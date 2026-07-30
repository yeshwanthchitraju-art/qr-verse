'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/logo';
import { RotateCcw, Home } from 'lucide-react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Logo />
      <p className="mt-12 font-mono text-sm text-destructive">500</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Something went wrong</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        An unexpected error occurred. Try again, or head back home.
      </p>
      <div className="mt-8 flex gap-3">
        <Button onClick={reset} variant="outline">
          <RotateCcw className="mr-2 h-4 w-4" /> Try again
        </Button>
        <Button asChild className="bg-brand text-brand-foreground hover:bg-brand/90">
          <Link href="/"><Home className="mr-2 h-4 w-4" /> Home</Link>
        </Button>
      </div>
    </div>
  );
}
