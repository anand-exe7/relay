import { User } from '@/types';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { UserPlus, FolderKanban, LayoutDashboard, CheckSquare, Calendar, FileText, Settings, BarChart3, GitCommit, Users, BookOpen, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface ProjectSidebarProps {
  projectName: string;
  members: User[];
  onAddMember: () => void;
  taskProgress?: number;
  completedTasks?: number;
  totalTasks?: number;
}

type NavView = 'kanban' | 'tasks' | 'calendar' | 'documents' | 'analytics' | 'commits' | 'contributors' | 'retrospective' | 'export' | 'settings';

export function ProjectSidebar({ 
  projectName, members, onAddMember,
  taskProgress = 37, completedTasks = 3, totalTasks = 8
}: ProjectSidebarProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const getActiveNav = (): NavView => {
    if (location.pathname.includes('/tasks')) return 'tasks';
    if (location.pathname.includes('/calendar')) return 'calendar';
    if (location.pathname.includes('/documents')) return 'documents';
    if (location.pathname.includes('/analytics')) return 'analytics';
    if (location.pathname.includes('/commits')) return 'commits';
    if (location.pathname.includes('/contributors')) return 'contributors';
    if (location.pathname.includes('/retrospective')) return 'retrospective';
    if (location.pathname.includes('/export')) return 'export';
    return 'kanban';
  };

  const activeNav = getActiveNav();

  const handleNavClick = (view: NavView) => {
    const routes: Record<NavView, string> = {
      kanban: `/project/${id}`,
      tasks: `/project/${id}/tasks`,
      calendar: `/project/${id}/calendar`,
      documents: `/project/${id}/documents`,
      analytics: `/project/${id}/analytics`,
      commits: `/project/${id}/commits`,
      contributors: `/project/${id}/contributors`,
      retrospective: `/project/${id}/retrospective`,
      export: `/project/${id}/export`,
      settings: '',
    };
    if (view === 'settings') { toast.info('Settings - Coming Soon!'); return; }
    navigate(routes[view]);
  };

  const navItems: { view: NavView; label: string; icon: typeof LayoutDashboard; section?: string }[] = [
    { view: 'kanban', label: 'Kanban Board', icon: LayoutDashboard },
    { view: 'tasks', label: 'Task List', icon: CheckSquare },
    { view: 'calendar', label: 'Calendar', icon: Calendar },
    { view: 'commits', label: 'Commits', icon: GitCommit, section: 'github' },
    { view: 'contributors', label: 'Contributors', icon: Users, section: 'github' },
    { view: 'retrospective', label: 'Retrospective', icon: BookOpen, section: 'github' },
    { view: 'analytics', label: 'Analytics', icon: BarChart3 },
    { view: 'export', label: 'Export', icon: Download, section: 'github' },
    { view: 'documents', label: 'Documents', icon: FileText },
    { view: 'settings', label: 'Settings', icon: Settings },
  ];

  const mainNav = navItems.filter(i => !i.section);
  const githubNav = navItems.filter(i => i.section === 'github');

  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Project Header */}
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <FolderKanban className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-semibold text-sidebar-foreground truncate">{projectName}</h2>
            <p className="text-xs text-sidebar-muted">Active Project</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="p-4 border-b border-sidebar-border">
        <p className="text-xs font-medium text-sidebar-muted uppercase tracking-wider mb-3">Progress</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-sidebar-foreground">Tasks Complete</span>
            <span className="text-sidebar-muted">{completedTasks}/{totalTasks}</span>
          </div>
          <Progress value={taskProgress} className="h-2" />
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 space-y-1 flex-1 overflow-y-auto">
        <p className="text-xs font-medium text-sidebar-muted uppercase tracking-wider px-2 mb-2">Navigation</p>
        {mainNav.map((item) => (
          <Button key={item.view} variant="ghost" className={`w-full justify-start gap-3 text-sidebar-foreground ${activeNav === item.view ? 'bg-sidebar-accent' : 'hover:bg-sidebar-accent'}`} onClick={() => handleNavClick(item.view)}>
            <item.icon className="w-4 h-4" />
            {item.label}
          </Button>
        ))}

        <Separator className="bg-sidebar-border my-3" />
        <p className="text-xs font-medium text-sidebar-muted uppercase tracking-wider px-2 mb-2">GitHub</p>
        {githubNav.map((item) => (
          <Button key={item.view} variant="ghost" className={`w-full justify-start gap-3 text-sidebar-foreground ${activeNav === item.view ? 'bg-sidebar-accent' : 'hover:bg-sidebar-accent'}`} onClick={() => handleNavClick(item.view)}>
            <item.icon className="w-4 h-4" />
            {item.label}
          </Button>
        ))}
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Members */}
      <div className="p-4 overflow-y-auto max-h-48">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-medium text-sidebar-muted uppercase tracking-wider">Team</h3>
          <span className="text-xs text-sidebar-muted bg-sidebar-accent px-2 py-0.5 rounded-full">{members.length}</span>
        </div>
        <div className="space-y-1">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-[10px] font-medium border border-sidebar-border">
                  {member.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-sidebar-foreground truncate">{member.name}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      <div className="p-4">
        <Button onClick={onAddMember} variant="secondary" className="w-full gap-2 bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-accent-foreground border border-sidebar-border text-xs">
          <UserPlus className="w-3 h-3" /> Add Member
        </Button>
      </div>
    </aside>
  );
}
