jest.mock("run-applescript");

import { runAppleScript } from "run-applescript";
import { registerUpdateNote } from "../../../src/tools/update-note";
import { createMockServer } from "../../utils/mock-server";

const mockRunAppleScript = runAppleScript as jest.Mock;

describe("update_note", () => {
  it("registers the tool with the correct name", () => {
    const server = createMockServer();
    registerUpdateNote(server as never);
    expect(server.registerTool).toHaveBeenCalledWith("update_note", expect.any(Object), expect.any(Function));
  });

  it("rejects immediately when neither title nor body is provided", async () => {
    const server = createMockServer();
    registerUpdateNote(server as never);
    const result = await server.getHandler("update_note")!({ noteId: "id1" });
    expect(result.content[0].text).toContain("Error");
    expect(mockRunAppleScript).not.toHaveBeenCalled();
  });

  it("updates only the title when body is omitted", async () => {
    mockRunAppleScript.mockResolvedValue("Note updated successfully");
    const server = createMockServer();
    registerUpdateNote(server as never);
    await server.getHandler("update_note")!({ noteId: "id1", title: "New Title" });
    const script: string = mockRunAppleScript.mock.calls[0][0];
    expect(script).toContain("set name of n");
    expect(script).not.toContain("set body of n");
  });

  it("updates only the body when title is omitted", async () => {
    mockRunAppleScript.mockResolvedValue("Note updated successfully");
    const server = createMockServer();
    registerUpdateNote(server as never);
    await server.getHandler("update_note")!({ noteId: "id1", body: "New body content" });
    const script: string = mockRunAppleScript.mock.calls[0][0];
    expect(script).toContain("set body of n");
    expect(script).not.toContain("set name of n");
  });

  it("updates both title and body when both are provided", async () => {
    mockRunAppleScript.mockResolvedValue("Note updated successfully");
    const server = createMockServer();
    registerUpdateNote(server as never);
    const result = await server.getHandler("update_note")!({ noteId: "id1", title: "T", body: "B" });
    expect(result.content[0].text).toBe("Note updated successfully");
    const script: string = mockRunAppleScript.mock.calls[0][0];
    expect(script).toContain("set name of n");
    expect(script).toContain("set body of n");
  });

  it("escapes injection characters in inputs", async () => {
    mockRunAppleScript.mockResolvedValue("Note updated successfully");
    const server = createMockServer();
    registerUpdateNote(server as never);
    await server.getHandler("update_note")!({ noteId: `bad"id`, title: `bad"title` });
    const script: string = mockRunAppleScript.mock.calls[0][0];
    expect(script).toContain("& quote &");
  });

  it("returns an error message on failure", async () => {
    mockRunAppleScript.mockRejectedValue(new Error("Note not found"));
    const server = createMockServer();
    registerUpdateNote(server as never);
    const result = await server.getHandler("update_note")!({ noteId: "id1", title: "T" });
    expect(result.content[0].text).toContain("Error updating note");
  });
});
