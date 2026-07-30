'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { setGuestLocal } from '@/lib/guest-history';

export function GuestCtaButton({ label = 'Start free', variant = 'default' }: { label?: string; variant?: 'default' | 'outline' }) {
  function handle() {
    setGuestLocal(true);
    window.location.href = '/dashboard';
  }

  if (variant === 'outline') {
    return (
      <Button asChild size="lg" variant="outline" className="h-12 px-6">
        <Link href="/templates">View templates</Link>
      </Button>
    );
  }

  return (
    <Button size="lg" className="h-12 px-6 bg-brand text-brand-foreground hover:bg-brand/90" onClick={handle}>
      <ArrowRight className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}
