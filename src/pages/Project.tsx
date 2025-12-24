import { useState } from 'react';
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
import { Task, User, Message, TaskStatus } from '@/types';
import { api } from '@/lib/api';

const mockUser: User = { id: 'user-1', name: 'You', email: 'you@example.com' };
const mockMembers: User[] = [mockUser, { id: '2', name: 'Alice', email: 'alice@example.com' }, { id: '3', name: 'Bob', email: 'bob@example.com' }];

const initialTasks: Task[] = [
  { id: '1', projectId: '1', title: 'Design homepage mockup', status: 'todo', createdAt: new Date() },
  { id: '2', projectId: '1', title: 'Set up database schema', status: 'doing', assignedTo: mockMembers[1], createdAt: new Date() },
  { id: '3', projectId: '1', title: 'Write API documentation', status: 'done', assignedTo: mockUser, createdAt: new Date() },
];

export default function Project() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('ABC123');
  const [searchQuery, setSearchQuery] = useState('');
  const { notifications, unreadCount, markAsRead, markAllAsRead, addNotification } = useNotifications();

  const handleCreateTask = async (title: string, assignedToId?: string) => {
    const newTask = await api.createTask(id!, title);
    const assignedTo = assignedToId ? mockMembers.find(m => m.id === assignedToId) : undefined;
    setTasks(prev => [...prev, { ...newTask, assignedTo }]);
    if (assignedTo) addNotification({ type: 'task_assigned', message: `Task "${title}" assigned to ${assignedTo.name}`, read: false });
  };

  const handleTaskStatusChange = (taskId: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    const allDone = tasks.every(t => t.id === taskId ? status === 'done' : t.status === 'done');
    if (allDone && tasks.length > 0) addNotification({ type: 'project_completed', message: 'All tasks completed!', read: false });
  };

  const handleTaskAssign = (taskId: string, memberId: string) => {
    const member = mockMembers.find(m => m.id === memberId);
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, assignedTo: member } : t));
    if (member) addNotification({ type: 'task_assigned', message: `Task assigned to ${member.name}`, read: false });
  };

  const handleSendMessage = async (text: string) => {
    const msg = await api.sendMessage(id!, text);
    setMessages(prev => [...prev, msg]);
  };

  const handleGenerateCode = async () => {
    const code = await api.generateJoinCode(id!);
    setJoinCode(code);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <ProjectSidebar projectName="Marketing Campaign" members={mockMembers} onAddMember={() => setAddMemberOpen(true)} />

      <div className="flex-1 flex flex-col">
        {/* Top Bar / Navbar */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')} className="gap-2 text-foreground hover:bg-accent">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="font-display font-semibold text-foreground">Marketing Campaign</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64 bg-accent border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Filter */}
            <Button variant="outline" className="gap-2 border-border text-foreground hover:bg-accent">
              <Filter className="w-4 h-4" /> Filter
            </Button>

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
          <KanbanBoard tasks={tasks} members={mockMembers} onCreateTask={() => setCreateTaskOpen(true)} onTaskStatusChange={handleTaskStatusChange} onTaskAssign={handleTaskAssign} />
          {chatOpen && <ChatPanel messages={messages} currentUser={mockUser} onSendMessage={handleSendMessage} onClose={() => setChatOpen(false)} />}
        </div>
      </div>

      <CreateTaskModal open={createTaskOpen} onClose={() => setCreateTaskOpen(false)} onCreate={handleCreateTask} members={mockMembers} />
      <AddMemberModal open={addMemberOpen} onClose={() => setAddMemberOpen(false)} joinCode={joinCode} onGenerateNewCode={handleGenerateCode} />
    </div>
  );
}
