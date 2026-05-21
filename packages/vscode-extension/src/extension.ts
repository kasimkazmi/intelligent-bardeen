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
}

export function deactivate() {}

