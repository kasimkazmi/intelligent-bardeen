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
  metadata: {
    rigid: boolean;
  };
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
      if (line.startsWith('name:')) {
        name = line.replace('name:', '').trim();
      } else if (line.startsWith('description:')) {
        description = line.replace('description:', '').trim();
      } else if (line.startsWith('rigid:')) {
        rigid = line.replace('rigid:', '').trim() === 'true';
      }
      continue;
    }

    if (line.startsWith('# ')) {
      if (currentStep) {
        steps.push(currentStep);
      }
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
  if (currentStep) {
    steps.push(currentStep);
  }

  return {
    name,
    description,
    metadata: { rigid },
    steps
  };
}
