import { User } from '@/types';
import { UserPlus, FolderKanban, LayoutDashboard, CheckSquare, Calendar, FileText, Settings, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

interface ProjectSidebarProps {
  projectName: string;
  members: User[];
  onAddMember: () => void;
}

export function ProjectSidebar({ projectName, members, onAddMember }: ProjectSidebarProps) {
  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Project Header */}
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <FolderKanban className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-semibold text-sidebar-foreground truncate">
              {projectName}
            </h2>
            <p className="text-xs text-sidebar-muted">Active Project</p>
          </div>
        </div>
      </div>

      {/* Project Stats */}
      <div className="p-4 border-b border-sidebar-border">
        <p className="text-xs font-medium text-sidebar-muted uppercase tracking-wider mb-3">Progress</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-sidebar-foreground">Tasks Complete</span>
            <span className="text-sidebar-muted">3/8</span>
          </div>
          <Progress value={37} className="h-2 bg-sidebar-accent" />
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 space-y-1">
        <p className="text-xs font-medium text-sidebar-muted uppercase tracking-wider px-2 mb-2">Navigation</p>
        <Button variant="ghost" className="w-full justify-start gap-3 text-sidebar-foreground bg-sidebar-accent">
          <LayoutDashboard className="w-4 h-4" />
          Kanban Board
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent">
          <CheckSquare className="w-4 h-4" />
          Task List
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent">
          <Calendar className="w-4 h-4" />
          Calendar
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent">
          <FileText className="w-4 h-4" />
          Documents
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent">
          <BarChart3 className="w-4 h-4" />
          Analytics
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent">
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Members Section */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-medium text-sidebar-muted uppercase tracking-wider">Team Members</h3>
          <span className="text-xs text-sidebar-muted bg-sidebar-accent px-2 py-0.5 rounded-full">
            {members.length}
          </span>
        </div>

        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-xs font-medium border border-sidebar-border">
                  {member.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {member.name}
                </p>
                <p className="text-xs text-sidebar-muted truncate">{member.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Admin Actions */}
      <div className="p-4">
        <Button
          onClick={onAddMember}
          variant="secondary"
          className="w-full gap-2 bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-accent-foreground border border-sidebar-border"
        >
          <UserPlus className="w-4 h-4" />
          Add Member
        </Button>
        <p className="text-xs text-sidebar-muted text-center mt-3">Admin Only</p>
      </div>
    </aside>
  );
}
