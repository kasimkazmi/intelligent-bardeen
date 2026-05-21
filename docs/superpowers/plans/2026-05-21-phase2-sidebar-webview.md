# Phase 2: VS Code Sidebar Extension Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a VS Code Sidebar Webview extension displaying interactive checklists, session state, and terminal logs, with full VS Code API permissions to read/write files and run local test scripts.

**Architecture:** A standard VS Code Extension registering a Sidebar View Provider. It loads a React frontend inside an iframe Webview, leveraging the VS Code API messaging channel (`vscode.postMessage`) to send/receive commands, file updates, and run commands in the terminal.

**Tech Stack:** TypeScript, VS Code Extension API (`vscode`), React, Vite.

---

### Task 1: Extension Boilerplate and Sidebar View Provider

**Files:**
- Create: `extension/package.json`
- Create: `extension/src/extension.ts`
- Create: `extension/src/SidebarProvider.ts`

- [ ] **Step 1: Create extension package.json**
  Set up the VS Code extension manifest, contributing a sidebar container and view.
  
  Create `extension/package.json`:
  ```json
  {
    "name": "superpowers-vscode-sidebar",
    "displayName": "Superpowers Agent",
    "version": "1.0.0",
    "publisher": "kasim-kazmi",
    "engines": {
      "vscode": "^1.90.0"
    },
    "categories": [
      "AI"
    ],
    "activationEvents": [],
    "main": "./dist/extension.js",
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
    "scripts": {
      "compile": "tsc -p ./",
      "watch": "tsc -watch -p ./"
    },
    "dependencies": {},
    "devDependencies": {
      "@types/vscode": "^1.90.0",
      "typescript": "^5.4.5"
    }
  }
  ```

- [ ] **Step 2: Implement Sidebar View Provider**
  Create the provider class that loads the HTML and sets up the message event listener.
  
  Create `extension/src/SidebarProvider.ts`:
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
      return `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Superpowers Dashboard</title>
          <style>
            body { font-family: sans-serif; padding: 15px; color: var(--vscode-foreground); }
            button { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; padding: 8px 12px; cursor: pointer; }
            button:hover { background: var(--vscode-button-hoverBackground); }
          </style>
        </head>
        <body>
          <h2>Superpowers Workspace</h2>
          <button onclick="runTest()">Run Tests</button>
          <script>
            const vscode = acquireVsCodeApi();
            function runTest() {
              vscode.postMessage({ type: 'runCommand', value: 'npm run test' });
            }
          </script>
        </body>
        </html>`;
    }
  }
  ```

- [ ] **Step 3: Hook provider up in extension entry point**
  Create `extension/src/extension.ts`:
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

- [ ] **Step 4: Verify compiling**
  Compile the extension typescript files using:
  Run: `npx tsc -p ./extension/tsconfig.json` (assume a standard tsconfig.json is placed in extension folder)
  Expected output: Success with no type errors.

- [ ] **Step 5: Commit changes**
  Run:
  ```bash
  git add extension/package.json extension/src/SidebarProvider.ts extension/src/extension.ts
  git commit -m "feat(extension): scaffold VS Code sidebar provider and message loop"
  ```

---

### Task 2: React Dashboard Interface & Inter-Process Communication

**Files:**
- Modify: `extension/src/SidebarProvider.ts`
- Create: `extension/src/webview/App.tsx`
- Create: `extension/src/webview/index.tsx`

- [ ] **Step 1: Update Sidebar Provider HTML to point to dynamic compiled JS**
  Modify `extension/src/SidebarProvider.ts` to read compiled React scripts from the build directory:
  ```typescript
  // Replace _getHtmlForWebview implementation to reference react compiled script paths
  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview.js')
    );
    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Superpowers Dashboard</title>
        <style>
          body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); background-color: var(--vscode-sideBar-background); }
          .step-card { border: 1px solid var(--vscode-panel-border); padding: 10px; margin-bottom: 8px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script src="${scriptUri}"></script>
      </body>
      </html>`;
  }
  ```

- [ ] **Step 2: Implement React App with task list state**
  Create `extension/src/webview/App.tsx` containing interactive checkboxes and state management for active steps:
  ```tsx
  import React, { useState, useEffect } from 'react';

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
        { id: '1', text: 'Write a test file under tests/', completed: false },
        { id: '2', text: 'Verify test fails running npm test', completed: false }
      ]
    });

    const toggleItem = (itemId: string) => {
      const updatedChecklist = currentStep.checklist.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      setCurrentStep({ ...currentStep, checklist: updatedChecklist });
      // Notify VS Code host
      (window as any).vscode?.postMessage({ type: 'itemToggled', itemId });
    };

    return (
      <div style={{ padding: '10px' }}>
        <h3>Active Phase: TDD Workflow</h3>
        <div className="step-card">
          <h4>{currentStep.title}</h4>
          {currentStep.checklist.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: '8px', margin: '4px 0' }}>
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleItem(item.id)}
              />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 3: Implement Webview entrypoint**
  Create `extension/src/webview/index.tsx`:
  ```tsx
  import React from 'react';
  import { createRoot } from 'react-dom/client';
  import App from './App.js';

  const root = createRoot(document.getElementById('root')!);
  root.render(<App />);
  ```

- [ ] **Step 4: Setup webview compiler script and compile**
  Configure webpack/vite/esbuild to compile `index.tsx` to `dist/webview.js`.
  Run: `npx esbuild extension/src/webview/index.tsx --bundle --outfile=extension/dist/webview.js --minify --platform=browser`
  Expected output: Success with compilation size report.

- [ ] **Step 5: Commit changes**
  Run:
  ```bash
  git add extension/src/webview/App.tsx extension/src/webview/index.tsx
  git commit -m "feat(webview): build React checklist dashboard UI"
  ```
