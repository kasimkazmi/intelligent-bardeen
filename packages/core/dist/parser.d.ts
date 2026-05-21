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
export declare function parseSkillMarkdown(content: string): Skill;
//# sourceMappingURL=parser.d.ts.map