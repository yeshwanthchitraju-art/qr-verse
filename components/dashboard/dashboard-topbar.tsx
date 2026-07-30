'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Search, Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { CommandPalette } from '@/components/dashboard/command-palette';
import { Button } from '@/components/ui/button';

const titleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/qr': 'My QR Codes',
  '/dashboard/qr/new': 'Create QR',
  '/dashboard/pages': 'Landing Pages',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/media': 'Media',
  '/dashboard/brand': 'Brand Kit',
  '/dashboard/settings': 'Settings',
  '/dashboard/account': 'Account',
};

export function DashboardTopbar() {
  const pathname = usePathname();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const title = titleMap[pathname] ?? 'Dashboard';

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-xl sm:px-6">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetClose className="absolute right-4 top-4 z-10" aria-label="Close menu">
              <X className="h-4 w-4" />
            </SheetClose>
            <DashboardSidebar onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <h1 className="text-base font-semibold tracking-tight sm:text-lg">{title}</h1>

        <button
          onClick={() => setCmdOpen(true)}
          className="ml-auto flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium sm:inline">
            ⌘K
          </kbd>
        </button>
      </header>

      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
    </>
  );
}
