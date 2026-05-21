# Phase 2: VS Code Sidebar Extension Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a VS Code Sidebar Webview extension displaying interactive checklists, session state, and terminal logs, with full VS Code API permissions to read/write files and run local test scripts.

**Architecture:** A standard VS Code Extension registering a Sidebar View Provider. It loads a React frontend inside an iframe Webview, leveraging the VS Code API messaging channel (`vscode.postMessage`) to send/receive commands, file updates, and run commands in the terminal.

**Tech Stack:** TypeScript, VS Code Extension API (`vscode`), React, Vitest, esbuild.

---

### Task 1: Extension Configuration & VS Code API Mock Setup

**Files:**
- Create: [packages/vscode-extension/package.json](file:///C:/Users/Kasim%20Kasmi/Documents/antigravity/intelligent-bardeen/packages/vscode-extension/package.json)
- Create: [packages/vscode-extension/tsconfig.json](file:///C:/Users/Kasim%20Kasmi/Documents/antigravity/intelligent-bardeen/packages/vscode-extension/tsconfig.json)
- Create: [packages/vscode-extension/tests/mocks/vscode.ts](file:///C:/Users/Kasim%20Kasmi/Documents/antigravity/intelligent-bardeen/packages/vscode-extension/tests/mocks/vscode.ts)

- [x] **Step 1: Create package.json**
  Define dependencies, workspaces links, activation events, and extension contribution points.
  Create [packages/vscode-extension/package.json](file:///C:/Users/Kasim%20Kasmi/Documents/antigravity/intelligent-bardeen/packages/vscode-extension/package.json):
  ```json
  {
    "name": "@superpowers/vscode-extension",
    "version": "1.0.0",
    "publisher": "kasim-kazmi",
    "engines": {
      "vscode": "^1.90.0"
    },
    "main": "./dist/extension.js",
    "type": "module",
    "scripts": {
      "build:extension": "tsc -p tsconfig.json",
      "build:webview": "esbuild src/webview/index.tsx --bundle --outfile=dist/webview.js --minify --platform=browser",
      "build": "npm run build:extension && npm run build:webview",
      "test": "vitest run"
    },
    "contributes": {
      "viewsContainers": {
        "activitybar": [
          {
            "id": "superpowers-sidebar",
            "title": "Superpowers",
            "icon": "resources/icon.svg"
          }
        ]
      },
      "views": {
        "superpowers-sidebar": [
          {
            "type": "webview",
            "id": "superpowers-sidebar-view",
            "name": "Superpowers Dashboard"
          }
        ]
      }
    },
    "dependencies": {
      "@superpowers/core": "*"
    },
    "devDependencies": {
      "@types/node": "^20.12.7",
      "@types/react": "^18.3.3",
      "@types/react-dom": "^18.3.0",
      "@types/vscode": "^1.90.0",
      "esbuild": "^0.21.3",
      "react": "^18.3.1",
      "react-dom": "^18.3.1",
      "typescript": "^5.4.5",
      "vitest": "^1.5.0"
    }
  }
  ```

- [x] **Step 2: Create tsconfig.json**
  Create [packages/vscode-extension/tsconfig.json](file:///C:/Users/Kasim%20Kasmi/Documents/antigravity/intelligent-bardeen/packages/vscode-extension/tsconfig.json):
  ```json
  {
    "compilerOptions": {
      "target": "ES2022",
      "module": "NodeNext",
      "moduleResolution": "NodeNext",
      "outDir": "./dist",
      "rootDir": "./src",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true,
      "jsx": "react-jsx"
    },
    "include": ["src/**/*"]
  }
  ```

- [x] **Step 3: Create VS Code API mock for local unit tests**
  Create [packages/vscode-extension/tests/mocks/vscode.ts](file:///C:/Users/Kasim%20Kasmi/Documents/antigravity/intelligent-bardeen/packages/vscode-extension/tests/mocks/vscode.ts):
  ```typescript
  import { vi } from 'vitest';

  export const window = {
    showInformationMessage: vi.fn(),
    createTerminal: vi.fn().mockReturnValue({
      show: vi.fn(),
      sendText: vi.fn()
    })
  };

  export const Uri = {
    joinPath: vi.fn().mockImplementation((base, ...paths) => ({
      path: paths.join('/')
    }))
  };

  export const workspace = {
    fs: {
      readFile: vi.fn()
    }
  };
  ```

- [x] **Step 4: Commit Setup**
  ```bash
  git add packages/vscode-extension/package.json packages/vscode-extension/tsconfig.json packages/vscode-extension/tests/mocks/vscode.ts
  git commit -m "chore(extension): setup extension package, tsconfig, and vitest mocks"
  ```

---

### Task 2: SidebarProvider and Extension Lifecycle

**Files:**
- Create: [packages/vscode-extension/src/SidebarProvider.ts](file:///C:/Users/Kasim%20Kasmi/Documents/antigravity/intelligent-bardeen/packages/vscode-extension/src/SidebarProvider.ts)
- Create: [packages/vscode-extension/src/extension.ts](file:///C:/Users/Kasim%20Kasmi/Documents/antigravity/intelligent-bardeen/packages/vscode-extension/src/extension.ts)
- Create: [packages/vscode-extension/tests/SidebarProvider.test.ts](file:///C:/Users/Kasim%20Kasmi/Documents/antigravity/intelligent-bardeen/packages/vscode-extension/tests/SidebarProvider.test.ts)

- [x] **Step 1: Write a failing test for SidebarProvider message handling**
  Create [packages/vscode-extension/tests/SidebarProvider.test.ts](file:///C:/Users/Kasim%20Kasmi/Documents/antigravity/intelligent-bardeen/packages/vscode-extension/tests/SidebarProvider.test.ts):
  ```typescript
  import { describe, it, expect, vi, beforeEach } from 'vitest';

  // Mock vscode module before imports
  vi.mock('vscode', () => import('./mocks/vscode.js'));

  import * as vscode from 'vscode';
  import { SidebarProvider } from '../src/SidebarProvider.js';

  describe('SidebarProvider', () => {
    let mockExtensionUri: any;

    beforeEach(() => {
      vi.clearAllMocks();
      mockExtensionUri = { fsPath: '/test-path' };
    });

    it('creates terminal and runs command on runCommand message', async () => {
      const provider = new SidebarProvider(mockExtensionUri);
      const mockWebviewView: any = {
        webview: {
          options: {},
          html: '',
          onDidReceiveMessage: vi.fn().mockImplementation((callback) => {
            // Trigger simulated message immediately
            callback({ type: 'runCommand', value: 'npm run test' });
            return { dispose: vi.fn() };
          }),
          asWebviewUri: vi.fn().mockReturnValue('mock-uri')
        }
      };

      provider.resolveWebviewView(mockWebviewView, {} as any, {} as any);

      expect(vscode.window.createTerminal).toHaveBeenCalledWith('Superpowers Runner');
    });
  });
  ```

- [x] **Step 2: Run test and verify it fails**
  Run: `npm test --workspace=@superpowers/vscode-extension`
  Expected: Failure (SidebarProvider does not exist).

- [x] **Step 3: Implement SidebarProvider**
  Create [packages/vscode-extension/src/SidebarProvider.ts](file:///C:/Users/Kasim%20Kasmi/Documents/antigravity/intelligent-bardeen/packages/vscode-extension/src/SidebarProvider.ts):
  ```typescript
  import * as vscode from 'vscode';

  export class SidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'superpowers-sidebar-view';
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(
      webviewView: vscode.WebviewView,
      context: vscode.WebviewViewResolveContext,
      _token: vscode.CancellationToken
    ) {
      this._view = webviewView;

      webviewView.webview.options = {
        enableScripts: true,
        localResourceRoots: [this._extensionUri]
      };

      webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

      webviewView.webview.onDidReceiveMessage(async (data) => {
        switch (data.type) {
          case 'onInfo': {
            if (!data.value) return;
            vscode.window.showInformationMessage(data.value);
            break;
          }
          case 'runCommand': {
            this.runLocalCommand(data.value);
            break;
          }
        }
      });
    }

    private runLocalCommand(command: string) {
      const terminal = vscode.window.createTerminal(`Superpowers Runner`);
      terminal.show();
      terminal.sendText(command);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
      const scriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview.js')
      );
      return `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Superpowers Dashboard</title>
          <style>
            body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); background-color: var(--vscode-sideBar-background); }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script src="${scriptUri}"></script>
        </body>
        </html>`;
    }
  }
  ```

- [x] **Step 4: Hook SidebarProvider up in extension.ts**
  Create [packages/vscode-extension/src/extension.ts](file:///C:/Users/Kasim%20Kasmi/Documents/antigravity/intelligent-bardeen/packages/vscode-extension/src/extension.ts):
  ```typescript
  import * as vscode from 'vscode';
  import { SidebarProvider } from './SidebarProvider.js';

  export function activate(context: vscode.ExtensionContext) {
    const sidebarProvider = new SidebarProvider(context.extensionUri);
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
        SidebarProvider.viewType,
        sidebarProvider
      )
    );
  }

  export function deactivate() {}
  ```

- [x] **Step 5: Run tests to verify they pass**
  Run: `npm test --workspace=@superpowers/vscode-extension`
  Expected: PASS

- [x] **Step 6: Commit**
  ```bash
  git add packages/vscode-extension/src/SidebarProvider.ts packages/vscode-extension/src/extension.ts packages/vscode-extension/tests/SidebarProvider.test.ts
  git commit -m "feat(extension): implement SidebarProvider class and registers view provider"
  ```

---

### Task 3: React Webview UI & Styling

**Files:**
- Create: [packages/vscode-extension/src/webview/App.tsx](file:///C:/Users/Kasim%20Kasmi/Documents/antigravity/intelligent-bardeen/packages/vscode-extension/src/webview/App.tsx)
- Create: [packages/vscode-extension/src/webview/App.css](file:///C:/Users/Kasim%20Kasmi/Documents/antigravity/intelligent-bardeen/packages/vscode-extension/src/webview/App.css)
- Create: [packages/vscode-extension/src/webview/index.tsx](file:///C:/Users/Kasim%20Kasmi/Documents/antigravity/intelligent-bardeen/packages/vscode-extension/src/webview/index.tsx)

- [x] **Step 1: Create React App Component**
  Create [packages/vscode-extension/src/webview/App.tsx](file:///C:/Users/Kasim%20Kasmi/Documents/antigravity/intelligent-bardeen/packages/vscode-extension/src/webview/App.tsx):
  ```tsx
  import React, { useState } from 'react';
  import './App.css';

  interface ChecklistItem {
    id: string;
    text: string;
    completed: boolean;
  }

  interface Step {
    title: string;
    checklist: ChecklistItem[];
  }

  export default function App() {
    const [currentStep, setCurrentStep] = useState<Step>({
      title: 'Step 1: Write a Failing Test',
      checklist: [
        { id: 'item-1', text: 'Write a test file under tests/', completed: false },
        { id: 'item-2', text: 'Verify test fails running npm test', completed: false }
      ]
    });

    const toggleItem = (itemId: string) => {
      const updatedChecklist = currentStep.checklist.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      setCurrentStep({ ...currentStep, checklist: updatedChecklist });
      
      // Post event back to VS Code Extension host
      const vscode = (window as any).acquireVsCodeApi ? (window as any).acquireVsCodeApi() : null;
      if (vscode) {
        vscode.postMessage({ type: 'onInfo', value: `Checked item: ${itemId}` });
      }
    };

    const triggerTestRun = () => {
      const vscode = (window as any).acquireVsCodeApi ? (window as any).acquireVsCodeApi() : null;
      if (vscode) {
        vscode.postMessage({ type: 'runCommand', value: 'npm run test' });
      }
    };

    return (
      <div className="container">
        <header className="header">
          <h3>Superpowers Dashboard</h3>
          <span className="subtitle">Workflow State Tracker</span>
        </header>

        <section className="step-card">
          <h4 className="step-title">{currentStep.title}</h4>
          <div className="checklist">
            {currentStep.checklist.map(item => (
              <label key={item.id} className="checklist-item">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleItem(item.id)}
                />
                <span className={item.completed ? 'completed-text' : ''}>{item.text}</span>
              </label>
            ))}
          </div>
        </section>

        <footer className="action-footer">
          <button className="btn btn-primary" onClick={triggerTestRun}>
            Run Local Test Suite
          </button>
        </footer>
      </div>
    );
  }
  ```

- [x] **Step 2: Create React App styling for rich native theme integration**
  Create [packages/vscode-extension/src/webview/App.css](file:///C:/Users/Kasim%20Kasmi/Documents/antigravity/intelligent-bardeen/packages/vscode-extension/src/webview/App.css):
  ```css
  body {
    padding: 12px;
    margin: 0;
    font-family: var(--vscode-font-family, sans-serif);
    color: var(--vscode-foreground, #cccccc);
    background-color: var(--vscode-sideBar-background, #1e1e1e);
  }

  .container {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .header {
    border-bottom: 1px solid var(--vscode-panel-border, #333333);
    padding-bottom: 8px;
  }

  .header h3 {
    margin: 0;
    font-weight: 600;
  }

  .subtitle {
    font-size: 11px;
    color: var(--vscode-descriptionForeground, #888888);
  }

  .step-card {
    background: var(--vscode-editor-background, #1e1e1e);
    border: 1px solid var(--vscode-panel-border, #333333);
    border-radius: 6px;
    padding: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .step-title {
    margin: 0 0 10px 0;
    color: var(--vscode-activityBarBadge-background, #007acc);
  }

  .checklist {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .checklist-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    cursor: pointer;
    user-select: none;
    transition: opacity 0.2s ease;
  }

  .checklist-item:hover {
    opacity: 0.8;
  }

  .completed-text {
    text-decoration: line-through;
    color: var(--vscode-disabledForeground, #666666);
  }

  .btn {
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 13px;
    cursor: pointer;
    width: 100%;
    font-weight: 500;
    transition: background 0.15s ease;
  }

  .btn-primary {
    background-color: var(--vscode-button-background, #007acc);
    color: var(--vscode-button-foreground, #ffffff);
  }

  .btn-primary:hover {
    background-color: var(--vscode-button-hoverBackground, #0062a3);
  }
  ```

- [x] **Step 3: Create React DOM mount entrypoint**
  Create [packages/vscode-extension/src/webview/index.tsx](file:///C:/Users/Kasim%20Kasmi/Documents/antigravity/intelligent-bardeen/packages/vscode-extension/src/webview/index.tsx):
  ```tsx
  import React from 'react';
  import { createRoot } from 'react-dom/client';
  import App from './App.js';

  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  }
  ```

- [x] **Step 4: Commit Webview source**
  ```bash
  git add packages/vscode-extension/src/webview/App.tsx packages/vscode-extension/src/webview/App.css packages/vscode-extension/src/webview/index.tsx
  git commit -m "feat(webview): build React checklist UI with VS Code variable mapping"
  ```

---

### Task 4: Bundle and Build Pipelines

**Files:**
- Modify: [package.json](file:///C:/Users/Kasim%20Kasmi/Documents/antigravity/intelligent-bardeen/package.json) (Root monorepo workspace mapping)

- [ ] **Step 1: Compile Workspace Extension**
  Compile extension typescript code and React webview bundle.
  Run: `npm run build --workspace=@superpowers/vscode-extension`
  Expected: Compiles with no errors and writes `dist/extension.js` and `dist/webview.js`.

- [ ] **Step 2: Update monorepo root package.json to include extension workspace**
  We must ensure the root packages know about `@superpowers/vscode-extension`.
  Let's verify [package.json](file:///C:/Users/Kasim%20Kasmi/Documents/antigravity/intelligent-bardeen/package.json) contains the workspace mapping.

- [ ] **Step 3: Run root tests and verify complete integration**
  Run: `npm test`
  Expected: All 3 suites (core, mcp-server, vscode-extension) pass.

- [ ] **Step 4: Update active workflow trackers**
  Update `docs/superpowers/ACTIVE_WORKFLOW.md` and `docs/superpowers/ACTIVE_STATE.json`.

- [ ] **Step 5: Final Commit**
  ```bash
  git add package.json docs/superpowers/ACTIVE_WORKFLOW.md docs/superpowers/ACTIVE_STATE.json
  git commit -m "chore(root): finalize Phase 2 workspace setup and plan files"
  ```
