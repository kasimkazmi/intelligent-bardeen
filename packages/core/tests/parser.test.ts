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
    expect(result.description).toBe('Follow TDD principles');
    expect(result.metadata.rigid).toBe(true);
    expect(result.steps.length).toBe(1);
    expect(result.steps[0].title).toBe('Step 1: Write a failing test');
    expect(result.steps[0].checklist.length).toBe(2);
    expect(result.steps[0].checklist[0].text).toBe('Create test file');
    expect(result.steps[0].checklist[0].id).toBe('step-1-item-1');
  });
});
