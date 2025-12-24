import { useState } from 'react';
import { Plus, Users, FolderKanban, Settings, HelpCircle, Star, Clock, Archive, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface DashboardSidebarProps {
  onCreateProject: () => void;
  onJoinProject: (code: string) => void;
}

export function DashboardSidebar({ onCreateProject, onJoinProject }: DashboardSidebarProps) {
  const [joinCode, setJoinCode] = useState('');

  const handleJoin = () => {
    if (joinCode.trim()) {
      onJoinProject(joinCode.trim());
      setJoinCode('');
    }
  };

  return (
    <aside className="w-72 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <FolderKanban className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-sidebar-foreground">FlowBoard</h1>
            <p className="text-xs text-sidebar-muted">Project Manager</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Create Project */}
        <Button
          onClick={onCreateProject}
          className="w-full gap-2 bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground"
        >
          <Plus className="w-4 h-4" />
          Create Project
        </Button>

        {/* Quick Links */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-sidebar-muted uppercase tracking-wider px-2 mb-2">Quick Links</p>
          <Button variant="ghost" className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent">
            <Star className="w-4 h-4" />
            Starred Projects
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent">
            <Clock className="w-4 h-4" />
            Recent Activity
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent">
            <Archive className="w-4 h-4" />
            Archived
          </Button>
        </div>

        <Separator className="bg-sidebar-border" />

        {/* Join Project */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sidebar-muted px-2">
            <Users className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Join Project</span>
          </div>
          <div className="space-y-2">
            <Input
              placeholder="Enter join code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-muted"
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            />
            <Button
              variant="secondary"
              onClick={handleJoin}
              disabled={!joinCode.trim()}
              className="w-full bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-accent-foreground"
            >
              Join
            </Button>
          </div>
        </div>

        <Separator className="bg-sidebar-border" />

        {/* Settings Links */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-sidebar-muted uppercase tracking-wider px-2 mb-2">Settings</p>
          <Button variant="ghost" className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent">
            <Settings className="w-4 h-4" />
            Preferences
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent">
            <HelpCircle className="w-4 h-4" />
            Help & Support
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-xs font-medium text-sidebar-foreground">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">John Doe</p>
            <p className="text-xs text-sidebar-muted truncate">john@example.com</p>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start gap-3 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent">
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
