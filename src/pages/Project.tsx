import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Search, Filter, Github, Loader } from 'lucide-react';
import { ProjectSidebar } from '@/components/layout/ProjectSidebar';
import { KanbanBoard } from '@/components/project/KanbanBoard';
import { ChatPanel } from '@/components/project/ChatPanel';
import { NotificationsDropdown } from '@/components/project/NotificationsDropdown';
import { CreateTaskModal } from '@/components/modals/CreateTaskModal';
import { AddMemberModal } from '@/components/modals/AddMemberModal';
import { GitHubSetupModal } from '@/components/modals/GitHubSetupModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNotifications } from '@/hooks/useNotifications';
import { useIsGitHubConnected, useRepoInfo } from '@/hooks/useGitHub';
import { Task, User, Message, Project, TaskStatus } from '@/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [githubModalOpen, setGithubModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, addNotification } = useNotifications();
  const isConnected = useIsGitHubConnected();
  const { data: repo } = useRepoInfo();

  // Load project and tasks on mount
  useEffect(() => {
    if (id) {
      loadProjectData();
    }
  }, [id]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const [projectData, tasksList, user, messagesList] = await Promise.all([
        api.getProjectById(id!),
        api.getTasks(id!),
        api.getCurrentUser(),
        api.getMessages(id!)
      ]);
      setProject(projectData);
      setTasks(tasksList);
      setCurrentUser(user);
      setMessages(messagesList);
      console.log('✅ Project data loaded:', { project: projectData, tasks: tasksList, user, messages: messagesList });
    } catch (error: any) {
      console.error('❌ Failed to load project:', error);
      toast.error('Failed to load project');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = project && currentUser && project.adminId === currentUser.id;

  const handleCreateTask = async (title: string, assignedToId?: string) => {
    try {
      const newTask = await api.createTask(id!, { title, assignedTo: assignedToId });
      setTasks((prev) => [...prev, newTask]);
      toast.success('Task created!');
      addNotification({ type: 'task_assigned', message: `New task created: ${title}`, read: false });
    } catch (error: any) {
      console.error('Failed to create task:', error);
      toast.error(error.response?.data?.error || 'Failed to create task');
    }
  };

  const handleTaskStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      // Only allow admin or assigned member to change task status
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        toast.error('Task not found');
        return;
      }

      // Allow if admin OR if user is assigned to the task
      const canChange = isAdmin || (task.assignedTo && task.assignedTo.id === currentUser?.id);
      if (!canChange) {
        toast.error('Only assigned members or admin can update task status');
        return;
      }

      const updatedTask = await api.updateTaskStatus(taskId, status);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));

      const allDone = tasks.every((t) => (t.id === taskId ? status === 'done' : t.status === 'done'));
      if (allDone && tasks.length > 0) {
        addNotification({ type: 'project_completed', message: 'All tasks completed!', read: false });
      }
    } catch (error: any) {
      console.error('Failed to update task status:', error);
      toast.error('Failed to update task');
    }
  };

  const handleTaskAssign = async (taskId: string, memberId: string) => {
    try {
      const updatedTask = await api.assignTask(taskId, memberId);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));

      const member = project?.members.find((m) => m.id === memberId);
      if (member) {
        addNotification({ type: 'task_assigned', message: `Task assigned to ${member.name}`, read: false });
      }
    } catch (error: any) {
      console.error('Failed to assign task:', error);
      toast.error('Failed to assign task');
    }
  };

  const handleSendMessage = async (text: string) => {
    try {
      const msg = await api.sendMessage(id!, text);
      setMessages((prev) => [...prev, msg]);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleGenerateCode = async () => {
    try {
      const newCode = await api.generateJoinCode(id!);
      if (project) {
        setProject({ ...project, joinCode: newCode });
      }
      toast.success('New join code generated!');
    } catch (error: any) {
      console.error('Failed to generate code:', error);
      toast.error('Failed to generate code');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success('Task deleted!');
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading project...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Project not found</h2>
          <Button onClick={() => navigate('/')}>Go back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ProjectSidebar projectName={project.name} members={project.members} onAddMember={() => setAddMemberOpen(true)} />

      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')} className="gap-2 text-foreground hover:bg-accent">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="font-display font-semibold text-foreground">{project.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant={isConnected ? 'outline' : 'default'}
              size="sm"
              onClick={() =>
                isConnected
                  ? toast.info(`Connected to ${repo?.owner}/${repo?.name}`)
                  : setGithubModalOpen(true)
              }
              className={`gap-2 ${isConnected ? 'border-sage/50 text-sage' : 'bg-coral text-coral-foreground hover:bg-coral/90'}`}
            >
              <Github className="w-4 h-4" />
              {isConnected ? `${repo?.owner || ''}/${repo?.name || 'Connected'}` : 'Connect GitHub'}
            </Button>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64 bg-accent border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="h-6 w-px bg-border" />
            <NotificationsDropdown notifications={notifications} onMarkAsRead={markAsRead} onMarkAllAsRead={markAllAsRead} />
            <Button
              variant={chatOpen ? 'default' : 'outline'}
              onClick={() => setChatOpen(!chatOpen)}
              className={`gap-2 ${chatOpen ? 'bg-primary text-primary-foreground' : 'border-border text-foreground hover:bg-accent'}`}
            >
              <MessageCircle className="w-4 h-4" /> Chat
            </Button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <KanbanBoard
            tasks={tasks.filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()))}
            members={project.members}
            onCreateTask={() => {
              if (!isAdmin) {
                toast.error('Only project admin can create tasks');
                return;
              }
              setCreateTaskOpen(true);
            }}
            onTaskStatusChange={handleTaskStatusChange}
            onTaskAssign={handleTaskAssign}
            onDeleteTask={handleDeleteTask}
            canCreateTask={!!isAdmin}
            currentUserId={currentUser?.id}
            isAdmin={!!isAdmin}
          />
          {chatOpen && currentUser && <ChatPanel messages={messages} currentUser={currentUser} onSendMessage={handleSendMessage} onClose={() => setChatOpen(false)} />}
        </div>
      </div>

      <CreateTaskModal open={createTaskOpen} onClose={() => setCreateTaskOpen(false)} onCreate={handleCreateTask} members={project.members} />
      <AddMemberModal
        open={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        joinCode={project.joinCode}
        onGenerateNewCode={handleGenerateCode}
      />
      <GitHubSetupModal
        open={githubModalOpen}
        onClose={() => setGithubModalOpen(false)}
        onConnected={() => toast.success('GitHub connected!')}
        projectId={id}
      />
    </div>
  );
}
