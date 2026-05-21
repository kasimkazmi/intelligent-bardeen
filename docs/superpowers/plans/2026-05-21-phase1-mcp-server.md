# Phase 1: Core MCP Server Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `@superpowers/core` TypeScript library and the Superpowers MCP Server to parse skills and expose standard JSON-RPC tools for agent workflows.

**Architecture:** A modular Node.js/TypeScript codebase split into a core parser/state-engine and an MCP protocol layer. The core engine translates markdown skills into executable state trees, while the MCP server exposes tools to load skills, start sessions, check items, and verify gates.

**Tech Stack:** TypeScript (v5.x), Node.js, `@modelcontextprotocol/sdk`, Vitest (for unit tests).

---

### Task 1: Project Setup and Skill Parser

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `src/parser.ts`
- Create: `tests/parser.test.ts`

- [ ] **Step 1: Create package.json and tsconfig.json**
  Configure the TypeScript project with ESModules support and standard dependencies.
  
  Create `package.json`:
  ```json
  {
    "name": "superpowers-mcp-server",
    "version": "1.0.0",
    "type": "module",
    "main": "dist/server.js",
    "scripts": {
      "build": "tsc",
      "test": "vitest run",
      "start": "node dist/server.js"
    },
    "dependencies": {
      "@modelcontextprotocol/sdk": "^0.6.0",
      "zod": "^3.23.8"
    },
    "devDependencies": {
      "@types/node": "^20.12.7",
      "typescript": "^5.4.5",
      "vitest": "^1.5.0"
    }
  }
  ```

  Create `tsconfig.json`:
  ```json
  {
    "compilerOptions": {
      "target": "ES2022",
      "module": "NodeNext",
      "moduleResolution": "NodeNext",
      "outDir": "./dist",
      "rootDir": "./src",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true
    },
    "include": ["src/**/*"]
  }
  ```

- [ ] **Step 2: Create a failing test for the parser**
  Create `tests/parser.test.ts` with tests for frontmatter, step parsing, and checklist extraction.
  ```typescript
  import { describe, it, expect } from 'vitest';
  import { parseSkillMarkdown } from '../src/parser.js';

  describe('Skill Markdown Parser', () => {
    it('correctly parses frontmatter, steps, and checklist items', () => {
      const markdown = `---
name: Test-Driven Development
description: Follow TDD principles
rigid: true
---

# Step 1: Write a failing test
- [ ] Create test file
- [ ] Run test to confirm fail
`;
      const result = parseSkillMarkdown(markdown);
      expect(result.name).toBe('Test-Driven Development');
      expect(result.metadata.rigid).toBe(true);
      expect(result.steps.length).toBe(1);
      expect(result.steps[0].title).toBe('Step 1: Write a failing test');
      expect(result.steps[0].checklist.length).toBe(2);
      expect(result.steps[0].checklist[0].text).toBe('Create test file');
    });
  });
  ```

- [ ] **Step 3: Run the test and verify it fails**
  Run: `npm run test`
  Expected output: FAIL (parser module does not exist or functions not declared).

- [ ] **Step 4: Implement the minimal parser to pass the test**
  Create `src/parser.ts` to implement markdown splitting and frontmatter extraction:
  ```typescript
  export interface ChecklistItem {
    id: string;
    text: string;
    completed: boolean;
  }

  export interface SkillStep {
    index: number;
    title: string;
    checklist: ChecklistItem[];
  }

  export interface Skill {
    name: string;
    description: string;
    metadata: { rigid: boolean };
    steps: SkillStep[];
  }

  export function parseSkillMarkdown(content: string): Skill {
    const lines = content.split('\n');
    let name = '';
    let description = '';
    let rigid = false;
    let currentStep: SkillStep | null = null;
    const steps: SkillStep[] = [];
    let parsingFrontmatter = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '---') {
        parsingFrontmatter = !parsingFrontmatter;
        continue;
      }
      if (parsingFrontmatter) {
        if (line.startsWith('name:')) name = line.replace('name:', '').trim();
        if (line.startsWith('description:')) description = line.replace('description:', '').trim();
        if (line.startsWith('rigid:')) rigid = line.replace('rigid:', '').trim() === 'true';
        continue;
      }

      if (line.startsWith('# ')) {
        if (currentStep) steps.push(currentStep);
        currentStep = {
          index: steps.length + 1,
          title: line.replace('# ', '').trim(),
          checklist: []
        };
      } else if (line.startsWith('- [ ]') && currentStep) {
        const text = line.replace('- [ ]', '').trim();
        currentStep.checklist.push({
          id: `step-${currentStep.index}-item-${currentStep.checklist.length + 1}`,
          text,
          completed: false
        });
      }
    }
    if (currentStep) steps.push(currentStep);

    return { name, description, metadata: { rigid }, steps };
  }
  ```

- [ ] **Step 5: Run tests and commit**
  Run: `npm run test`
  Expected output: PASS
  Commit commands:
  ```bash
  git add package.json tsconfig.json src/parser.ts tests/parser.test.ts
  git commit -m "feat(parser): add markdown parser and config setup"
  ```

---

### Task 2: State Tracker & Checkpoint System

**Files:**
- Create: `src/tracker.ts`
- Create: `tests/tracker.test.ts`

