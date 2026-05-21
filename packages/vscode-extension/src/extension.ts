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
