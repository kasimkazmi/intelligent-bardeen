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
    (stream as any).button?.({
      command: 'superpowers.brainstorm',
      title: '🧠 Start Brainstorming',
    });
    return { metadata: { command: 'brainstorm' } };
  }

  if (request.command === 'tdd') {
    stream.markdown(`### 🧪 TDD Loop Activated\n`);
    stream.markdown(`Let's write a failing test first. Specify the file path or behaviour you wish to test.`);
    (stream as any).button?.({
      command: 'superpowers.tdd',
      title: '🧪 Start TDD Loop',
    });
    return { metadata: { command: 'tdd' } };
  }

  if (request.command === 'debug') {
    stream.markdown(`### 🛠️ Systematic Debugging Activated\n`);
    stream.markdown(`Paste your error log or test failure, and I'll walk through the root cause analysis.`);
    (stream as any).button?.({
      command: 'superpowers.debug',
      title: '🛠️ Start Debugging',
    });
    return { metadata: { command: 'debug' } };
  }

  // Default fallback
  stream.markdown(`Welcome to **Superpowers**! Use a slash command to begin a guided session:\n- \`/brainstorm\` to plan features\n- \`/tdd\` to write tests first\n- \`/debug\` to diagnose exceptions`);
  return { metadata: { command: 'default' } };
}

