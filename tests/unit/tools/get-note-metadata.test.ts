jest.mock("run-applescript");

import { runAppleScript } from "run-applescript";
import { registerGetNoteMetadata } from "../../../src/tools/get-note-metadata";
import { createMockServer } from "../../utils/mock-server";

const mockRunAppleScript = runAppleScript as jest.Mock;

describe("get_note_metadata", () => {
  it("registers the tool with the correct name", () => {
    const server = createMockServer();
    registerGetNoteMetadata(server as never);
    expect(server.registerTool).toHaveBeenCalledWith("get_note_metadata", expect.any(Object), expect.any(Function));
  });

  it("returns parsed metadata with all fields", async () => {
    mockRunAppleScript.mockResolvedValue(
      "Meeting Notes|||Work|||Sunday, 1 January 2026 at 10:00:00|||Monday, 6 April 2026 at 09:00:00"
    );
    const server = createMockServer();
    registerGetNoteMetadata(server as never);
    const result = await server.getHandler("get_note_metadata")!({ noteId: "note-1" });
    const metadata = JSON.parse(result.content[0].text);
    expect(metadata).toEqual({
      id: "note-1",
      title: "Meeting Notes",
      folder: "Work",
      created: "Sunday, 1 January 2026 at 10:00:00",
      modified: "Monday, 6 April 2026 at 09:00:00",
    });
  });

  it("includes the noteId in the returned metadata", async () => {
    mockRunAppleScript.mockResolvedValue("Title|||Folder|||date1|||date2");
    const server = createMockServer();
    registerGetNoteMetadata(server as never);
    const result = await server.getHandler("get_note_metadata")!({ noteId: "x-coredata://abc" });
    const metadata = JSON.parse(result.content[0].text);
    expect(metadata.id).toBe("x-coredata://abc");
  });

  it("escapes injection characters in noteId", async () => {
    mockRunAppleScript.mockResolvedValue("T|||F|||d1|||d2");
    const server = createMockServer();
    registerGetNoteMetadata(server as never);
    await server.getHandler("get_note_metadata")!({ noteId: `bad"id` });
    const script: string = mockRunAppleScript.mock.calls[0][0];
    expect(script).toContain("& quote &");
  });

  it("returns an error message on failure", async () => {
    mockRunAppleScript.mockRejectedValue(new Error("Note not found"));
    const server = createMockServer();
    registerGetNoteMetadata(server as never);
    const result = await server.getHandler("get_note_metadata")!({ noteId: "bad" });
    expect(result.content[0].text).toContain("Error getting note metadata");
    expect(result.content[0].text).toContain("Note not found");
  });
});
