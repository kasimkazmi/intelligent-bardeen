# Superpowers Project Work-In-Progress Tracker

This document maintains the active development state, completed milestones, and immediate next steps for the Superpowers project. It is designed to allow any AI agent or human developer to immediately resume work on the project, even across restarts, model changes, or agent swaps.

---

## 1. Project Global State
*   **Active Project:** Phase 2 (VS Code Sidebar Webview Extension)
*   **Active Git Branch:** `feature/phase2-sidebar-webview`
*   **Monorepo Packages:**
    *   `packages/core`: Engine & AST parser (**Complete**)
    *   `packages/mcp-server`: MCP stdio server (**Complete**)
    *   `packages/vscode-extension`: VS Code Sidebar Webview UI (**Active Phase**)

---

## 2. Completed Milestones

### Phase 1: Core Library & MCP Server
*   **AST Parser:** Parses markdown files, frontmatter, steps, and checklist items.
*   **Session Tracker:** Tracks checklist progress and saves checkpoints to `.superpowers/sessions/`.
*   **MCP Server:** Exposes stdio tools `start_session` and `update_checklist`.
*   **Tests:** 100% Vitest unit and integration coverage passing.

---

## 3. Active Phase: Phase 2 (VS Code Sidebar Extension)
Plan File: [2026-05-21-phase2-sidebar-webview.md](file:///C:/Users/Kasim%20Kazmi/Documents/antigravity/intelligent-bardeen/docs/superpowers/plans/2026-05-21-phase2-sidebar-webview.md)

### Detailed Feature Status
| Task / Feature | Files Involved | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Task 1: Extension Config & VS Code API Mock** | `packages/vscode-extension/package.json`, `packages/vscode-extension/tsconfig.json`, `packages/vscode-extension/tests/mocks/vscode.ts` | **Not Started** | Boilerplate layout and testing mocks |
| **Task 2: SidebarProvider and Extension Lifecycle** | `packages/vscode-extension/src/SidebarProvider.ts`, `packages/vscode-extension/src/extension.ts`, `packages/vscode-extension/tests/SidebarProvider.test.ts` | **Not Started** | Registers view provider & tests message loop |
| **Task 3: React Webview UI & Styling** | `packages/vscode-extension/src/webview/App.tsx`, `packages/vscode-extension/src/webview/App.css`, `packages/vscode-extension/src/webview/index.tsx` | **Not Started** | Interactive dashboard UI & VS Code CSS variable styling |
| **Task 4: Bundle and Build Pipelines** | `package.json` (root), `packages/vscode-extension/dist/*` | **Not Started** | esbuild bundles and root workspace workspace tests |

---

## 4. Resumption and Handshake Protocol (How to Resume Work)

1.  **Read this file (`docs/superpowers/ACTIVE_WORKFLOW.md`)** to find the current active phase and git branch.
2.  Check the JSON-formatted state details in [ACTIVE_STATE.json](file:///C:/Users/Kasim%20Kazmi/Documents/antigravity/intelligent-bardeen/docs/superpowers/ACTIVE_STATE.json).
3.  Ensure you are on the correct active branch:
    ```bash
    git status
    ```
4.  Run root tests to verify the baseline build integrity:
    ```bash
    npm test
    ```
5.  Open the active plan file and follow the checkboxes task-by-task. Make small commits after each step.
