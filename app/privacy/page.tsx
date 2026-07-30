import type { Metadata } from 'next';
import { MarketingNav } from '@/components/marketing/marketing-nav';
import { MarketingFooter } from '@/components/marketing/marketing-footer';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How QRVerse handles your data.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <h1 className="text-4xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        <div className="prose prose-neutral mt-8 max-w-none text-muted-foreground">
          <p>QRVerse collects minimal data needed to operate the service: your account email, the QR codes and landing pages you create, and aggregated scan analytics (device type, browser, approximate location, referrer).</p>
          <h2 className="text-foreground">What we collect</h2>
          <ul>
            <li>Account information: email and display name.</li>
            <li>Content you create: business info, landing page content, QR styling.</li>
            <li>Analytics: anonymous scan events with hashed IPs (we do not store raw IP addresses).</li>
          </ul>
          <h2 className="text-foreground">How we use it</h2>
          <p>To provide the service, show you analytics, and improve the product. We never sell your data.</p>
          <h2 className="text-foreground">Your rights</h2>
          <p>You can export or delete your data at any time from your dashboard.</p>
        </div>
      </section>
      <MarketingFooter />
    </div>
  );
}
