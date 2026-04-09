# Apple-notes-mcp

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that gives Claude Desktop full access to your Apple Notes — read, write, search, organize, and more.

Built with TypeScript, AppleScript, and the official MCP SDK. No API keys. No cloud. Everything runs locally on your Mac.

---

## Why this over the official connector?

The official Anthropic Apple Notes connector has 4 tools. This one has **13**.

| Tool | This | Official |
|---|:---:|:---:|
| `list_notes` (includes folder info) | ✅ | ✅ |
| `search_notes` (with optional folder filter) | ✅ | ❌ |
| `read_note` | ✅ | ✅ |
| `create_note` | ✅ | ✅ |
| `update_note` | ✅ | ✅ |
| `delete_note` | ✅ | ❌ |
| `append_to_note` | ✅ | ❌ |
| `list_folders` (with note counts) | ✅ | ❌ |
| `list_notes_in_folder` | ✅ | ❌ |
| `create_folder` | ✅ | ❌ |
| `delete_folder` | ✅ | ❌ |
| `move_note` | ✅ | ❌ |
| `get_note_metadata` | ✅ | ❌ |

---

## Requirements

- macOS (AppleScript only runs on Mac)
- [Node.js](https://nodejs.org) v18 or later
- [Claude Desktop](https://claude.ai/download)
- Apple Notes app (built into macOS)

---

## Installation

```bash
# 1. Clone the repo
git clone https://github.com/your-username/apple-notes-mcp.git
cd apple-notes-mcp

# 2. Install dependencies
npm install

# 3. Build
npm run build
```

---

## Connect to Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "apple-notes": {
      "command": "node",
      "args": ["/absolute/path/to/apple-notes-mcp/dist/index.js"]
    }
  }
}
```

Replace `/absolute/path/to/apple-notes-mcp` with the actual path. You can get it by running `pwd` inside the project folder.

Then **restart Claude Desktop**. You should see `apple-notes` listed under Connectors with all 13 tools active.

> **Tip:** If Claude Desktop can't find `node`, use the full path. Run `which node` in your terminal and use that instead of `"node"`.

---

## Tools

### `list_notes`
List every note across all folders.

**Returns:** array of `{ id, name, folder }`

**Example prompt:**
> "List all my Apple Notes"

---

### `search_notes`
Search notes by title or body content, optionally scoped to a folder.

**Inputs:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `query` | string | ✅ | Text to search for |
| `folder` | string | ❌ | Restrict search to this folder |

**Example prompts:**
> "Search my notes for 'project deadline'"
> "Find notes about 'budget' only in my Work folder"

---

### `read_note`
Read the full plain-text content of a note by ID.

**Inputs:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `noteId` | string | ✅ | The note's unique ID |

**Example prompt:**
> "Read my note called 'Meeting Notes'" *(Claude will search first, then read)*

---

### `create_note`
Create a new note, optionally in a specific folder.

**Inputs:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `title` | string | ✅ | Note title |
| `body` | string | ✅ | Note body content |
| `folder` | string | ❌ | Folder to create it in |

**Example prompts:**
> "Create a note called 'Ideas' with a list of my startup ideas"
> "Create a note called 'Sprint Plan' in my Work folder"

---

### `update_note`
Update the title and/or body of an existing note. Only the fields you provide are changed.

**Inputs:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `noteId` | string | ✅ | The note's unique ID |
| `title` | string | ❌ | New title |
| `body` | string | ❌ | New body (replaces existing) |

**Example prompt:**
> "Update the title of my 'Draft' note to 'Final Version'"

---

### `append_to_note`
Add content to the end of a note without overwriting it.

**Inputs:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `noteId` | string | ✅ | The note's unique ID |
| `content` | string | ✅ | Text to append |

**Example prompt:**
> "Append 'Follow up next Monday' to my meeting notes"

---

### `delete_note`
Permanently delete a note. **Cannot be undone.**

**Inputs:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `noteId` | string | ✅ | The note's unique ID |

**Example prompt:**
> "Delete my note called 'Temp'"

---

### `list_folders`
List all folders with their note counts.

**Returns:** array of `{ name, noteCount }`

**Example prompts:**
> "List all my Notes folders"
> "How many notes are in each folder?"

---

### `list_notes_in_folder`
List all notes inside a specific folder.

**Inputs:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `folder` | string | ✅ | Folder name |

**Example prompt:**
> "Show me all notes in my Personal folder"

---

### `create_folder`
Create a new folder in Apple Notes.

**Inputs:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `name` | string | ✅ | Folder name |

**Example prompt:**
> "Create a folder called 'Archive 2026'"

---

### `delete_folder`
Permanently delete a folder and **all notes inside it**. **Cannot be undone.**

**Inputs:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `name` | string | ✅ | Folder name |

**Example prompt:**
> "Delete the folder called 'Old Drafts'"

---

### `move_note`
Move a note to a different folder.

**Inputs:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `noteId` | string | ✅ | The note's unique ID |
| `folder` | string | ✅ | Destination folder name |

**Example prompt:**
> "Move my 'Ideas' note to the Work folder"

---

### `get_note_metadata`
Get metadata for a note: title, folder, creation date, last modified date.

**Inputs:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `noteId` | string | ✅ | The note's unique ID |

**Example prompt:**
> "When was my 'Meeting Notes' note last modified?"

---

## Example multi-step prompts

These chain multiple tools automatically:

> "Find all notes about 'budget', read the most relevant one, then append today's date as a footer"

> "List all my folders, then show me the notes inside the one with the most notes"

> "Create a folder called 'Projects', then create a note called 'Project Alpha' inside it"

> "Search for notes containing 'invoice' in my Finance folder, then read each one"

---

## Project structure

```
apple-notes-mcp/
├── src/
│   ├── index.ts              # Entry point — connects transport
│   ├── server.ts             # Wires all tools onto McpServer
│   ├── helpers.ts            # escapeAppleScriptString, stripHtml, parseNoteLines
│   └── tools/
│       ├── list-notes.ts
│       ├── search-notes.ts
│       ├── read-note.ts
│       ├── create-note.ts
│       ├── update-note.ts
│       ├── delete-note.ts
│       ├── append-to-note.ts
│       ├── list-folders.ts
│       ├── list-notes-in-folder.ts
│       ├── create-folder.ts
│       ├── delete-folder.ts
│       ├── move-note.ts
│       └── get-note-metadata.ts
├── tests/
│   ├── unit/
│   │   ├── helpers.test.ts
│   │   └── tools/            # One test file per tool
│   ├── integration/
│   │   └── server.test.ts
│   └── utils/
│       └── mock-server.ts
├── __mocks__/
│   └── run-applescript.ts    # CJS mock for ESM-only package
├── dist/                     # Compiled output (git-ignored)
├── package.json
├── tsconfig.json
├── tsconfig.test.json
├── jest.config.ts
└── eslint.config.ts
```

---

## Development

```bash
npm run build          # compile TypeScript → dist/
npm run lint           # check for lint errors
npm run lint:fix       # auto-fix lint errors
npm run dev            # run directly with ts-node (no build needed)
npm test               # run all tests
npm run test:unit      # run unit tests only
npm run test:integration  # run integration tests only
npm run test:coverage  # run tests with coverage report
```

---

## Security

- All user-supplied values are sanitized via `escapeAppleScriptString()` before being interpolated into AppleScript, preventing injection attacks.
- All debug/error output goes to `stderr` only — `stdout` is reserved for the MCP JSON-RPC channel.
- No data leaves your machine. All operations run locally via AppleScript.

---

## License

MIT
