import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchRepoInfo, fetchCommits, fetchContributors, fetchPullRequests, fetchCommitDetail, getGitHubConfig, detectHeroMoments, detectFlowPeriods, detectDecisionPoints } from '@/lib/github';
import { detectSkillsFromFiles } from '@/lib/skills';
import { GitHubCommit, GitHubContributor } from '@/types';

function useConfig(projectId?: string) {
  return getGitHubConfig(projectId);
}

export function useProjectGitHubConfig() {
  const { id } = useParams();
  return getGitHubConfig(id);
}

export function useRepoInfo(projectId?: string) {
  const { id } = useParams();
  const pid = projectId || id;
  const config = useConfig(pid);
  return useQuery({
    queryKey: ['github', 'repo', pid, config?.owner, config?.repo],
    queryFn: () => fetchRepoInfo(config!.owner, config!.repo, config!.token),
    enabled: !!config,
    staleTime: 15 * 60 * 1000,
  });
}

export function useCommits(author?: string, projectId?: string) {
  const { id } = useParams();
  const pid = projectId || id;
  const config = useConfig(pid);
  return useQuery({
    queryKey: ['github', 'commits', pid, config?.owner, config?.repo, author],
    queryFn: () => fetchCommits(config!.owner, config!.repo, config!.token, undefined, author),
    enabled: !!config,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCommitDetails(shas: string[], projectId?: string) {
  const { id } = useParams();
  const pid = projectId || id;
  const config = useConfig(pid);
  return useQuery({
    queryKey: ['github', 'commit-details', pid, config?.owner, config?.repo, shas.join(',')],
    queryFn: async () => {
      const details: GitHubCommit[] = [];
      for (const sha of shas.slice(0, 20)) {
        try {
          const detail = await fetchCommitDetail(config!.owner, config!.repo, sha, config!.token);
          details.push(detail);
        } catch { /* skip failed */ }
      }
      return details;
    },
    enabled: !!config && shas.length > 0,
    staleTime: 30 * 60 * 1000,
  });
}

export function useContributors(projectId?: string) {
  const { id } = useParams();
  const pid = projectId || id;
  const config = useConfig(pid);
  return useQuery({
    queryKey: ['github', 'contributors', pid, config?.owner, config?.repo],
    queryFn: () => fetchContributors(config!.owner, config!.repo, config!.token),
    enabled: !!config,
    staleTime: 15 * 60 * 1000,
  });
}

export function useContributorsWithSkills(projectId?: string) {
  const { id } = useParams();
  const pid = projectId || id;
  const config = useConfig(pid);
  const contributorsQuery = useContributors(pid);
  const commitsQuery = useCommits(undefined, pid);

  return useQuery({
    queryKey: ['github', 'contributors-skills', pid, config?.owner, config?.repo],
    queryFn: async () => {
      const contributors = contributorsQuery.data || [];
      const commits = commitsQuery.data || [];

      const detailedCommits: GitHubCommit[] = [];
      const sampled = commits.slice(0, 30);
      for (const c of sampled) {
        try {
          const detail = await fetchCommitDetail(config!.owner, config!.repo, c.sha, config!.token);
          detailedCommits.push(detail);
        } catch { /* skip */ }
      }

      return contributors.map(contributor => {
        const authorCommits = detailedCommits.filter(c => c.author === contributor.login);
        const allFiles = authorCommits.flatMap(c => c.filesChanged);
        const skills = detectSkillsFromFiles(allFiles);
        return { ...contributor, commits: authorCommits, skills };
      });
    },
    enabled: !!config && !!contributorsQuery.data && !!commitsQuery.data,
    staleTime: 15 * 60 * 1000,
  });
}

export function usePullRequests(state = 'all', projectId?: string) {
  const { id } = useParams();
  const pid = projectId || id;
  const config = useConfig(pid);
  return useQuery({
    queryKey: ['github', 'prs', pid, config?.owner, config?.repo, state],
    queryFn: () => fetchPullRequests(config!.owner, config!.repo, config!.token, state),
    enabled: !!config,
    staleTime: 5 * 60 * 1000,
  });
}

export function useHeroMoments(projectId?: string) {
  const { id } = useParams();
  const pid = projectId || id;
  const commitsQuery = useCommits(undefined, pid);
  const config = useConfig(pid);

  return useQuery({
    queryKey: ['github', 'heroes', pid, config?.owner, config?.repo],
    queryFn: async () => {
      const commits = commitsQuery.data || [];
      const detailed: GitHubCommit[] = [];
      for (const c of commits.slice(0, 50)) {
        try {
          const d = await fetchCommitDetail(config!.owner, config!.repo, c.sha, config!.token);
          detailed.push(d);
        } catch { /* skip */ }
      }
      return detectHeroMoments(detailed);
    },
    enabled: !!config && !!commitsQuery.data,
    staleTime: 15 * 60 * 1000,
  });
}

export function useDecisionPoints(projectId?: string) {
  const { id } = useParams();
  const pid = projectId || id;
  const prsQuery = usePullRequests('closed', pid);
  return useQuery({
    queryKey: ['github', 'decisions', pid, prsQuery.data?.length],
    queryFn: () => detectDecisionPoints(prsQuery.data || []),
    enabled: !!prsQuery.data,
    staleTime: 15 * 60 * 1000,
  });
}

export function useIsGitHubConnected(projectId?: string) {
  const { id } = useParams();
  const pid = projectId || id;
  return !!getGitHubConfig(pid);
}
