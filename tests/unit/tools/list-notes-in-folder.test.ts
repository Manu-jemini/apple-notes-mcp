jest.mock("run-applescript");

import { runAppleScript } from "run-applescript";
import { registerListNotesInFolder } from "../../../src/tools/list-notes-in-folder";
import { createMockServer } from "../../utils/mock-server";

const mockRunAppleScript = runAppleScript as jest.Mock;

describe("list_notes_in_folder", () => {
  it("registers the tool with the correct name", () => {
    const server = createMockServer();
    registerListNotesInFolder(server as never);
    expect(server.registerTool).toHaveBeenCalledWith("list_notes_in_folder", expect.any(Object), expect.any(Function));
  });

  it("returns notes inside the specified folder", async () => {
    mockRunAppleScript.mockResolvedValue("id1|||Sprint Plan\nid2|||Retro Notes\n");
    const server = createMockServer();
    registerListNotesInFolder(server as never);
    const result = await server.getHandler("list_notes_in_folder")!({ folder: "Work" });
    const notes = JSON.parse(result.content[0].text);
    expect(notes).toEqual([
      { id: "id1", name: "Sprint Plan" },
      { id: "id2", name: "Retro Notes" },
    ]);
  });

  it("passes the folder name to the AppleScript", async () => {
    mockRunAppleScript.mockResolvedValue("");
    const server = createMockServer();
    registerListNotesInFolder(server as never);
    await server.getHandler("list_notes_in_folder")!({ folder: "Personal" });
    const script: string = mockRunAppleScript.mock.calls[0][0];
    expect(script).toContain(`every folder whose name is "Personal"`);
  });

  it("returns empty array for an empty folder", async () => {
    mockRunAppleScript.mockResolvedValue("");
    const server = createMockServer();
    registerListNotesInFolder(server as never);
    const result = await server.getHandler("list_notes_in_folder")!({ folder: "Empty" });
    expect(JSON.parse(result.content[0].text)).toEqual([]);
  });

  it("escapes injection characters in folder name", async () => {
    mockRunAppleScript.mockResolvedValue("");
    const server = createMockServer();
    registerListNotesInFolder(server as never);
    await server.getHandler("list_notes_in_folder")!({ folder: `" & evil & "` });
    const script: string = mockRunAppleScript.mock.calls[0][0];
    expect(script).toContain("& quote &");
  });

  it("returns an error message on failure", async () => {
    mockRunAppleScript.mockRejectedValue(new Error("Folder not found"));
    const server = createMockServer();
    registerListNotesInFolder(server as never);
    const result = await server.getHandler("list_notes_in_folder")!({ folder: "Ghost" });
    expect(result.content[0].text).toContain("Error listing notes in folder");
    expect(result.content[0].text).toContain("Folder not found");
  });
});
