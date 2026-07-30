'use client';

import { useWizardStore } from '@/features/qr-wizard/wizard-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SOCIAL_PLATFORMS } from '@/constants';
import {
  Instagram, Facebook, Music, Youtube, Linkedin, Twitter,
  Send, MessageCircle, Image as ImageIcon, Ghost, Plus, Trash2, GripVertical,
} from 'lucide-react';
import { generateShortId } from '@/utils';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Instagram, Facebook, Music, Youtube, Linkedin, Twitter,
  Send, MessageCircle, Image: ImageIcon, Ghost,
};

export function StepSocial() {
  const s = useWizardStore();

  function addLink() {
    s.set('customLinks', [...s.customLinks, { id: generateShortId(6), label: '', url: '' }]);
  }
  function updateLink(id: string, patch: Partial<{ label: string; url: string }>) {
    s.set('customLinks', s.customLinks.map((l) => l.id === id ? { ...l, ...patch } : l));
  }
  function removeLink(id: string) {
    s.set('customLinks', s.customLinks.filter((l) => l.id !== id));
  }

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-lg font-semibold">Social media & links</h2>
        <p className="text-sm text-muted-foreground">Connect your profiles and add custom buttons.</p>
      </div>

      <div className="space-y-3">
        <Label>Social profiles</Label>
        <div className="grid gap-3 sm:grid-cols-2">
          {SOCIAL_PLATFORMS.map((p) => {
            const Icon = iconMap[p.icon] ?? Instagram;
            return (
              <div key={p.key} className="flex items-center gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-background">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  value={s.social[p.key] ?? ''}
                  onChange={(e) => s.set('social', { ...s.social, [p.key]: e.target.value })}
                  placeholder={p.label}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Custom buttons</Label>
          <Button variant="outline" size="sm" onClick={addLink}>
            <Plus className="mr-1.5 h-4 w-4" /> Add button
          </Button>
        </div>
        {s.customLinks.length === 0 ? (
          <div className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
            No custom buttons yet. Add unlimited links to anything.
          </div>
        ) : (
          <div className="space-y-2">
            {s.customLinks.map((link) => (
              <div key={link.id} className="flex items-center gap-2 rounded-lg border bg-background p-2">
                <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground/50" />
                <Input
                  value={link.label}
                  onChange={(e) => updateLink(link.id, { label: e.target.value })}
                  placeholder="Button label"
                  className="h-9"
                />
                <Input
                  value={link.url}
                  onChange={(e) => updateLink(link.id, { url: e.target.value })}
                  placeholder="https://..."
                  className="h-9"
                />
                <button onClick={() => removeLink(link.id)} className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-destructive" aria-label="Remove">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
