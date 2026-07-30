import type { Metadata } from 'next';
import { MarketingNav } from '@/components/marketing/marketing-nav';
import { MarketingFooter } from '@/components/marketing/marketing-footer';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that govern your use of QRVerse.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <h1 className="text-4xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        <div className="prose prose-neutral mt-8 max-w-none text-muted-foreground">
          <p>By using QRVerse, you agree to these terms. You are responsible for the content you publish and for ensuring you have the rights to any logos or images you upload.</p>
          <h2 className="text-foreground">Acceptable use</h2>
          <ul>
            <li>Don't use QRVerse for illegal or fraudulent purposes.</li>
            <li>Don't create QR codes that point to malicious or deceptive destinations.</li>
            <li>Don't attempt to abuse or overload the service.</li>
          </ul>
          <h2 className="text-foreground">Service availability</h2>
          <p>We work hard to keep QRVerse fast and reliable, but do not guarantee uninterrupted service. You are responsible for keeping backups of important content.</p>
        </div>
      </section>
      <MarketingFooter />
    </div>
  );
}
