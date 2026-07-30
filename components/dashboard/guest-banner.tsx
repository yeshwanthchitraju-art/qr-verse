'use client';

import { Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function GuestBanner() {
  return (
    <div className="flex items-center gap-3 border-b bg-brand/5 px-4 py-2.5 text-sm sm:px-6">
      <Sparkles className="h-4 w-4 shrink-0 text-brand" />
      <p className="flex-1 text-muted-foreground">
        You're exploring as a <span className="font-medium text-foreground">guest</span>.
        Your pages are saved on this device. Create an account to keep them forever.
      </p>
      <Button asChild size="sm" className="shrink-0 bg-brand text-brand-foreground hover:bg-brand/90">
        <Link href="/signup">Save my account</Link>
      </Button>
      <button className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-accent" aria-label="Dismiss">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
