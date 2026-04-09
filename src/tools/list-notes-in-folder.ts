import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runAppleScript } from "run-applescript";
import { z } from "zod/v3";
import { escapeAppleScriptString, parseNoteLines } from "../helpers";

export function registerListNotesInFolder(server: McpServer): void {
  server.registerTool(
    "list_notes_in_folder",
    {
      description: "List all notes inside a specific folder. Returns {id, name} objects.",
      inputSchema: {
        folder: z.string().describe("The name of the folder to list notes from"),
      },
    },
    async ({ folder }: { folder: string }) => {
      try {
        const safeFolder = escapeAppleScriptString(folder);
        const result = await runAppleScript(`
          tell application "Notes"
            set output to ""
            set matchingFolders to (every folder whose name is "${safeFolder}")
            repeat with f in matchingFolders
              repeat with n in (notes of f)
                set noteId to id of n
                set noteName to name of n
                set output to output & noteId & "|||" & noteName & "\\n"
              end repeat
            end repeat
            return output
          end tell
        `);

        const notes = parseNoteLines(result);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(notes, null, 2) }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text" as const, text: `Error listing notes in folder: ${message}` }],
        };
      }
    }
  );
}
