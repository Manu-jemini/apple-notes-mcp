import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runAppleScript } from "run-applescript";
import { z } from "zod/v3";
import { escapeAppleScriptString } from "../helpers";

export function registerCreateFolder(server: McpServer): void {
  server.registerTool(
    "create_folder",
    {
      description: "Create a new folder in Apple Notes.",
      inputSchema: {
        name: z.string().describe("The name of the folder to create"),
      },
    },
    async ({ name }: { name: string }) => {
      try {
        const safeName = escapeAppleScriptString(name);
        const result = await runAppleScript(`
          tell application "Notes"
            make new folder with properties {name:"${safeName}"}
            return "Folder created: ${safeName}"
          end tell
        `);
        return { content: [{ type: "text" as const, text: result }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text" as const, text: `Error creating folder: ${message}` }],
        };
      }
    }
  );
}
