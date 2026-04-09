import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runAppleScript } from "run-applescript";
import { z } from "zod/v3";
import { escapeAppleScriptString } from "../helpers";

export function registerAppendToNote(server: McpServer): void {
  server.registerTool(
    "append_to_note",
    {
      description:
        "Append content to the end of an existing note without overwriting it.",
      inputSchema: {
        noteId: z.string().describe("The unique ID of the note to append to"),
        content: z.string().describe("The text content to append to the note"),
      },
    },
    async ({ noteId, content }: { noteId: string; content: string }) => {
      try {
        const safeId = escapeAppleScriptString(noteId);
        const safeContent = escapeAppleScriptString(content);
        const result = await runAppleScript(`
          tell application "Notes"
            set n to note id "${safeId}"
            set currentBody to body of n
            set body of n to currentBody & "<br><br>${safeContent}"
            return "Content appended successfully"
          end tell
        `);
        return { content: [{ type: "text" as const, text: result }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text" as const, text: `Error appending to note: ${message}` }],
        };
      }
    }
  );
}
