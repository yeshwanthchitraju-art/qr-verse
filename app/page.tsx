import Link from 'next/link';
import { Metadata } from 'next';
import {
  ArrowRight, Sparkles, Check, Star, Quote, ChevronDown,
} from 'lucide-react';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { MarketingNav } from '@/components/marketing/marketing-nav';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { FeatureGrid } from '@/components/marketing/feature-grid';
import { HeroDemo } from '@/components/marketing/hero-demo';
import { AnalyticsPreview } from '@/components/marketing/analytics-preview';
import { GuestCtaButton } from '@/components/marketing/guest-cta-button';
import { TEMPLATES, PLAN_TIERS, APP_NAME } from '@/constants';

export const metadata: Metadata = {
  title: 'QRVerse — Dynamic QR Codes & Business Landing Pages',
  description:
    'Create beautiful landing pages, generate dynamic QR codes you can edit anytime, and track real-time scan analytics. Free to start.',
  alternates: { canonical: '/' },
};

const steps = [
  { n: '01', title: 'Add your business', body: 'Logo, contact details, social links, services — all in one guided form.' },
  { n: '02', title: 'Pick a template', body: 'Choose from 12+ premium designs and customize colors, fonts, and layout.' },
  { n: '03', title: 'Generate your QR', body: 'Style it with gradients, rounded dots, and your logo. Download in seconds.' },
  { n: '04', title: 'Track everything', body: 'Watch scans, views, and clicks roll in. Update the destination anytime.' },
];

const testimonials = [
  { name: 'Maya Rodriguez', role: 'Owner, Bloom & Co.', quote: 'We reprinted menus once. Now our QR points to a live page we update weekly. Game changer.', rating: 5 },
  { name: 'James Liu', role: 'Marketing Lead, Northwind', quote: 'The analytics alone are worth it. We finally know which locations actually get scanned.', rating: 5 },
  { name: 'Sofia Andersson', role: 'Founder, Atelier Studio', quote: 'Clients love how the landing page looks. It feels custom-built, not a generic QR tool.', rating: 5 },
];

const faqs = [
  { q: 'What is a dynamic QR code?', a: 'A dynamic QR encodes a short link (like qrverse.app/r/abc123) instead of your final destination. Because the redirect is handled server-side, you can change where it points anytime — without reprinting the QR.' },
  { q: 'Is QRVerse really free?', a: 'Yes. The Free plan includes unlimited landing pages, unlimited QR codes, unlimited edits, all templates, and real-time analytics. Paid tiers (Pro, Business) are coming soon for custom domains and teams.' },
  { q: 'Do I need to install anything?', a: 'No. QRVerse runs in your browser. You design landing pages, generate QR codes, and view analytics — all on the web. Scanned pages work on any phone with a camera.' },
  { q: 'Can I use my own domain?', a: 'Custom domains are part of the upcoming Pro plan. Today every landing page lives at qrverse.app/q/your-slug, which is great for getting started.' },
  { q: 'What happens if I edit my landing page?', a: 'Your printed QR keeps working. Scans will always show the latest version of your landing page — no reprint needed.' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" aria-hidden />
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-20 sm:px-6 sm:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              Dynamic QR codes, reimagined
            </div>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
              The QR platform that{' '}
              <span className="brand-gradient bg-clip-text text-transparent">never gets stale</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
              Create beautiful business landing pages, generate dynamic QR codes you can edit anytime,
              and track every scan in real time. No reprinting. No code.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <GuestCtaButton label="Start free" />
              <GuestCtaButton label="View templates" variant="outline" />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Free forever · No credit card · Unlimited QR codes
            </p>
          </div>

          <HeroDemo />
        </div>
      </section>

      {/* Logos / social proof strip */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Trusted by modern businesses
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-60">
            {['BLOOM & CO.', 'Northwind', 'Atelier', 'Lumen', 'Meridian', 'Forge Gym'].map((b) => (
              <span key={b} className="text-sm font-semibold tracking-tight">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-brand">Everything in one place</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            More than a QR generator
          </h2>
          <p className="mt-4 text-muted-foreground">
            QRVerse combines dynamic QR codes, landing pages, and analytics into a single,
            beautifully designed workflow.
          </p>
        </div>
        <div className="mt-12">
          <FeatureGrid />
        </div>
      </section>

      {/* How it works */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-brand">How it works</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              From zero to live in minutes
            </h2>
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="relative">
                <span className="text-sm font-mono font-semibold text-brand">{s.n}</span>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="flex items-end justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-brand">Templates</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Start from a premium design
            </h2>
            <p className="mt-4 text-muted-foreground">
              Hand-crafted templates for every industry. Customize colors, fonts, and layout in seconds.
            </p>
          </div>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/templates">Browse all <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TEMPLATES.slice(0, 8).map((t) => (
            <Link
              key={t.id}
              href={`/templates#${t.id}`}
              className="group overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-lg hover:shadow-foreground/5"
            >
              <div
                className="flex h-32 items-center justify-center p-6"
                style={{ background: t.preview.secondary }}
              >
                <div
                  className="h-16 w-16 rounded-xl"
                  style={{ background: t.preview.primary }}
                />
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t.category}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Analytics preview */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-brand">Analytics</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Know exactly what's working
            </h2>
            <p className="mt-4 text-muted-foreground">
              Real-time scans, button clicks, devices, and locations — all in a clean, fast dashboard.
            </p>
          </div>
          <div className="mt-12">
            <AnalyticsPreview />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-brand">Loved by businesses</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            What our customers say
          </h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-2xl border bg-card p-6">
              <Quote className="h-6 w-6 text-brand" />
              <p className="mt-4 text-sm leading-relaxed">"{t.quote}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-muted text-sm font-semibold text-brand">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
                <div className="ml-auto flex">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-brand">Pricing</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Simple, honest pricing
            </h2>
            <p className="mt-4 text-muted-foreground">
              Start free forever. Upgrade later when you need more.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {PLAN_TIERS.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl border bg-card p-7 ${
                  plan.highlight ? 'border-brand shadow-xl shadow-brand/10' : ''
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-7 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-brand-foreground">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight">${plan.price}</span>
                  <span className="text-sm text-muted-foreground">/{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild={!plan.disabled}
                  disabled={plan.disabled}
                  className={`mt-7 w-full ${plan.highlight ? 'bg-brand text-brand-foreground hover:bg-brand/90' : ''}`}
                  variant={plan.highlight ? 'default' : 'outline'}
                >
                  {plan.disabled ? <span>{plan.cta}</span> : <Link href="/signup">{plan.cta}</Link>}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold text-brand">FAQ</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Questions, answered
          </h2>
        </div>
        <Accordion type="single" collapsible className="mt-10">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border bg-foreground px-6 py-16 text-center text-background sm:px-16 sm:py-24">
          <div className="absolute inset-0 -z-10 opacity-20 brand-gradient" aria-hidden />
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Ship your first dynamic QR today
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-background/70">
            Free forever. No credit card. Unlimited landing pages and QR codes.
          </p>
          <Button size="lg" className="mt-8 h-12 px-6 bg-background text-foreground hover:bg-background/90" onClick={undefined}>
            <GuestCtaButton label="Get started free" />
          </Button>
        </div>
      </section>

      <MarketingFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
      />
    </div>
  );
}
