import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runAppleScript } from "run-applescript";
import { z } from "zod/v3";
import { escapeAppleScriptString } from "../helpers";

export function registerGetNoteMetadata(server: McpServer): void {
  server.registerTool(
    "get_note_metadata",
    {
      description:
        "Get metadata for a note: title, folder, creation date, and last modification date.",
      inputSchema: {
        noteId: z.string().describe("The unique ID of the note"),
      },
    },
    async ({ noteId }: { noteId: string }) => {
      try {
        const safeId = escapeAppleScriptString(noteId);
        const result = await runAppleScript(`
          tell application "Notes"
            set n to note id "${safeId}"
            set noteName to name of n
            set noteFolder to ""
            try
              set noteFolder to name of container of n
            end try
            set noteCreated to creation date of n as string
            set noteModified to modification date of n as string
            return noteName & "|||" & noteFolder & "|||" & noteCreated & "|||" & noteModified
          end tell
        `);

        const [title, folder, created, modified] = result.split("|||");
        const metadata = {
          id: noteId,
          title: title?.trim(),
          folder: folder?.trim(),
          created: created?.trim(),
          modified: modified?.trim(),
        };

        return {
          content: [{ type: "text" as const, text: JSON.stringify(metadata, null, 2) }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text" as const, text: `Error getting note metadata: ${message}` }],
        };
      }
    }
  );
}
