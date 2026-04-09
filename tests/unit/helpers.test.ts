import { escapeAppleScriptString, stripHtml, parseNoteLines } from "../../src/helpers";

describe("escapeAppleScriptString", () => {
  it("returns the string unchanged when there are no quotes", () => {
    expect(escapeAppleScriptString("hello world")).toBe("hello world");
  });

  it("escapes a single double quote", () => {
    expect(escapeAppleScriptString(`say "hello"`)).toBe(`say " & quote & "hello" & quote & "`);
  });

  it("escapes multiple double quotes", () => {
    const input = `"a" and "b"`;
    const result = escapeAppleScriptString(input);
    expect(result).toBe(`" & quote & "a" & quote & " and " & quote & "b" & quote & "`);
  });

  it("prevents AppleScript injection via closing the string context", () => {
    const malicious = `" & do shell script "rm -rf /" & "`;
    const escaped = escapeAppleScriptString(malicious);
    // Every original quote is replaced by the safe encoding
    const originalQuoteCount = (malicious.match(/"/g) ?? []).length;
    const replacementCount = (escaped.match(/& quote &/g) ?? []).length;
    expect(replacementCount).toBe(originalQuoteCount);
    // The literal injection payload must not remain intact
    expect(escaped).not.toContain('do shell script "rm -rf /"');
  });

  it("handles empty string", () => {
    expect(escapeAppleScriptString("")).toBe("");
  });

  it("handles string with only quotes", () => {
    // Each `"` is independently replaced by `" & quote & "`, so two adjacent
    // quotes produce a trailing `"` followed immediately by a leading `"`.
    expect(escapeAppleScriptString(`""`)).toBe(`" & quote & "" & quote & "`);
  });
});

describe("stripHtml", () => {
  it("removes simple block tags", () => {
    expect(stripHtml("<p>Hello</p>")).toBe("Hello");
  });

  it("removes inline tags", () => {
    expect(stripHtml("<b>Bold</b> and <i>italic</i>")).toBe("Bold and italic");
  });

  it("removes nested tags", () => {
    expect(stripHtml("<div><p><b>Bold</b> text</p></div>")).toBe("Bold text");
  });

  it("decodes &amp;", () => {
    expect(stripHtml("a &amp; b")).toBe("a & b");
  });

  it("decodes &lt; and &gt;", () => {
    expect(stripHtml("&lt;tag&gt;")).toBe("<tag>");
  });

  it("decodes &apos;", () => {
    expect(stripHtml("it&apos;s fine")).toBe("it's fine");
  });

  it("decodes &quot;", () => {
    expect(stripHtml("she said &quot;hello&quot;")).toBe(`she said "hello"`);
  });

  it("decodes &nbsp;", () => {
    expect(stripHtml("a&nbsp;b")).toBe("a b");
  });

  it("handles mixed tags and entities", () => {
    expect(stripHtml("<p>Hello &amp; World</p>")).toBe("Hello & World");
  });

  it("returns plain text unchanged", () => {
    expect(stripHtml("plain text")).toBe("plain text");
  });

  it("returns empty string unchanged", () => {
    expect(stripHtml("")).toBe("");
  });

  it("handles self-closing tags", () => {
    expect(stripHtml("line1<br/>line2")).toBe("line1line2");
  });
});

describe("parseNoteLines", () => {
  it("parses a single line", () => {
    expect(parseNoteLines("id1|||My Note\n")).toEqual([{ id: "id1", name: "My Note" }]);
  });

  it("parses multiple lines", () => {
    const result = parseNoteLines("id1|||Note A\nid2|||Note B\n");
    expect(result).toEqual([
      { id: "id1", name: "Note A" },
      { id: "id2", name: "Note B" },
    ]);
  });

  it("returns empty array for empty input", () => {
    expect(parseNoteLines("")).toEqual([]);
  });

  it("filters blank lines", () => {
    expect(parseNoteLines("id1|||Note\n\n  \n")).toEqual([{ id: "id1", name: "Note" }]);
  });

  it("preserves extra pipe separators inside the note name", () => {
    expect(parseNoteLines("id1|||Note|||with|||pipes\n")).toEqual([
      { id: "id1", name: "Note|||with|||pipes" },
    ]);
  });

  it("trims whitespace from id and name", () => {
    expect(parseNoteLines(" id1 ||| My Note \n")).toEqual([{ id: "id1", name: "My Note" }]);
  });

  it("handles whitespace-only lines as empty", () => {
    expect(parseNoteLines("   \n   \n")).toEqual([]);
  });
});
