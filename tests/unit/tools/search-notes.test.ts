jest.mock("run-applescript");

import { runAppleScript } from "run-applescript";
import { registerSearchNotes } from "../../../src/tools/search-notes";
import { createMockServer } from "../../utils/mock-server";

const mockRunAppleScript = runAppleScript as jest.Mock;

describe("search_notes", () => {
  it("registers the tool with the correct name", () => {
    const server = createMockServer();
    registerSearchNotes(server as never);
    expect(server.registerTool).toHaveBeenCalledWith("search_notes", expect.any(Object), expect.any(Function));
  });

  it("returns matching notes on success", async () => {
    mockRunAppleScript.mockResolvedValue("id1|||Budget 2026|||Finance\n");
    const server = createMockServer();
    registerSearchNotes(server as never);
    const result = await server.getHandler("search_notes")!({ query: "budget" });
    const notes = JSON.parse(result.content[0].text);
    expect(notes).toEqual([{ id: "id1", name: "Budget 2026", folder: "Finance" }]);
  });

  it("returns an empty array when no notes match", async () => {
    mockRunAppleScript.mockResolvedValue("");
    const server = createMockServer();
    registerSearchNotes(server as never);
    const result = await server.getHandler("search_notes")!({ query: "nonexistent" });
    expect(JSON.parse(result.content[0].text)).toEqual([]);
  });

  it("uses 'every note' scope when folder is not provided", async () => {
    mockRunAppleScript.mockResolvedValue("");
    const server = createMockServer();
    registerSearchNotes(server as never);
    await server.getHandler("search_notes")!({ query: "test" });
    const script: string = mockRunAppleScript.mock.calls[0][0];
    expect(script).toContain("every note");
    expect(script).not.toContain(`every folder whose name is`);
  });

  it("restricts search to folder when folder is provided", async () => {
    mockRunAppleScript.mockResolvedValue("");
    const server = createMockServer();
    registerSearchNotes(server as never);
    await server.getHandler("search_notes")!({ query: "test", folder: "Work" });
    const script: string = mockRunAppleScript.mock.calls[0][0];
    expect(script).toContain(`every folder whose name is "Work"`);
  });

  it("escapes injection characters in query", async () => {
    mockRunAppleScript.mockResolvedValue("");
    const server = createMockServer();
    registerSearchNotes(server as never);
    await server.getHandler("search_notes")!({ query: `" & do shell script "rm" & "` });
    const script: string = mockRunAppleScript.mock.calls[0][0];
    expect(script).toContain("& quote &");
  });

  it("escapes injection characters in folder name", async () => {
    mockRunAppleScript.mockResolvedValue("");
    const server = createMockServer();
    registerSearchNotes(server as never);
    await server.getHandler("search_notes")!({ query: "x", folder: `" & malicious & "` });
    const script: string = mockRunAppleScript.mock.calls[0][0];
    expect(script).toContain("& quote &");
  });

  it("returns an error message on failure", async () => {
    mockRunAppleScript.mockRejectedValue(new Error("AppleScript failed"));
    const server = createMockServer();
    registerSearchNotes(server as never);
    const result = await server.getHandler("search_notes")!({ query: "test" });
    expect(result.content[0].text).toContain("Error searching notes");
    expect(result.content[0].text).toContain("AppleScript failed");
  });
});
