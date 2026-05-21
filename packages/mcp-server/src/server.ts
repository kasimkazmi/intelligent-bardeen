import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { parseSkillMarkdown, SessionTracker } from '@superpowers/core';

const server = new Server(
  {
    name: 'superpowers-mcp-server',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

const sessions = new Map<string, SessionTracker>();

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'start_session',
        description: 'Start a new workflow session from a markdown skill file',
        inputSchema: {
          type: 'object',
          properties: {
            skillContent: {
              type: 'string',
              description: 'Raw markdown contents of the skill file'
            },
            workspacePath: {
              type: 'string',
              description: 'Absolute path to the current workspace'
            }
          },
          required: ['skillContent', 'workspacePath']
        }
      },
      {
        name: 'update_checklist',
        description: 'Update checklist items in the current step of an active session',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'The unique ID of the active session'
            },
            itemId: {
              type: 'string',
              description: 'The unique ID of the checklist item to complete'
            },
            workspacePath: {
              type: 'string',
              description: 'Absolute path to the current workspace'
            }
          },
          required: ['sessionId', 'itemId', 'workspacePath']
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'start_session') {
    const skillContent = args?.skillContent as string;
    const workspacePath = args?.workspacePath as string;

    if (!skillContent || !workspacePath) {
      throw new Error('Missing required arguments: skillContent, workspacePath');
    }

    const sessionId = `sess-${Date.now()}`;
    const skill = parseSkillMarkdown(skillContent);
    const tracker = new SessionTracker(sessionId, skill);
    sessions.set(sessionId, tracker);
    tracker.saveCheckpoint(workspacePath);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            sessionId,
            step: tracker.getCurrentStep(),
            canAdvance: tracker.canAdvance()
          }, null, 2)
        }
      ]
    };
  }

  if (name === 'update_checklist') {
    const sessionId = args?.sessionId as string;
    const itemId = args?.itemId as string;
    const workspacePath = args?.workspacePath as string;

    if (!sessionId || !itemId || !workspacePath) {
      throw new Error('Missing required arguments: sessionId, itemId, workspacePath');
    }

    const tracker = sessions.get(sessionId);
    if (!tracker) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    tracker.completeItem(itemId);
    tracker.saveCheckpoint(workspacePath);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            step: tracker.getCurrentStep(),
            canAdvance: tracker.canAdvance()
          }, null, 2)
        }
      ]
    };
  }

  throw new Error(`Tool not found: ${name}`);
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Superpowers MCP server running on stdio');
}

run().catch((error) => {
  console.error('Fatal error running server:', error);
  process.exit(1);
});
