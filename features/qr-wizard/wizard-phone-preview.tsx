'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Phone, Globe, Mail, MapPin, MessageCircle, Clock, Star,
  Instagram, Facebook, Youtube, Linkedin, Twitter, Send,
} from 'lucide-react';
import { useWizardStore } from '@/features/qr-wizard/wizard-store';
import { TEMPLATES } from '@/constants';
import { formatThemeStyle } from '@/features/qr-wizard/theme-utils';

type IconType = React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

const socialIcons: Record<string, IconType> = {
  instagram: Instagram, facebook: Facebook, youtube: Youtube,
  linkedin: Linkedin, twitter: Twitter, telegram: Send,
};

export function WizardPhonePreview() {
  const s = useWizardStore();

  const template = useMemo(
    () => TEMPLATES.find((t) => t.id === s.template) ?? TEMPLATES[0],
    [s.template]
  );

  const style = useMemo(() => formatThemeStyle(s.theme, template), [s.theme, template]);

  const activeSocials = Object.entries(s.social).filter(([, v]) => v);

  return (
    <div className="sticky top-24">
      <div className="mx-auto w-[280px]">
        <div className="rounded-[2.2rem] border-[10px] border-foreground/90 bg-foreground shadow-2xl">
          <div className="relative h-[560px] overflow-hidden rounded-[1.4rem] bg-background">
            {/* notch */}
            <div className="absolute left-1/2 top-0 z-20 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-foreground" />

            <div className="h-full overflow-y-auto pb-6" style={style.root}>
              {/* cover / logo */}
              <div className="relative h-28 w-full" style={style.cover}>
                <div
                  className="absolute -bottom-7 left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center overflow-hidden rounded-2xl border-4 border-background bg-background shadow"
                >
                  {s.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.logoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold" style={{ color: style.accent.color }}>
                      {(s.businessName || '?').charAt(0)}
                    </span>
                  )}
                </div>
              </div>

              <div className="px-5 pt-10 text-center">
                <h3 className="text-base font-semibold" style={style.title}>
                  {s.businessName || 'Your business'}
                </h3>
                {s.category && (
                  <p className="mt-0.5 text-[11px] uppercase tracking-wide" style={style.muted}>
                    {s.category}
                  </p>
                )}
                {s.description && (
                  <p className="mt-2 text-xs leading-relaxed" style={style.muted}>
                    {s.description.length > 90 ? s.description.slice(0, 90) + '…' : s.description}
                  </p>
                )}
              </div>

              {/* action buttons */}
              <div className="mt-4 space-y-2 px-5">
                {[
                  { label: 'Call', value: s.phone, icon: Phone },
                  { label: 'WhatsApp', value: s.whatsapp, icon: MessageCircle },
                  { label: 'Email', value: s.email, icon: Mail },
                  { label: 'Website', value: s.website, icon: Globe },
                  { label: 'Directions', value: s.address, icon: MapPin },
                ]
                  .filter((b) => b.value)
                  .slice(0, 4)
                  .map((b, i) => (
                    <motion.div
                      key={b.label}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-medium"
                      style={i === 0 ? style.primaryButton : style.secondaryButton}
                    >
                      <b.icon className="h-3.5 w-3.5" /> {b.label}
                    </motion.div>
                  ))}

                {s.ctaButtons.slice(0, 2).map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-medium"
                    style={b.variant === 'primary' ? style.primaryButton : style.secondaryButton}
                  >
                    {b.label}
                  </div>
                ))}
              </div>

              {/* services */}
              {s.services.length > 0 && (
                <Section title="Services" style={style}>
                  {s.services.slice(0, 3).map((sv) => (
                    <div key={sv.id} className="flex items-center justify-between rounded-lg p-2 text-xs" style={style.surface}>
                      <span style={style.title}>{sv.name}</span>
                      {sv.price && <span style={style.accent}>{sv.price}</span>}
                    </div>
                  ))}
                </Section>
              )}

              {/* gallery */}
              {s.gallery.length > 0 && (
                <Section title="Gallery" style={style}>
                  <div className="grid grid-cols-3 gap-1.5">
                    {s.gallery.slice(0, 6).map((g) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={g.id} src={g.url} alt={g.caption || ''} className="aspect-square w-full rounded-lg object-cover" />
                    ))}
                  </div>
                </Section>
              )}

              {/* hours */}
              {s.hours.some((h) => !h.closed) && (
                <Section title="Hours" style={style}>
                  <div className="space-y-1 text-[11px]" style={style.muted}>
                    {s.hours.slice(0, 3).map((h) => (
                      <div key={h.day} className="flex justify-between">
                        <span>{h.day.slice(0, 3)}</span>
                        <span>{h.closed ? 'Closed' : `${h.open}–${h.close}`}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* socials */}
              {activeSocials.length > 0 && (
                <Section title="Follow" style={style}>
                  <div className="flex justify-center gap-2">
                    {activeSocials.slice(0, 6).map(([key]) => {
                      const Icon = socialIcons[key] ?? Star;
                      return (
                        <div key={key} className="flex h-8 w-8 items-center justify-center rounded-full" style={style.surface}>
                          <Icon className="h-4 w-4" style={style.accent} />
                        </div>
                      );
                    })}
                  </div>
                </Section>
              )}

              <div className="mt-6 px-5 text-center">
                <p className="text-[10px]" style={style.muted}>Powered by QRVerse</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title, children, style,
}: {
  title: string;
  children: React.ReactNode;
  style: ReturnType<typeof formatThemeStyle>;
}) {
  return (
    <div className="mt-6 px-5">
      <p className="mb-2 text-xs font-semibold" style={style.title}>{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}
