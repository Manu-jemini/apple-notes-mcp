import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runAppleScript } from "run-applescript";
import { z } from "zod/v3";
import { escapeAppleScriptString } from "../helpers";

export function registerDeleteFolder(server: McpServer): void {
  server.registerTool(
    "delete_folder",
    {
      description:
        "Permanently delete a folder and all notes inside it from Apple Notes. This cannot be undone.",
      inputSchema: {
        name: z.string().describe("The name of the folder to delete"),
      },
    },
    async ({ name }: { name: string }) => {
      try {
        const safeName = escapeAppleScriptString(name);
        const result = await runAppleScript(`
          tell application "Notes"
            delete folder "${safeName}"
            return "Folder deleted: ${safeName}"
          end tell
        `);
        return { content: [{ type: "text" as const, text: result }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text" as const, text: `Error deleting folder: ${message}` }],
        };
      }
    }
  );
}
