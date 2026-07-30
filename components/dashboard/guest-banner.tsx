'use client';

import { useState } from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { useAuth } from '@/providers/auth-provider';
import { SocialAuth } from '@/components/auth/social-auth';
import { toast } from 'sonner';

export function GuestBanner() {
  const { upgradeGuest } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    if (!email || !password) {
      toast.error('Enter your email and a password');
      return;
    }
    setLoading(true);
    try {
      await upgradeGuest(email, password);
      toast.success('Account created! Your pages are saved.');
      setOpen(false);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 border-b bg-brand/5 px-4 py-2.5 text-sm sm:px-6">
        <Sparkles className="h-4 w-4 shrink-0 text-brand" />
        <p className="flex-1 text-muted-foreground">
          You're exploring as a <span className="font-medium text-foreground">guest</span>.
          Your pages are saved on this device. Create an account to keep them forever.
        </p>
        <Button size="sm" className="shrink-0 bg-brand text-brand-foreground hover:bg-brand/90" onClick={() => setOpen(true)}>
          Save my account
        </Button>
        <button className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-accent" aria-label="Dismiss">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save your account</DialogTitle>
            <DialogDescription>
              Add an email and password to convert your guest session into a permanent account.
              All your pages and QR codes stay with you.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <SocialAuth />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or add email</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gu-email">Email</Label>
              <Input id="gu-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gu-password">Password</Label>
              <Input id="gu-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleUpgrade} disabled={loading} className="bg-brand text-brand-foreground hover:bg-brand/90">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
