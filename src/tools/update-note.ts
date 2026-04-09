import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runAppleScript } from "run-applescript";
import { z } from "zod/v3";
import { escapeAppleScriptString } from "../helpers";

export function registerUpdateNote(server: McpServer): void {
  server.registerTool(
    "update_note",
    {
      description:
        "Update the title and/or body of an existing note by its ID. Only provided fields are changed.",
      inputSchema: {
        noteId: z.string().describe("The unique ID of the note to update"),
        title: z.string().optional().describe("New title for the note (omit to keep existing)"),
        body: z.string().optional().describe("New body content for the note (omit to keep existing)"),
      },
    },
    async ({ noteId, title, body }: { noteId: string; title?: string; body?: string }) => {
      if (!title && !body) {
        return {
          content: [{ type: "text" as const, text: "Error: provide at least one of title or body to update." }],
        };
      }
      try {
        const safeId = escapeAppleScriptString(noteId);
        const lines: string[] = [
          `tell application "Notes"`,
          `  set n to note id "${safeId}"`,
        ];
        if (title) lines.push(`  set name of n to "${escapeAppleScriptString(title)}"`);
        if (body) lines.push(`  set body of n to "${escapeAppleScriptString(body)}"`);
        lines.push(`  return "Note updated successfully"`);
        lines.push(`end tell`);

        const result = await runAppleScript(lines.join("\n"));
        return { content: [{ type: "text" as const, text: result }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text" as const, text: `Error updating note: ${message}` }] };
      }
    }
  );
}
