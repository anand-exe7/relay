import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { CreateProjectModal } from '@/components/modals/CreateProjectModal';
import { GitHubSetupModal } from '@/components/modals/GitHubSetupModal';
import { Project, User } from '@/types';
import { api } from '@/lib/api';
import { FolderOpen, Search, Bell, Loader } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [githubModalOpen, setGithubModalOpen] = useState(false);
  const [githubProjectId, setGithubProjectId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load projects and user on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [user, projectsList] = await Promise.all([
        api.getCurrentUser(),
        api.getProjects()
      ]);
      setCurrentUser(user);
      setProjects(projectsList);
      console.log('✅ Dashboard data loaded:', { user, projects: projectsList });
    } catch (error: any) {
      console.error('❌ Failed to load dashboard:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (name: string) => {
    try {
      const newProject = await api.createProject(name);
      setProjects((prev) => [...prev, newProject]);
      toast.success('Project created successfully!');
    } catch (error: any) {
      console.error('Failed to create project:', error);
      toast.error(error.response?.data?.error || 'Failed to create project');
    }
  };

  const handleJoinProject = async (code: string) => {
    try {
      const project = await api.joinProject(code);
      setProjects((prev) => [...prev, project]);
      toast.success('Joined project successfully!');
    } catch (error: any) {
      console.error('Failed to join project:', error);
      toast.error(error.response?.data?.error || 'Failed to join project');
    }
  };

  const handleConnectGitHub = (projectId: string) => {
    setGithubProjectId(projectId);
    setGithubModalOpen(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await api.deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      toast.success('Project deleted successfully!');
    } catch (error: any) {
      console.error('Failed to delete project:', error);
      toast.error(error.response?.data?.error || 'Failed to delete project');
    }
  };

  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const userInitials = currentUser?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar onCreateProject={() => setCreateModalOpen(true)} onJoinProject={handleJoinProject} currentUser={currentUser} />
      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-8">
          <h1 className="font-display text-xl font-bold text-foreground">Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search projects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-72 bg-accent border-border" />
            </div>
            <Button variant="outline" size="icon" className="border-border"><Bell className="w-4 h-4" /></Button>
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center border border-border">
              <span className="text-xs font-medium">{userInitials}</span>
            </div>
          </div>
        </header>
        <div className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">Your Projects</h2>
              <p className="text-muted-foreground">Select a project to view its task board</p>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader className="w-8 h-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading projects...</span>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-16">
                <FolderOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">{searchQuery ? 'No projects found' : 'No projects yet'}</h3>
                <p className="text-muted-foreground">{searchQuery ? 'Try a different search term' : 'Create a new project or join one'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={() => navigate(`/project/${project.id}`)}
                    onConnectGitHub={() => handleConnectGitHub(project.id)}
                    onDelete={() => handleDeleteProject(project.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <CreateProjectModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} onCreate={handleCreateProject} />
      <GitHubSetupModal
        open={githubModalOpen}
        onClose={() => setGithubModalOpen(false)}
        onConnected={() => toast.success('GitHub connected!')}
        projectId={githubProjectId}
      />
    </div>
  );
}
