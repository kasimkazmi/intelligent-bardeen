import { vi } from 'vitest';

export const window = {
  showInformationMessage: vi.fn(),
  terminals: [] as any[],
  createTerminal: vi.fn().mockImplementation((name: string) => {
    const term = {
      name,
      show: vi.fn(),
      sendText: vi.fn()
    };
    window.terminals.push(term);
    return term;
  }),
  registerWebviewViewProvider: vi.fn()
};

export const Uri = {
  parse: vi.fn().mockImplementation((val) => ({ path: val, fsPath: val })),
  file: vi.fn().mockImplementation((val) => ({ path: val, fsPath: val })),
  joinPath: vi.fn().mockImplementation((base, ...paths) => {
    const joinedPath = base ? [base.path || '', ...paths].filter(Boolean).join('/') : paths.join('/');
    const joinedFsPath = base ? [base.fsPath || '', ...paths].filter(Boolean).join('/') : paths.join('/');
    return {
      ...base,
      path: joinedPath,
      fsPath: joinedFsPath
    };
  })
};

export const workspace = {
  fs: {
    readFile: vi.fn()
  }
};

export const commands = {
  registerCommand: vi.fn().mockReturnValue({ dispose: vi.fn() }),
  executeCommand: vi.fn().mockResolvedValue(undefined),
};

// Stub so (vscode as any).chat?.createChatParticipant resolves to undefined safely
export const chat = {
  createChatParticipant: vi.fn().mockReturnValue(undefined),
};
