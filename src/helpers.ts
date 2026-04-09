/**
 * Escapes a string for safe interpolation into an AppleScript double-quoted
 * string literal. Replaces every `"` with `" & quote & "` so that user-
 * supplied values cannot break out of the string context.
 */
export function escapeAppleScriptString(s: string): string {
  return s.replace(/"/g, '" & quote & "');
}

/**
 * Strips HTML tags from a string and decodes common HTML entities so that
 * read_note always returns readable plain text.
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ");
}

/** Parses the pipe-delimited AppleScript output into {id, name} objects. */
export function parseNoteLines(raw: string): Array<{ id: string; name: string }> {
  return raw
    .trim()
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => {
      const [id, ...nameParts] = line.split("|||");
      return { id: id.trim(), name: nameParts.join("|||").trim() };
    });
}
