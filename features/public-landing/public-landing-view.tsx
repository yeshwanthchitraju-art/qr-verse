'use client';

import { useMemo } from 'react';
import {
  Phone, Globe, Mail, MapPin, MessageCircle, Clock, Star,
  Instagram, Facebook, Music, Youtube, Linkedin, Twitter,
  Send, Image as ImageIcon, Ghost,
} from 'lucide-react';
import type { LandingPageRow } from '@/types';
import { TEMPLATES } from '@/constants';
import { formatThemeStyle } from '@/features/qr-wizard/theme-utils';

type IconType = React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

const socialIcons: Record<string, IconType> = {
  instagram: Instagram, facebook: Facebook, tiktok: Music, youtube: Youtube,
  linkedin: Linkedin, twitter: Twitter, telegram: Send, discord: MessageCircle,
  pinterest: ImageIcon, snapchat: Ghost,
};

function buildTheme(page: LandingPageRow) {
  const template = TEMPLATES.find((t) => t.id === page.template) ?? TEMPLATES[0];
  const theme = {
    accentColor: page.theme_config?.accentColor || template.accent,
    background: page.theme_config?.background || template.background,
    surface: page.theme_config?.surface || template.surface,
    text: page.theme_config?.text || '#0a0a0a',
    mutedText: page.theme_config?.mutedText || '#6b7280',
    fontFamily: page.theme_config?.fontFamily || 'var(--font-inter)',
    radius: page.theme_config?.radius ?? 16,
    buttonStyle: page.theme_config?.buttonStyle || 'solid',
    animation: page.theme_config?.animation ?? true,
  };
  return { template, theme, style: formatThemeStyle(theme, template) };
}

