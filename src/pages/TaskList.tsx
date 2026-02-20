import { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpDown, Filter, Search, X, Check } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { ProjectSidebar } from '@/components/layout/ProjectSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Task, User, TaskStatus } from '@/types';
import { toast } from 'sonner';

const mockUser: User = { id: 'user-1', name: 'You', email: 'you@example.com' };
const mockMembers: User[] = [
  mockUser,
  { id: '2', name: 'Alice', email: 'alice@example.com' },
  { id: '3', name: 'Bob', email: 'bob@example.com' },
];

const initialTasks: Task[] = [
  { id: '1', projectId: '1', title: 'Design homepage mockup', status: 'todo', createdAt: new Date('2024-01-15') },
  { id: '2', projectId: '1', title: 'Set up database schema', status: 'doing', assignedTo: mockMembers[1], createdAt: new Date('2024-01-14') },
  { id: '3', projectId: '1', title: 'Write API documentation', status: 'done', assignedTo: mockUser, createdAt: new Date('2024-01-13') },
  { id: '4', projectId: '1', title: 'Implement authentication', status: 'todo', assignedTo: mockMembers[2], createdAt: new Date('2024-01-12') },
  { id: '5', projectId: '1', title: 'Create user dashboard', status: 'doing', assignedTo: mockMembers[1], createdAt: new Date('2024-01-11') },
  { id: '6', projectId: '1', title: 'Setup CI/CD pipeline', status: 'done', createdAt: new Date('2024-01-10') },
];

type SortField = 'title' | 'status' | 'assignedTo' | 'createdAt';
type SortDirection = 'asc' | 'desc';
type EditingCell = { taskId: string; field: 'title' | 'status' | 'assignedTo' } | null;

const statusConfig: Record<TaskStatus, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  todo: { label: 'To Do', variant: 'outline' },
  doing: { label: 'In Progress', variant: 'secondary' },
  done: { label: 'Done', variant: 'default' },
};

