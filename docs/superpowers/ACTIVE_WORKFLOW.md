# Superpowers Project Work-In-Progress Tracker

This document maintains the active development state, completed milestones, and immediate next steps for the Superpowers project. It is designed to allow any AI agent or human developer to immediately resume work on the project, even across restarts, model changes, or agent swaps.

---

## 1. Project Global State
*   **Active Project:** Phase 1 (Core MCP Server)
*   **Target Monorepo Structure:**
    *   `packages/core`: Engine & AST parser (to be created)
    *   `packages/mcp-server`: MCP protocol implementation (to be created)
    *   `packages/vscode-extension`: VS Code Sidebar & Chat wrapper (to be created in Phase 2/3)

---

## 2. Active Phase: Phase 1 (Core MCP Server)
Plan File: [2026-05-21-phase1-mcp-server.md](file:///C:/Users/Kasim%20Kazmi/Documents/antigravity/intelligent-bardeen/docs/superpowers/plans/2026-05-21-phase1-mcp-server.md)

### Detailed Feature Status
| Task / Feature | Files Involved | Status | Notes |
| :--- | :--- | :--- | :--- |
| Monorepo Workspaces Configuration | `package.json`, `tsconfig.json` | **Complete** | Setup workspaces mapping to `packages/*` |
| **Task 1: Setup & Parser** | `packages/core/package.json`, `packages/core/src/parser.ts` | *Not Started* | Requires TDD implementation |
| **Task 2: State Tracker & Checkpoints** | `packages/core/src/tracker.ts` | *Not Started* | Requires state machine logic |
| **Task 3: MCP Server Wrap** | `packages/mcp-server/src/server.ts` | *Not Started* | Setup stdio JSON-RPC transport |
| **Task 4: Vitest Suite Integration** | `packages/core/tests/*` | *Not Started* | Unit tests for parser and tracker |

---

## 3. How to Resume Work

1.  **Read this file (`docs/superpowers/ACTIVE_WORKFLOW.md`)** to find the current active phase and next step.
2.  **Open the corresponding active plan file** (e.g. `docs/superpowers/plans/2026-05-21-phase1-mcp-server.md`).
3.  Check the checkbox progress (`- [ ]` / `- [x]`) in the plan file.
4.  Run `npm run test` from the root workspace to confirm that the existing test suite passes before implementing new code.
5.  Perform the next checklist step, update files, write passing tests, and commit.
