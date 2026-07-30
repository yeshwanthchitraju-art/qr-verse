import { create } from 'zustand';
import type {
  BusinessHours, CtaButton, CustomLink, GalleryImage, Product,
  QrStyling, Service, TemplateId, Testimonial, ThemeConfig,
} from '@/types';
import { DEFAULT_QR_STYLING } from '@/utils/qr';

export interface WizardState {
  // step 1 — business
  logoUrl: string;
  coverUrl: string;
  businessName: string;
  description: string;
  category: string;
  website: string;
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  hours: BusinessHours[];
  // step 2 — social & links
  social: Record<string, string>;
  customLinks: CustomLink[];
  // step 3 — landing
  template: TemplateId;
  theme: ThemeConfig;
  services: Service[];
  products: Product[];
  gallery: GalleryImage[];
  testimonials: Testimonial[];
  ctaButtons: CtaButton[];
  // step 4 — qr
  qrName: string;
  folder: string;
  destinationType: 'landing_page' | 'url';
  destinationUrl: string;
  styling: QrStyling;
}

export const defaultTheme: ThemeConfig = {
  accentColor: '#2563eb',
  background: '#ffffff',
  surface: '#ffffff',
  text: '#0a0a0a',
  mutedText: '#64748b',
  fontFamily: 'var(--font-inter)',
  radius: 16,
  buttonStyle: 'solid',
  animation: true,
};

export const defaultHours = (): BusinessHours[] => [
  { day: 'Monday', open: '09:00', close: '17:00', closed: false },
  { day: 'Tuesday', open: '09:00', close: '17:00', closed: false },
  { day: 'Wednesday', open: '09:00', close: '17:00', closed: false },
  { day: 'Thursday', open: '09:00', close: '17:00', closed: false },
  { day: 'Friday', open: '09:00', close: '17:00', closed: false },
  { day: 'Saturday', open: '10:00', close: '16:00', closed: false },
  { day: 'Sunday', open: '09:00', close: '17:00', closed: true },
];

interface WizardStore extends WizardState {
  set: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
  patch: (partial: Partial<WizardState>) => void;
  reset: () => void;
}

const initialState: WizardState = {
  logoUrl: '',
  coverUrl: '',
  businessName: '',
  description: '',
  category: 'Restaurant',
  website: '',
  phone: '',
  email: '',
  whatsapp: '',
  address: '',
  latitude: null,
  longitude: null,
  hours: defaultHours(),
  social: {},
  customLinks: [],
  template: 'minimal',
  theme: defaultTheme,
  services: [],
  products: [],
  gallery: [],
  testimonials: [],
  ctaButtons: [],
  qrName: '',
  folder: 'Default',
  destinationType: 'landing_page',
  destinationUrl: '',
  styling: DEFAULT_QR_STYLING,
};

export const useWizardStore = create<WizardStore>((set) => ({
  ...initialState,
  set: (key, value) => set({ [key]: value } as Partial<WizardStore>),
  patch: (partial) => set(partial as Partial<WizardStore>),
  reset: () => set(initialState),
}));
