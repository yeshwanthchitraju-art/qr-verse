import type { ReactNode } from 'react';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { DashboardTopbar } from '@/components/dashboard/dashboard-topbar';
import { GuestBannerClient } from '@/components/dashboard/guest-banner-client';

export const dynamic = 'force-dynamic';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="hidden w-64 shrink-0 border-r bg-background lg:block">
        <div className="sticky top-0 h-screen">
          <DashboardSidebar />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <GuestBannerClient />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
