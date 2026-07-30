'use client';

import { useState, type FormEvent } from 'react';
import { Mail, MessageSquare, Loader2, Check } from 'lucide-react';
import { MarketingNav } from '@/components/marketing/marketing-nav';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    setSent(true);
    toast.success('Message sent');
  }

  return (
    <div className="min-h-screen">
      <MarketingNav />
      <section className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Get in touch</h1>
          <p className="mt-4 text-lg text-muted-foreground">Questions, feedback, or partnership ideas? We'd love to hear from you.</p>
        </div>

        <div className="mt-10 rounded-2xl border bg-card p-7">
          {sent ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-muted">
                <Check className="h-6 w-6 text-brand" />
              </div>
              <p className="mt-4 text-base font-semibold">Thanks for reaching out</p>
              <p className="mt-1 text-sm text-muted-foreground">We'll reply within 1-2 business days.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="n">Name</Label>
                  <Input id="n" required placeholder="Jane Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="e">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="e" type="email" required placeholder="you@email.com" className="pl-9" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="m">Message</Label>
                <Textarea id="m" required rows={5} placeholder="How can we help?" />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-brand text-brand-foreground hover:bg-brand/90">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><MessageSquare className="mr-2 h-4 w-4" /> Send message</>}
              </Button>
            </form>
          )}
        </div>
      </section>
      <MarketingFooter />
    </div>
  );
}
