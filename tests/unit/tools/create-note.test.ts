jest.mock("run-applescript");

import { runAppleScript } from "run-applescript";
import { registerCreateNote } from "../../../src/tools/create-note";
import { createMockServer } from "../../utils/mock-server";

const mockRunAppleScript = runAppleScript as jest.Mock;

describe("create_note", () => {
  it("registers the tool with the correct name", () => {
    const server = createMockServer();
    registerCreateNote(server as never);
    expect(server.registerTool).toHaveBeenCalledWith("create_note", expect.any(Object), expect.any(Function));
  });

  it("creates a note in the default location when no folder is given", async () => {
    mockRunAppleScript.mockResolvedValue("Note created successfully");
    const server = createMockServer();
    registerCreateNote(server as never);
    const result = await server.getHandler("create_note")!({ title: "Ideas", body: "Some ideas" });
    expect(result.content[0].text).toBe("Note created successfully");
    const script: string = mockRunAppleScript.mock.calls[0][0];
    expect(script).toContain("make new note");
    expect(script).not.toContain("set targetFolder");
  });

  it("creates a note inside a specific folder when folder is given", async () => {
    mockRunAppleScript.mockResolvedValue("Note created in folder: Work");
    const server = createMockServer();
    registerCreateNote(server as never);
    const result = await server.getHandler("create_note")!({ title: "Sprint", body: "Tasks", folder: "Work" });
    expect(result.content[0].text).toContain("Work");
    const script: string = mockRunAppleScript.mock.calls[0][0];
    expect(script).toContain(`folder "Work"`);
    expect(script).toContain("make new note at targetFolder");
  });

  it("escapes injection characters in title and body", async () => {
    mockRunAppleScript.mockResolvedValue("Note created successfully");
    const server = createMockServer();
    registerCreateNote(server as never);
    await server.getHandler("create_note")!({ title: `bad "title"`, body: `bad "body"` });
    const script: string = mockRunAppleScript.mock.calls[0][0];
    expect(script).toContain("& quote &");
  });

  it("escapes injection characters in folder name", async () => {
    mockRunAppleScript.mockResolvedValue("Note created in folder: x");
    const server = createMockServer();
    registerCreateNote(server as never);
    await server.getHandler("create_note")!({ title: "t", body: "b", folder: `" & evil & "` });
    const script: string = mockRunAppleScript.mock.calls[0][0];
    expect(script).toContain("& quote &");
  });

  it("returns an error message on failure", async () => {
    mockRunAppleScript.mockRejectedValue(new Error("Folder does not exist"));
    const server = createMockServer();
    registerCreateNote(server as never);
    const result = await server.getHandler("create_note")!({ title: "T", body: "B", folder: "Ghost" });
    expect(result.content[0].text).toContain("Error creating note");
    expect(result.content[0].text).toContain("Folder does not exist");
  });
});
