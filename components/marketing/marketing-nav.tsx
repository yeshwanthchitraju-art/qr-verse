'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Loader2 } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NAV_LINKS } from '@/constants';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';

export function MarketingNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signInAsGuest } = useAuth();
  const [open, setOpen] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  async function handleTryFree() {
    setOpen(false);
    if (user) {
      router.push('/dashboard');
      return;
    }
    setGuestLoading(true);
    try {
      await signInAsGuest();
      toast.success('Welcome! Explore the dashboard as a guest.');
      router.push('/dashboard');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setGuestLoading(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass-strong border-b">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center" aria-label="QRVerse home">
            <Logo />
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                  pathname === link.href && 'text-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={handleTryFree} disabled={guestLoading}>
              {guestLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Try free
            </Button>
          </div>

          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {open && (
          <div className="border-t md:hidden">
            <div className="space-y-1 px-4 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-2 pt-3">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link href="/login" onClick={() => setOpen(false)}>Sign in</Link>
                </Button>
                <Button size="sm" className="flex-1 bg-brand text-brand-foreground hover:bg-brand/90" onClick={handleTryFree} disabled={guestLoading}>
                  {guestLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Try free
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
