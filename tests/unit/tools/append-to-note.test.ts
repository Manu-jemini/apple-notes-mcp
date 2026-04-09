jest.mock("run-applescript");

import { runAppleScript } from "run-applescript";
import { registerAppendToNote } from "../../../src/tools/append-to-note";
import { createMockServer } from "../../utils/mock-server";

const mockRunAppleScript = runAppleScript as jest.Mock;

describe("append_to_note", () => {
  it("registers the tool with the correct name", () => {
    const server = createMockServer();
    registerAppendToNote(server as never);
    expect(server.registerTool).toHaveBeenCalledWith("append_to_note", expect.any(Object), expect.any(Function));
  });

  it("returns success message on append", async () => {
    mockRunAppleScript.mockResolvedValue("Content appended successfully");
    const server = createMockServer();
    registerAppendToNote(server as never);
    const result = await server.getHandler("append_to_note")!({ noteId: "id1", content: "New line" });
    expect(result.content[0].text).toBe("Content appended successfully");
  });

  it("reads current body and appends new content with a line break", async () => {
    mockRunAppleScript.mockResolvedValue("Content appended successfully");
    const server = createMockServer();
    registerAppendToNote(server as never);
    await server.getHandler("append_to_note")!({ noteId: "id1", content: "Follow up" });
    const script: string = mockRunAppleScript.mock.calls[0][0];
    expect(script).toContain("currentBody");
    expect(script).toContain("& \"<br><br>");
    expect(script).toContain("Follow up");
  });

  it("escapes injection characters in noteId and content", async () => {
    mockRunAppleScript.mockResolvedValue("Content appended successfully");
    const server = createMockServer();
    registerAppendToNote(server as never);
    await server.getHandler("append_to_note")!({ noteId: `bad"id`, content: `evil "injection"` });
    const script: string = mockRunAppleScript.mock.calls[0][0];
    expect(script).toContain("& quote &");
  });

  it("returns an error message on failure", async () => {
    mockRunAppleScript.mockRejectedValue(new Error("Note locked"));
    const server = createMockServer();
    registerAppendToNote(server as never);
    const result = await server.getHandler("append_to_note")!({ noteId: "id1", content: "text" });
    expect(result.content[0].text).toContain("Error appending to note");
    expect(result.content[0].text).toContain("Note locked");
  });
});
