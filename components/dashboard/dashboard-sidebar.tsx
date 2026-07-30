'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, QrCode, FileText, BarChart3, Image as ImageIcon,
  Palette, Settings, User, Plus, ChevronRight, Sparkles,
} from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DASHBOARD_NAV, DASHBOARD_SECONDARY } from '@/constants';
import { useAuth } from '@/providers/auth-provider';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, QrCode, FileText, BarChart3, Image: ImageIcon,
  Palette, Settings, User,
};

export function DashboardSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { profile } = useAuth();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Link href="/" onClick={onNavigate}>
          <Logo />
        </Link>
      </div>

      <div className="px-3">
        <Button asChild className="w-full bg-brand text-brand-foreground hover:bg-brand/90">
          <Link href="/dashboard/qr/new" onClick={onNavigate}>
            <Plus className="mr-2 h-4 w-4" /> Create QR
          </Link>
        </Button>
      </div>

      <nav className="mt-6 flex-1 space-y-1 px-3">
        <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Workspace
        </p>
        {DASHBOARD_NAV.map((item) => {
          const Icon = iconMap[item.icon] ?? QrCode;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
              {active && <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />}
            </Link>
          );
        })}

        <p className="px-3 pb-2 pt-5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Account
        </p>
        {DASHBOARD_SECONDARY.map((item) => {
          const Icon = iconMap[item.icon] ?? User;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-muted text-sm font-semibold text-brand">
            {(profile?.full_name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{profile?.full_name || 'User'}</p>
            <p className="truncate text-xs text-muted-foreground">Free plan</p>
          </div>
          <Sparkles className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
