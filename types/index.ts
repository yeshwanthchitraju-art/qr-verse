export type DestinationType = 'landing_page' | 'url';

export type QrDotsType =
  | 'square'
  | 'rounded'
  | 'dots'
  | 'classy'
  | 'classy-rounded'
  | 'extra-rounded';

export type QrCornersSquareType = 'square' | 'dot' | 'extra-rounded';
export type QrCornersDotType = 'square' | 'dot';

export interface QrStyling {
  dotsType: QrDotsType;
  cornersSquareType: QrCornersSquareType;
  cornersDotType: QrCornersDotType;
  foregroundColor: string;
  backgroundColor: string;
  gradientFrom?: string;
  gradientTo?: string;
  gradientEnabled: boolean;
  gradientRotation: number;
  logoUrl?: string;
  logoSize: number;
  imageMargin: number;
  cornersSquareColor: string;
  cornersDotColor: string;
  padding: number;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface CustomLink {
  id: string;
  label: string;
  url: string;
  icon?: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price?: string;
  icon?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price?: string;
  image?: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  content: string;
  rating: number;
  avatar?: string;
}

export interface CtaButton {
  id: string;
  label: string;
  url: string;
  variant: 'primary' | 'secondary' | 'outline';
}

export interface BusinessHours {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export type TemplateId =
  | 'minimal'
  | 'luxury'
  | 'restaurant'
  | 'cafe'
  | 'salon'
  | 'medical'
  | 'gym'
  | 'portfolio'
  | 'event'
  | 'retail'
  | 'corporate'
  | 'dark'
  | 'business-card';

export interface ThemeConfig {
  accentColor: string;
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  fontFamily: string;
  radius: number;
  buttonStyle: 'solid' | 'soft' | 'outline' | 'glass';
  animation: boolean;
}

export interface QrCodeRow {
  id: string;
  user_id: string;
  landing_page_id: string | null;
  short_id: string;
  name: string;
  folder: string;
  destination_type: DestinationType;
  destination_url: string | null;
  styling: QrStyling | Record<string, never>;
  is_favorite: boolean;
  is_archived: boolean;
  scans_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface LandingPageRow {
  id: string;
  user_id: string;
  slug: string;
  qr_id: string | null;
  template: string;
  business_name: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  category: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  hours: BusinessHours[];
  social: Record<string, string>;
  custom_links: CustomLink[];
  services: Service[];
  products: Product[];
  gallery: GalleryImage[];
  testimonials: Testimonial[];
  cta_buttons: CtaButton[];
  theme_config: Partial<ThemeConfig> & {
    booking_url?: string | null;
    reviews_url?: string | null;
    lead_form_enabled?: boolean;
    lead_form_fields?: string[];
  };
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileRow {
  id: string;
  full_name: string;
  avatar_url: string | null;
  company: string | null;
  brand_color: string;
  theme: 'light' | 'dark' | 'system';
  created_at: string;
  updated_at: string;
}

export interface ScanRow {
  id: string;
  qr_id: string | null;
  landing_page_id: string | null;
  event_type: 'scan' | 'view' | 'click';
  user_agent: string | null;
  referer: string | null;
  ip_hash: string | null;
  country: string | null;
  city: string | null;
  device: string | null;
  os: string | null;
  browser: string | null;
  button_key: string | null;
  created_at: string;
}

export interface QrWithLanding extends QrCodeRow {
  landing_pages?: Pick<LandingPageRow, 'id' | 'slug' | 'business_name' | 'logo_url'> | null;
}
