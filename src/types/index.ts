export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  githubUsername?: string;
  avatarUrl?: string;
  skills?: ContributorSkill[];
}

export interface Project {
  id: string;
  name: string;
  joinCode: string;
  members: User[];
  adminId: string;
  createdAt: Date;
  github?: {
    repoOwner: string;
    repoName: string;
    connected: boolean;
  };
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: 'todo' | 'doing' | 'done';
  assignedTo?: User;
  skillRequired?: SkillCategory;
  createdAt: Date;
}

export interface Message {
  id: string;
  projectId: string;
  sender: User;
  text: string;
  timestamp: Date;
}

export interface Notification {
  id: string;
  type: 'task_assigned' | 'project_completed';
  message: string;
  read: boolean;
  timestamp: Date;
}

export type TaskStatus = Task['status'];

// GitHub types
export interface GitHubRepo {
  name: string;
  owner: string;
  url: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  openIssues: number;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  authorAvatar: string;
  date: string;
  additions: number;
  deletions: number;
  filesChanged: string[];
}

export interface GitHubContributor {
  login: string;
  avatar: string;
  contributions: number;
  commits: GitHubCommit[];
  skills: ContributorSkill[];
}

export interface ContributorSkill {
  name: SkillCategory;
  confidence: number;
  fileCount: number;
}

export type SkillCategory = 'frontend' | 'backend' | 'database' | 'devops' | 'ml' | 'design' | 'docs' | 'other';

export interface HeroMoment {
  commitSha: string;
  author: string;
  authorAvatar: string;
  message: string;
  reason: string;
  timestamp: string;
  linesChanged: number;
}

export interface FlowPeriod {
  contributor: string;
  start: string;
  end: string;
  commitCount: number;
}

export interface DecisionPoint {
  prNumber: number;
  title: string;
  mergedDate: string;
  author: string;
  impact: string;
}

export interface GitHubPullRequest {
  number: number;
  title: string;
  author: string;
  authorAvatar: string;
  state: string;
  mergedAt: string | null;
  createdAt: string;
  additions: number;
  deletions: number;
}
