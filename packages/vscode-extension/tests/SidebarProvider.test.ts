import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock vscode module before imports
vi.mock('vscode', () => import('./mocks/vscode.js'));

import * as vscode from 'vscode';
import { SidebarProvider } from '../src/SidebarProvider.js';

describe('SidebarProvider', () => {
  let mockExtensionUri: any;

  beforeEach(() => {
    vi.clearAllMocks();
    (vscode.window as any).terminals = [];
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
      },
      onDidDispose: vi.fn()
    };

    provider.resolveWebviewView(mockWebviewView, {} as any, {} as any);

    expect(vscode.window.createTerminal).toHaveBeenCalledWith('Superpowers Runner');
    const createdTerminal = (vscode.window as any).terminals[0];
    expect(createdTerminal.sendText).toHaveBeenCalledWith('npm run test');
  });

  it('does not run command if value is invalid', async () => {
    const provider = new SidebarProvider(mockExtensionUri);
    const mockWebviewView: any = {
      webview: {
        options: {},
        html: '',
        onDidReceiveMessage: vi.fn().mockImplementation((callback) => {
          callback({ type: 'runCommand', value: '   ' });
          callback({ type: 'runCommand', value: null });
          return { dispose: vi.fn() };
        }),
        asWebviewUri: vi.fn().mockReturnValue('mock-uri')
      },
      onDidDispose: vi.fn()
    };

    provider.resolveWebviewView(mockWebviewView, {} as any, {} as any);

    expect(vscode.window.createTerminal).not.toHaveBeenCalled();
  });

  it('reuses terminal if it already exists', async () => {
    const mockTerminal = {
      name: 'Superpowers Runner',
      show: vi.fn(),
      sendText: vi.fn()
    };
    (vscode.window as any).terminals = [mockTerminal];

    const provider = new SidebarProvider(mockExtensionUri);
    const mockWebviewView: any = {
      webview: {
        options: {},
        html: '',
        onDidReceiveMessage: vi.fn().mockImplementation((callback) => {
          callback({ type: 'runCommand', value: 'npm run test' });
          return { dispose: vi.fn() };
        }),
        asWebviewUri: vi.fn().mockReturnValue('mock-uri')
      },
      onDidDispose: vi.fn()
    };

    provider.resolveWebviewView(mockWebviewView, {} as any, {} as any);

    expect(vscode.window.createTerminal).not.toHaveBeenCalled();
    expect(mockTerminal.show).toHaveBeenCalled();
    expect(mockTerminal.sendText).toHaveBeenCalledWith('npm run test');
  });

  it('disposes message listener on dispose', async () => {
    const provider = new SidebarProvider(mockExtensionUri);
    const mockDispose = vi.fn();
    let disposeCallback: any;

    const mockWebviewView: any = {
      webview: {
        options: {},
        html: '',
        onDidReceiveMessage: vi.fn().mockReturnValue({ dispose: mockDispose }),
        asWebviewUri: vi.fn().mockReturnValue('mock-uri')
      },
      onDidDispose: vi.fn().mockImplementation((callback) => {
        disposeCallback = callback;
        return { dispose: vi.fn() };
      })
    };

    provider.resolveWebviewView(mockWebviewView, {} as any, {} as any);

    expect(disposeCallback).toBeDefined();
    disposeCallback();
    expect(mockDispose).toHaveBeenCalled();
  });
});
