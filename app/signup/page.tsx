'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Loader as Loader2, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { setGuestLocal, setGuestLocalOff } from '@/lib/guest-history';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/shared/logo';
import { SocialAuth } from '@/components/auth/social-auth';
import { toast } from 'sonner';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setGuestLocalOff();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.user) {
      // Wait for the session to be established before redirecting
      await supabase.auth.getSession();
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName,
        });
      } catch {
        // Profile creation is best-effort; the auth-provider also creates it on first load
      }
    }
    toast.success('Account created');
    window.location.href = '/dashboard';
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Link href="/"><Logo /></Link>
        </div>
        <div className="rounded-2xl border bg-card p-7 shadow-sm">
          <h1 className="text-xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Free forever. No credit card.</p>

          <SocialAuth />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" required value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe" className="pl-9" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@business.com" className="pl-9" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters" className="pl-9" />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-brand text-brand-foreground hover:bg-brand/90">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create account <ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-foreground hover:underline">Sign in</Link>
          </p>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => { setGuestLocal(true); window.location.href = '/dashboard'; }}
              className="text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              or continue as a guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
