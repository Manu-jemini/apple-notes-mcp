import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runAppleScript } from "run-applescript";
import { z } from "zod/v3";
import { escapeAppleScriptString } from "../helpers";

export function registerCreateNote(server: McpServer): void {
  server.registerTool(
    "create_note",
    {
      description: "Create a new note in Apple Notes.",
      inputSchema: {
        title: z.string().describe("The title for the new note"),
        body: z.string().describe("The body content for the new note"),
        folder: z
          .string()
          .optional()
          .describe(
            "Optional folder name to create the note in. Uses default folder if omitted."
          ),
      },
    },
    async ({ title, body, folder }: { title: string; body: string; folder?: string }) => {
      try {
        const safeTitle = escapeAppleScriptString(title);
        const safeBody = escapeAppleScriptString(body);

        let script: string;
        if (folder) {
          const safeFolder = escapeAppleScriptString(folder);
          script = `
            tell application "Notes"
              set targetFolder to folder "${safeFolder}"
              make new note at targetFolder with properties {name:"${safeTitle}", body:"${safeBody}"}
              return "Note created in folder: ${safeFolder}"
            end tell
          `;
        } else {
          script = `
            tell application "Notes"
              make new note with properties {name:"${safeTitle}", body:"${safeBody}"}
              return "Note created successfully"
            end tell
          `;
        }

        const result = await runAppleScript(script);
        return {
          content: [{ type: "text" as const, text: result }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text" as const, text: `Error creating note: ${message}` }],
        };
      }
    }
  );
}
