import type { Metadata } from 'next';
import { MarketingNav } from '@/components/marketing/marketing-nav';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { FeatureGrid } from '@/components/marketing/feature-grid';

export const metadata: Metadata = {
  title: 'Features',
  description: 'Everything QRVerse offers: dynamic QR codes, landing pages, analytics, and more.',
  alternates: { canonical: '/features' },
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Features</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            A complete toolkit for dynamic QR codes, beautiful landing pages, and real-time analytics.
          </p>
        </div>
        <div className="mt-14"><FeatureGrid /></div>
      </section>
      <MarketingFooter />
    </div>
  );
}
