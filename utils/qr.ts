import type { QrStyling } from '@/types';

export const DEFAULT_QR_STYLING: QrStyling = {
  dotsType: 'rounded',
  cornersSquareType: 'extra-rounded',
  cornersDotType: 'dot',
  foregroundColor: '#0a0a0a',
  backgroundColor: '#ffffff',
  gradientFrom: '#2563eb',
  gradientTo: '#0891b2',
  gradientEnabled: false,
  gradientRotation: 0,
  logoUrl: undefined,
  logoSize: 0.3,
  imageMargin: 4,
  cornersSquareColor: '#0a0a0a',
  cornersDotColor: '#0a0a0a',
  padding: 20,
};

export const QR_DOT_OPTIONS = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'dots', label: 'Dots' },
  { value: 'classy', label: 'Classy' },
  { value: 'classy-rounded', label: 'Classy Rounded' },
  { value: 'extra-rounded', label: 'Extra Rounded' },
] as const;

export const QR_CORNERS_SQUARE_OPTIONS = [
  { value: 'square', label: 'Square' },
  { value: 'dot', label: 'Dot' },
  { value: 'extra-rounded', label: 'Extra Rounded' },
] as const;

export const QR_CORNERS_DOT_OPTIONS = [
  { value: 'square', label: 'Square' },
  { value: 'dot', label: 'Dot' },
] as const;
