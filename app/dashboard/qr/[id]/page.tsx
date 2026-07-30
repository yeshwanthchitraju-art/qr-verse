'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, ExternalLink, Copy, Trash2, Loader as Loader2, Star, Archive, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/providers/auth-provider';
import { getGuestQrHistory, updateGuestQr, deleteGuestQr } from '@/lib/guest-history';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { formatNumber, relativeTime } from '@/utils';
import type { QrCodeRow, QrStyling } from '@/types';

const QrPreview = dynamic(() => import('@/components/qr/qr-preview'), { ssr: false });

interface QrDetail extends QrCodeRow {
  landing_pages: { slug: string; business_name: string } | null;
}

export default function QrDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isGuest } = useAuth();
  const qc = useQueryClient();

  const [name, setName] = useState('');
  const [destinationType, setDestinationType] = useState<'landing_page' | 'url'>('landing_page');
  const [destinationUrl, setDestinationUrl] = useState('');
  const [folder, setFolder] = useState('Default');
  const [loaded, setLoaded] = useState(false);

  const { data, isLoading } = useQuery<QrDetail | null>({
    queryKey: ['qr-detail', params.id, isGuest],
    enabled: (!!user || isGuest) && !!params.id,
    queryFn: async (): Promise<QrDetail | null> => {
      if (isGuest) {
        const item = getGuestQrHistory().find((q) => q.id === params.id);
        if (!item) return null;
        return {
          id: item.id,
          name: item.name,
          short_id: item.short_id,
          folder: item.folder,
          destination_type: item.destination_type,
          destination_url: item.destination_url,
          styling: item.styling,
          is_favorite: item.is_favorite,
          is_archived: item.is_archived,
          scans_count: item.scans_count,
          views_count: item.views_count,
          created_at: item.created_at,
          landing_pages: item.landing ? { slug: item.landing.slug, business_name: item.landing.business_name } : null,
        } as unknown as QrDetail;
      }
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*, landing_pages(slug, business_name)')
        .eq('id', params.id!)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as QrDetail) ?? null;
    },
  });

  const current = data as QrDetail | null;

  if (current && !loaded) {
    setName(current.name);
    setDestinationType(current.destination_type);
    setDestinationUrl(current.destination_url ?? '');
    setFolder(current.folder);
    setLoaded(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isGuest) { updateGuestQr(params.id!, { name, destination_type: destinationType, destination_url: destinationType === 'url' ? destinationUrl : null, folder }); return; }
      const { error } = await supabase
        .from('qr_codes')
        .update({ name, destination_type: destinationType, destination_url: destinationType === 'url' ? destinationUrl : null, folder })
        .eq('id', params.id!);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('QR updated');
      qc.invalidateQueries({ queryKey: ['qr-detail', params.id, isGuest] });
      qc.invalidateQueries({ queryKey: ['qr-codes', user?.id, isGuest] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (isGuest) { deleteGuestQr(params.id!); return; }
      const { error } = await supabase.from('qr_codes').delete().eq('id', params.id!);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('QR deleted');
      router.push('/dashboard/qr');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function download(extension: 'png' | 'svg') {
    const { default: QRCodeStyling } = await import('qr-code-styling');
    if (!current) return;
    const styling = (current.styling || {}) as QrStyling;
    const from = styling.gradientFrom || '#6366f1';
    const to = styling.gradientTo || '#8b5cf6';
    const qr = new QRCodeStyling({
      width: 1024, height: 1024, type: 'svg',
      data: `${window.location.origin}/r/${current.short_id}`,
      margin: styling.padding ?? 20,
      dotsOptions: styling.gradientEnabled
        ? { type: styling.dotsType, gradient: { type: 'linear', rotation: styling.gradientRotation, colorStops: [{ offset: 0, color: from }, { offset: 1, color: to }] } }
        : { type: styling.dotsType, color: styling.foregroundColor },
      cornersSquareOptions: { type: styling.cornersSquareType, color: styling.cornersSquareColor },
      cornersDotOptions: { type: styling.cornersDotType, color: styling.cornersDotColor },
      backgroundOptions: { color: styling.backgroundColor },
      image: styling.logoUrl || undefined,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (qr as any).download({ name: `${current.name || 'qr'}-qr`, extension });
    toast.success(`Downloaded ${extension.toUpperCase()}`);
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm font-medium">QR code not found</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/dashboard/qr">Back to QR codes</Link>
        </Button>
      </div>
    );
  }

  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/r/${current.short_id}` : '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/qr"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => download('png')}><Download className="mr-2 h-4 w-4" /> PNG</Button>
          <Button variant="outline" size="sm" onClick={() => download('svg')}><Download className="mr-2 h-4 w-4" /> SVG</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Folder</Label>
                  <Input value={folder} onChange={(e) => setFolder(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Destination</Label>
                  <Select value={destinationType} onValueChange={(v) => setDestinationType(v as 'landing_page' | 'url')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="landing_page">Landing page</SelectItem>
                      <SelectItem value="url">External URL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {destinationType === 'url' && (
                <div className="space-y-2">
                  <Label>Destination URL</Label>
                  <Input value={destinationUrl} onChange={(e) => setDestinationUrl(e.target.value)} placeholder="https://..." />
                </div>
              )}
              {destinationType === 'landing_page' && current.landing_pages && (
                <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                  <p className="text-xs text-muted-foreground">Points to landing page</p>
                  <Link href={`/q/${current.landing_pages.slug}`} target="_blank" className="mt-1 inline-flex items-center gap-1.5 font-medium text-brand hover:underline">
                    {current.landing_pages.business_name} <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="bg-brand text-brand-foreground hover:bg-brand/90">
                {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save changes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Stats</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">Total scans</p>
                  <p className="text-2xl font-semibold">{formatNumber(current.scans_count)}</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">Landing views</p>
                  <p className="text-2xl font-semibold">{formatNumber(current.views_count)}</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">Created {relativeTime(current.created_at)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex flex-col items-center">
              <div className="rounded-xl bg-white p-3 shadow-sm">
                <QrPreview value={publicUrl} styling={(current.styling || {}) as QrStyling} size={220} />
              </div>
              <p className="mt-4 break-all text-center font-mono text-xs text-muted-foreground">{publicUrl}</p>
              <Button
                variant="outline" size="sm" className="mt-3 w-full"
                onClick={() => { navigator.clipboard.writeText(publicUrl); toast.success('Link copied'); }}
              >
                <Copy className="mr-2 h-4 w-4" /> Copy link
              </Button>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex gap-2">
              <Button
                variant="outline" size="sm" className="flex-1"
                onClick={async () => {
                  if (isGuest) { updateGuestQr(current.id, { is_favorite: !current.is_favorite }); }
                  else { await supabase.from('qr_codes').update({ is_favorite: !current.is_favorite }).eq('id', current.id); }
                  qc.invalidateQueries({ queryKey: ['qr-detail', params.id, isGuest] });
                  toast.success(current.is_favorite ? 'Unfavorited' : 'Favorited');
                }}
              >
                <Star className={`mr-2 h-4 w-4 ${current.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                {current.is_favorite ? 'Favorited' : 'Favorite'}
              </Button>
              <Button
                variant="outline" size="sm" className="flex-1"
                onClick={async () => {
                  if (isGuest) { updateGuestQr(current.id, { is_archived: !current.is_archived }); }
                  else { await supabase.from('qr_codes').update({ is_archived: !current.is_archived }).eq('id', current.id); }
                  qc.invalidateQueries({ queryKey: ['qr-detail', params.id, isGuest] });
                  toast.success(current.is_archived ? 'Unarchived' : 'Archived');
                }}
              >
                <Archive className="mr-2 h-4 w-4" /> {current.is_archived ? 'Unarchive' : 'Archive'}
              </Button>
            </div>
          </Card>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete QR
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this QR code?</AlertDialogTitle>
                <AlertDialogDescription>This permanently deletes "{current.name}" and all its scan data.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteMutation.mutate()}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
