import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runAppleScript } from "run-applescript";
import { z } from "zod/v3";
import { escapeAppleScriptString } from "../helpers";

export function registerMoveNote(server: McpServer): void {
  server.registerTool(
    "move_note",
    {
      description: "Move a note to a different folder.",
      inputSchema: {
        noteId: z.string().describe("The unique ID of the note to move"),
        folder: z.string().describe("The name of the destination folder"),
      },
    },
    async ({ noteId, folder }: { noteId: string; folder: string }) => {
      try {
        const safeId = escapeAppleScriptString(noteId);
        const safeFolder = escapeAppleScriptString(folder);
        const result = await runAppleScript(`
          tell application "Notes"
            set n to note id "${safeId}"
            set targetFolder to folder "${safeFolder}"
            move n to targetFolder
            return "Note moved to folder: ${safeFolder}"
          end tell
        `);
        return { content: [{ type: "text" as const, text: result }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text" as const, text: `Error moving note: ${message}` }] };
      }
    }
  );
}
