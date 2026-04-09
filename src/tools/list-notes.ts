import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runAppleScript } from "run-applescript";

export function registerListNotes(server: McpServer): void {
  server.registerTool(
    "list_notes",
    {
      description: "List all notes in Apple Notes. Returns an array of {id, name, folder} objects.",
      inputSchema: {},
    },
    async () => {
      try {
        const result = await runAppleScript(`
          tell application "Notes"
            set output to ""
            repeat with n in every note
              set noteId to id of n
              set noteName to name of n
              set noteFolder to ""
              try
                set noteFolder to name of container of n
              end try
              set output to output & noteId & "|||" & noteName & "|||" & noteFolder & "\\n"
            end repeat
            return output
          end tell
        `);

        const notes = result
          .trim()
          .split("\n")
          .filter((line) => line.trim() !== "")
          .map((line) => {
            const parts = line.split("|||");
            return {
              id: parts[0]?.trim() ?? "",
              name: parts[1]?.trim() ?? "",
              folder: parts[2]?.trim() ?? "",
            };
          });

        return {
          content: [{ type: "text" as const, text: JSON.stringify(notes, null, 2) }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text" as const, text: `Error listing notes: ${message}` }],
        };
      }
    }
  );
}
