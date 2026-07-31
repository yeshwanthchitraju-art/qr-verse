import type { Metadata } from 'next';
import { MarketingNav } from '@/components/marketing/marketing-nav';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { TEMPLATES } from '@/constants';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Templates',
  description: 'Premium, customizable landing page templates for every industry.',
  alternates: { canonical: '/templates' },
};

export default function TemplatesPage() {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Templates</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Start from a hand-crafted design. Customize colors, fonts, and layout in seconds.
          </p>
        </div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => (
            <div
              key={t.id}
              id={t.id}
              className="group overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-lg"
            >
              <div className="flex h-40 items-center justify-center p-8" style={{ background: t.preview.secondary }}>
                <div className="h-20 w-20 rounded-2xl shadow-lg" style={{ background: t.preview.primary }} />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">{t.name}</h3>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">{t.category}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>
                <Button asChild variant="ghost" size="sm" className="mt-4 -ml-3">
                  <Link href={`/dashboard/qr/new?template=${t.id}`}>Use this template <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <MarketingFooter />
    </div>
  );
}
