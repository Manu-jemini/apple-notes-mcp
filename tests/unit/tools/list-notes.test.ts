jest.mock("run-applescript");

import { runAppleScript } from "run-applescript";
import { registerListNotes } from "../../../src/tools/list-notes";
import { createMockServer } from "../../utils/mock-server";

const mockRunAppleScript = runAppleScript as jest.Mock;

describe("list_notes", () => {
  it("registers the tool with the correct name", () => {
    const server = createMockServer();
    registerListNotes(server as never);
    expect(server.registerTool).toHaveBeenCalledWith(
      "list_notes",
      expect.objectContaining({ description: expect.any(String) }),
      expect.any(Function)
    );
  });

  it("returns parsed notes with id, name and folder on success", async () => {
    mockRunAppleScript.mockResolvedValue(
      "note-1|||Meeting Notes|||Work\nnote-2|||Shopping List|||Personal\n"
    );
    const server = createMockServer();
    registerListNotes(server as never);
    const result = await server.getHandler("list_notes")!();
    const notes = JSON.parse(result.content[0].text);
    expect(notes).toEqual([
      { id: "note-1", name: "Meeting Notes", folder: "Work" },
      { id: "note-2", name: "Shopping List", folder: "Personal" },
    ]);
  });

  it("returns an empty array when there are no notes", async () => {
    mockRunAppleScript.mockResolvedValue("");
    const server = createMockServer();
    registerListNotes(server as never);
    const result = await server.getHandler("list_notes")!();
    expect(JSON.parse(result.content[0].text)).toEqual([]);
  });

  it("returns an error message when runAppleScript throws", async () => {
    mockRunAppleScript.mockRejectedValue(new Error("Notes not accessible"));
    const server = createMockServer();
    registerListNotes(server as never);
    const result = await server.getHandler("list_notes")!();
    expect(result.content[0].text).toContain("Error listing notes");
    expect(result.content[0].text).toContain("Notes not accessible");
  });

  it("handles non-Error throws", async () => {
    mockRunAppleScript.mockRejectedValue("unexpected failure");
    const server = createMockServer();
    registerListNotes(server as never);
    const result = await server.getHandler("list_notes")!();
    expect(result.content[0].text).toContain("unexpected failure");
  });
});
