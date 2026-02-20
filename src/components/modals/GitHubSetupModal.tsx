import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchRepoInfo } from '@/lib/github';
import { api } from '@/lib/api';
import { GitHubRepo } from '@/types';
import { Github, CheckCircle, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';

interface GitHubSetupModalProps {
  open: boolean;
  onClose: () => void;
  onConnected: () => void;
  projectId?: string;
}

export function GitHubSetupModal({ open, onClose, onConnected, projectId }: GitHubSetupModalProps) {
  const [step, setStep] = useState(1);
  const [token, setToken] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [repoInfo, setRepoInfo] = useState<GitHubRepo | null>(null);
  const queryClient = useQueryClient();

  const parseRepoUrl = (url: string): { owner: string; repo: string } | null => {
    const cleaned = url.replace(/^https?:\/\//, '').replace(/^github\.com\//, '').replace(/\.git$/, '').trim();
    const parts = cleaned.split('/');
    if (parts.length >= 2) return { owner: parts[0], repo: parts[1] };
    return null;
  };

  const handleValidate = async () => {
    const parsed = parseRepoUrl(repoUrl);
    if (!parsed) { setError('Invalid repo format. Use owner/repo or full URL.'); return; }
    setLoading(true);
    setError('');
    try {
      const info = await fetchRepoInfo(parsed.owner, parsed.repo, token || undefined);
      setRepoInfo(info);
      setStep(3);
    } catch (e: any) {
      setError(e.message || 'Failed to validate repository');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!projectId) return;
    const parsed = parseRepoUrl(repoUrl)!;
    setLoading(true);
    setError('');
    try {
      // Save to backend
      await api.setProjectGitHub(projectId, parsed.owner, parsed.repo, token);
      // Invalidate GitHub config cache so hooks refetch
      queryClient.invalidateQueries({ queryKey: ['github-config', projectId] });
      queryClient.invalidateQueries({ queryKey: ['github'] });
      onConnected();
      onClose();
      setStep(1);
      setToken('');
      setRepoUrl('');
      setRepoInfo(null);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to save GitHub config');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Github className="w-5 h-5" />
            Connect GitHub Repository
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="gh-token">Personal Access Token (optional for public repos)</Label>
              <Input id="gh-token" type="password" placeholder="ghp_xxxxxxxxxxxx" value={token} onChange={(e) => setToken(e.target.value)} />
              <a href="https://github.com/settings/tokens/new?scopes=repo" target="_blank" rel="noopener noreferrer" className="text-xs text-coral hover:underline inline-flex items-center gap-1">
                Generate a token <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)}>Next</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="repo-url">Repository</Label>
              <Input id="repo-url" placeholder="owner/repo or https://github.com/owner/repo" value={repoUrl} onChange={(e) => { setRepoUrl(e.target.value); setError(''); }} autoFocus />
              {error && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {error}
                </p>
              )}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={handleValidate} disabled={!repoUrl.trim() || loading}>
                {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Validating...</> : 'Validate'}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && repoInfo && (
          <div className="space-y-6 mt-4">
            <div className="p-4 rounded-lg border border-sage/30 bg-sage/5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-sage" />
                <span className="font-semibold text-sage">Repository Found!</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{repoInfo.owner}/{repoInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Language</span>
                  <span className="font-medium">{repoInfo.language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stars</span>
                  <span className="font-medium">⭐ {repoInfo.stars}</span>
                </div>
                {repoInfo.description && (
                  <p className="text-muted-foreground pt-2 border-t border-border">{repoInfo.description}</p>
                )}
              </div>
            </div>
            {error && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {error}
              </p>
            )}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={handleConnect} disabled={loading} className="bg-sage text-sage-foreground hover:bg-sage/90">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Connecting...</> : 'Connect Repository'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
