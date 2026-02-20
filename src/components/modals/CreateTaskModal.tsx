import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, SkillCategory } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SKILL_LABELS } from '@/lib/skills';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (title: string, assignedTo?: string, skillRequired?: SkillCategory) => void;
  members: User[];
}

const skillOptions: SkillCategory[] = ['frontend', 'backend', 'database', 'devops', 'ml', 'design'];

export function CreateTaskModal({ open, onClose, onCreate, members }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [skillRequired, setSkillRequired] = useState<string>('none');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    await onCreate(title.trim(), assignedTo || undefined, skillRequired !== 'none' ? skillRequired as SkillCategory : undefined);
    setLoading(false);
    setTitle('');
    setAssignedTo('');
    setSkillRequired('none');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Task Title</Label>
            <Input id="task-title" placeholder="Enter task title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Skill Required
              <Badge variant="outline" className="text-[10px] gap-1 font-normal">
                <Sparkles className="w-3 h-3" /> Smart assign
              </Badge>
            </Label>
            <Select value={skillRequired} onValueChange={setSkillRequired}>
              <SelectTrigger>
                <SelectValue placeholder="Select skill type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific skill</SelectItem>
                {skillOptions.map((skill) => (
                  <SelectItem key={skill} value={skill}>{SKILL_LABELS[skill]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Assign to (optional)</Label>
            <Select value={assignedTo || 'unassigned'} onValueChange={(v) => setAssignedTo(v === 'unassigned' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                    {member.skills && member.skills.length > 0 && (
                      <span className="text-muted-foreground ml-2 text-xs">
                        ({member.skills[0].name} {member.skills[0].confidence}%)
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!title.trim() || loading}>
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
