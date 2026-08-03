'use client';

import { Suspense, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader as Loader2, Mail, Lock, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { setGuestLocal, setGuestLocalOff } from '@/lib/guest-history';
import { safeRedirect } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/shared/logo';
import { SocialAuth } from '@/components/auth/social-auth';
import { toast } from 'sonner';

function LoginForm() {
  const params = useSearchParams();
  const redirect = params.get('redirect') || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setGuestLocalOff();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Welcome back');
    window.location.href = safeRedirect(redirect);
  }

  function handleGuest() {
    setGuestLoading(true);
    setGuestLocal(true);
    window.location.href = '/dashboard';
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Link href="/"><Logo /></Link>
        </div>
        <div className="rounded-2xl border bg-card p-7 shadow-sm">
          <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Welcome back to QRVerse.</p>

          <SocialAuth redirectTo={redirect} />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email" type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@business.com"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password" type="password" required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="pl-9"
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-brand text-brand-foreground hover:bg-brand/90">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign in <ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            No account?{' '}
            <Link href="/signup" className="font-medium text-foreground hover:underline">Create one</Link>
          </p>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleGuest}
              disabled={guestLoading}
              className="text-sm text-muted-foreground hover:text-foreground hover:underline disabled:opacity-60"
            >
              {guestLoading ? 'Starting guest session...' : 'or continue as a guest'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
