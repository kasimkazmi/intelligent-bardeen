import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SessionTracker } from '../src/tracker.js';
import { Skill } from '../src/parser.js';
import * as fs from 'fs';
import * as path from 'path';

const mockSkill: Skill = {
  name: 'Test-Driven Development',
  description: 'Follow TDD principles',
  metadata: { rigid: true },
  steps: [
    {
      index: 1,
      title: 'Step 1',
      checklist: [
        { id: 'step-1-item-1', text: 'Task A', completed: false },
        { id: 'step-1-item-2', text: 'Task B', completed: false }
      ]
    },
    {
      index: 2,
      title: 'Step 2',
      checklist: [
        { id: 'step-2-item-1', text: 'Task C', completed: false }
      ]
    }
  ]
};

describe('Session Tracker', () => {
  const tempWorkspace = path.join(process.cwd(), 'temp_test_workspace');

  beforeEach(() => {
    fs.mkdirSync(tempWorkspace, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tempWorkspace, { recursive: true, force: true });
  });

  it('correctly tracks and updates state', () => {
    const tracker = new SessionTracker('session-123', mockSkill);
    expect(tracker.getCurrentStep().index).toBe(1);
    expect(tracker.canAdvance()).toBe(false);

    tracker.completeItem('step-1-item-1');
    expect(tracker.getCurrentStep().checklist[0].completed).toBe(true);
    expect(tracker.canAdvance()).toBe(false);

    tracker.completeItem('step-1-item-2');
    expect(tracker.canAdvance()).toBe(true);

    const advanced = tracker.nextStep();
    expect(advanced).toBe(true);
    expect(tracker.getCurrentStep().index).toBe(2);
  });

  it('saves checkpoints to local folder', () => {
    const tracker = new SessionTracker('session-123', mockSkill);
    tracker.saveCheckpoint(tempWorkspace);

    const checkpointPath = path.join(tempWorkspace, '.superpowers', 'sessions', 'session-123.json');
    expect(fs.existsSync(checkpointPath)).toBe(true);

    const data = JSON.parse(fs.readFileSync(checkpointPath, 'utf8'));
    expect(data.sessionId).toBe('session-123');
    expect(data.activeStepIndex).toBe(0);
  });
});
