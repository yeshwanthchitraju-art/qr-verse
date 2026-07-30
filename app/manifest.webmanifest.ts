import type { MetadataRoute } from 'next';
import { APP_URL } from '@/constants';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'QRVerse',
    short_name: 'QRVerse',
    description: 'Dynamic QR codes & business landing pages with analytics.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  };
}