export function PublicLandingView({ page }: { page: LandingPageRow }) {
  const { style, theme } = useMemo(() => buildTheme(page), [page]);
  const activeSocials = Object.entries(page.social || {}).filter(([, v]) => v);
  const openHours = (page.hours || []).filter((h) => !h.closed);

  const actionButtons: Array<{ label: string; href: string | null; icon: IconType }> = [
    { label: 'Call', href: page.phone ? `tel:${page.phone}` : null, icon: Phone },
    { label: 'WhatsApp', href: page.whatsapp ? `https://wa.me/${page.whatsapp.replace(/[^0-9]/g, '')}` : null, icon: MessageCircle },
    { label: 'Email', href: page.email ? `mailto:${page.email}` : null, icon: Mail },
    { label: 'Website', href: page.website || null, icon: Globe },
    { label: 'Directions', href: page.address ? `https://maps.google.com/?q=${encodeURIComponent(page.address)}` : null, icon: MapPin },
  ].filter((b) => b.href);

  return (
    <div style={style.root} className="min-h-screen w-full">
      <div className="mx-auto max-w-md px-5 pb-16">
        {/* Cover */}
        <div className="relative h-32 w-full rounded-b-3xl" style={style.cover}>
          <div className="absolute -bottom-8 left-1/2 flex h-20 w-20 -translate-x-1/2 items-center justify-center overflow-hidden rounded-2xl border-4 border-background bg-background shadow-lg">
            {page.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={page.logo_url} alt={page.business_name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl font-bold" style={{ color: style.accent.color }}>
                {page.business_name.charAt(0)}
              </span>
            )}
          </div>
        </div>

        {/* Header */}
        <header className="pt-12 text-center">
          <h1 className="text-xl font-semibold tracking-tight" style={style.title}>{page.business_name}</h1>
          {page.category && (
            <p className="mt-1 text-xs uppercase tracking-widest" style={style.muted}>{page.category}</p>
          )}
          {page.description && (
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed" style={style.muted}>{page.description}</p>
          )}
        </header>

        {/* Action buttons */}
        {actionButtons.length > 0 && (
          <section className="mt-6 space-y-2.5">
            {actionButtons.map((b, i) => (
              <a
                key={b.label}
                href={b.href!}
                target={b.label === 'Website' || b.label === 'Directions' ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 py-3.5 text-sm font-semibold transition-transform active:scale-95"
                style={i === 0 ? style.primaryButton : style.secondaryButton}
              >
                <b.icon className="h-4 w-4" /> {b.label}
              </a>
            ))}

            {(page.cta_buttons || []).map((b) => (
              <a
                key={b.id}
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 py-3.5 text-sm font-semibold transition-transform active:scale-95"
                style={b.variant === 'primary' ? style.primaryButton : style.secondaryButton}
              >
                {b.label}
              </a>
            ))}

            {(page.custom_links || []).map((l) => (
              <a
                key={l.id}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 py-3.5 text-sm font-semibold transition-transform active:scale-95"
                style={style.secondaryButton}
              >
                {l.label}
              </a>
            ))}
          </section>
        )}

        {/* Services */}
        {(page.services || []).length > 0 && (
          <Section title="Services" style={style}>
            <div className="space-y-2">
              {page.services.map((sv) => (
                <div key={sv.id} className="flex items-center justify-between rounded-xl p-3.5" style={style.surface}>
                  <div>
                    <p className="text-sm font-medium" style={style.title}>{sv.name}</p>
                    {sv.description && <p className="mt-0.5 text-xs" style={style.muted}>{sv.description}</p>}
                  </div>
                  {sv.price && <span className="text-sm font-semibold" style={style.accent}>{sv.price}</span>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Products */}
        {(page.products || []).length > 0 && (
          <Section title="Products" style={style}>
            <div className="space-y-2">
              {page.products.map((p) => (
                <div key={p.id} className="flex gap-3 rounded-xl p-3.5" style={style.surface}>
                  {p.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt={p.name} className="h-14 w-14 rounded-lg object-cover" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={style.title}>{p.name}</p>
                    {p.description && <p className="mt-0.5 text-xs" style={style.muted}>{p.description}</p>}
                    {p.price && <span className="mt-1 block text-sm font-semibold" style={style.accent}>{p.price}</span>}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Gallery */}
        {(page.gallery || []).length > 0 && (
          <Section title="Gallery" style={style}>
            <div className="grid grid-cols-3 gap-2">
              {page.gallery.map((g) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={g.id} src={g.url} alt={g.caption || ''} className="aspect-square w-full rounded-xl object-cover" />
              ))}
            </div>
          </Section>
        )}

        {/* Testimonials */}
        {(page.testimonials || []).length > 0 && (
          <Section title="Testimonials" style={style}>
            <div className="space-y-3">
              {page.testimonials.map((t) => (
                <div key={t.id} className="rounded-xl p-4" style={style.surface}>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
                    ))}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed" style={style.title}>"{t.content}"</p>
                  <div className="mt-3 flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: theme.accentColor }}>
                      <span className="text-xs font-semibold text-white">{t.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold" style={style.title}>{t.name}</p>
                      {t.role && <p className="text-xs" style={style.muted}>{t.role}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Hours */}
        {openHours.length > 0 && (
          <Section title="Hours" style={style}>
            <div className="space-y-1.5 rounded-xl p-3.5" style={style.surface}>
              {page.hours.map((h) => (
                <div key={h.day} className="flex justify-between text-sm">
                  <span style={style.title}>{h.day}</span>
                  <span style={style.muted}>{h.closed ? 'Closed' : `${h.open} – ${h.close}`}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Address / map */}
        {page.address && (
          <Section title="Location" style={style}>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(page.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl p-3.5 transition-transform active:scale-95"
              style={style.surface}
            >
              <MapPin className="h-5 w-5" style={style.accent} />
              <span className="flex-1 text-sm" style={style.title}>{page.address}</span>
            </a>
          </Section>
        )}

        {/* Social */}
        {activeSocials.length > 0 && (
          <Section title="Follow" style={style}>
            <div className="flex flex-wrap justify-center gap-2.5">
              {activeSocials.map(([key, url]) => {
                const Icon = socialIcons[key] ?? Star;
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-full transition-transform active:scale-90"
                    style={style.surface}
                    aria-label={key}
                  >
                    <Icon className="h-5 w-5" style={style.accent} />
                  </a>
                );
              })}
            </div>
          </Section>
        )}

        {/* Footer */}
        <footer className="mt-10 flex items-center justify-center gap-1.5 text-center">
          <Clock className="h-3 w-3" style={style.muted} />
          <p className="text-xs" style={style.muted}>Powered by QRVerse</p>
        </footer>
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
    <section className="mt-8">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={style.muted}>{title}</h2>
      {children}
    </section>
  );
}
