import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runAppleScript } from "run-applescript";
import { z } from "zod/v3";
import { escapeAppleScriptString } from "../helpers";

export function registerSearchNotes(server: McpServer): void {
  server.registerTool(
    "search_notes",
    {
      description:
        "Search Apple Notes by title or body content. Returns matching {id, name, folder} objects.",
      inputSchema: {
        query: z.string().describe("The search query to match against note titles and bodies"),
        folder: z
          .string()
          .optional()
          .describe("Optional folder name to restrict the search to"),
      },
    },
    async ({ query, folder }: { query: string; folder?: string }) => {
      try {
        const safeQuery = escapeAppleScriptString(query);
        let script: string;
        if (folder) {
          const safeFolder = escapeAppleScriptString(folder);
          // Use "every folder whose name is" to be robust across multiple iCloud accounts
          script = `
          tell application "Notes"
            set output to ""
            set q to "${safeQuery}"
            set matchingFolders to (every folder whose name is "${safeFolder}")
            repeat with f in matchingFolders
              set folderName to name of f
              repeat with n in (notes of f)
                set noteName to name of n
                set noteBody to body of n
                if noteName contains q or noteBody contains q then
                  set noteId to id of n
                  set output to output & noteId & "|||" & noteName & "|||" & folderName & "\\n"
                end if
              end repeat
            end repeat
            return output
          end tell
        `;
        } else {
          script = `
          tell application "Notes"
            set output to ""
            set q to "${safeQuery}"
            repeat with n in every note
              set noteName to name of n
              set noteBody to body of n
              if noteName contains q or noteBody contains q then
                set noteId to id of n
                set noteFolder to ""
                try
                  set noteFolder to name of container of n
                end try
                set output to output & noteId & "|||" & noteName & "|||" & noteFolder & "\\n"
              end if
            end repeat
            return output
          end tell
        `;
        }
        const result = await runAppleScript(script);

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
          content: [{ type: "text" as const, text: `Error searching notes: ${message}` }],
        };
      }
    }
  );
}
