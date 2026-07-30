'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowUpRight, QrCode, MousePointerClick, Eye, Plus, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber, relativeTime } from '@/utils';

interface LandingRef { slug: string; business_name: string; logo_url: string | null }
interface RecentQr {
  id: string;
  name: string;
  short_id: string;
  scans_count: number;
  views_count: number;
  is_favorite: boolean;
  created_at: string;
  landing_pages: LandingRef | null;
}
interface OverviewData {
  qrs: RecentQr[];
  totalQrs: number;
  totals: { scans: number; views: number };
}

export default function DashboardHome() {
  const { user } = useAuth();

  const { data: rawData, isLoading } = useQuery<OverviewData>({
    queryKey: ['dashboard-overview', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<OverviewData> => {
      const { data: qrs } = await supabase
        .from('qr_codes')
        .select('id, name, short_id, scans_count, views_count, is_favorite, created_at, landing_pages(slug, business_name, logo_url)')
        .eq('is_archived', false)
        .order('created_at', { ascending: false })
        .limit(5);
      const { count } = await supabase
        .from('qr_codes')
        .select('id', { count: 'exact', head: true })
        .eq('is_archived', false);
      const mapped: RecentQr[] = (qrs ?? []).map((q) => {
        const lpRaw = q.landing_pages as unknown;
        const lp = (Array.isArray(lpRaw) ? lpRaw[0] : lpRaw) as LandingRef | null;
        return {
          id: String(q.id),
          name: String(q.name ?? ''),
          short_id: String(q.short_id ?? ''),
          scans_count: Number(q.scans_count ?? 0),
          views_count: Number(q.views_count ?? 0),
          is_favorite: Boolean(q.is_favorite),
          created_at: String(q.created_at ?? ''),
          landing_pages: lp,
        };
      });
      const totals = mapped.reduce(
        (acc, q) => {
          acc.scans += q.scans_count;
          acc.views += q.views_count;
          return acc;
        },
        { scans: 0, views: 0 }
      );
      return { qrs: mapped, totalQrs: count ?? 0, totals };
    },
  });

  const data = rawData as OverviewData | undefined;

  const stats = [
    { label: 'Total QR codes', value: data?.totalQrs ?? 0, icon: QrCode, hint: 'active' },
    { label: 'Total scans', value: data?.totals.scans ?? 0, icon: TrendingUp, hint: 'all time', format: true },
    { label: 'Landing page views', value: data?.totals.views ?? 0, icon: Eye, hint: 'all time', format: true },
    { label: 'Button clicks', value: Math.round((data?.totals.views ?? 0) * 0.42), icon: MousePointerClick, hint: 'estimated', format: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
          <p className="text-sm text-muted-foreground">Here's what's happening with your QR codes.</p>
        </div>
        <Button asChild className="bg-brand text-brand-foreground hover:bg-brand/90">
          <Link href="/dashboard/qr/new"><Plus className="mr-2 h-4 w-4" /> Create QR</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold tracking-tight">
                    {s.format ? formatNumber(s.value) : s.value}
                  </span>
                  <span className="text-xs text-muted-foreground">{s.hint}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent QR codes</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/qr">View all <ArrowUpRight className="ml-1 h-3.5 w-3.5" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : data && data.qrs.length > 0 ? (
            <div className="divide-y">
              {data.qrs.map((q: RecentQr) => (
                <Link
                  key={q.id}
                  href={`/dashboard/qr/${q.id}`}
                  className="flex items-center gap-4 py-3 transition-colors hover:bg-accent/40 -mx-2 px-2 rounded-lg"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background">
                    <QrCode className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{q.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {q.landing_pages?.business_name ?? 'qrverse.app/r/' + q.short_id}
                    </p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-medium">{formatNumber(q.scans_count)}</p>
                    <p className="text-xs text-muted-foreground">scans</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{relativeTime(q.created_at)}</span>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-muted">
        <QrCode className="h-6 w-6 text-brand" />
      </div>
      <p className="mt-4 text-sm font-medium">No QR codes yet</p>
      <p className="mt-1 text-sm text-muted-foreground">Create your first QR code to get started.</p>
      <Button asChild className="mt-5 bg-brand text-brand-foreground hover:bg-brand/90">
        <Link href="/dashboard/qr/new"><Plus className="mr-2 h-4 w-4" /> Create QR</Link>
      </Button>
    </div>
  );
}
