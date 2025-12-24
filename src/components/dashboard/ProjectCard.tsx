import { Users, Calendar } from 'lucide-react';
import { Project } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer bg-card hover:shadow-lg hover:shadow-primary/10 transition-all duration-200 border-border hover:border-primary/30"
    >
      <CardContent className="p-5">
        {/* Project Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <span className="font-display font-bold text-primary text-lg">
              {project.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs font-medium">
            {project.members.length} member{project.members.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Project Name */}
        <h3 className="font-display font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
          {project.name}
        </h3>

        {/* Project Meta */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>{project.members.length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}