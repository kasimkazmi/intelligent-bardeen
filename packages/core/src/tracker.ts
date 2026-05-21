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
    if (!this.skill.metadata.rigid) {
      return true;
    }
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
    
    const checkpointData = {
      sessionId: this.sessionId,
      activeStepIndex: this.activeStepIndex,
      skill: this.skill
    };

    fs.writeFileSync(checkpointFile, JSON.stringify(checkpointData, null, 2));
  }
}
