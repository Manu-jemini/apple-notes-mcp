import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runAppleScript } from "run-applescript";
import { z } from "zod/v3";
import { escapeAppleScriptString, stripHtml } from "../helpers";

export function registerReadNote(server: McpServer): void {
  server.registerTool(
    "read_note",
    {
      description: "Read the full body of a note by its ID. Returns plain text (HTML stripped).",
      inputSchema: {
        noteId: z.string().describe("The unique ID of the note to read"),
      },
    },
    async ({ noteId }: { noteId: string }) => {
      try {
        const safeId = escapeAppleScriptString(noteId);
        const result = await runAppleScript(`
          tell application "Notes"
            set n to note id "${safeId}"
            return body of n
          end tell
        `);

        return {
          content: [{ type: "text" as const, text: stripHtml(result) }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text" as const, text: `Error reading note: ${message}` }],
        };
      }
    }
  );
}
