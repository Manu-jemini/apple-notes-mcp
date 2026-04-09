/*
 * apple-notes-mcp — MCP Server for Apple Notes
 *
 * BUILD & RUN
 * -----------
 *   npm install
 *   npm run build        # compiles src/ → dist/
 *   node dist/index.js   # verify it starts without crashing
 *
 * WIRE UP TO CLAUDE DESKTOP (macOS)
 * ----------------------------------
 * Edit ~/Library/Application Support/Claude/claude_desktop_config.json:
 *
 *   {
 *     "mcpServers": {
 *       "apple-notes": {
 *         "command": "node",
 *         "args": ["/absolute/path/to/apple-notes-mcp/dist/index.js"]
 *       }
 *     }
 *   }
 *
 * Then restart Claude Desktop. You should see 4 tools: list_notes,
 * search_notes, read_note, and create_note.
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server";

const server = createServer();
const transport = new StdioServerTransport();

server.connect(transport).catch((err: unknown) => {
  console.error("Failed to connect MCP server:", err);
  process.exit(1);
});
