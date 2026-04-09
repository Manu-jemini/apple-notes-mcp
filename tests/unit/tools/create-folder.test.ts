jest.mock("run-applescript");

import { runAppleScript } from "run-applescript";
import { registerCreateFolder } from "../../../src/tools/create-folder";
import { createMockServer } from "../../utils/mock-server";

const mockRunAppleScript = runAppleScript as jest.Mock;

describe("create_folder", () => {
  it("registers the tool with the correct name", () => {
    const server = createMockServer();
    registerCreateFolder(server as never);
    expect(server.registerTool).toHaveBeenCalledWith("create_folder", expect.any(Object), expect.any(Function));
  });

  it("returns success message with the folder name", async () => {
    mockRunAppleScript.mockResolvedValue("Folder created: Archive 2026");
    const server = createMockServer();
    registerCreateFolder(server as never);
    const result = await server.getHandler("create_folder")!({ name: "Archive 2026" });
    expect(result.content[0].text).toContain("Archive 2026");
  });

  it("passes the folder name to the AppleScript", async () => {
    mockRunAppleScript.mockResolvedValue("Folder created: Projects");
    const server = createMockServer();
    registerCreateFolder(server as never);
    await server.getHandler("create_folder")!({ name: "Projects" });
    const script: string = mockRunAppleScript.mock.calls[0][0];
    expect(script).toContain(`make new folder`);
    expect(script).toContain(`"Projects"`);
  });

  it("escapes injection characters in folder name", async () => {
    mockRunAppleScript.mockResolvedValue("Folder created: x");
    const server = createMockServer();
    registerCreateFolder(server as never);
    await server.getHandler("create_folder")!({ name: `" & evil & "` });
    const script: string = mockRunAppleScript.mock.calls[0][0];
    expect(script).toContain("& quote &");
  });

  it("returns an error message on failure", async () => {
    mockRunAppleScript.mockRejectedValue(new Error("Folder already exists"));
    const server = createMockServer();
    registerCreateFolder(server as never);
    const result = await server.getHandler("create_folder")!({ name: "Duplicate" });
    expect(result.content[0].text).toContain("Error creating folder");
    expect(result.content[0].text).toContain("Folder already exists");
  });
});
