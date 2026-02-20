import { Task, User, TaskStatus } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronRight, Trash2 } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  members: User[];
  onStatusChange: (status: TaskStatus) => void;
  onAssign: (memberId: string) => void;
  onDelete?: () => void;
  currentUserId?: string;
  isAdmin?: boolean;
}

const statusConfig: Record<TaskStatus, { label: string; color: string }> = {
  todo: { label: 'To Do', color: 'bg-muted text-muted-foreground' },
  doing: { label: 'Doing', color: 'bg-warning/20 text-warning-foreground' },
  done: { label: 'Done', color: 'bg-success/20 text-success' },
};

export function TaskCard({ task, members, onStatusChange, onAssign, onDelete, currentUserId, isAdmin = false }: TaskCardProps) {
  const nextStatus: Record<TaskStatus, TaskStatus | null> = {
    todo: 'doing',
    doing: 'done',
    done: null,
  };

  // Permission checks
  const isAssigned = task.assignedTo && task.assignedTo.id === currentUserId;
  const canMoveStatus = isAdmin || isAssigned;
  const canAssign = isAdmin;
  const canDelete = isAdmin;

  return (
    <Card className="p-4 bg-card border-border hover:border-primary/30 transition-colors">
      {/* Task Title */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-foreground mb-3">{task.title}</h4>
        {canDelete && onDelete && (
          <button
            onClick={onDelete}
            className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded shrink-0"
            title="Delete task (Admin)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Assigned Member */}
      <div className="mb-3">
        {canAssign ? (
          <Select
            value={task.assignedTo?.id || 'unassigned'}
            onValueChange={(value) => onAssign(value === 'unassigned' ? '' : value)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Assign member">
                {task.assignedTo ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="w-5 h-5">
                      <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                        {task.assignedTo.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{task.assignedTo.name}</span>
                  </div>
                ) : (
                  'Unassigned'
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {members.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="flex items-center gap-2 h-8 px-2 text-xs text-muted-foreground">
            {task.assignedTo ? (
              <>
                <Avatar className="w-5 h-5">
                  <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                    {task.assignedTo.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-foreground">{task.assignedTo.name}</span>
              </>
            ) : (
              <span>Unassigned</span>
            )}
          </div>
        )}
      </div>

      {/* Status Actions */}
      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusConfig[task.status].color}`}>
          {statusConfig[task.status].label}
        </span>

        {canMoveStatus && nextStatus[task.status] && (
          <button
            onClick={() => onStatusChange(nextStatus[task.status]!)}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Move to {statusConfig[nextStatus[task.status]!].label}
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </Card>
  );
}