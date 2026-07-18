'use client';

import { useEffect, useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { addViewer, removeViewer, listViewers, isValidEmail, type Viewer } from '@/lib/share-access';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, Copy, Check, UserPlus, Users } from 'lucide-react';

export function ShareAccessDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = user && typeof window !== 'undefined' ? `${window.location.origin}/shared/${user.uid}` : '';

  const refresh = async () => {
    if (!user || !firestore) return;
    setLoading(true);
    try {
      setViewers(await listViewers(firestore, user.uid));
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user, firestore]);

  const add = async () => {
    if (!user || !firestore) return;
    if (!isValidEmail(email)) {
      toast({ variant: 'destructive', title: 'Enter a valid email address' });
      return;
    }
    setBusy(true);
    try {
      await addViewer(firestore, user.uid, email);
      setEmail('');
      await refresh();
      toast({ title: 'Viewer invited', description: 'They can follow your progress once signed in with that email.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Could not add viewer', description: e?.message });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (e: string) => {
    if (!user || !firestore) return;
    try {
      await removeViewer(firestore, user.uid, e);
      await refresh();
      toast({ title: 'Access revoked' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Could not revoke access', description: err?.message });
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Share read-only access
          </DialogTitle>
          <DialogDescription>
            Invite an investor or mentor by email to follow your LaunchCode progress. They get read-only access — never edit — and you can revoke anytime.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="investor@fund.com"
              onKeyDown={(e) => e.key === 'Enter' && !busy && add()}
            />
            <Button onClick={add} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            </Button>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
            <p className="mb-2 text-xs text-muted-foreground">Share this link with invited viewers:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded bg-background px-2 py-1 text-xs">{shareUrl}</code>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={copy} aria-label="Copy share link">
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">People with access</p>
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : viewers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No one yet. Add an email above.</p>
            ) : (
              <ul className="space-y-2">
                {viewers.map((v) => (
                  <li key={v.email} className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2">
                    <span className="truncate text-sm">{v.email}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => remove(v.email)}
                      aria-label={`Revoke access for ${v.email}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Viewers see your validation reports, phase progress, Vault evidence, and decision log. They do not see your private Ideamait chats or Resumait resumes.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
