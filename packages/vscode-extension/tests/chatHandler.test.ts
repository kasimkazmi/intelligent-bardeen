import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('vscode', () => import('./mocks/vscode.js'));

import { handleChatRequest } from '../src/chatHandler.js';

// Minimal mock helpers
function makeStream() {
  return {
    markdown: vi.fn(),
    button: vi.fn(),
  };
}

function makeRequest(command: string | undefined, prompt = '') {
  return { command, prompt } as any;
}

describe('handleChatRequest', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('responds with brainstorm mode markdown when /brainstorm', async () => {
    const stream = makeStream();
    const result = await handleChatRequest(makeRequest('brainstorm'), {} as any, stream as any, {} as any);
    expect(stream.markdown).toHaveBeenCalledWith(expect.stringContaining('Brainstorming'));
    expect(result?.metadata?.command).toBe('brainstorm');
  });

  it('responds with tdd mode markdown when /tdd', async () => {
    const stream = makeStream();
    const result = await handleChatRequest(makeRequest('tdd'), {} as any, stream as any, {} as any);
    expect(stream.markdown).toHaveBeenCalledWith(expect.stringContaining('TDD'));
    expect(result?.metadata?.command).toBe('tdd');
  });

  it('responds with debug mode markdown when /debug', async () => {
    const stream = makeStream();
    const result = await handleChatRequest(makeRequest('debug'), {} as any, stream as any, {} as any);
    expect(stream.markdown).toHaveBeenCalledWith(expect.stringContaining('Debugging'));
    expect(result?.metadata?.command).toBe('debug');
  });

  it('returns default fallback for unknown command', async () => {
    const stream = makeStream();
    const result = await handleChatRequest(makeRequest(undefined), {} as any, stream as any, {} as any);
    expect(stream.markdown).toHaveBeenCalled();
    expect(result?.metadata?.command).toBe('default');
  });
});
