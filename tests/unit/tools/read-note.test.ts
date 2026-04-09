jest.mock("run-applescript");

import { runAppleScript } from "run-applescript";
import { registerReadNote } from "../../../src/tools/read-note";
import { createMockServer } from "../../utils/mock-server";

const mockRunAppleScript = runAppleScript as jest.Mock;

describe("read_note", () => {
  it("registers the tool with the correct name", () => {
    const server = createMockServer();
    registerReadNote(server as never);
    expect(server.registerTool).toHaveBeenCalledWith("read_note", expect.any(Object), expect.any(Function));
  });

  it("returns plain text with HTML stripped", async () => {
    mockRunAppleScript.mockResolvedValue("<p>Hello <b>World</b></p><p>Line 2</p>");
    const server = createMockServer();
    registerReadNote(server as never);
    const result = await server.getHandler("read_note")!({ noteId: "note-1" });
    expect(result.content[0].text).toBe("Hello WorldLine 2");
  });

  it("decodes HTML entities in the body", async () => {
    mockRunAppleScript.mockResolvedValue("<p>Rock &amp; Roll &lt;loud&gt;</p>");
    const server = createMockServer();
    registerReadNote(server as never);
    const result = await server.getHandler("read_note")!({ noteId: "note-1" });
    expect(result.content[0].text).toBe("Rock & Roll <loud>");
  });

  it("passes the note ID safely to AppleScript", async () => {
    mockRunAppleScript.mockResolvedValue("body");
    const server = createMockServer();
    registerReadNote(server as never);
    await server.getHandler("read_note")!({ noteId: "x-coredata://abc-123" });
    const script: string = mockRunAppleScript.mock.calls[0][0];
    expect(script).toContain(`note id "x-coredata://abc-123"`);
  });

  it("escapes injection characters in noteId", async () => {
    mockRunAppleScript.mockResolvedValue("body");
    const server = createMockServer();
    registerReadNote(server as never);
    await server.getHandler("read_note")!({ noteId: `" & malicious & "` });
    const script: string = mockRunAppleScript.mock.calls[0][0];
    expect(script).toContain("& quote &");
  });

  it("returns an error message on failure", async () => {
    mockRunAppleScript.mockRejectedValue(new Error("Note not found"));
    const server = createMockServer();
    registerReadNote(server as never);
    const result = await server.getHandler("read_note")!({ noteId: "bad-id" });
    expect(result.content[0].text).toContain("Error reading note");
    expect(result.content[0].text).toContain("Note not found");
  });
});
