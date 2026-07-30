'use client';

import dynamic from 'next/dynamic';
import { useWizardStore } from '@/features/qr-wizard/wizard-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { QR_DOT_OPTIONS, QR_CORNERS_SQUARE_OPTIONS, QR_CORNERS_DOT_OPTIONS } from '@/utils/qr';
import { ImagePlus, X, Download } from 'lucide-react';
import { toast } from 'sonner';
import { generateShortId } from '@/utils';
import type { QrStyling } from '@/types';

function buildQrOptions(value: string, s: QrStyling, size: number) {
  const dotsOptions = s.gradientEnabled
    ? {
        type: s.dotsType,
        gradient: {
          type: 'linear' as const,
          rotation: s.gradientRotation,
          colorStops: [
            { offset: 0, color: s.gradientFrom || '#6366f1' },
            { offset: 1, color: s.gradientTo || '#8b5cf6' },
          ],
        },
      }
    : { type: s.dotsType, color: s.foregroundColor };
  return {
    width: size,
    height: size,
    type: 'svg' as const,
    data: value,
    margin: s.padding,
    image: s.logoUrl || undefined,
    imageOptions: {
      crossOrigin: 'anonymous',
      margin: s.imageMargin,
      imageSize: s.logoSize,
      hideBackgroundDots: true,
    },
    dotsOptions,
    cornersSquareOptions: { type: s.cornersSquareType, color: s.cornersSquareColor },
    cornersDotOptions: { type: s.cornersDotType, color: s.cornersDotColor },
    backgroundOptions: { color: s.backgroundColor },
    qrOptions: { errorCorrectionLevel: 'Q' as const },
  };
}

const QrPreview = dynamic(() => import('@/components/qr/qr-preview'), { ssr: false, loading: () => <div className="h-[220px] w-[220px] rounded-xl bg-muted animate-pulse" /> });

export function StepQr() {
  const s = useWizardStore();

  async function handleLogo(file: File | undefined) {
    if (!file) return;
    if (file.size > 1_500_000) { toast.error('Logo must be under 1.5MB'); return; }
    const reader = new FileReader();
    reader.onload = () => s.set('styling', { ...s.styling, logoUrl: String(reader.result) });
    reader.readAsDataURL(file);
  }

  async function downloadPng() {
    const { default: QRCodeStyling } = await import('qr-code-styling');
    const shortId = generateShortId();
    const qr = new QRCodeStyling(buildQrOptions(`https://qrverse.app/r/${shortId}`, s.styling, 1024));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (qr as any).download({ name: `${s.qrName || 'qrverse'}-qr`, extension: 'png' });
    toast.success('QR downloaded as PNG');
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Generate your QR</h2>
          <p className="text-sm text-muted-foreground">Style it, then download. The QR encodes only a short link.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="qrname">QR name *</Label>
            <Input id="qrname" value={s.qrName} onChange={(e) => s.set('qrName', e.target.value)} placeholder="e.g. Storefront window QR" />
          </div>
          <div className="space-y-2">
            <Label>Folder</Label>
            <Input value={s.folder} onChange={(e) => s.set('folder', e.target.value)} placeholder="Default" />
          </div>
          <div className="space-y-2">
            <Label>Destination</Label>
            <Select value={s.destinationType} onValueChange={(v) => s.set('destinationType', v as 'landing_page' | 'url')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="landing_page">Landing page</SelectItem>
                <SelectItem value="url">External URL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {s.destinationType === 'url' && (
            <div className="space-y-2 sm:col-span-2">
              <Label>Destination URL</Label>
              <Input value={s.destinationUrl} onChange={(e) => s.set('destinationUrl', e.target.value)} placeholder="https://your-site.com" />
            </div>
          )}
        </div>

        <div className="border-t pt-6">
          <h3 className="text-sm font-semibold">QR style</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Dot pattern</Label>
              <Select value={s.styling.dotsType} onValueChange={(v) => s.set('styling', { ...s.styling, dotsType: v as typeof s.styling.dotsType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {QR_DOT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Corner squares</Label>
              <Select value={s.styling.cornersSquareType} onValueChange={(v) => s.set('styling', { ...s.styling, cornersSquareType: v as typeof s.styling.cornersSquareType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {QR_CORNERS_SQUARE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Corner dots</Label>
              <Select value={s.styling.cornersDotType} onValueChange={(v) => s.set('styling', { ...s.styling, cornersDotType: v as typeof s.styling.cornersDotType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {QR_CORNERS_DOT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Padding ({s.styling.padding}px)</Label>
              <input type="range" min={0} max={40} value={s.styling.padding} onChange={(e) => s.set('styling', { ...s.styling, padding: Number(e.target.value) })} className="w-full accent-[hsl(var(--brand))]" />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Gradient fill</p>
              <p className="text-xs text-muted-foreground">Use a two-color gradient for the dots.</p>
            </div>
            <Switch checked={s.styling.gradientEnabled} onCheckedChange={(v) => s.set('styling', { ...s.styling, gradientEnabled: v })} />
          </div>

          {s.styling.gradientEnabled ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">From</Label>
                <ColorInput value={s.styling.gradientFrom || '#6366f1'} onChange={(v) => s.set('styling', { ...s.styling, gradientFrom: v })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">To</Label>
                <ColorInput value={s.styling.gradientTo || '#8b5cf6'} onChange={(v) => s.set('styling', { ...s.styling, gradientTo: v })} />
              </div>
            </div>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Foreground</Label>
                <ColorInput value={s.styling.foregroundColor} onChange={(v) => s.set('styling', { ...s.styling, foregroundColor: v })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Background</Label>
                <ColorInput value={s.styling.backgroundColor} onChange={(v) => s.set('styling', { ...s.styling, backgroundColor: v })} />
              </div>
            </div>
          )}

          <div className="mt-5 space-y-2">
            <Label>Logo (center of QR)</Label>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                {s.styling.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.styling.logoUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImagePlus className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <label className="inline-flex cursor-pointer items-center rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-accent">
                Upload
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => handleLogo(e.target.files?.[0])} />
              </label>
              {s.styling.logoUrl && (
                <button onClick={() => s.set('styling', { ...s.styling, logoUrl: undefined })} className="inline-flex items-center rounded-md border px-2.5 py-2 text-sm hover:bg-accent">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="lg:sticky lg:top-6">
        <div className="flex flex-col items-center rounded-2xl border bg-card p-6">
          <div className="rounded-xl bg-white p-3 shadow-sm">
            <QrPreview
              value={`https://qrverse.app/r/preview`}
              styling={s.styling}
              size={220}
            />
          </div>
          <Button onClick={downloadPng} variant="outline" className="mt-5 w-full">
            <Download className="mr-2 h-4 w-4" /> Download PNG
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            The final QR will encode <span className="font-mono">qrverse.app/r/…</span> — fully editable later.
          </p>
        </div>
      </div>
    </div>
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-background px-2 py-1.5">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0" />
      <input value={value} onChange={(e) => onChange(e.target.value)} className="h-6 w-full bg-transparent text-xs font-mono outline-none" />
    </div>
  );
}
