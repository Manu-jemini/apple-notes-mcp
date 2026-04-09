jest.mock("run-applescript");

import { runAppleScript } from "run-applescript";
import { registerDeleteFolder } from "../../../src/tools/delete-folder";
import { createMockServer } from "../../utils/mock-server";

const mockRunAppleScript = runAppleScript as jest.Mock;

describe("delete_folder", () => {
  it("registers the tool with the correct name", () => {
    const server = createMockServer();
    registerDeleteFolder(server as never);
    expect(server.registerTool).toHaveBeenCalledWith("delete_folder", expect.any(Object), expect.any(Function));
  });

  it("returns success message on deletion", async () => {
    mockRunAppleScript.mockResolvedValue("Folder deleted: Old Drafts");
    const server = createMockServer();
    registerDeleteFolder(server as never);
    const result = await server.getHandler("delete_folder")!({ name: "Old Drafts" });
    expect(result.content[0].text).toContain("Old Drafts");
  });

  it("passes delete command with folder name to AppleScript", async () => {
    mockRunAppleScript.mockResolvedValue("Folder deleted: Temp");
    const server = createMockServer();
    registerDeleteFolder(server as never);
    await server.getHandler("delete_folder")!({ name: "Temp" });
    const script: string = mockRunAppleScript.mock.calls[0][0];
    expect(script).toContain(`delete folder "Temp"`);
  });

  it("escapes injection characters in folder name", async () => {
    mockRunAppleScript.mockResolvedValue("Folder deleted: x");
    const server = createMockServer();
    registerDeleteFolder(server as never);
    await server.getHandler("delete_folder")!({ name: `" & evil & "` });
    const script: string = mockRunAppleScript.mock.calls[0][0];
    expect(script).toContain("& quote &");
  });

  it("returns an error message on failure", async () => {
    mockRunAppleScript.mockRejectedValue(new Error("Folder not found"));
    const server = createMockServer();
    registerDeleteFolder(server as never);
    const result = await server.getHandler("delete_folder")!({ name: "Ghost" });
    expect(result.content[0].text).toContain("Error deleting folder");
    expect(result.content[0].text).toContain("Folder not found");
  });
});
