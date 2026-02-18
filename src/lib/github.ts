import { GitHubCommit, GitHubContributor, GitHubRepo, GitHubPullRequest, HeroMoment, FlowPeriod, DecisionPoint } from '@/types';
import { detectSkillsFromFiles, SKILL_MAP } from './skills';

const BASE = 'https://api.github.com';

function headers(token?: string): HeadersInit {
  const h: HeadersInit = { Accept: 'application/vnd.github.v3+json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export async function fetchRepoInfo(owner: string, repo: string, token?: string): Promise<GitHubRepo> {
  const res = await fetch(`${BASE}/repos/${owner}/${repo}`, { headers: headers(token) });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const d = await res.json();
  return {
    name: d.name,
    owner: d.owner.login,
    url: d.html_url,
    description: d.description || '',
    language: d.language || 'Unknown',
    stars: d.stargazers_count,
    forks: d.forks_count,
    openIssues: d.open_issues_count,
  };
}

export async function fetchCommits(owner: string, repo: string, token?: string, since?: string, author?: string): Promise<GitHubCommit[]> {
  const params = new URLSearchParams({ per_page: '100' });
  if (since) params.set('since', since);
  if (author) params.set('author', author);
  const res = await fetch(`${BASE}/repos/${owner}/${repo}/commits?${params}`, { headers: headers(token) });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const data = await res.json();
  return data.map((c: any) => ({
    sha: c.sha,
    message: c.commit.message.split('\n')[0],
    author: c.author?.login || c.commit.author.name,
    authorAvatar: c.author?.avatar_url || '',
    date: c.commit.author.date,
    additions: 0,
    deletions: 0,
    filesChanged: [],
  }));
}

export async function fetchCommitDetail(owner: string, repo: string, sha: string, token?: string): Promise<GitHubCommit> {
  const res = await fetch(`${BASE}/repos/${owner}/${repo}/commits/${sha}`, { headers: headers(token) });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const c = await res.json();
  return {
    sha: c.sha,
    message: c.commit.message.split('\n')[0],
    author: c.author?.login || c.commit.author.name,
    authorAvatar: c.author?.avatar_url || '',
    date: c.commit.author.date,
    additions: c.stats?.additions || 0,
    deletions: c.stats?.deletions || 0,
    filesChanged: (c.files || []).map((f: any) => f.filename),
  };
}

export async function fetchContributors(owner: string, repo: string, token?: string): Promise<GitHubContributor[]> {
  const res = await fetch(`${BASE}/repos/${owner}/${repo}/contributors?per_page=50`, { headers: headers(token) });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const data = await res.json();
  return data.map((c: any) => ({
    login: c.login,
    avatar: c.avatar_url,
    contributions: c.contributions,
    commits: [],
    skills: [],
  }));
}

export async function fetchPullRequests(owner: string, repo: string, token?: string, state = 'all'): Promise<GitHubPullRequest[]> {
  const res = await fetch(`${BASE}/repos/${owner}/${repo}/pulls?state=${state}&per_page=50&sort=updated&direction=desc`, { headers: headers(token) });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const data = await res.json();
  return data.map((pr: any) => ({
    number: pr.number,
    title: pr.title,
    author: pr.user.login,
    authorAvatar: pr.user.avatar_url,
    state: pr.state,
    mergedAt: pr.merged_at,
    createdAt: pr.created_at,
    additions: 0,
    deletions: 0,
  }));
}

export function detectHeroMoments(commits: GitHubCommit[]): HeroMoment[] {
  const heroes: HeroMoment[] = [];
  for (const c of commits) {
    const hour = new Date(c.date).getHours();
    const linesChanged = c.additions + c.deletions;
    const msgLower = c.message.toLowerCase();
    const reasons: string[] = [];

    if (hour >= 0 && hour < 5) reasons.push('🌙 Late night commit');
    if (linesChanged > 500) reasons.push('💪 Massive change');
    if (/\b(fix|hotfix|critical|urgent|emergency)\b/.test(msgLower)) reasons.push('🔥 Critical fix');
    if (linesChanged > 200 && hour >= 0 && hour < 5) reasons.push('⚡ Clutch player');

    if (reasons.length > 0) {
      heroes.push({
        commitSha: c.sha,
        author: c.author,
        authorAvatar: c.authorAvatar,
        message: c.message,
        reason: reasons[0],
        timestamp: c.date,
        linesChanged,
      });
    }
  }
  return heroes;
}

export function detectFlowPeriods(commits: GitHubCommit[], contributor: string): FlowPeriod[] {
  const authorCommits = commits
    .filter(c => c.author === contributor)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const periods: FlowPeriod[] = [];
  let start: string | null = null;
  let count = 0;
  let lastDate: Date | null = null;

  for (const c of authorCommits) {
    const d = new Date(c.date);
    if (lastDate && d.getTime() - lastDate.getTime() < 3 * 60 * 60 * 1000) {
      count++;
      lastDate = d;
    } else {
      if (count >= 3 && start && lastDate) {
        periods.push({ contributor, start, end: lastDate.toISOString(), commitCount: count });
      }
      start = c.date;
      count = 1;
      lastDate = d;
    }
  }
  if (count >= 3 && start && lastDate) {
    periods.push({ contributor, start, end: lastDate.toISOString(), commitCount: count });
  }
  return periods;
}

export function detectDecisionPoints(prs: GitHubPullRequest[]): DecisionPoint[] {
  return prs
    .filter(pr => pr.mergedAt)
    .map(pr => ({
      prNumber: pr.number,
      title: pr.title,
      mergedDate: pr.mergedAt!,
      author: pr.author,
      impact: `PR #${pr.number} merged`,
    }));
}

// Per-project GitHub config stored in localStorage with project ID as key
export function getGitHubConfig(projectId?: string): { token: string; owner: string; repo: string } | null {
  if (projectId) {
    const data = localStorage.getItem(`github_config_${projectId}`);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed.owner && parsed.repo) return parsed;
      } catch { /* fall through */ }
    }
  }
  // Fallback to legacy global config
  const token = localStorage.getItem('github_token') || '';
  const owner = localStorage.getItem('github_owner') || '';
  const repo = localStorage.getItem('github_repo') || '';
  if (!owner || !repo) return null;
  return { token, owner, repo };
}

export function setGitHubConfig(token: string, owner: string, repo: string, projectId?: string) {
  if (projectId) {
    localStorage.setItem(`github_config_${projectId}`, JSON.stringify({ token, owner, repo }));
  } else {
    localStorage.setItem('github_token', token);
    localStorage.setItem('github_owner', owner);
    localStorage.setItem('github_repo', repo);
  }
}
