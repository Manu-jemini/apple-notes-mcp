jest.mock("run-applescript");

import { runAppleScript } from "run-applescript";
import { registerDeleteNote } from "../../../src/tools/delete-note";
import { createMockServer } from "../../utils/mock-server";

const mockRunAppleScript = runAppleScript as jest.Mock;

describe("delete_note", () => {
  it("registers the tool with the correct name", () => {
    const server = createMockServer();
    registerDeleteNote(server as never);
    expect(server.registerTool).toHaveBeenCalledWith("delete_note", expect.any(Object), expect.any(Function));
  });

  it("returns success message on deletion", async () => {
    mockRunAppleScript.mockResolvedValue("Note deleted successfully");
    const server = createMockServer();
    registerDeleteNote(server as never);
    const result = await server.getHandler("delete_note")!({ noteId: "note-1" });
    expect(result.content[0].text).toBe("Note deleted successfully");
  });

  it("passes the noteId to the AppleScript", async () => {
    mockRunAppleScript.mockResolvedValue("Note deleted successfully");
    const server = createMockServer();
    registerDeleteNote(server as never);
    await server.getHandler("delete_note")!({ noteId: "note-abc" });
    const script: string = mockRunAppleScript.mock.calls[0][0];
    expect(script).toContain(`delete note id "note-abc"`);
  });

  it("escapes injection characters in noteId", async () => {
    mockRunAppleScript.mockResolvedValue("Note deleted successfully");
    const server = createMockServer();
    registerDeleteNote(server as never);
    await server.getHandler("delete_note")!({ noteId: `" & evil & "` });
    const script: string = mockRunAppleScript.mock.calls[0][0];
    expect(script).toContain("& quote &");
  });

  it("returns an error message on failure", async () => {
    mockRunAppleScript.mockRejectedValue(new Error("Note not found"));
    const server = createMockServer();
    registerDeleteNote(server as never);
    const result = await server.getHandler("delete_note")!({ noteId: "bad-id" });
    expect(result.content[0].text).toContain("Error deleting note");
    expect(result.content[0].text).toContain("Note not found");
  });
});
