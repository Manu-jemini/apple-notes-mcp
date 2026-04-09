import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runAppleScript } from "run-applescript";
import { z } from "zod/v3";
import { escapeAppleScriptString } from "../helpers";

export function registerDeleteNote(server: McpServer): void {
  server.registerTool(
    "delete_note",
    {
      description: "Permanently delete a note by its ID. This cannot be undone.",
      inputSchema: {
        noteId: z.string().describe("The unique ID of the note to delete"),
      },
    },
    async ({ noteId }: { noteId: string }) => {
      try {
        const safeId = escapeAppleScriptString(noteId);
        const result = await runAppleScript(`
          tell application "Notes"
            delete note id "${safeId}"
            return "Note deleted successfully"
          end tell
        `);
        return { content: [{ type: "text" as const, text: result }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text" as const, text: `Error deleting note: ${message}` }] };
      }
    }
  );
}
