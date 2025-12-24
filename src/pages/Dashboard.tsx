import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { CreateProjectModal } from '@/components/modals/CreateProjectModal';
import { Project, User } from '@/types';
import { api } from '@/lib/api';
import { FolderOpen, Search, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const mockUser: User = { id: 'user-1', name: 'You', email: 'you@example.com' };

const initialProjects: Project[] = [
  { id: '1', name: 'Marketing Campaign', joinCode: 'ABC123', members: [mockUser, { id: '2', name: 'Alice', email: 'alice@example.com' }], adminId: 'user-1', createdAt: new Date() },
  { id: '2', name: 'Product Launch', joinCode: 'XYZ789', members: [mockUser], adminId: 'user-1', createdAt: new Date() },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateProject = async (name: string) => {
    const newProject = await api.createProject(name);
    setProjects((prev) => [...prev, newProject]);
  };

  const handleJoinProject = async (code: string) => {
    console.log('[Dashboard] Joining project with code:', code);
    await api.joinProject(code);
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar onCreateProject={() => setCreateModalOpen(true)} onJoinProject={handleJoinProject} />

      <main className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-8">
          <h1 className="font-display text-xl font-bold text-foreground">Dashboard</h1>
          
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-72 bg-accent border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Notifications */}
            <Button variant="outline" size="icon" className="border-border text-foreground hover:bg-accent">
              <Bell className="w-4 h-4" />
            </Button>

            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center border border-border">
              <span className="text-xs font-medium text-foreground">JD</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">Your Projects</h2>
              <p className="text-muted-foreground">Select a project to view its task board</p>
            </div>

            {filteredProjects.length === 0 ? (
              <div className="text-center py-16">
                <FolderOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  {searchQuery ? 'No projects found' : 'No projects yet'}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try a different search term' : 'Create a new project or join one with a code'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} onClick={() => navigate(`/project/${project.id}`)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <CreateProjectModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} onCreate={handleCreateProject} />
    </div>
  );
}
