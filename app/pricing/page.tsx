import type { Metadata } from 'next';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { MarketingNav } from '@/components/marketing/marketing-nav';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { Button } from '@/components/ui/button';
import { PLAN_TIERS } from '@/constants';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Free forever to start. Pro and Business plans coming soon.',
  alternates: { canonical: '/pricing' },
};

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Pricing</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free forever. Upgrade when you need more.
          </p>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {PLAN_TIERS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border bg-card p-7 ${plan.highlight ? 'border-brand shadow-xl shadow-brand/10' : ''}`}
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
      </section>
      <MarketingFooter />
    </div>
  );
}
