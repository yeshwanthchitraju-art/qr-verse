import type { TemplateId } from '@/types';

export const APP_NAME = 'QRVerse';
export const APP_TAGLINE = 'Dynamic QR codes for modern businesses';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://qrverse.app';
export const APP_DESCRIPTION =
  'QRVerse is the all-in-one platform to create dynamic QR codes, beautiful business landing pages, and track scan analytics in real time.';

export const NAV_LINKS = [
  { label: 'Features', href: '/features' },
  { label: 'Templates', href: '/templates' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
] as const;

export const DASHBOARD_NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'My QR Codes', href: '/dashboard/qr', icon: 'QrCode' },
  { label: 'Landing Pages', href: '/dashboard/pages', icon: 'FileText' },
  { label: 'Analytics', href: '/dashboard/analytics', icon: 'BarChart3' },
  { label: 'Media', href: '/dashboard/media', icon: 'Image' },
  { label: 'Brand Kit', href: '/dashboard/brand', icon: 'Palette' },
] as const;

export const DASHBOARD_SECONDARY = [
  { label: 'Settings', href: '/dashboard/settings', icon: 'Settings' },
  { label: 'Account', href: '/dashboard/account', icon: 'User' },
] as const;

export const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram', icon: 'Instagram' },
  { key: 'facebook', label: 'Facebook', icon: 'Facebook' },
  { key: 'tiktok', label: 'TikTok', icon: 'Music' },
  { key: 'youtube', label: 'YouTube', icon: 'Youtube' },
  { key: 'linkedin', label: 'LinkedIn', icon: 'Linkedin' },
  { key: 'twitter', label: 'Twitter / X', icon: 'Twitter' },
  { key: 'telegram', label: 'Telegram', icon: 'Send' },
  { key: 'discord', label: 'Discord', icon: 'MessageCircle' },
  { key: 'pinterest', label: 'Pinterest', icon: 'Image' },
  { key: 'snapchat', label: 'Snapchat', icon: 'Ghost' },
] as const;

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
  category: string;
  accent: string;
  surface: string;
  background: string;
  preview: { primary: string; secondary: string };
}

export const TEMPLATES: TemplateMeta[] = [
  { id: 'minimal', name: 'Minimal', description: 'Clean, airy, lots of whitespace.', category: 'Business', accent: '#0a0a0a', surface: '#ffffff', background: '#fafafa', preview: { primary: '#0a0a0a', secondary: '#fafafa' } },
  { id: 'luxury', name: 'Luxury', description: 'Gold accents on deep charcoal.', category: 'Premium', accent: '#c8a86a', surface: '#16161a', background: '#0b0b0f', preview: { primary: '#c8a86a', secondary: '#0b0b0f' } },
  { id: 'restaurant', name: 'Restaurant', description: 'Warm tones for menus & reservations.', category: 'Food', accent: '#b45309', surface: '#fffaf3', background: '#fff7ed', preview: { primary: '#b45309', secondary: '#fff7ed' } },
  { id: 'cafe', name: 'Cafe', description: 'Cozy cream and espresso palette.', category: 'Food', accent: '#7c4a32', surface: '#fbf6ee', background: '#f5ecdf', preview: { primary: '#7c4a32', secondary: '#f5ecdf' } },
  { id: 'salon', name: 'Salon', description: 'Soft rose and blush neutrals.', category: 'Beauty', accent: '#be185d', surface: '#fff5f7', background: '#fdf2f5', preview: { primary: '#be185d', secondary: '#fdf2f5' } },
  { id: 'medical', name: 'Medical', description: 'Calm teal clinical feel.', category: 'Health', accent: '#0d9488', surface: '#f4fbfb', background: '#ecfdf5', preview: { primary: '#0d9488', secondary: '#ecfdf5' } },
  { id: 'gym', name: 'Gym', description: 'High-energy lime on black.', category: 'Fitness', accent: '#84cc16', surface: '#18181b', background: '#09090b', preview: { primary: '#84cc16', secondary: '#09090b' } },
  { id: 'portfolio', name: 'Portfolio', description: 'Editorial grid for creatives.', category: 'Creative', accent: '#0ea5e9', surface: '#ffffff', background: '#f8fafc', preview: { primary: '#0ea5e9', secondary: '#f8fafc' } },
  { id: 'event', name: 'Event', description: 'Bold gradient for event details.', category: 'Marketing', accent: '#0891b2', surface: '#0f172a', background: '#020617', preview: { primary: '#0891b2', secondary: '#020617' } },
  { id: 'retail', name: 'Retail', description: 'Crisp commerce with sale accents.', category: 'Commerce', accent: '#2563eb', surface: '#ffffff', background: '#f1f5f9', preview: { primary: '#2563eb', secondary: '#f1f5f9' } },
  { id: 'corporate', name: 'Corporate', description: 'Trustworthy navy + steel.', category: 'Business', accent: '#1e3a8a', surface: '#ffffff', background: '#f5f7fa', preview: { primary: '#1e3a8a', secondary: '#f5f7fa' } },
  { id: 'dark', name: 'Dark', description: 'Sleek dark mode default.', category: 'Business', accent: '#3b82f6', surface: '#0f172a', background: '#020617', preview: { primary: '#3b82f6', secondary: '#020617' } },
];

export const ACCENT_PRESETS = [
  '#0a0a0a', '#2563eb', '#1d4ed8', '#0ea5e9', '#0891b2',
  '#0d9488', '#10b981', '#84cc16', '#eab308', '#f59e0b',
  '#f97316', '#ef4444', '#e11d48', '#be185d', '#7c3aed',
];

export const FONT_PRESETS = [
  { label: 'Inter', value: 'var(--font-inter)' },
  { label: 'Display Serif', value: 'var(--font-display)' },
  { label: 'Mono', value: 'var(--font-mono)' },
];

export const BUSINESS_CATEGORIES = [
  'Restaurant', 'Cafe', 'Retail', 'Salon', 'Spa', 'Gym', 'Hotel',
  'Medical', 'Real Estate', 'Education', 'Portfolio', 'Event',
  'Corporate', 'Startup', 'Other',
];

export const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];

export interface PlanTier {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlight: boolean;
  disabled?: boolean;
}

export const PLAN_TIERS: PlanTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Everything you need to launch.',
    features: [
      'Unlimited landing pages',
      'Unlimited dynamic QR codes',
      'Unlimited edits & templates',
      'Real-time scan analytics',
      'Custom QR styling',
      'qrverse.app/q/your-slug',
    ],
    cta: 'Get started free',
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    period: 'month',
    description: 'For growing brands & teams.',
    features: [
      'Everything in Free',
      'Custom domain support',
      'Remove QRVerse branding',
      'Advanced analytics & export',
      'Password-protected pages',
      'Scheduled redirects',
      'Priority support',
    ],
    cta: 'Coming soon',
    highlight: true,
    disabled: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 49,
    period: 'month',
    description: 'For agencies & multi-location.',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Brand kit & asset library',
      'Bulk QR operations',
      'Webhooks & API access',
      'Dedicated manager',
    ],
    cta: 'Coming soon',
    highlight: false,
    disabled: true,
  },
];
