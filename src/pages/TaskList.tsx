import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpDown, Filter, Search, X, Check, Trash2, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { ProjectSidebar } from '@/components/layout/ProjectSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Task, User, TaskStatus, Project } from '@/types';
import { toast } from 'sonner';
import { api } from '@/lib/api';

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
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>([]);
  const [assigneeFilter, setAssigneeFilter] = useState<string[]>([]);
  const [editingCell, setEditingCell] = useState<EditingCell>(null);
  const [editValue, setEditValue] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  const isAdmin = project && currentUser ? project.adminId === currentUser.id : false;
  const members = project?.members || [];

  // Fetch project, tasks, and current user
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [proj, taskList, user] = await Promise.all([
          api.getProjectById(id),
          api.getTasks(id),
          api.getCurrentUser(),
        ]);
        setProject(proj);
        setTasks(taskList);
        setCurrentUser(user);
      } catch (err: any) {
        console.error('Failed to load tasks:', err);
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (editingCell?.field === 'title' && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  // Permission helpers
  const canEditTask = (task: Task) => isAdmin;
  const canChangeStatus = (task: Task) => isAdmin || (task.assignedTo && task.assignedTo.id === currentUser?.id);
  const canAssignTask = () => isAdmin;
  const canDeleteTask = () => isAdmin;

  const handleStartEdit = (taskId: string, field: 'title' | 'status' | 'assignedTo', currentValue: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    if (field === 'title' && !canEditTask(task)) { toast.error('Only admin can edit tasks'); return; }
    if (field === 'status' && !canChangeStatus(task)) { toast.error('Only assigned member or admin can change status'); return; }
    if (field === 'assignedTo' && !canAssignTask()) { toast.error('Only admin can assign tasks'); return; }
    setEditingCell({ taskId, field });
    setEditValue(currentValue);
  };

  const handleSaveEdit = async () => {
    if (!editingCell) return;
    const { taskId, field } = editingCell;
    if (field === 'title') {
      if (editValue.trim() === '') { toast.error('Title cannot be empty'); return; }
      try {
        const updated = await api.updateTask(taskId, { title: editValue.trim() });
        setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
        toast.success('Title updated');
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Failed to update title');
      }
    }
    setEditingCell(null);
    setEditValue('');
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const updated = await api.updateTaskStatus(taskId, newStatus);
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      toast.success('Status updated');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    }
    setEditingCell(null);
  };

  const handleAssigneeChange = async (taskId: string, memberId: string) => {
    try {
      const updated = await api.assignTask(taskId, memberId === 'unassigned' ? '' : memberId);
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      toast.success('Assignee updated');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update assignee');
    }
    setEditingCell(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setSelectedTasks(prev => { const n = new Set(prev); n.delete(taskId); return n; });
      toast.success('Task deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete task');
    }
  };

  const handleCancelEdit = () => { setEditingCell(null); setEditValue(''); };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveEdit();
    else if (e.key === 'Escape') handleCancelEdit();
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) { setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc')); }
    else { setSortField(field); setSortDirection('asc'); }
  };

  const toggleStatusFilter = (status: TaskStatus) => {
    setStatusFilter(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]);
  };
  const toggleAssigneeFilter = (memberId: string) => {
    setAssigneeFilter(prev => prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]);
  };
  const clearFilters = () => { setStatusFilter([]); setAssigneeFilter([]); setSearchQuery(''); };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) newSet.delete(taskId); else newSet.add(taskId);
      return newSet;
    });
  };

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];
    if (searchQuery) result = result.filter(task => task.title.toLowerCase().includes(searchQuery.toLowerCase()));
    if (statusFilter.length > 0) result = result.filter(task => statusFilter.includes(task.status));
    if (assigneeFilter.length > 0) result = result.filter(task => task.assignedTo ? assigneeFilter.includes(task.assignedTo.id) : assigneeFilter.includes('unassigned'));
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'title': cmp = a.title.localeCompare(b.title); break;
        case 'status': { const o = { todo: 0, doing: 1, done: 2 }; cmp = o[a.status] - o[b.status]; break; }
        case 'assignedTo': cmp = (a.assignedTo?.name || 'zzz').localeCompare(b.assignedTo?.name || 'zzz'); break;
        case 'createdAt': cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); break;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [tasks, searchQuery, statusFilter, assigneeFilter, sortField, sortDirection]);

  const isAllSelected = filteredAndSortedTasks.length > 0 && selectedTasks.size === filteredAndSortedTasks.length;
  const isSomeSelected = selectedTasks.size > 0;
  const hasActiveFilters = statusFilter.length > 0 || assigneeFilter.length > 0 || searchQuery.length > 0;

  const toggleSelectAll = () => {
    if (selectedTasks.size === filteredAndSortedTasks.length) setSelectedTasks(new Set());
    else setSelectedTasks(new Set(filteredAndSortedTasks.map(t => t.id)));
  };

  const handleBulkStatusChange = async (newStatus: TaskStatus) => {
    let count = 0;
    for (const taskId of selectedTasks) {
      const task = tasks.find(t => t.id === taskId);
      if (task && canChangeStatus(task)) {
        try {
          const updated = await api.updateTaskStatus(taskId, newStatus);
          setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
          count++;
        } catch { /* skip */ }
      }
    }
    if (count > 0) toast.success(`Updated ${count} task(s) to ${statusConfig[newStatus].label}`);
    setSelectedTasks(new Set());
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      if (e.key === 'a' || e.key === 'A') { e.preventDefault(); toggleSelectAll(); }
      if (e.key === 'Escape' && selectedTasks.size > 0) { e.preventDefault(); setSelectedTasks(new Set()); }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [selectedTasks, filteredAndSortedTasks]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ProjectSidebar projectName={project?.name || 'Project'} members={members} onAddMember={() => {}} />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(`/project/${id}`)} className="gap-2 text-foreground hover:bg-accent">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="font-display font-semibold text-foreground">Task List</h1>
            <span className="text-sm text-muted-foreground">({tasks.length} tasks)</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Toolbar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-accent border-border text-foreground placeholder:text-muted-foreground" />
            </div>

            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 border-border text-foreground hover:bg-accent">
                  <Filter className="w-4 h-4" /> Status
                  {statusFilter.length > 0 && <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">{statusFilter.length}</Badge>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-card border-border">
                {(['todo', 'doing', 'done'] as TaskStatus[]).map((status) => (
                  <DropdownMenuCheckboxItem key={status} checked={statusFilter.includes(status)} onCheckedChange={() => toggleStatusFilter(status)} className="text-foreground">
                    {statusConfig[status].label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Assignee Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 border-border text-foreground hover:bg-accent">
                  <Filter className="w-4 h-4" /> Assignee
                  {assigneeFilter.length > 0 && <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">{assigneeFilter.length}</Badge>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-card border-border">
                <DropdownMenuCheckboxItem checked={assigneeFilter.includes('unassigned')} onCheckedChange={() => toggleAssigneeFilter('unassigned')} className="text-foreground">
                  Unassigned
                </DropdownMenuCheckboxItem>
                {members.map((member) => (
                  <DropdownMenuCheckboxItem key={member.id} checked={assigneeFilter.includes(member.id)} onCheckedChange={() => toggleAssigneeFilter(member.id)} className="text-foreground">
                    {member.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="gap-2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" /> Clear filters
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
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 border-border text-foreground hover:bg-background">Change Status</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-card border-border">
                    {(['todo', 'doing', 'done'] as TaskStatus[]).map((status) => (
                      <DropdownMenuCheckboxItem key={status} checked={false} onCheckedChange={() => handleBulkStatusChange(status)} className="text-foreground">
                        {statusConfig[status].label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Button variant="ghost" size="sm" onClick={() => setSelectedTasks(new Set())} className="text-muted-foreground hover:text-foreground">
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
                    <Checkbox checked={isAllSelected} onCheckedChange={toggleSelectAll} aria-label="Select all" />
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    <Button variant="ghost" onClick={() => handleSort('title')} className="gap-2 -ml-4 text-muted-foreground hover:text-foreground">
                      Title <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    <Button variant="ghost" onClick={() => handleSort('status')} className="gap-2 -ml-4 text-muted-foreground hover:text-foreground">
                      Status <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    <Button variant="ghost" onClick={() => handleSort('assignedTo')} className="gap-2 -ml-4 text-muted-foreground hover:text-foreground">
                      Assignee <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    <Button variant="ghost" onClick={() => handleSort('createdAt')} className="gap-2 -ml-4 text-muted-foreground hover:text-foreground">
                      Created <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </TableHead>
                  {isAdmin && <TableHead className="w-12" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 6 : 5} className="text-center text-muted-foreground py-8">
                      {tasks.length === 0 ? 'No tasks yet. Create tasks from the project board.' : 'No tasks match your filters.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedTasks.map((task) => (
                    <TableRow key={task.id} className={`border-border ${selectedTasks.has(task.id) ? 'bg-accent/50' : ''}`}>
                      {/* Checkbox */}
                      <TableCell className="w-12">
                        <Checkbox checked={selectedTasks.has(task.id)} onCheckedChange={() => toggleTaskSelection(task.id)} aria-label={`Select ${task.title}`} />
                      </TableCell>

                      {/* Title */}
                      <TableCell className="font-medium text-foreground">
                        {editingCell?.taskId === task.id && editingCell.field === 'title' ? (
                          <div className="flex items-center gap-2">
                            <Input ref={inputRef} value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={handleKeyDown} onBlur={handleSaveEdit} className="h-8 bg-accent border-border text-foreground" />
                            <Button size="sm" variant="ghost" onClick={handleSaveEdit} className="h-8 w-8 p-0">
                              <Check className="w-4 h-4 text-primary" />
                            </Button>
                          </div>
                        ) : (
                          <span
                            onClick={() => isAdmin && handleStartEdit(task.id, 'title', task.title)}
                            className={`px-2 py-1 rounded -ml-2 block ${isAdmin ? 'cursor-pointer hover:bg-accent' : ''}`}
                          >
                            {task.title}
                          </span>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        {editingCell?.taskId === task.id && editingCell.field === 'status' ? (
                          <Select defaultValue={task.status} onValueChange={(value) => handleStatusChange(task.id, value as TaskStatus)} open={true} onOpenChange={(open) => !open && handleCancelEdit()}>
                            <SelectTrigger className="w-32 h-8 bg-accent border-border text-foreground"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-card border-border">
                              {(['todo', 'doing', 'done'] as TaskStatus[]).map((status) => (
                                <SelectItem key={status} value={status} className="text-foreground">{statusConfig[status].label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge
                            variant={statusConfig[task.status].variant}
                            className={canChangeStatus(task) ? 'cursor-pointer hover:opacity-80' : ''}
                            onClick={() => canChangeStatus(task) && handleStartEdit(task.id, 'status', task.status)}
                          >
                            {statusConfig[task.status].label}
                          </Badge>
                        )}
                      </TableCell>

                      {/* Assignee */}
                      <TableCell>
                        {editingCell?.taskId === task.id && editingCell.field === 'assignedTo' ? (
                          <Select defaultValue={task.assignedTo?.id || 'unassigned'} onValueChange={(value) => handleAssigneeChange(task.id, value)} open={true} onOpenChange={(open) => !open && handleCancelEdit()}>
                            <SelectTrigger className="w-36 h-8 bg-accent border-border text-foreground"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-card border-border">
                              <SelectItem value="unassigned" className="text-foreground">Unassigned</SelectItem>
                              {members.map((member) => (
                                <SelectItem key={member.id} value={member.id} className="text-foreground">{member.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div
                            onClick={() => isAdmin && handleStartEdit(task.id, 'assignedTo', task.assignedTo?.id || 'unassigned')}
                            className={`px-2 py-1 rounded -ml-2 inline-flex items-center gap-2 ${isAdmin ? 'cursor-pointer hover:bg-accent' : ''}`}
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

                      {/* Delete (admin only) */}
                      {isAdmin && (
                        <TableCell className="w-12">
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                            title="Delete task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredAndSortedTasks.length} of {tasks.length} tasks
          </div>
        </main>
      </div>
    </div>
  );
}