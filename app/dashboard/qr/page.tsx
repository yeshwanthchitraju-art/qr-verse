'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Search, Star, Archive, Copy, Trash2, MoveHorizontal as MoreHorizontal, QrCode as QrIcon, Folder, ArrowUpDown } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/providers/auth-provider';
import {
  getGuestQrHistory, addGuestQr, updateGuestQr, deleteGuestQr, duplicateGuestQr,
  type GuestQrItem,
} from '@/lib/guest-history';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { formatNumber, relativeTime } from '@/utils';

interface QrItem {
  id: string;
  name: string;
  short_id: string;
  folder: string;
  destination_type: 'landing_page' | 'url';
  destination_url: string | null;
  styling: Record<string, unknown>;
  is_favorite: boolean;
  is_archived: boolean;
  scans_count: number;
  views_count: number;
  created_at: string;
  landing_pages: { slug: string; business_name: string; logo_url: string | null } | null;
}

export default function QrListPage() {
  const { user, isGuest } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('All');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: rawData, isLoading } = useQuery<QrItem[]>({
    queryKey: ['qr-codes', user?.id, isGuest],
    enabled: !!user || isGuest,
    queryFn: async (): Promise<QrItem[]> => {
      if (isGuest) {
        return getGuestQrHistory().map((g) => ({
          id: g.id,
          name: g.name,
          short_id: g.short_id,
          folder: g.folder,
          destination_type: g.destination_type,
          destination_url: g.destination_url,
          styling: g.styling,
          is_favorite: g.is_favorite,
          is_archived: g.is_archived,
          scans_count: g.scans_count,
          views_count: g.views_count,
          created_at: g.created_at,
          landing_pages: g.landing,
        }));
      }
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*, landing_pages(slug, business_name, logo_url)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row) => {
        const lpRaw = row.landing_pages as unknown;
        const lp = (Array.isArray(lpRaw) ? lpRaw[0] : lpRaw) as QrItem['landing_pages'];
        return {
          id: String(row.id),
          name: String(row.name ?? ''),
          short_id: String(row.short_id ?? ''),
          folder: String(row.folder ?? 'Default'),
          destination_type: (row.destination_type as QrItem['destination_type']) ?? 'landing_page',
          destination_url: (row.destination_url as string | null) ?? null,
          styling: (row.styling as Record<string, unknown>) ?? {},
          is_favorite: Boolean(row.is_favorite),
          is_archived: Boolean(row.is_archived),
          scans_count: Number(row.scans_count ?? 0),
          views_count: Number(row.views_count ?? 0),
          created_at: String(row.created_at ?? ''),
          landing_pages: lp,
        };
      });
    },
  });

  const data = (rawData as QrItem[] | undefined) ?? [];

  const folders = useMemo(() => {
    const set = new Set<string>(['All', 'Default']);
    data.forEach((q: QrItem) => set.add(q.folder || 'Default'));
    return Array.from(set);
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter((q: QrItem) => {
      if (folder !== 'All' && (q.folder || 'Default') !== folder) return false;
      if (search) {
        const term = search.toLowerCase();
        return (
          q.name.toLowerCase().includes(term) ||
          q.short_id.toLowerCase().includes(term) ||
          (q.landing_pages?.business_name ?? '').toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [data, folder, search]);

  const updateMutation = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<QrItem> }) => {
      if (isGuest) { updateGuestQr(id, patch); return; }
      const { error } = await supabase.from('qr_codes').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['qr-codes', user?.id, isGuest] });
      qc.invalidateQueries({ queryKey: ['dashboard-overview', user?.id, isGuest] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isGuest) { deleteGuestQr(id); return; }
      const { error } = await supabase.from('qr_codes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['qr-codes', user?.id, isGuest] });
      qc.invalidateQueries({ queryKey: ['dashboard-overview', user?.id, isGuest] });
      toast.success('QR code deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const duplicateMutation = useMutation({
    mutationFn: async (q: QrItem) => {
      if (isGuest) {
        duplicateGuestQr({
          id: q.id, name: q.name, short_id: q.short_id, folder: q.folder,
          destination_type: q.destination_type, destination_url: q.destination_url,
          styling: q.styling, is_favorite: q.is_favorite, is_archived: q.is_archived,
          scans_count: q.scans_count, views_count: q.views_count, created_at: q.created_at,
          landing: q.landing_pages,
        });
        return;
      }
      const { error } = await supabase
        .from('qr_codes')
        .insert({
          name: `${q.name} (copy)`,
          folder: q.folder,
          destination_type: q.destination_type,
          destination_url: q.destination_url,
          styling: q.styling,
          short_id: Math.random().toString(36).slice(2, 10),
        });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['qr-codes', user?.id, isGuest] });
      toast.success('QR code duplicated');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">My QR Codes</h2>
          <p className="text-sm text-muted-foreground">Manage, edit, and track your QR codes.</p>
        </div>
        <Button asChild className="bg-brand text-brand-foreground hover:bg-brand/90">
          <Link href="/dashboard/qr/new"><Plus className="mr-2 h-4 w-4" /> Create QR</Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search QR codes..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {folders.map((f) => (
            <button
              key={f}
              onClick={() => setFolder(f)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                folder === f ? 'border-foreground/20 bg-foreground text-background' : 'bg-background hover:bg-accent'
              }`}
            >
              <Folder className="h-3.5 w-3.5" /> {f}
            </button>
          ))}
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border bg-accent/50 px-4 py-2.5">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setSelected(new Set())}>Clear</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((q: QrItem) => (
            <Card key={q.id} className="group relative p-5 transition-all hover:shadow-md hover:shadow-foreground/5">
              <div className="flex items-start justify-between">
                <Link href={`/dashboard/qr/${q.id}`} className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border bg-background">
                    <QrIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{q.name}</p>
                    <p className="truncate text-xs text-muted-foreground">/{q.short_id}</p>
                  </div>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100" aria-label="Actions">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => updateMutation.mutate({ id: q.id, patch: { is_favorite: !q.is_favorite } })}>
                      <Star className="mr-2 h-4 w-4" /> {q.is_favorite ? 'Unfavorite' : 'Favorite'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => duplicateMutation.mutate(q)}>
                      <Copy className="mr-2 h-4 w-4" /> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateMutation.mutate({ id: q.id, patch: { is_archived: !q.is_archived } })}>
                      <Archive className="mr-2 h-4 w-4" /> {q.is_archived ? 'Unarchive' : 'Archive'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this QR code?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{q.name}" and all its scan data. This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => deleteMutation.mutate(q.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Link href={`/dashboard/qr/${q.id}`} className="mt-5 block">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-muted/40 p-2.5">
                    <p className="text-xs text-muted-foreground">Scans</p>
                    <p className="text-base font-semibold">{formatNumber(q.scans_count)}</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-2.5">
                    <p className="text-xs text-muted-foreground">Views</p>
                    <p className="text-base font-semibold">{formatNumber(q.views_count)}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ArrowUpDown className="h-3 w-3" />
                  {q.landing_pages ? q.landing_pages.business_name : 'Direct URL'}
                  <span className="ml-auto">{relativeTime(q.created_at)}</span>
                </div>
              </Link>

              {q.is_favorite && (
                <Star className="absolute right-3 top-3 h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-muted">
        <QrIcon className="h-7 w-7 text-brand" />
      </div>
      <p className="mt-5 text-base font-semibold">No QR codes yet</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Create your first dynamic QR code. It takes less than a minute.
      </p>
      <Button asChild className="mt-6 bg-brand text-brand-foreground hover:bg-brand/90">
        <Link href="/dashboard/qr/new"><Plus className="mr-2 h-4 w-4" /> Create QR</Link>
      </Button>
    </div>
  );
}
