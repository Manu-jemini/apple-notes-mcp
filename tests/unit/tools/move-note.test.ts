jest.mock("run-applescript");

import { runAppleScript } from "run-applescript";
import { registerMoveNote } from "../../../src/tools/move-note";
import { createMockServer } from "../../utils/mock-server";

const mockRunAppleScript = runAppleScript as jest.Mock;

describe("move_note", () => {
  it("registers the tool with the correct name", () => {
    const server = createMockServer();
    registerMoveNote(server as never);
    expect(server.registerTool).toHaveBeenCalledWith("move_note", expect.any(Object), expect.any(Function));
  });

  it("returns success message with destination folder", async () => {
    mockRunAppleScript.mockResolvedValue("Note moved to folder: Work");
    const server = createMockServer();
    registerMoveNote(server as never);
    const result = await server.getHandler("move_note")!({ noteId: "id1", folder: "Work" });
    expect(result.content[0].text).toContain("Work");
  });

  it("passes move command with noteId and destination folder to AppleScript", async () => {
    mockRunAppleScript.mockResolvedValue("Note moved to folder: Archive");
    const server = createMockServer();
    registerMoveNote(server as never);
    await server.getHandler("move_note")!({ noteId: "note-abc", folder: "Archive" });
    const script: string = mockRunAppleScript.mock.calls[0][0];
    expect(script).toContain(`note id "note-abc"`);
    expect(script).toContain(`folder "Archive"`);
    expect(script).toContain("move n to targetFolder");
  });

  it("escapes injection characters in noteId and folder", async () => {
    mockRunAppleScript.mockResolvedValue("Note moved to folder: x");
    const server = createMockServer();
    registerMoveNote(server as never);
    await server.getHandler("move_note")!({ noteId: `bad"id`, folder: `bad"folder` });
    const script: string = mockRunAppleScript.mock.calls[0][0];
    expect(script).toContain("& quote &");
  });

  it("returns an error message on failure", async () => {
    mockRunAppleScript.mockRejectedValue(new Error("Destination folder not found"));
    const server = createMockServer();
    registerMoveNote(server as never);
    const result = await server.getHandler("move_note")!({ noteId: "id1", folder: "Ghost" });
    expect(result.content[0].text).toContain("Error moving note");
    expect(result.content[0].text).toContain("Destination folder not found");
  });
});
