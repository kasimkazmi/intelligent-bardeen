import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider.js';
import { handleChatRequest } from './chatHandler.js';

export function activate(context: vscode.ExtensionContext) {
  // Sidebar webview
  const sidebarProvider = new SidebarProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      SidebarProvider.viewType,
      sidebarProvider
    )
  );

  // Chat participant (VS Code 1.90+)
  const participant = (vscode as any).chat?.createChatParticipant('superpowers.chat', handleChatRequest);
  if (participant) {
    context.subscriptions.push(participant);
  }

  // Action button commands — invoked when the user clicks inline buttons in chat
  const commandMap: Record<string, string> = {
    'superpowers.brainstorm': 'brainstorm',
    'superpowers.tdd': 'tdd',
    'superpowers.debug': 'debug',
  };

  for (const [commandId, slashCmd] of Object.entries(commandMap)) {
    context.subscriptions.push(
      vscode.commands.registerCommand(commandId, () => {
        vscode.commands.executeCommand(
          'workbench.panel.chat.view.copilot.focus'
        );
        vscode.commands.executeCommand('workbench.action.chat.open', {
          query: `@superpowers /${slashCmd}`,
        });
      })
    );
  }
}

export function deactivate() {}


