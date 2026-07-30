'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ExternalLink, FileText, Eye, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/providers/auth-provider';
import { getGuestLandingHistory } from '@/lib/guest-history';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber, relativeTime } from '@/utils';

interface PageRow {
  id: string;
  business_name: string;
  slug: string;
  logo_url: string | null;
  created_at: string;
}

export default function PagesListPage() {
  const { user, isGuest } = useAuth();

  const { data: rawData, isLoading } = useQuery<PageRow[]>({
    queryKey: ['landing-pages', user?.id, isGuest],
    enabled: !!user || isGuest,
    queryFn: async (): Promise<PageRow[]> => {
      if (isGuest) {
        return getGuestLandingHistory().map((g) => ({
          id: g.id,
          business_name: g.business_name,
          slug: g.slug,
          logo_url: g.logo_url,
          created_at: g.created_at,
        }));
      }
      const { data, error } = await supabase
        .from('landing_pages')
        .select('id, business_name, slug, logo_url, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((p) => ({
        id: String(p.id),
        business_name: String(p.business_name ?? ''),
        slug: String(p.slug ?? ''),
        logo_url: (p.logo_url as string | null) ?? null,
        created_at: String(p.created_at ?? ''),
      }));
    },
  });

  const data = (rawData as PageRow[] | undefined) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Landing Pages</h2>
          <p className="text-sm text-muted-foreground">Every business page published via QRVerse.</p>
        </div>
        <Button asChild className="bg-brand text-brand-foreground hover:bg-brand/90">
          <Link href="/dashboard/qr/new"><Plus className="mr-2 h-4 w-4" /> New page</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : data.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((p: PageRow) => (
            <Card key={p.id} className="group p-5 transition-all hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border bg-background">
                  {p.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.logo_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/dashboard/pages/${p.slug}`}>
                    <p className="truncate text-sm font-semibold hover:text-brand">{p.business_name}</p>
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">/q/{p.slug}</p>
                </div>
                <Link href={`/dashboard/pages/${p.slug}`} className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100" aria-label="Edit page">
                  <FileText className="h-4 w-4" />
                </Link>
                <Link href={`/q/${p.slug}`} target="_blank" className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100" aria-label="Open page">
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {formatNumber(0)} views</span>
                <span className="ml-auto">{relativeTime(p.created_at)}</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-muted">
            <FileText className="h-7 w-7 text-brand" />
          </div>
          <p className="mt-5 text-base font-semibold">No landing pages yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">Create a QR code to publish your first landing page.</p>
          <Button asChild className="mt-6 bg-brand text-brand-foreground hover:bg-brand/90">
            <Link href="/dashboard/qr/new"><Plus className="mr-2 h-4 w-4" /> Create QR</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
