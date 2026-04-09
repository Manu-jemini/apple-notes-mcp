jest.mock("run-applescript", () => ({ runAppleScript: jest.fn() }));
jest.mock("@modelcontextprotocol/sdk/server/mcp.js", () => ({
  McpServer: jest.fn(),
}));

import { createServer } from "../../src/server";

const EXPECTED_TOOL_NAMES = [
  "list_notes",
  "search_notes",
  "read_note",
  "create_note",
  "update_note",
  "delete_note",
  "append_to_note",
  "list_folders",
  "list_notes_in_folder",
  "create_folder",
  "delete_folder",
  "move_note",
  "get_note_metadata",
] as const;

describe("createServer", () => {
  let mockRegisterTool: jest.Mock;

  beforeEach(() => {
    // resetMocks clears mock implementations between tests; re-establish here.
    mockRegisterTool = jest.fn().mockReturnValue({});
    const { McpServer } = jest.requireMock("@modelcontextprotocol/sdk/server/mcp.js") as {
      McpServer: jest.Mock;
    };
    McpServer.mockImplementation(() => ({ registerTool: mockRegisterTool }));
  });

  it("creates an McpServer with the correct name and version", () => {
    const { McpServer } = jest.requireMock("@modelcontextprotocol/sdk/server/mcp.js") as {
      McpServer: jest.Mock;
    };
    createServer();
    expect(McpServer).toHaveBeenCalledWith({ name: "apple-notes-mcp", version: expect.any(String) });
  });

  it("registers exactly 13 tools", () => {
    createServer();
    expect(mockRegisterTool).toHaveBeenCalledTimes(13);
  });

  it("registers all expected tool names", () => {
    createServer();
    const registeredNames = (mockRegisterTool.mock.calls as Array<[string, ...unknown[]]>).map(
      (call) => call[0]
    );
    expect(registeredNames).toEqual(expect.arrayContaining([...EXPECTED_TOOL_NAMES]));
  });

  it.each(EXPECTED_TOOL_NAMES)('registers the "%s" tool', (toolName) => {
    createServer();
    const registeredNames = (mockRegisterTool.mock.calls as Array<[string, ...unknown[]]>).map(
      (call) => call[0]
    );
    expect(registeredNames).toContain(toolName);
  });

  it("returns the McpServer instance", () => {
    const server = createServer();
    expect(server).toBeDefined();
  });
});
