jest.mock("run-applescript");

import { runAppleScript } from "run-applescript";
import { registerListFolders } from "../../../src/tools/list-folders";
import { createMockServer } from "../../utils/mock-server";

const mockRunAppleScript = runAppleScript as jest.Mock;

describe("list_folders", () => {
  it("registers the tool with the correct name", () => {
    const server = createMockServer();
    registerListFolders(server as never);
    expect(server.registerTool).toHaveBeenCalledWith("list_folders", expect.any(Object), expect.any(Function));
  });

  it("returns folders with name and noteCount on success", async () => {
    mockRunAppleScript.mockResolvedValue("Work|||5\nPersonal|||12\nArchive|||0\n");
    const server = createMockServer();
    registerListFolders(server as never);
    const result = await server.getHandler("list_folders")!();
    const folders = JSON.parse(result.content[0].text);
    expect(folders).toEqual([
      { name: "Work", noteCount: 5 },
      { name: "Personal", noteCount: 12 },
      { name: "Archive", noteCount: 0 },
    ]);
  });

  it("returns an empty array when there are no folders", async () => {
    mockRunAppleScript.mockResolvedValue("");
    const server = createMockServer();
    registerListFolders(server as never);
    const result = await server.getHandler("list_folders")!();
    expect(JSON.parse(result.content[0].text)).toEqual([]);
  });

  it("parses noteCount as integer", async () => {
    mockRunAppleScript.mockResolvedValue("Work|||7\n");
    const server = createMockServer();
    registerListFolders(server as never);
    const result = await server.getHandler("list_folders")!();
    const folders = JSON.parse(result.content[0].text);
    expect(typeof folders[0].noteCount).toBe("number");
    expect(folders[0].noteCount).toBe(7);
  });

  it("returns an error message on failure", async () => {
    mockRunAppleScript.mockRejectedValue(new Error("Access denied"));
    const server = createMockServer();
    registerListFolders(server as never);
    const result = await server.getHandler("list_folders")!();
    expect(result.content[0].text).toContain("Error listing folders");
    expect(result.content[0].text).toContain("Access denied");
  });
});
