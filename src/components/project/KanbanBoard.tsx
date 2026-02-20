import { Task, User, TaskStatus } from '@/types';
import { KanbanColumn } from './KanbanColumn';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KanbanBoardProps {
  tasks: Task[];
  members: User[];
  onCreateTask: () => void;
  onTaskStatusChange: (taskId: string, status: TaskStatus) => void;
  onTaskAssign: (taskId: string, memberId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  canCreateTask?: boolean;
  currentUserId?: string;
  isAdmin?: boolean;
}

export function KanbanBoard({
  tasks,
  members,
  onCreateTask,
  onTaskStatusChange,
  onTaskAssign,
  onDeleteTask,
  canCreateTask = false,
  currentUserId,
  isAdmin = false,
}: KanbanBoardProps) {
  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const doingTasks = tasks.filter((t) => t.status === 'doing');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  return (
    <div className="flex-1 p-6 overflow-x-auto">
      {/* Board Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground">Task Board</h2>
        {canCreateTask && (
          <Button onClick={onCreateTask} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Task
            <span className="text-xs opacity-70">(Admin)</span>
          </Button>
        )}
      </div>

      {/* Kanban Columns */}
      <div className="flex gap-6 min-h-[calc(100vh-200px)]">
        <KanbanColumn
          title="To Do"
          status="todo"
          tasks={todoTasks}
          members={members}
          onTaskStatusChange={onTaskStatusChange}
          onTaskAssign={onTaskAssign}
          onDeleteTask={onDeleteTask}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
        />
        <KanbanColumn
          title="In Progress"
          status="doing"
          tasks={doingTasks}
          members={members}
          onTaskStatusChange={onTaskStatusChange}
          onTaskAssign={onTaskAssign}
          onDeleteTask={onDeleteTask}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
        />
        <KanbanColumn
          title="Done"
          status="done"
          tasks={doneTasks}
          members={members}
          onTaskStatusChange={onTaskStatusChange}
          onTaskAssign={onTaskAssign}
          onDeleteTask={onDeleteTask}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
}