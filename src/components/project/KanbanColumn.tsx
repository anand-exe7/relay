import { Task, User, TaskStatus } from '@/types';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  members: User[];
  onTaskStatusChange: (taskId: string, status: TaskStatus) => void;
  onTaskAssign: (taskId: string, memberId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  currentUserId?: string;
  isAdmin?: boolean;
}

const columnStyles: Record<TaskStatus, { bg: string; border: string; badge: string }> = {
  todo: {
    bg: 'bg-muted/30',
    border: 'border-muted',
    badge: 'bg-muted text-muted-foreground',
  },
  doing: {
    bg: 'bg-warning/5',
    border: 'border-warning/30',
    badge: 'bg-warning/20 text-warning-foreground',
  },
  done: {
    bg: 'bg-success/5',
    border: 'border-success/30',
    badge: 'bg-success/20 text-success',
  },
};

export function KanbanColumn({
  title,
  status,
  tasks,
  members,
  onTaskStatusChange,
  onTaskAssign,
  onDeleteTask,
  currentUserId,
  isAdmin = false,
}: KanbanColumnProps) {
  const styles = columnStyles[status];

  return (
    <div className={`flex-1 min-w-[300px] rounded-xl ${styles.bg} border ${styles.border} p-4`}>
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-foreground">{title}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles.badge}`}>
          {tasks.length}
        </span>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            members={members}
            onStatusChange={(newStatus) => onTaskStatusChange(task.id, newStatus)}
            onAssign={(memberId) => onTaskAssign(task.id, memberId)}
            onDelete={onDeleteTask ? () => onDeleteTask(task.id) : undefined}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
          />
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No tasks yet
          </div>
        )}
      </div>
    </div>
  );
}