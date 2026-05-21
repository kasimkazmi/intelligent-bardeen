# State Tracking Workflow & Phase 2 Extension Design Specification

This document defines the rules and structure for tracking active workflow state across model and agent context switches, along with the detailed architecture for Phase 2: Standalone Sidebar Webview VS Code Extension.

---

## 1. State-Tracking and Resumption Workflow

To make the codebase self-documenting and model-agnostic, any coding agent or AI model must be able to resume development immediately by reading files committed directly to the git repository.

### 1.1 State Files

1.  **`docs/superpowers/ACTIVE_WORKFLOW.md` (Human & AI Readable)**
    *   Acts as the central dashboard of development.
    *   Tracks current phase, branch name, completed files, and next immediate checklist tasks.
    *   Includes verification shell commands to execute to ensure the workspace builds and tests pass.
2.  **`docs/superpowers/ACTIVE_STATE.json` (Machine & Tool Readable)**
    *   Allows automated tools or parsers to programmatically check state.
    *   Stores `current_phase`, `active_branch`, `completed_tasks`, `in_progress_task`, and `next_step` fields.

### 1.2 Progression Protocol for Agents
Before concluding a turn or switching tasks:
1.  **Verify Code:** Ensure that all tests pass (`npm test`) and the workspace compiles without TypeScript errors.
2.  **Update State Files:** Update checklists in `ACTIVE_WORKFLOW.md` (changing `[ ]` to `[x]`), update `ACTIVE_STATE.json`, and check off tasks in the active phase markdown plan.
3.  **Git Commit:** Add all code changes and the updated tracking files in a single logical commit:
    ```bash
    git add .
    git commit -m "feat(module): add feature and update ACTIVE_WORKFLOW tracking"
    ```

---

## 2. Version Control Branching Strategy

All work must follow a clean, isolated branch structure to prevent half-finished features from polluting the primary code tree.

*   **Master/Main Branch (`master`):** Kept as the release-ready baseline. No direct commits allowed.
*   **Phase 1 Branch (`feature/phase1-mcp-server`):** Contains the completed Core AST parser and stdio MCP server. This branch remains active but unmerged until all phases are complete.
*   **Phase 2 Branch (`feature/phase2-sidebar-webview`):** Branches off from `feature/phase1-mcp-server` so it inherits the core library and server. All Phase 2 work occurs on this branch.
*   **Merge Sequence:** Once all phases are fully completed and tested, branches will be merged one by one back into `master` (Phase 1 first, then Phase 2, then Phase 3).

---

## 3. Phase 2 Component Architecture

The VS Code sidebar extension is structured inside `packages/vscode-extension`.

```
packages/vscode-extension/
├── package.json               # Extension manifest, commands, views
├── tsconfig.json              # TypeScript compilation setup
├── src/
│   ├── extension.ts           # Extension entrypoint, registers sidebar
│   ├── SidebarProvider.ts     # Hosts WebviewView, handles messaging
│   └── webview/
│       ├── App.tsx            # React workspace dashboard UI
│       └── index.tsx          # Webview entrypoint
```

### 3.1 Sidebar Webview Container (`SidebarProvider.ts`)
*   Implements `vscode.WebviewViewProvider`.
*   Resolves the webview view, enabling scripts and local resource access from the extension folder.
*   Serves compiled React bundles from `dist/webview.js`.
*   Establishes message bridge via `webviewView.webview.onDidReceiveMessage`:
    *   `itemToggled`: Update session state checklist and write back checkpoint JSON.
    *   `runCommand`: Spawns integrated terminal `vscode.window.createTerminal("Superpowers Runner")` and runs commands locally.

### 3.2 React Dashboard UI (`App.tsx`)
*   **Aesthetics:** Dark-mode native UI utilizing standard VS Code CSS tokens:
    *   Background: `var(--vscode-sideBar-background)`
    *   Border: `var(--vscode-panel-border)`
    *   Button: `var(--vscode-button-background)` / `--vscode-button-hoverBackground`
    *   Typography: `var(--vscode-font-family)`
*   **Interactions:** Hover transitions on checklist cards, clean indicator badges for active vs completed steps.

### 3.3 Bundling & Compilation
*   Extension Node source is compiled via standard `tsc`.
*   Webview React browser source is compiled via `esbuild` using:
    ```bash
    npx esbuild packages/vscode-extension/src/webview/index.tsx --bundle --outfile=packages/vscode-extension/dist/webview.js --minify --platform=browser
    ```

---

## 4. Verification Plan

### 4.1 Automated Tests
*   We will introduce mock test suites for `SidebarProvider` webview message routing inside `packages/vscode-extension/tests/`.
*   We will ensure the monorepo root runs `npm test` to verify both the core parser/MCP server and the VS Code extension helper logic.

### 4.2 Manual Verification
*   We will run the extension locally inside VS Code Extension Development Host to visually test the sidebar webview rendering, CSS variables theme matching, and terminal command triggering.
