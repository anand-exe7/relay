import { useState } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
  joinCode: string;
  onGenerateNewCode: () => void;
}

export function AddMemberModal({ open, onClose, joinCode, onGenerateNewCode }: AddMemberModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Add Team Member</DialogTitle>
          <DialogDescription>
            Share this code with team members to let them join the project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex gap-2">
            <Input
              value={joinCode}
              readOnly
              className="font-mono text-lg text-center tracking-widest"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>

          <Button
            variant="secondary"
            onClick={onGenerateNewCode}
            className="w-full gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Generate New Code
          </Button>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}