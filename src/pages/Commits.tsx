import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GitCommit, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectSidebar } from '@/components/layout/ProjectSidebar';
import { useCommits, useContributors } from '@/hooks/useGitHub';
import { HeroMomentBadge } from '@/components/project/HeroMomentBadge';
import { detectHeroMoments } from '@/lib/github';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { User } from '@/types';

const mockMembers: User[] = [
  { id: 'user-1', name: 'You', email: 'you@example.com' },
  { id: '2', name: 'Alice', email: 'alice@example.com' },
  { id: '3', name: 'Bob', email: 'bob@example.com' },
];

export default function Commits() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [authorFilter, setAuthorFilter] = useState('all');
  const { data: commits = [], isLoading } = useCommits(authorFilter === 'all' ? undefined : authorFilter);
  const { data: contributors = [] } = useContributors();

  const grouped = commits.reduce((acc, commit) => {
    const day = format(new Date(commit.date), 'yyyy-MM-dd');
    if (!acc[day]) acc[day] = [];
    acc[day].push(commit);
    return acc;
  }, {} as Record<string, (typeof commits)>);

  const heroShas = new Set(detectHeroMoments(commits).map(h => h.commitSha));
  const heroMap = Object.fromEntries(detectHeroMoments(commits).map(h => [h.commitSha, h.reason]));

  return (
    <div className="flex min-h-screen bg-background">
      <ProjectSidebar projectName="Project" members={mockMembers} onAddMember={() => {}} />
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-coral" />
            <h1 className="text-xl font-display font-bold">Commits</h1>
          </div>
          <Select value={authorFilter} onValueChange={setAuthorFilter}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by author" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All contributors</SelectItem>
              {contributors.map(c => (
                <SelectItem key={c.login} value={c.login}>{c.login}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </header>

        <main className="flex-1 p-6 overflow-auto max-w-3xl mx-auto w-full">
          {isLoading ? (
            <div className="text-center py-16 text-muted-foreground">Loading commits...</div>
          ) : commits.length === 0 ? (
            <div className="text-center py-16">
              <GitCommit className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No commits found. Connect a GitHub repo first.</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate(`/project/${id}`)}>Go to project</Button>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(grouped).map(([day, dayCommits]: [string, typeof commits]) => (
                <div key={day}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-4 sticky top-0 bg-background py-2">
                    {format(new Date(day), 'EEEE, MMM d, yyyy')}
                  </h3>
                  <div className="relative pl-8 border-l-2 border-border space-y-4">
                    {dayCommits.map((commit, i) => (
                      <motion.div key={commit.sha} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="relative">
                        <div className="absolute -left-[calc(2rem+5px)] w-3 h-3 rounded-full bg-coral border-2 border-background" />
                        <Card className="bg-card border-border hover:border-coral/30 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="w-8 h-8 shrink-0">
                                <AvatarImage src={commit.authorAvatar} />
                                <AvatarFallback>{commit.author.slice(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-foreground truncate">{commit.message}</p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                  <span className="font-medium text-coral">{commit.author}</span>
                                  <span>{format(new Date(commit.date), 'h:mm a')}</span>
                                  <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">{commit.sha.slice(0, 7)}</code>
                                </div>
                                {heroShas.has(commit.sha) && (
                                  <div className="mt-2"><HeroMomentBadge reason={heroMap[commit.sha]} /></div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
