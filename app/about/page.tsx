import type { Metadata } from 'next';
import { MarketingNav } from '@/components/marketing/marketing-nav';
import { MarketingFooter } from '@/components/marketing/marketing-footer';

export const metadata: Metadata = {
  title: 'About',
  description: 'QRVerse is building the best dynamic QR platform for modern businesses.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">About QRVerse</h1>
        <div className="prose prose-neutral mt-8 max-w-none text-muted-foreground">
          <p>
            QRVerse was built on a simple idea: QR codes shouldn't be static. A business changes —
            its menu, its hours, its promotions — and the QR pointing to it should change too,
            without reprinting.
          </p>
          <p>
            We combine dynamic QR codes, beautiful landing pages, and real-time analytics into a
            single, fast workflow. Whether you run a cafe, a salon, or a multi-location brand,
            QRVerse gives you a premium presence your customers can scan in seconds.
          </p>
          <h2 className="text-foreground">Our principles</h2>
          <ul>
            <li><strong>Fast by default.</strong> Every page is optimized for the phone in your customer's hand.</li>
            <li><strong>Editable forever.</strong> Your printed QR keeps working. Change the destination anytime.</li>
            <li><strong>Privacy-respecting.</strong> We collect only what's needed to show you useful analytics.</li>
            <li><strong>Free to start.</strong> The Free plan is genuinely useful, not a trial.</li>
          </ul>
        </div>
      </section>
      <MarketingFooter />
    </div>
  );
}
