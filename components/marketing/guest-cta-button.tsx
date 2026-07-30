'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';

export function GuestCtaButton({ label = 'Start free', variant = 'default' }: { label?: string; variant?: 'default' | 'outline' }) {
  const router = useRouter();
  const { user, signInAsGuest } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handle() {
    if (user) {
      router.push('/dashboard');
      return;
    }
    setLoading(true);
    try {
      await signInAsGuest();
      toast.success('Welcome! Explore the dashboard as a guest.');
      router.push('/dashboard');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (variant === 'outline') {
    return (
      <Button asChild size="lg" variant="outline" className="h-12 px-6">
        <Link href="/templates">View templates</Link>
      </Button>
    );
  }

  return (
    <Button size="lg" className="h-12 px-6 bg-brand text-brand-foreground hover:bg-brand/90" onClick={handle} disabled={loading}>
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
      {label}
    </Button>
  );
}
