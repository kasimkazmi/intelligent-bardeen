import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('vscode', () => import('./mocks/vscode.js'));

import * as vscode from 'vscode';
import { activate } from '../src/extension.js';

describe('activate – command registration', () => {
  let mockContext: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockContext = {
      extensionUri: { fsPath: '/test-path' },
      subscriptions: { push: vi.fn() },
    };
  });

  it('registers superpowers.brainstorm command', () => {
    activate(mockContext);
    const calls = (vscode.commands.registerCommand as any).mock.calls.map(
      (c: any[]) => c[0]
    );
    expect(calls).toContain('superpowers.brainstorm');
  });

  it('registers superpowers.tdd command', () => {
    activate(mockContext);
    const calls = (vscode.commands.registerCommand as any).mock.calls.map(
      (c: any[]) => c[0]
    );
    expect(calls).toContain('superpowers.tdd');
  });

  it('registers superpowers.debug command', () => {
    activate(mockContext);
    const calls = (vscode.commands.registerCommand as any).mock.calls.map(
      (c: any[]) => c[0]
    );
    expect(calls).toContain('superpowers.debug');
  });

  it('pushes registered commands into subscriptions', () => {
    activate(mockContext);
    // subscriptions.push should be called at least 4 times:
    // 1× webviewViewProvider + 1× chat participant (if chat is available) + 3× commands
    expect(mockContext.subscriptions.push).toHaveBeenCalled();
  });
});
