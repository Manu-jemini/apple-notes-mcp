import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerListNotes } from "./tools/list-notes";
import { registerSearchNotes } from "./tools/search-notes";
import { registerReadNote } from "./tools/read-note";
import { registerCreateNote } from "./tools/create-note";
import { registerUpdateNote } from "./tools/update-note";
import { registerDeleteNote } from "./tools/delete-note";
import { registerListFolders } from "./tools/list-folders";
import { registerMoveNote } from "./tools/move-note";
import { registerGetNoteMetadata } from "./tools/get-note-metadata";
import { registerAppendToNote } from "./tools/append-to-note";
import { registerListNotesInFolder } from "./tools/list-notes-in-folder";
import { registerCreateFolder } from "./tools/create-folder";
import { registerDeleteFolder } from "./tools/delete-folder";

export function createServer(): McpServer {
  const server = new McpServer({ name: "apple-notes-mcp", version: "1.2.0" });

  registerListNotes(server);
  registerSearchNotes(server);
  registerReadNote(server);
  registerCreateNote(server);
  registerUpdateNote(server);
  registerDeleteNote(server);
  registerAppendToNote(server);
  registerListFolders(server);
  registerListNotesInFolder(server);
  registerCreateFolder(server);
  registerDeleteFolder(server);
  registerMoveNote(server);
  registerGetNoteMetadata(server);

  return server;
}
