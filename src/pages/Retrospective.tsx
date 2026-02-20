import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Flame, GitPullRequest, Trophy, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectSidebar } from '@/components/layout/ProjectSidebar';
import { useCommits, useHeroMoments, useDecisionPoints, useContributors, useRepoInfo } from '@/hooks/useGitHub';
import { HeroMomentBadge } from '@/components/project/HeroMomentBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { User } from '@/types';

const mockMembers: User[] = [
  { id: 'user-1', name: 'You', email: 'you@example.com' },
  { id: '2', name: 'Alice', email: 'alice@example.com' },
  { id: '3', name: 'Bob', email: 'bob@example.com' },
];

export default function Retrospective() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: commits = [] } = useCommits();
  const { data: heroes = [] } = useHeroMoments();
  const { data: decisions = [] } = useDecisionPoints();
  const { data: contributors = [] } = useContributors();
  const { data: repo } = useRepoInfo();

  const timelineData = commits.reduce((acc, c) => {
    const day = format(new Date(c.date), 'MMM d');
    const existing = acc.find(d => d.date === day);
    if (existing) {
      existing[c.author] = (existing[c.author] || 0) + 1;
      existing.total = (existing.total || 0) + 1;
    } else {
      acc.push({ date: day, [c.author]: 1, total: 1 });
    }
    return acc;
  }, [] as any[]).reverse();

  const uniqueAuthors = [...new Set(commits.map(c => c.author))] as string[];
  const authorColors = ['hsl(var(--coral))', 'hsl(var(--amber))', 'hsl(var(--sage))', 'hsl(var(--terracotta))', 'hsl(var(--primary))'];

  return (
    <div className="flex min-h-screen bg-background">
      <ProjectSidebar projectName="Project" members={mockMembers} onAddMember={() => {}} />
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-border bg-card flex items-center px-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sage" />
            <h1 className="text-xl font-display font-bold">Retrospective</h1>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto max-w-5xl mx-auto w-full space-y-8">
          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Commits', value: commits.length, icon: Activity, color: 'text-coral' },
              { label: 'Contributors', value: contributors.length, icon: Trophy, color: 'text-amber' },
              { label: 'Hero Moments', value: heroes.length, icon: Flame, color: 'text-terracotta' },
              { label: 'PRs Merged', value: decisions.length, icon: GitPullRequest, color: 'text-sage' },
            ].map((stat, i) => (
              <Card key={i} className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                  <p className="text-2xl font-display font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Timeline Chart */}
          {timelineData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-card border-border">
                <CardHeader><CardTitle className="font-display">Contribution Timeline</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      {uniqueAuthors.map((author: string, i) => (
                        <Area key={author} type="monotone" dataKey={author} stackId="1" stroke={authorColors[i % authorColors.length]} fill={authorColors[i % authorColors.length]} fillOpacity={0.3} />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-4 mt-4 justify-center">
                    {uniqueAuthors.map((author: string, i) => (
                      <div key={author} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: authorColors[i % authorColors.length] }} />
                        <span className="text-muted-foreground">{author}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Hero Moments */}
          {heroes.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <Flame className="w-5 h-5 text-terracotta" /> Hero Moments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {heroes.map((hero, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-accent/30">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={hero.authorAvatar} />
                        <AvatarFallback>{hero.author.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{hero.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{hero.author}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{format(new Date(hero.timestamp), 'MMM d, h:mm a')}</span>
                          <HeroMomentBadge reason={hero.reason} />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Decision Points */}
          {decisions.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <GitPullRequest className="w-5 h-5 text-sage" /> Decision Points
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {decisions.map((d, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-border">
                      <div className="text-xs text-muted-foreground shrink-0">{format(new Date(d.mergedDate), 'MMM d')}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{d.title}</p>
                        <p className="text-xs text-muted-foreground">by {d.author} · PR #{d.prNumber}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {commits.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Connect a GitHub repo to generate your retrospective.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
