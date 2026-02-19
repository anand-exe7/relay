import { ContributorSkill, SkillCategory } from '@/types';

export const SKILL_MAP: Record<string, SkillCategory> = {
  '.tsx': 'frontend', '.jsx': 'frontend', '.css': 'frontend', '.scss': 'frontend',
  '.html': 'frontend', '.vue': 'frontend', '.svelte': 'frontend', '.less': 'frontend',
  '.py': 'backend', '.go': 'backend', '.java': 'backend', '.rs': 'backend',
  '.rb': 'backend', '.php': 'backend', '.cs': 'backend', '.cpp': 'backend',
  '.c': 'backend', '.ts': 'frontend', '.js': 'frontend',
  '.sql': 'database', '.prisma': 'database', '.migration': 'database',
  '.yml': 'devops', '.yaml': 'devops', '.dockerfile': 'devops', '.tf': 'devops',
  '.sh': 'devops', '.toml': 'devops',
  '.ipynb': 'ml', '.pkl': 'ml', '.h5': 'ml', '.onnx': 'ml',
  '.figma': 'design', '.sketch': 'design', '.svg': 'design', '.psd': 'design',
  '.md': 'docs', '.txt': 'docs', '.rst': 'docs',
};

export const SKILL_LABELS: Record<SkillCategory, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  database: 'Database',
  devops: 'DevOps',
  ml: 'ML / AI',
  design: 'Design',
  docs: 'Documentation',
  other: 'Other',
};

export const SKILL_COLORS: Record<SkillCategory, string> = {
  frontend: 'bg-coral/15 text-coral border-coral/30',
  backend: 'bg-amber/15 text-amber border-amber/30',
  database: 'bg-sage/15 text-sage border-sage/30',
  devops: 'bg-terracotta/15 text-terracotta border-terracotta/30',
  ml: 'bg-primary/15 text-primary border-primary/30',
  design: 'bg-coral/15 text-coral border-coral/30',
  docs: 'bg-muted text-muted-foreground border-border',
  other: 'bg-muted text-muted-foreground border-border',
};

export function detectSkillsFromFiles(files: string[]): ContributorSkill[] {
  const counts: Record<SkillCategory, number> = {
    frontend: 0, backend: 0, database: 0, devops: 0, ml: 0, design: 0, docs: 0, other: 0,
  };

  for (const f of files) {
    const ext = '.' + f.split('.').pop()?.toLowerCase();
    const skill = SKILL_MAP[ext] || 'other';
    counts[skill]++;
  }

  const total = files.length || 1;
  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([name, fileCount]) => ({
      name: name as SkillCategory,
      confidence: Math.round((fileCount / total) * 100),
      fileCount,
    }))
    .sort((a, b) => b.confidence - a.confidence);
}

export function suggestAssignee(
  contributors: { login: string; skills: ContributorSkill[]; currentTaskCount: number }[],
  requiredSkill: SkillCategory
): { login: string; score: number }[] {
  return contributors
    .map(c => {
      const skill = c.skills.find(s => s.name === requiredSkill);
      const skillScore = skill?.confidence || 0;
      const loadPenalty = c.currentTaskCount * 10;
      return { login: c.login, score: Math.max(0, skillScore - loadPenalty) };
    })
    .sort((a, b) => b.score - a.score);
}
