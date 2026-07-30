'use client';

import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp, MousePointerClick, Smartphone, Monitor, Tablet,
  Download,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/utils';

interface DayBucket { date: string; scans: number; views: number; label: string }
interface BreakdownItem { name: string; value: number }
interface QrStat { id: string; name: string; short_id: string; scans_count: number; views_count: number }
interface AnalyticsData {
  qrs: QrStat[];
  byDay: DayBucket[];
  deviceBreak: BreakdownItem[];
  browserBreak: BreakdownItem[];
  osBreak: BreakdownItem[];
  totalScans: number;
  totalViews: number;
  recentScans: number;
}

export default function AnalyticsPage() {
  const { user } = useAuth();

  const { data: rawData, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['analytics', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<AnalyticsData> => {
      const { data: qrsRaw } = await supabase
        .from('qr_codes')
        .select('id, name, short_id, scans_count, views_count')
        .order('scans_count', { ascending: false });
      const qrs: QrStat[] = (qrsRaw ?? []).map((q) => ({
        id: String(q.id),
        name: String(q.name ?? ''),
        short_id: String(q.short_id ?? ''),
        scans_count: Number(q.scans_count ?? 0),
        views_count: Number(q.views_count ?? 0),
      }));
      const qrIds = qrs.map((q) => q.id);

      const since = new Date();
      since.setDate(since.getDate() - 30);
      const { data: scans } = await supabase
        .from('scans')
        .select('event_type, device, os, browser, country, created_at')
        .in('qr_id', qrIds.length ? qrIds : ['00000000-0000-0000-0000-000000000000'])
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: true });

      const dayMap = new Map<string, DayBucket>();
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        dayMap.set(key, { date: key, scans: 0, views: 0, label: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }) });
      }
      (scans ?? []).forEach((sc) => {
        const key = String(sc.created_at ?? '').slice(0, 10);
        const bucket = dayMap.get(key);
        if (!bucket) return;
        if (sc.event_type === 'scan') bucket.scans += 1;
        if (sc.event_type === 'view') bucket.views += 1;
      });
      const byDay: DayBucket[] = Array.from(dayMap.values());

      const scanRows: Array<{ device: string; os: string; browser: string }> = (scans ?? []).map((s) => ({
        device: String(s.device ?? 'Unknown'),
        os: String(s.os ?? 'Unknown'),
        browser: String(s.browser ?? 'Unknown'),
      }));

      const deviceBreak = aggregate(scanRows, 'device');
      const browserBreak = aggregate(scanRows, 'browser');
      const osBreak = aggregate(scanRows, 'os');

      const totalScans = qrs.reduce((a, q) => a + q.scans_count, 0);
      const totalViews = qrs.reduce((a, q) => a + q.views_count, 0);

      return {
        qrs,
        byDay,
        deviceBreak,
        browserBreak,
        osBreak,
        totalScans,
        totalViews,
        recentScans: scans?.length ?? 0,
      };
    },
  });

  const data = rawData as AnalyticsData | undefined;

  const stats = [
    { label: 'Total scans', value: data?.totalScans ?? 0, icon: TrendingUp, hint: 'all time' },
    { label: 'Landing views', value: data?.totalViews ?? 0, icon: Monitor, hint: 'all time' },
    { label: 'Scans (30d)', value: data?.recentScans ?? 0, icon: MousePointerClick, hint: 'last 30 days' },
    { label: 'Active QR', value: data?.qrs.length ?? 0, icon: Smartphone, hint: 'codes' },
  ];

  function exportCsv() {
    if (!data) return;
    const rows: string[][] = data.byDay.map((d: DayBucket) => [d.date, String(d.scans), String(d.views)]);
    const csv = ['date,scans,views', ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qrverse-analytics.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const topQrs = data?.qrs.slice(0, 5) ?? [];
  const maxScans = topQrs.length ? Math.max(...topQrs.map((x: QrStat) => x.scans_count), 1) : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Analytics</h2>
          <p className="text-sm text-muted-foreground">Track every scan, view, and click.</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={!data}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
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
              {isLoading ? <Skeleton className="h-8 w-24" /> : (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold tracking-tight">{formatNumber(s.value)}</span>
                  <span className="text-xs text-muted-foreground">{s.hint}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Scans & views over time</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-[280px] w-full" /> : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.byDay ?? []} margin={{ left: -16, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" interval={4} />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={32} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="scans" stroke="hsl(var(--chart-1))" strokeWidth={2} fill="url(#g1)" />
                  <Area type="monotone" dataKey="views" stroke="hsl(var(--chart-2))" strokeWidth={2} fill="url(#g2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <BreakdownCard title="Devices" data={data?.deviceBreak ?? []} loading={isLoading} icons={{ Mobile: Smartphone, Desktop: Monitor, Tablet }} />
        <BreakdownCard title="Browsers" data={data?.browserBreak ?? []} loading={isLoading} />
        <BreakdownCard title="Operating systems" data={data?.osBreak ?? []} loading={isLoading} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top performing QR codes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-32" /> : topQrs.length > 0 ? (
            <div className="space-y-2">
              {topQrs.map((q: QrStat) => (
                <div key={q.id} className="flex items-center gap-3">
                  <span className="w-40 truncate text-sm font-medium">{q.name}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${(q.scans_count / maxScans) * 100}%` }} />
                  </div>
                  <span className="w-12 text-right text-sm font-medium">{formatNumber(q.scans_count)}</span>
                </div>
              ))}
            </div>
          ) : <EmptyAnalytics />}
        </CardContent>
      </Card>
    </div>
  );
}

type ScanRow = { device: string; os: string; browser: string };

function aggregate(rows: ScanRow[], key: keyof ScanRow): BreakdownItem[] {
  const map = new Map<string, number>();
  rows.forEach((r) => {
    const v = r[key] || 'Unknown';
    map.set(v, (map.get(v) ?? 0) + 1);
  });
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

function BreakdownCard({ title, data, loading, icons }: {
  title: string;
  data: BreakdownItem[];
  loading: boolean;
  icons?: Record<string, React.ComponentType<{ className?: string }>>;
}) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle></CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-24" /> : data.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">No data yet</p>
        ) : (
          <div className="space-y-3">
            {data.map((d: BreakdownItem) => {
              const max = Math.max(...data.map((x: BreakdownItem) => x.value));
              const Icon = icons?.[d.name];
              return (
                <div key={d.name}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium">
                      {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
                      {d.name}
                    </span>
                    <span className="text-muted-foreground">{d.value}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-brand/70" style={{ width: `${(d.value / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyAnalytics() {
  return (
    <div className="py-8 text-center">
      <p className="text-sm font-medium">No scans yet</p>
      <p className="mt-1 text-sm text-muted-foreground">Once people scan your QR codes, analytics will appear here.</p>
    </div>
  );
}
