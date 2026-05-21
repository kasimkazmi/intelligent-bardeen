# Phase 3: VS Code Chat Participant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Register `@superpowers` as a native Chat Participant in VS Code Chat. It registers slash commands (`/brainstorm`, `/tdd`, `/debug`) and supports rich markdown rendering and inline action buttons inside the native chat stream.

**Architecture:** Leverages VS Code's native `vscode.chat.registerChatParticipant` API to capture and stream messages. It feeds user messages and command requests to the `@superpowers/core` State Engine, streams back token-by-token responses, and injects actionable buttons for file editing or terminal execution.

**Tech Stack:** TypeScript, VS Code Extension API (`vscode`).

---

### Task 1: Registering Chat Participant and Slash Commands

**Files:**
- Modify: `extension/package.json`
- Modify: `extension/src/extension.ts`
- Create: `extension/src/chatHandler.ts`

- [ ] **Step 1: Register Chat Participant in package.json**
  Update `extension/package.json` to include the `chatParticipants` contribution point and commands:
  ```json
  // Add this block inside the existing "contributes" object
  "chatParticipants": [
    {
      "id": "superpowers.chat",
      "name": "superpowers",
      "description": "Agentic workflows for TDD, brainstorming, and debugging",
      "commands": [
        {
          "name": "brainstorm",
          "description": "Initialize a design planning session"
        },
        {
          "name": "tdd",
          "description": "Kick off a Test-Driven Development loop"
        },
        {
          "name": "debug",
          "description": "Run root-cause analysis on test failures"
        }
      ]
    }
  ]
  ```

- [ ] **Step 2: Create Chat Handler Router**
  Create `extension/src/chatHandler.ts` to parse commands and direct traffic:
  ```typescript
  import * as vscode from 'vscode';

  export async function handleChatRequest(
    request: vscode.ChatRequest,
    context: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
  ): Promise<vscode.ChatResult | undefined> {
    
    stream.markdown(`Initializing your agent workflow...\n\n`);

    if (request.command === 'brainstorm') {
      stream.markdown(`### 🧠 Brainstorming Mode Activated\n`);
      stream.markdown(`Tell me what feature you want to design, and I will explore constraints step-by-step.`);
      return { metadata: { command: 'brainstorm' } };
    }

    if (request.command === 'tdd') {
      stream.markdown(`### 🧪 TDD Loop Activated\n`);
      stream.markdown(`Let's write a failing test first. Specify the file path or behaviour you wish to test.`);
      return { metadata: { command: 'tdd' } };
    }

    if (request.command === 'debug') {
      stream.markdown(`### 🛠️ Systematic Debugging Activated\n`);
      stream.markdown(`Paste your error log or test failure, and I'll walk through the root cause analysis.`);
      return { metadata: { command: 'debug' } };
    }

    // Default chat fallback
    stream.markdown(`Welcome to **Superpowers**! Use a slash command to begin a guided session:
- \`/brainstorm\` to plan features
- \`/tdd\` to write tests first
- \`/debug\` to diagnose exceptions`);
    return { metadata: { command: 'default' } };
  }
  ```

- [ ] **Step 3: Hook Chat Participant into Extension Activation**
  Modify `extension/src/extension.ts` to register the participant on startup:
  ```typescript
  import * as vscode from 'vscode';
  import { SidebarProvider } from './SidebarProvider.js';
  import { handleChatRequest } from './chatHandler.js';

  export function activate(context: vscode.ExtensionContext) {
    // Webview Sidebar registration
    const sidebarProvider = new SidebarProvider(context.extensionUri);
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
        SidebarProvider.viewType,
        sidebarProvider
      )
    );

    // Chat Participant registration
    const participant = vscode.chat.createChatParticipant("superpowers.chat", handleChatRequest);
    context.subscriptions.push(participant);
  }

  export function deactivate() {}
  ```

- [ ] **Step 4: Verify compiling**
  Run: `npx tsc -p ./extension/tsconfig.json`
  Expected output: Compile successfully with no typescript errors.

- [ ] **Step 5: Commit changes**
  Run:
  ```bash
  git add extension/package.json extension/src/chatHandler.ts extension/src/extension.ts
  git commit -m "feat(chat): register chat participant and route slash commands"
  ```

---

### Task 2: Action Buttons & Core Engine Execution

**Files:**
- Modify: `extension/src/chatHandler.ts`

- [ ] **Step 1: Update Chat Handler to render inline action buttons**
  Add interactive buttons that trigger local extension commands (e.g. running scripts or generating files) directly in the chat bubble.
  
  Modify `extension/src/chatHandler.ts`:
  ```typescript
  // Import vscode commands namespace
  import * as vscode from 'vscode';

  export async function handleChatRequest(
    request: vscode.ChatRequest,
    context: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
  ): Promise<vscode.ChatResult | undefined> {
    
    if (request.command === 'tdd') {
      stream.markdown(`### 🧪 TDD Step 1: Write a failing test\n`);
      stream.markdown(`I have formatted a draft test case. Click the button below to write it to disk or run it.`);
      
      // Stream an action button
      stream.button({
        command: 'superpowers.writeDraftTest',
        title: '✍️ Write Draft Test File'
      });
      
      stream.button({
        command: 'superpowers.runTests',
        title: '🏃‍♂️ Run Tests'
      });

      return { metadata: { command: 'tdd' } };
    }
    
    return { metadata: { command: 'default' } };
  }
  ```

- [ ] **Step 2: Register Commands inside extension activation**
  Add command definitions to execute when chat buttons are clicked.
  
  Modify `extension/src/extension.ts`:
  ```typescript
  // Register the commands corresponding to chat buttons
  export function activate(context: vscode.ExtensionContext) {
    // Existing provider and participant setups...

    context.subscriptions.push(
      vscode.commands.registerCommand('superpowers.writeDraftTest', async () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) return;
        const testFileUri = vscode.Uri.joinPath(workspaceFolders[0].uri, 'tests', 'sample.test.js');
        const defaultContent = Buffer.from(`import { test } from 'vitest';\ntest('runs successfully', () => {});\n`);
        await vscode.workspace.fs.writeFile(testFileUri, defaultContent);
        vscode.window.showInformationMessage('Created sample.test.js in tests/ directory');
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand('superpowers.runTests', () => {
        const terminal = vscode.window.createTerminal('Superpowers Test Runner');
        terminal.show();
        terminal.sendText('npm run test');
      })
    );
  }
  ```

- [ ] **Step 3: Run full TypeScript compilation check**
  Run: `npx tsc -p ./extension/tsconfig.json`
  Expected output: Compile successfully.

- [ ] **Step 4: Commit**
  Run:
  ```bash
  git add extension/src/extension.ts extension/src/chatHandler.ts
  git commit -m "feat(chat): implement inline action buttons and command integrations"
  ```
