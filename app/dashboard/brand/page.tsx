'use client';

import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Palette, Check } from 'lucide-react';
import { ACCENT_PRESETS } from '@/constants';
import { useState } from 'react';

export default function BrandPage() {
  const { profile, refreshProfile } = useAuth();
  const [color, setColor] = useState(profile?.brand_color || '#6366f1');

  async function save() {
    // brand_color lives on profiles
    const { supabase } = await import('@/lib/supabase/client');
    const { error } = await supabase.from('profiles').update({ brand_color: color }).eq('id', profile?.id ?? '');
    if (error) { toast.error(error.message); return; }
    await refreshProfile();
    toast.success('Brand kit updated');
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Brand Kit</h2>
        <p className="text-sm text-muted-foreground">Default colors and identity for new QR codes.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Palette className="h-4 w-4" /> Brand color</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block">Preset colors</Label>
            <div className="flex flex-wrap gap-2">
              {ACCENT_PRESETS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`relative h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    color === c ? 'border-foreground' : 'border-transparent'
                  }`}
                  style={{ background: c }}
                  aria-label={c}
                >
                  {color === c && <Check className="absolute inset-0 m-auto h-4 w-4 text-white" />}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-10 cursor-pointer rounded-lg border" />
            <Input value={color} onChange={(e) => setColor(e.target.value)} className="font-mono" />
          </div>
          <Button onClick={save} className="bg-brand text-brand-foreground hover:bg-brand/90">
            <Check className="mr-2 h-4 w-4" /> Save brand kit
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
