import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

describe('MCP Server Integration', () => {
  let serverProcess: ChildProcessWithoutNullStreams;
  const tempWorkspace = path.join(process.cwd(), 'temp_mcp_test_workspace');

  beforeAll(() => {
    fs.mkdirSync(tempWorkspace, { recursive: true });
    // Spawn server process
    const serverPath = path.join(process.cwd(), 'dist', 'server.js');
    serverProcess = spawn('node', [serverPath]);
    serverProcess.stderr.on('data', (data) => {
      console.error(`[Server Stderr] ${data}`);
    });
  });

  afterAll(() => {
    serverProcess.kill();
    fs.rmSync(tempWorkspace, { recursive: true, force: true });
  });

  const sendRequest = (request: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      const onData = (data: Buffer) => {
        serverProcess.stdout.off('data', onData);
        try {
          const response = JSON.parse(data.toString());
          resolve(response);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data.toString()}`));
        }
      };

      serverProcess.stdout.on('data', onData);
      serverProcess.stdin.write(JSON.stringify(request) + '\n');
    });
  };

  it('handles tools/list request correctly', async () => {
    const request = {
      jsonrpc: '2.0',
      method: 'tools/list',
      id: 1,
      params: {}
    };

    const response = await sendRequest(request);
    expect(response.id).toBe(1);
    expect(response.result).toBeDefined();
    expect(response.result.tools).toHaveLength(2);
    expect(response.result.tools[0].name).toBe('start_session');
    expect(response.result.tools[1].name).toBe('update_checklist');
  });

  it('handles tools/call start_session correctly', async () => {
    const request = {
      jsonrpc: '2.0',
      method: 'tools/call',
      id: 2,
      params: {
        name: 'start_session',
        arguments: {
          skillContent: '---\nname: Mock Skill\nrigid: true\n---\n# Step 1\n- [ ] Task A\n',
          workspacePath: tempWorkspace
        }
      }
    };

    const response = await sendRequest(request);
    expect(response.id).toBe(2);
    expect(response.result).toBeDefined();
    const content = JSON.parse(response.result.content[0].text);
    expect(content.sessionId).toBeDefined();
    expect(content.step.title).toBe('Step 1');
    expect(content.step.checklist[0].text).toBe('Task A');
  });
});
