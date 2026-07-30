'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WizardPhonePreview } from '@/features/qr-wizard/wizard-phone-preview';
import { useWizardStore } from '@/features/qr-wizard/wizard-store';
import { toast } from 'sonner';
import type { LandingPageRow } from '@/types';

type PageDetail = LandingPageRow;

export default function EditLandingPage() {
  const params = useParams<{ slug: string }>();
  const { user } = useAuth();
  const qc = useQueryClient();
  const s = useWizardStore();

  const [loaded, setLoaded] = useState(false);

  const { data: page, isLoading } = useQuery<PageDetail | null>({
    queryKey: ['landing-page', params.slug],
    enabled: !!user && !!params.slug,
    queryFn: async (): Promise<PageDetail | null> => {
      const { data, error } = await supabase
        .from('landing_pages')
        .select('*')
        .eq('slug', params.slug!)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as PageDetail) ?? null;
    },
  });

  const current = page as PageDetail | null;

  useEffect(() => {
    if (current && !loaded) {
      s.patch({
        businessName: current.business_name,
        description: current.description || '',
        category: current.category || '',
        phone: current.phone || '',
        email: current.email || '',
        website: current.website || '',
        whatsapp: current.whatsapp || '',
        address: current.address || '',
        social: (current.social as Record<string, string>) || {},
        services: (current.services as typeof s.services) || [],
        products: (current.products as typeof s.products) || [],
        gallery: (current.gallery as typeof s.gallery) || [],
        testimonials: (current.testimonials as typeof s.testimonials) || [],
        hours: (current.hours as typeof s.hours) || [],
        ctaButtons: (current.cta_buttons as typeof s.ctaButtons) || [],
        customLinks: (current.custom_links as typeof s.customLinks) || [],
        template: (current.template as typeof s.template) || 'minimal',
        logoUrl: current.logo_url || '',
        theme: { ...s.theme, ...((current.theme_config as Partial<typeof s.theme>) || {}) },
      });
      setLoaded(true);
    }
  }, [current, loaded, s]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!current) throw new Error('Page not found');
      const { error } = await supabase
        .from('landing_pages')
        .update({
          business_name: s.businessName,
          description: s.description,
          category: s.category,
          phone: s.phone,
          email: s.email,
          website: s.website,
          whatsapp: s.whatsapp,
          address: s.address,
          social: s.social,
          services: s.services,
          products: s.products,
          gallery: s.gallery,
          testimonials: s.testimonials,
          hours: s.hours,
          cta_buttons: s.ctaButtons,
          custom_links: s.customLinks,
          theme_config: s.theme,
          template: s.template,
          logo_url: s.logoUrl,
        })
        .eq('slug', params.slug!);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Landing page saved');
      qc.invalidateQueries({ queryKey: ['landing-page', params.slug] });
      qc.invalidateQueries({ queryKey: ['landing-pages', user?.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!current) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm font-medium">Page not found</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/dashboard/pages">Back to pages</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/pages"><ArrowLeft className="mr-2 h-4 w-4" /> Back to pages</Link>
        </Button>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/q/${current.slug}`} target="_blank"><Eye className="mr-2 h-4 w-4" /> Preview</Link>
          </Button>
          <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="bg-brand text-brand-foreground hover:bg-brand/90">
            {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save changes
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit: {current.business_name}</h1>
        <p className="text-sm text-muted-foreground">Edit your landing page content and styling. Changes save instantly.</p>
      </div>

      <Tabs defaultValue="content" className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="design">Design</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Business info</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Business name</Label>
                  <Input value={s.businessName} onChange={(e) => s.set('businessName', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={s.description} onChange={(e) => s.set('description', e.target.value)} rows={3} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input value={s.category} onChange={(e) => s.set('category', e.target.value)} placeholder="Restaurant, Salon..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={s.phone} onChange={(e) => s.set('phone', e.target.value)} placeholder="+1 555-0100" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={s.email} onChange={(e) => s.set('email', e.target.value)} placeholder="hello@business.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input value={s.website} onChange={(e) => s.set('website', e.target.value)} placeholder="https://..." />
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp</Label>
                    <Input value={s.whatsapp} onChange={(e) => s.set('whatsapp', e.target.value)} placeholder="+1 555-0100" />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input value={s.address} onChange={(e) => s.set('address', e.target.value)} placeholder="123 Main St..." />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Social links</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {['instagram', 'facebook', 'twitter', 'youtube', 'linkedin', 'tiktok'].map((key) => (
                    <div key={key} className="space-y-1.5">
                      <Label className="capitalize">{key}</Label>
                      <Input
                        value={s.social[key] || ''}
                        onChange={(e) => s.set('social', { ...s.social, [key]: e.target.value })}
                        placeholder={`https://${key}.com/...`}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="design" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Theme</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Accent color</Label>
                  <div className="flex flex-wrap gap-2">
                    {['#2563eb', '#0891b2', '#0d9488', '#10b981', '#f59e0b', '#ef4444', '#e11d48', '#7c3aed', '#0a0a0a'].map((c) => (
                      <button
                        key={c}
                        onClick={() => s.set('theme', { ...s.theme, accentColor: c })}
                        className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${s.theme.accentColor === c ? 'border-foreground' : 'border-transparent'}`}
                        style={{ background: c }}
                        aria-label={`Accent ${c}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Template</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {['minimal', 'bold', 'elegant', 'corporate', 'dark', 'retail'].map((t) => (
                      <button
                        key={t}
                        onClick={() => s.set('template', t as typeof s.template)}
                        className={`rounded-lg border p-3 text-xs font-medium capitalize transition-colors ${s.template === t ? 'border-brand bg-brand-muted text-brand' : 'hover:bg-accent'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>

        <div className="lg:sticky lg:top-24">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Live preview</p>
          <WizardPhonePreview />
        </div>
      </Tabs>
    </div>
  );
}
