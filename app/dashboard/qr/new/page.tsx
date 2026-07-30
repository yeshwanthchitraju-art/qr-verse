'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/providers/auth-provider';
import { addGuestQr, addGuestLanding } from '@/lib/guest-history';
import { useWizardStore } from '@/features/qr-wizard/wizard-store';
import { StepBusiness } from '@/features/qr-wizard/step-business';
import { StepSocial } from '@/features/qr-wizard/step-social';
import { StepLanding } from '@/features/qr-wizard/step-landing';
import { StepQr } from '@/features/qr-wizard/step-qr';
import { WizardPhonePreview } from '@/features/qr-wizard/wizard-phone-preview';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader as Loader2, Check } from 'lucide-react';
import { generateShortId, generateSlug } from '@/utils';
import { toast } from 'sonner';

const steps = [
  { n: 1, label: 'Business', description: 'Who you are' },
  { n: 2, label: 'Social & links', description: 'Connect everything' },
  { n: 3, label: 'Landing page', description: 'Design the page' },
  { n: 4, label: 'QR code', description: 'Style & generate' },
];

export default function NewQrPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const { user, isGuest } = useAuth();
  const s = useWizardStore();

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user && !isGuest) throw new Error('Sign in or continue as guest to save');
      if (!s.businessName.trim()) throw new Error('Business name is required');
      if (!s.qrName.trim()) throw new Error('QR name is required');

      const shortId = generateShortId();
      const slug = generateSlug(s.businessName);

      if (isGuest) {
        const qrId = crypto.randomUUID();
        addGuestLanding({
          id: qrId,
          slug,
          business_name: s.businessName,
          description: s.description || null,
          logo_url: s.logoUrl || null,
          template: s.template,
          created_at: new Date().toISOString(),
        });
        addGuestQr({
          id: qrId,
          name: s.qrName,
          short_id: shortId,
          folder: s.folder || 'Default',
          destination_type: s.destinationType,
          destination_url: s.destinationType === 'url' ? s.destinationUrl : null,
          styling: s.styling as unknown as Record<string, unknown>,
          is_favorite: false,
          is_archived: false,
          scans_count: 0,
          views_count: 0,
          created_at: new Date().toISOString(),
          landing: { slug, business_name: s.businessName, logo_url: s.logoUrl || null },
        });
        return { shortId, slug };
      }

      const { data: landing, error: lpError } = await supabase
        .from('landing_pages')
        .insert({
          slug,
          template: s.template,
          business_name: s.businessName,
          description: s.description || null,
          logo_url: s.logoUrl || null,
          category: s.category,
          website: s.website || null,
          phone: s.phone || null,
          email: s.email || null,
          whatsapp: s.whatsapp || null,
          address: s.address || null,
          hours: s.hours,
          social: s.social,
          custom_links: s.customLinks,
          services: s.services,
          products: s.products,
          gallery: s.gallery,
          testimonials: s.testimonials,
          cta_buttons: s.ctaButtons,
          theme_config: s.theme,
        })
        .select()
        .single();
      if (lpError) throw lpError;

      const { error: qrError } = await supabase.from('qr_codes').insert({
        landing_page_id: landing.id,
        short_id: shortId,
        name: s.qrName,
        folder: s.folder || 'Default',
        destination_type: s.destinationType,
        destination_url: s.destinationType === 'url' ? s.destinationUrl : null,
        styling: s.styling,
      });
      if (qrError) throw qrError;

      return { shortId, slug };
    },
    onSuccess: () => {
      toast.success('QR code created');
      s.reset();
      router.push('/dashboard/qr');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function next() {
    if (step === 1 && !s.businessName.trim()) {
      toast.error('Business name is required');
      return;
    }
    if (step < 4) setStep(step + 1);
    else saveMutation.mutate();
  }
  function back() {
    if (step > 1) setStep(step - 1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Create a QR code</h2>
        <p className="text-sm text-muted-foreground">Build a landing page and generate a dynamic QR in four steps.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1 overflow-x-auto rounded-xl border bg-card p-1.5">
        {steps.map((st, i) => (
          <div key={st.n} className="flex items-center">
            <button
              onClick={() => st.n < step && setStep(st.n)}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                step === st.n ? 'bg-foreground text-background' : st.n < step ? 'text-foreground hover:bg-accent' : 'text-muted-foreground'
              }`}
              disabled={st.n > step}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold ${
                step === st.n ? 'bg-background text-foreground' : st.n < step ? 'bg-brand text-brand-foreground' : 'bg-muted'
              }`}>
                {st.n < step ? <Check className="h-3 w-3" /> : st.n}
              </span>
              <span className="hidden font-medium sm:inline">{st.label}</span>
            </button>
            {i < steps.length - 1 && <div className="mx-1 h-px w-4 bg-border sm:w-8" />}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border bg-card p-6">
          {step === 1 && <StepBusiness />}
          {step === 2 && <StepSocial />}
          {step === 3 && <StepLanding />}
          {step === 4 && <StepQr />}

          <div className="mt-8 flex items-center justify-between border-t pt-6">
            <Button variant="ghost" onClick={back} disabled={step === 1}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              onClick={next}
              disabled={saveMutation.isPending}
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {saveMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : step === 4 ? (
                <>Create QR <Check className="ml-2 h-4 w-4" /></>
              ) : (
                <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </div>
        </div>

        <WizardPhonePreview />
      </div>
    </div>
  );
}
