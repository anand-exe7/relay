import { GitHubContributor } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { SKILL_LABELS, SKILL_COLORS } from '@/lib/skills';
import { GitCommit } from 'lucide-react';

interface ContributorCardProps {
  contributor: GitHubContributor;
}

export function ContributorCard({ contributor }: ContributorCardProps) {
  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={contributor.avatar} alt={contributor.login} />
            <AvatarFallback>{contributor.login.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-display font-semibold text-foreground">{contributor.login}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <GitCommit className="w-3 h-3" />
              <span>{contributor.contributions} commits</span>
            </div>
          </div>
        </div>

        {contributor.skills.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Skills</p>
            {contributor.skills.slice(0, 4).map((skill) => (
              <div key={skill.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${SKILL_COLORS[skill.name]}`}>
                    {SKILL_LABELS[skill.name]}
                  </span>
                  <span className="text-muted-foreground text-xs">{skill.confidence}%</span>
                </div>
                <Progress value={skill.confidence} className="h-1.5" />
              </div>
            ))}
          </div>
        )}

        {contributor.skills.length === 0 && (
          <p className="text-sm text-muted-foreground italic">Analyzing skills...</p>
        )}
      </CardContent>
    </Card>
  );
}
