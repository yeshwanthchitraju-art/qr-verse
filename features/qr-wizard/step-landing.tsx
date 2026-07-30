'use client';

import { useWizardStore } from '@/features/qr-wizard/wizard-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { TEMPLATES, ACCENT_PRESETS, FONT_PRESETS } from '@/constants';
import { Plus, Trash2, Star, ImagePlus } from 'lucide-react';
import { generateShortId } from '@/utils';
import { toast } from 'sonner';
import type { TemplateId } from '@/types';

export function StepLanding() {
  const s = useWizardStore();

  async function addGallery(file: File | undefined) {
    if (!file) return;
    if (file.size > 1_500_000) { toast.error('Image must be under 1.5MB'); return; }
    const reader = new FileReader();
    reader.onload = () => s.set('gallery', [...s.gallery, { id: generateShortId(6), url: String(reader.result) }]);
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-lg font-semibold">Landing page design</h2>
        <p className="text-sm text-muted-foreground">Pick a template and customize the look.</p>
      </div>

      <div className="space-y-3">
        <Label>Template</Label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                s.set('template', t.id as TemplateId);
                s.set('theme', { ...s.theme, accentColor: t.accent, background: t.background, surface: t.surface });
              }}
              className={`overflow-hidden rounded-xl border text-left transition-all ${
                s.template === t.id ? 'border-brand ring-2 ring-brand/20' : 'hover:border-foreground/20'
              }`}
            >
              <div className="flex h-16 items-center justify-center" style={{ background: t.preview.secondary }}>
                <div className="h-8 w-8 rounded-lg" style={{ background: t.preview.primary }} />
              </div>
              <div className="px-2 py-1.5">
                <p className="text-xs font-medium">{t.name}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Accent color</Label>
          <div className="flex flex-wrap gap-2">
            {ACCENT_PRESETS.map((c) => (
              <button
                key={c}
                onClick={() => s.set('theme', { ...s.theme, accentColor: c })}
                className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${
                  s.theme.accentColor === c ? 'border-foreground' : 'border-transparent'
                }`}
                style={{ background: c }}
                aria-label={`Accent ${c}`}
              />
            ))}
            <label className="relative h-7 w-7 cursor-pointer overflow-hidden rounded-full border-2 border-dashed">
              <input
                type="color" value={s.theme.accentColor}
                onChange={(e) => s.set('theme', { ...s.theme, accentColor: e.target.value })}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <span className="block h-full w-full" style={{ background: s.theme.accentColor }} />
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Font</Label>
          <div className="grid grid-cols-3 gap-2">
            {FONT_PRESETS.map((f) => (
              <button
                key={f.value}
                onClick={() => s.set('theme', { ...s.theme, fontFamily: f.value })}
                className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                  s.theme.fontFamily === f.value ? 'border-foreground bg-foreground text-background' : 'hover:bg-accent'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Corner radius ({s.theme.radius}px)</Label>
          <input
            type="range" min={0} max={28} value={s.theme.radius}
            onChange={(e) => s.set('theme', { ...s.theme, radius: Number(e.target.value) })}
            className="w-full accent-[hsl(var(--brand))]"
          />
        </div>

        <div className="space-y-2">
          <Label>Button style</Label>
          <div className="grid grid-cols-4 gap-2">
            {(['solid', 'soft', 'outline', 'glass'] as const).map((b) => (
              <button
                key={b}
                onClick={() => s.set('theme', { ...s.theme, buttonStyle: b })}
                className={`rounded-lg border px-2 py-2 text-xs capitalize transition-colors ${
                  s.theme.buttonStyle === b ? 'border-foreground bg-foreground text-background' : 'hover:bg-accent'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Services */}
      <Block title="Services">
        {s.services.map((sv) => (
          <Row key={sv.id}>
            <Input value={sv.name} onChange={(e) => s.set('services', s.services.map((x) => x.id === sv.id ? { ...x, name: e.target.value } : x))} placeholder="Service name" className="h-9" />
            <Input value={sv.price ?? ''} onChange={(e) => s.set('services', s.services.map((x) => x.id === sv.id ? { ...x, price: e.target.value } : x))} placeholder="Price" className="h-9 w-24" />
            <RemoveBtn onClick={() => s.set('services', s.services.filter((x) => x.id !== sv.id))} />
          </Row>
        ))}
        <AddBtn label="Add service" onClick={() => s.set('services', [...s.services, { id: generateShortId(6), name: '', price: '' }])} />
      </Block>

      {/* Products */}
      <Block title="Products">
        {s.products.map((p) => (
          <Row key={p.id}>
            <Input value={p.name} onChange={(e) => s.set('products', s.products.map((x) => x.id === p.id ? { ...x, name: e.target.value } : x))} placeholder="Product name" className="h-9" />
            <Input value={p.price ?? ''} onChange={(e) => s.set('products', s.products.map((x) => x.id === p.id ? { ...x, price: e.target.value } : x))} placeholder="Price" className="h-9 w-24" />
            <RemoveBtn onClick={() => s.set('products', s.products.filter((x) => x.id !== p.id))} />
          </Row>
        ))}
        <AddBtn label="Add product" onClick={() => s.set('products', [...s.products, { id: generateShortId(6), name: '', price: '' }])} />
      </Block>

      {/* Gallery */}
      <Block title="Gallery">
        {s.gallery.length > 0 && (
          <div className="mb-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
            {s.gallery.map((g) => (
              <div key={g.id} className="group relative aspect-square overflow-hidden rounded-lg border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.url} alt="" className="h-full w-full object-cover" />
                <button onClick={() => s.set('gallery', s.gallery.filter((x) => x.id !== g.id))} className="absolute right-1 top-1 rounded-md bg-background/80 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <label className="inline-flex cursor-pointer items-center rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-accent">
          <ImagePlus className="mr-1.5 h-4 w-4" /> Upload image
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => addGallery(e.target.files?.[0])} />
        </label>
      </Block>

      {/* Testimonials */}
      <Block title="Testimonials">
        {s.testimonials.map((t) => (
          <div key={t.id} className="space-y-2 rounded-lg border bg-background p-3">
            <div className="flex gap-2">
              <Input value={t.name} onChange={(e) => s.set('testimonials', s.testimonials.map((x) => x.id === t.id ? { ...x, name: e.target.value } : x))} placeholder="Name" className="h-9" />
              <Input value={t.role ?? ''} onChange={(e) => s.set('testimonials', s.testimonials.map((x) => x.id === t.id ? { ...x, role: e.target.value } : x))} placeholder="Role" className="h-9" />
              <div className="flex items-center gap-0.5 rounded-lg border bg-background px-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button key={i} onClick={() => s.set('testimonials', s.testimonials.map((x) => x.id === t.id ? { ...x, rating: i + 1 } : x))}>
                    <Star className={`h-4 w-4 ${i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
                  </button>
                ))}
              </div>
              <RemoveBtn onClick={() => s.set('testimonials', s.testimonials.filter((x) => x.id !== t.id))} />
            </div>
            <Textarea value={t.content} onChange={(e) => s.set('testimonials', s.testimonials.map((x) => x.id === t.id ? { ...x, content: e.target.value } : x))} placeholder="Testimonial" rows={2} />
          </div>
        ))}
        <AddBtn label="Add testimonial" onClick={() => s.set('testimonials', [...s.testimonials, { id: generateShortId(6), name: '', content: '', rating: 5 }])} />
      </Block>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <Label>{title}</Label>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2">{children}</div>;
}
function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-destructive" aria-label="Remove">
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
function AddBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      <Plus className="mr-1.5 h-4 w-4" /> {label}
    </Button>
  );
}