- [ ] **Step 1: Write a failing test for state management**
  Create `tests/tracker.test.ts` to test updating checklists, active steps, and checkpoint saving.
  ```typescript
  import { describe, it, expect, vi } from 'vitest';
  import { SessionTracker } from '../src/tracker.js';
  import { Skill } from '../src/parser.js';

  const mockSkill: Skill = {
    name: 'TDD',
    description: 'Test TDD',
    metadata: { rigid: true },
    steps: [
      {
        index: 1,
        title: 'Step 1',
        checklist: [
          { id: '1-1', text: 'Task A', completed: false },
          { id: '1-2', text: 'Task B', completed: false }
        ]
      }
    ]
  };

  describe('Session Tracker', () => {
    it('marks checklist item complete and tracks state', () => {
      const tracker = new SessionTracker('session-abc', mockSkill);
      expect(tracker.getCurrentStep().index).toBe(1);
      
      tracker.completeItem('1-1');
      expect(tracker.getCurrentStep().checklist[0].completed).toBe(true);
    });
  });
  ```

- [ ] **Step 2: Run tests and verify failure**
  Run: `npm run test`
  Expected output: FAIL (tracker not defined).

- [ ] **Step 3: Implement SessionTracker**
  Create `src/tracker.ts`:
  ```typescript
  import { Skill, SkillStep } from './parser.js';
  import * as fs from 'fs';
  import * as path from 'path';

  export class SessionTracker {
    private sessionId: string;
    private skill: Skill;
    private activeStepIndex: number = 0;

    constructor(sessionId: string, skill: Skill) {
      this.sessionId = sessionId;
      this.skill = JSON.parse(JSON.stringify(skill)); // Deep copy
    }

    getCurrentStep(): SkillStep {
      return this.skill.steps[this.activeStepIndex];
    }

    completeItem(itemId: string): void {
      const step = this.getCurrentStep();
      const item = step.checklist.find(i => i.id === itemId);
      if (item) {
        item.completed = true;
      }
    }

    canAdvance(): boolean {
      if (!this.skill.metadata.rigid) return true;
      const step = this.getCurrentStep();
      return step.checklist.every(item => item.completed);
    }

    nextStep(): boolean {
      if (this.canAdvance() && this.activeStepIndex < this.skill.steps.length - 1) {
        this.activeStepIndex++;
        return true;
      }
      return false;
    }

    saveCheckpoint(workspacePath: string): void {
      const checkpointDir = path.join(workspacePath, '.superpowers', 'sessions');
      fs.mkdirSync(checkpointDir, { recursive: true });
      const checkpointFile = path.join(checkpointDir, `${this.sessionId}.json`);
      fs.writeFileSync(checkpointFile, JSON.stringify({
        sessionId: this.sessionId,
        activeStepIndex: this.activeStepIndex,
        skill: this.skill
      }, null, 2));
    }
  }
  ```

- [ ] **Step 4: Run tests and confirm pass**
  Run: `npm run test`
  Expected output: PASS

- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add src/tracker.ts tests/tracker.test.ts
  git commit -m "feat(tracker): implement state tracking and checkpointing"
  ```

---

### Task 3: Building the MCP Server

**Files:**
- Create: `src/server.ts`

- [ ] **Step 1: Implement the MCP Server logic**
  Build the server that implements the `@modelcontextprotocol/sdk` and exposes the core engine functions over Stdio transport.
  
  Create `src/server.ts`:
  ```typescript
  import { Server } from '@modelcontextprotocol/sdk/server/index.js';
  import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
  import {
    CallToolRequestSchema,
    ListToolsRequestSchema
  } from '@modelcontextprotocol/sdk/types.js';
  import { parseSkillMarkdown } from './parser.js';
  import { SessionTracker } from './tracker.js';
  import * as fs from 'fs';
  import * as path from 'path';

  const server = new Server(
    { name: 'superpowers-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
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
              skillContent: { type: 'string', description: 'Raw markdown contents of the skill' },
              workspacePath: { type: 'string', description: 'Absolute path to current workspace' }
            },
            required: ['skillContent', 'workspacePath']
          }
        },
        {
          name: 'update_checklist',
          description: 'Update checklist items in the current step',
          inputSchema: {
            type: 'object',
            properties: {
              sessionId: { type: 'string' },
              itemId: { type: 'string' },
              workspacePath: { type: 'string' }
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
      const sessionId = `sess-${Date.now()}`;
      const skill = parseSkillMarkdown(args?.skillContent as string);
      const tracker = new SessionTracker(sessionId, skill);
      sessions.set(sessionId, tracker);
      tracker.saveCheckpoint(args?.workspacePath as string);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ sessionId, step: tracker.getCurrentStep() })
          }
        ]
      };
    }

    if (name === 'update_checklist') {
      const sessionId = args?.sessionId as string;
      const itemId = args?.itemId as string;
      const workspacePath = args?.workspacePath as string;
      const tracker = sessions.get(sessionId);

      if (!tracker) {
        throw new Error('Session not found');
      }

      tracker.completeItem(itemId);
      tracker.saveCheckpoint(workspacePath);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ step: tracker.getCurrentStep(), canAdvance: tracker.canAdvance() })
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

  run().catch(console.error);
  ```

- [ ] **Step 2: Run build and verify successful compilation**
  Run: `npm run build`
  Expected output: Compiles to `./dist` with no type errors.

- [ ] **Step 3: Commit**
  Run:
  ```bash
  git add src/server.ts
  git commit -m "feat(server): implement MCP protocol wrapper for workflows"
  ```
