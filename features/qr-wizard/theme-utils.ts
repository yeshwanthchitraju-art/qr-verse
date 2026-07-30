import type { TemplateId, ThemeConfig } from '@/types';
import type { TemplateMeta } from '@/constants';

interface ThemeStyle {
  root: React.CSSProperties;
  cover: React.CSSProperties;
  title: React.CSSProperties;
  muted: React.CSSProperties;
  accent: React.CSSProperties;
  surface: React.CSSProperties;
  primaryButton: React.CSSProperties;
  secondaryButton: React.CSSProperties;
}

export function formatThemeStyle(theme: ThemeConfig, template: TemplateMeta): ThemeStyle {
  const accent = theme.accentColor || template.accent;
  const bg = theme.background || template.background;
  const surface = theme.surface || template.surface;
  const text = theme.text || '#0a0a0a';
  const muted = theme.mutedText || '#6b7280';
  const radius = `${theme.radius ?? 12}px`;
  const fontFamily = theme.fontFamily || 'var(--font-inter)';

  const buttonBase: React.CSSProperties = {
    borderRadius: radius,
    fontFamily,
  };

  const primaryBg = theme.buttonStyle === 'solid' ? accent
    : theme.buttonStyle === 'soft' ? `${accent}1a`
    : theme.buttonStyle === 'glass' ? `${accent}33`
    : 'transparent';

  const primaryColor = theme.buttonStyle === 'solid' ? '#fff'
    : theme.buttonStyle === 'outline' ? accent
    : text;

  const primaryButton: React.CSSProperties = {
    ...buttonBase,
    background: primaryBg,
    color: primaryColor,
    border: theme.buttonStyle === 'outline' ? `1px solid ${accent}` : '1px solid transparent',
    backdropFilter: theme.buttonStyle === 'glass' ? 'blur(8px)' : undefined,
  };

  const secondaryButton: React.CSSProperties = {
    ...buttonBase,
    background: `${text}08`,
    color: text,
    border: '1px solid transparent',
  };

  return {
    root: { background: bg, color: text, fontFamily },
    cover: { background: `linear-gradient(135deg, ${accent}, ${accent}99)` },
    title: { color: text },
    muted: { color: muted },
    accent: { color: accent },
    surface: { background: `${text}06`, borderRadius: radius },
    primaryButton,
    secondaryButton,
  };
}
