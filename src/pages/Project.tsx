// src/pages/Project.tsx - Updated with real API calls
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Search, Filter } from 'lucide-react';
import { ProjectSidebar } from '@/components/layout/ProjectSidebar';
import { KanbanBoard } from '@/components/project/KanbanBoard';
import { ChatPanel } from '@/components/project/ChatPanel';
import { NotificationsDropdown } from '@/components/project/NotificationsDropdown';
import { CreateTaskModal } from '@/components/modals/CreateTaskModal';
import { AddMemberModal } from '@/components/modals/AddMemberModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNotifications } from '@/hooks/useNotifications';
import { Task, User, Message, TaskStatus, Project } from '@/types';
import { api } from '@/lib/api';
import { socket, SOCKET_EVENTS } from '@/lib/socket';
import { toast } from 'sonner';

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  const currentUser: User = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (id) {
      loadProjectData();
      socket.connect();
      socket.joinProject(id);

      // Socket event listeners
      socket.on(SOCKET_EVENTS.TASK_CREATED, handleTaskCreated);
      socket.on(SOCKET_EVENTS.TASK_UPDATED, handleTaskUpdated);
      socket.on(SOCKET_EVENTS.TASK_DELETED, handleTaskDeleted);
      socket.on(SOCKET_EVENTS.MESSAGE_NEW, handleNewMessage);

      return () => {
        socket.leaveProject(id);
        socket.off(SOCKET_EVENTS.TASK_CREATED);
        socket.off(SOCKET_EVENTS.TASK_UPDATED);
        socket.off(SOCKET_EVENTS.TASK_DELETED);
        socket.off(SOCKET_EVENTS.MESSAGE_NEW);
      };
    }
  }, [id]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const [projectData, tasksData, messagesData] = await Promise.all([
        api.getProjectById(id!),
        api.getTasks(id!),
        api.getMessages(id!),
      ]);
      setProject(projectData);
      setTasks(tasksData);
      setMessages(messagesData);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load project');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = (task: Task) => {
    setTasks(prev => [...prev, task]);
  };

  const handleTaskUpdated = (task: Task) => {
    setTasks(prev => prev.map(t => t.id === task.id ? task : t));
  };

  const handleTaskDeleted = ({ taskId }: { taskId: string }) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleNewMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleCreateTask = async (title: string, assignedToId?: string) => {
    try {
      const taskData = {
        title,
        assignedTo: assignedToId,
      };
      await api.createTask(id!, taskData);
      toast.success('Task created successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create task');
    }
  };

  const handleTaskStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await api.updateTaskStatus(taskId, status);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update task status');
    }
  };

  const handleTaskAssign = async (taskId: string, memberId: string) => {
    try {
      await api.assignTask(taskId, memberId);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to assign task');
    }
  };

  const handleSendMessage = async (text: string) => {
    try {
      await api.sendMessage(id!, text);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send message');
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
      toast.error(error.response?.data?.error || 'Failed to generate code');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-muted-foreground">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const isAdmin = project.adminId === currentUser.id;

  return (
    <div className="flex min-h-screen bg-background">
      <ProjectSidebar 
        projectName={project.name} 
        members={project.members} 
        onAddMember={() => setAddMemberOpen(true)}
        completedTasks={tasks.filter(t => t.status === 'done').length}
        totalTasks={tasks.length}
        taskProgress={tasks.length > 0 ? (tasks.filter(t => t.status === 'done').length / tasks.length) * 100 : 0}
      />

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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64 bg-accent border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

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
            tasks={tasks} 
            members={project.members} 
            onCreateTask={() => isAdmin && setCreateTaskOpen(true)} 
            onTaskStatusChange={handleTaskStatusChange} 
            onTaskAssign={handleTaskAssign} 
          />
          {chatOpen && <ChatPanel messages={messages} currentUser={currentUser} onSendMessage={handleSendMessage} onClose={() => setChatOpen(false)} />}
        </div>
      </div>

      {isAdmin && (
        <>
          <CreateTaskModal open={createTaskOpen} onClose={() => setCreateTaskOpen(false)} onCreate={handleCreateTask} members={project.members} />
          <AddMemberModal open={addMemberOpen} onClose={() => setAddMemberOpen(false)} joinCode={project.joinCode} onGenerateNewCode={handleGenerateCode} />
        </>
      )}
    </div>
  );
}