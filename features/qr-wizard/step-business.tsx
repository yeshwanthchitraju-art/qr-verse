'use client';

import { useWizardStore } from '@/features/qr-wizard/wizard-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { BUSINESS_CATEGORIES, DAYS_OF_WEEK } from '@/constants';
import { ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';

export function StepBusiness() {
  const s = useWizardStore();

  async function handleLogoUpload(file: File | undefined) {
    if (!file) return;
    if (file.size > 1_500_000) {
      toast.error('Image must be under 1.5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => s.set('logoUrl', String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Business information</h2>
        <p className="text-sm text-muted-foreground">Tell customers who you are.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>Logo</Label>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border bg-muted">
              {s.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.logoUrl} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <ImagePlus className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex gap-2">
              <label className="inline-flex cursor-pointer items-center rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-accent">
                Upload
                <input
                  type="file" accept="image/*" className="sr-only"
                  onChange={(e) => handleLogoUpload(e.target.files?.[0])}
                />
              </label>
              {s.logoUrl && (
                <button onClick={() => s.set('logoUrl', '')} className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-accent">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="bn">Business name *</Label>
          <Input id="bn" value={s.businessName} onChange={(e) => s.set('businessName', e.target.value)} placeholder="Bloom & Co." />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="desc">Description</Label>
          <Textarea id="desc" value={s.description} onChange={(e) => s.set('description', e.target.value)} placeholder="A short bio shown on your landing page." rows={3} />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={s.category} onValueChange={(v) => s.set('category', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {BUSINESS_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="web">Website</Label>
          <Input id="web" value={s.website} onChange={(e) => s.set('website', e.target.value)} placeholder="https://..." />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={s.phone} onChange={(e) => s.set('phone', e.target.value)} placeholder="+1 555 0100" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={s.email} onChange={(e) => s.set('email', e.target.value)} placeholder="hello@business.com" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="wa">WhatsApp</Label>
          <Input id="wa" value={s.whatsapp} onChange={(e) => s.set('whatsapp', e.target.value)} placeholder="+1 555 0100" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="addr">Address</Label>
          <Input id="addr" value={s.address} onChange={(e) => s.set('address', e.target.value)} placeholder="123 Main St, Brooklyn, NY" />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Business hours</Label>
        <div className="rounded-xl border divide-y">
          {DAYS_OF_WEEK.map((day) => {
            const entry = s.hours.find((h) => h.day === day);
            if (!entry) return null;
            return (
              <div key={day} className="flex items-center gap-3 p-3">
                <span className="w-28 text-sm font-medium">{day}</span>
                <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox" checked={!entry.closed}
                    onChange={(e) => s.set('hours', s.hours.map((h) => h.day === day ? { ...h, closed: !e.target.checked } : h))}
                  />
                  Open
                </label>
                {!entry.closed && (
                  <div className="flex items-center gap-2">
                    <Input type="time" value={entry.open} onChange={(e) => s.set('hours', s.hours.map((h) => h.day === day ? { ...h, open: e.target.value } : h))} className="h-8 w-28 text-xs" />
                    <span className="text-xs text-muted-foreground">to</span>
                    <Input type="time" value={entry.close} onChange={(e) => s.set('hours', s.hours.map((h) => h.day === day ? { ...h, close: e.target.value } : h))} className="h-8 w-28 text-xs" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
