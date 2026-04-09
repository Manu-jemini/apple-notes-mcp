import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runAppleScript } from "run-applescript";

export function registerListFolders(server: McpServer): void {
  server.registerTool(
    "list_folders",
    {
      description: "List all folders in Apple Notes. Returns an array of folder names.",
      inputSchema: {},
    },
    async () => {
      try {
        const result = await runAppleScript(`
          tell application "Notes"
            set output to ""
            repeat with f in every folder
              set folderName to name of f
              set noteCount to count of notes of f
              set output to output & folderName & "|||" & noteCount & "\\n"
            end repeat
            return output
          end tell
        `);

        const folders = result
          .trim()
          .split("\n")
          .filter((line) => line.trim() !== "")
          .map((line) => {
            const parts = line.split("|||");
            return {
              name: parts[0]?.trim() ?? "",
              noteCount: parseInt(parts[1]?.trim() ?? "0", 10),
            };
          });

        return {
          content: [{ type: "text" as const, text: JSON.stringify(folders, null, 2) }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text" as const, text: `Error listing folders: ${message}` }] };
      }
    }
  );
}
