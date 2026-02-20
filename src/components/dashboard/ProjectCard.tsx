import { Users, Calendar, Github, Code } from 'lucide-react';
import { Project } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRepoInfo } from '@/hooks/useGitHub';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onConnectGitHub?: () => void;
  onDelete?: () => void;
}

export function ProjectCard({ project, onClick, onConnectGitHub, onDelete }: ProjectCardProps) {
  const isGitHubConnected = project.github?.connected || false;
  const { data: repo } = useRepoInfo(isGitHubConnected ? project.id : undefined);

  return (
    <Card onClick={onClick} className="group cursor-pointer bg-card hover:shadow-lg hover:shadow-primary/10 transition-all duration-200 border-border hover:border-primary/30">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <span className="font-display font-bold text-primary text-lg">{project.name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs font-medium">
            {project.members.length} member{project.members.length !== 1 ? 's' : ''}
          </div>
        </div>

        <h3 className="font-display font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">{project.name}</h3>

        {repo && (
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-sage/10 text-sage border border-sage/30">
              <Code className="w-3 h-3" /> {repo.language}
            </span>
            <span className="text-[10px] text-muted-foreground">⭐ {repo.stars}</span>
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>{project.members.length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
          {repo ? (
            <div className="flex items-center gap-1.5">
              <Github className="w-3 h-3" />
              <span className="text-xs truncate max-w-[80px]">{repo.name}</span>
            </div>
          ) : onConnectGitHub && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs text-coral hover:text-coral/80 p-0 h-auto"
              onClick={(e) => { e.stopPropagation(); onConnectGitHub(); }}
            >
              <Github className="w-3 h-3" />
              Connect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