export default function TaskList() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>([]);
  const [assigneeFilter, setAssigneeFilter] = useState<string[]>([]);
  const [editingCell, setEditingCell] = useState<EditingCell>(null);
  const [editValue, setEditValue] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingCell?.field === 'title' && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const handleStartEdit = (taskId: string, field: 'title' | 'status' | 'assignedTo', currentValue: string) => {
    setEditingCell({ taskId, field });
    setEditValue(currentValue);
  };

  const handleSaveEdit = () => {
    if (!editingCell) return;

    const { taskId, field } = editingCell;

    setTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task;

      if (field === 'title') {
        if (editValue.trim() === '') {
          toast.error('Title cannot be empty');
          return task;
        }
        toast.success('Title updated');
        return { ...task, title: editValue.trim() };
      }
      return task;
    }));

    setEditingCell(null);
    setEditValue('');
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
    setEditingCell(null);
    toast.success('Status updated');
  };

  const handleAssigneeChange = (taskId: string, memberId: string) => {
    const member = memberId === 'unassigned' ? undefined : mockMembers.find(m => m.id === memberId);
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, assignedTo: member } : task
    ));
    setEditingCell(null);
    toast.success('Assignee updated');
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleStatusFilter = (status: TaskStatus) => {
    setStatusFilter(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const toggleAssigneeFilter = (memberId: string) => {
    setAssigneeFilter(prev =>
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  };

  const clearFilters = () => {
    setStatusFilter([]);
    setAssigneeFilter([]);
    setSearchQuery('');
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedTasks.size === filteredAndSortedTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(filteredAndSortedTasks.map(t => t.id)));
    }
  };

  const handleBulkStatusChange = (newStatus: TaskStatus) => {
    setTasks(prev => prev.map(task =>
      selectedTasks.has(task.id) ? { ...task, status: newStatus } : task
    ));
    toast.success(`Updated ${selectedTasks.size} tasks to ${statusConfig[newStatus].label}`);
    setSelectedTasks(new Set());
  };

  // Tasks are not deletable

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // Search filter
    if (searchQuery) {
      result = result.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter.length > 0) {
      result = result.filter(task => statusFilter.includes(task.status));
    }

    // Assignee filter
    if (assigneeFilter.length > 0) {
      result = result.filter(task =>
        task.assignedTo ? assigneeFilter.includes(task.assignedTo.id) : assigneeFilter.includes('unassigned')
      );
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'status':
          const statusOrder = { todo: 0, doing: 1, done: 2 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        case 'assignedTo':
          const aName = a.assignedTo?.name || 'zzz';
          const bName = b.assignedTo?.name || 'zzz';
          comparison = aName.localeCompare(bName);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [tasks, searchQuery, statusFilter, assigneeFilter, sortField, sortDirection]);

  const isAllSelected = filteredAndSortedTasks.length > 0 && selectedTasks.size === filteredAndSortedTasks.length;
  const isSomeSelected = selectedTasks.size > 0;
  const hasActiveFilters = statusFilter.length > 0 || assigneeFilter.length > 0 || searchQuery.length > 0;

  // Keyboard shortcuts - must be after filteredAndSortedTasks and handleBulkDelete are defined
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // 'a' to select all visible tasks
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        if (selectedTasks.size === filteredAndSortedTasks.length) {
          setSelectedTasks(new Set());
        } else {
          setSelectedTasks(new Set(filteredAndSortedTasks.map(t => t.id)));
        }
      }

      // 'Escape' to clear selection
      if (e.key === 'Escape' && selectedTasks.size > 0) {
        e.preventDefault();
        setSelectedTasks(new Set());
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [selectedTasks, filteredAndSortedTasks]);

  return (
    <div className="flex min-h-screen bg-background">
      <ProjectSidebar
        projectName="Marketing Campaign"
        members={mockMembers}
        onAddMember={() => {}}
      />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(`/project/${id}`)}
              className="gap-2 text-foreground hover:bg-accent"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="font-display font-semibold text-foreground">Task List</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Toolbar */}
          <div className="flex items-center gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-accent border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 border-border text-foreground hover:bg-accent">
                  <Filter className="w-4 h-4" />
                  Status
                  {statusFilter.length > 0 && (
                    <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                      {statusFilter.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-card border-border">
                {(['todo', 'doing', 'done'] as TaskStatus[]).map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={statusFilter.includes(status)}
                    onCheckedChange={() => toggleStatusFilter(status)}
                    className="text-foreground"
                  >
                    {statusConfig[status].label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Assignee Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 border-border text-foreground hover:bg-accent">
                  <Filter className="w-4 h-4" />
                  Assignee
                  {assigneeFilter.length > 0 && (
                    <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                      {assigneeFilter.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-card border-border">
                <DropdownMenuCheckboxItem
                  checked={assigneeFilter.includes('unassigned')}
                  onCheckedChange={() => toggleAssigneeFilter('unassigned')}
                  className="text-foreground"
                >
                  Unassigned
                </DropdownMenuCheckboxItem>
                {mockMembers.map((member) => (
                  <DropdownMenuCheckboxItem
                    key={member.id}
                    checked={assigneeFilter.includes(member.id)}
                    onCheckedChange={() => toggleAssigneeFilter(member.id)}
                    className="text-foreground"
                  >
                    {member.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
                Clear filters
              </Button>
            )}
          </div>

          {/* Bulk Actions Bar */}
          {isSomeSelected && (
            <div className="mb-4 flex items-center gap-4 p-3 rounded-lg bg-accent border border-border">
              <span className="text-sm font-medium text-foreground">
                {selectedTasks.size} task{selectedTasks.size > 1 ? 's' : ''} selected
              </span>
              <div className="h-4 w-px bg-border" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 border-border text-foreground hover:bg-background">
                    Change Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-card border-border">
                  {(['todo', 'doing', 'done'] as TaskStatus[]).map((status) => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={false}
                      onCheckedChange={() => handleBulkStatusChange(status)}
                      className="text-foreground"
                    >
                      {statusConfig[status].label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTasks(new Set())}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear selection
              </Button>
            </div>
          )}

          {/* Table */}
          <div className="rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('title')}
                      className="gap-2 -ml-4 text-muted-foreground hover:text-foreground"
                    >
                      Title
                      <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('status')}
                      className="gap-2 -ml-4 text-muted-foreground hover:text-foreground"
                    >
                      Status
                      <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('assignedTo')}
                      className="gap-2 -ml-4 text-muted-foreground hover:text-foreground"
                    >
                      Assignee
                      <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('createdAt')}
                      className="gap-2 -ml-4 text-muted-foreground hover:text-foreground"
                    >
                      Created
                      <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No tasks found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedTasks.map((task) => (
                    <TableRow key={task.id} className={`border-border ${selectedTasks.has(task.id) ? 'bg-accent/50' : ''}`}>
                      {/* Checkbox Cell */}
                      <TableCell className="w-12">
                        <Checkbox
                          checked={selectedTasks.has(task.id)}
                          onCheckedChange={() => toggleTaskSelection(task.id)}
                          aria-label={`Select ${task.title}`}
                        />
                      </TableCell>
                      {/* Editable Title Cell */}
                      <TableCell className="font-medium text-foreground">
                        {editingCell?.taskId === task.id && editingCell.field === 'title' ? (
                          <div className="flex items-center gap-2">
                            <Input
                              ref={inputRef}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              onBlur={handleSaveEdit}
                              className="h-8 bg-accent border-border text-foreground"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleSaveEdit}
                              className="h-8 w-8 p-0"
                            >
                              <Check className="w-4 h-4 text-primary" />
                            </Button>
                          </div>
                        ) : (
                          <span
                            onClick={() => handleStartEdit(task.id, 'title', task.title)}
                            className="cursor-pointer hover:bg-accent px-2 py-1 rounded -ml-2 block"
                          >
                            {task.title}
                          </span>
                        )}
                      </TableCell>

                      {/* Editable Status Cell */}
                      <TableCell>
                        {editingCell?.taskId === task.id && editingCell.field === 'status' ? (
                          <Select
                            defaultValue={task.status}
                            onValueChange={(value) => handleStatusChange(task.id, value as TaskStatus)}
                            open={true}
                            onOpenChange={(open) => !open && handleCancelEdit()}
                          >
                            <SelectTrigger className="w-32 h-8 bg-accent border-border text-foreground">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                              {(['todo', 'doing', 'done'] as TaskStatus[]).map((status) => (
                                <SelectItem key={status} value={status} className="text-foreground">
                                  {statusConfig[status].label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge
                            variant={statusConfig[task.status].variant}
                            className="cursor-pointer hover:opacity-80"
                            onClick={() => handleStartEdit(task.id, 'status', task.status)}
                          >
                            {statusConfig[task.status].label}
                          </Badge>
                        )}
                      </TableCell>

                      {/* Editable Assignee Cell */}
                      <TableCell>
                        {editingCell?.taskId === task.id && editingCell.field === 'assignedTo' ? (
                          <Select
                            defaultValue={task.assignedTo?.id || 'unassigned'}
                            onValueChange={(value) => handleAssigneeChange(task.id, value)}
                            open={true}
                            onOpenChange={(open) => !open && handleCancelEdit()}
                          >
                            <SelectTrigger className="w-36 h-8 bg-accent border-border text-foreground">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                              <SelectItem value="unassigned" className="text-foreground">
                                Unassigned
                              </SelectItem>
                              {mockMembers.map((member) => (
                                <SelectItem key={member.id} value={member.id} className="text-foreground">
                                  {member.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div
                            onClick={() => handleStartEdit(task.id, 'assignedTo', task.assignedTo?.id || 'unassigned')}
                            className="cursor-pointer hover:bg-accent px-2 py-1 rounded -ml-2 inline-flex items-center gap-2"
                          >
                            {task.assignedTo ? (
                              <>
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-xs bg-accent text-foreground">
                                    {task.assignedTo.name.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-foreground">{task.assignedTo.name}</span>
                              </>
                            ) : (
                              <span className="text-muted-foreground">Unassigned</span>
                            )}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredAndSortedTasks.length} of {tasks.length} tasks
          </div>
        </main>
      </div>
    </div>
  );
}