import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createServerSupabase } from '@/lib/supabase/server';
import { PublicLandingView } from '@/features/public-landing/public-landing-view';
import { APP_URL } from '@/constants';
import type { LandingPageRow } from '@/types';

export const dynamic = 'force-dynamic';

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('landing_pages')
    .select('business_name, description, logo_url, slug')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .maybeSingle();

  if (!data) return { title: 'Page not found' };

  const title = data.business_name;
  const description = data.description || `Visit ${data.business_name} on QRVerse`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: data.logo_url ? [{ url: data.logo_url }] : undefined,
      url: `${APP_URL}/q/${data.slug}`,
    },
    twitter: { card: 'summary', title, description },
    alternates: { canonical: `${APP_URL}/q/${data.slug}` },
    robots: { index: true, follow: true },
  };
}

export default async function PublicLandingPage({ params }: Props) {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('landing_pages')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .maybeSingle();

  if (!data) notFound();

  // increment views (best effort)
  try {
    const { data: qr } = await supabase
      .from('qr_codes')
      .select('id')
      .eq('landing_page_id', data.id)
      .maybeSingle();
    if (qr?.id) {
      await supabase.rpc('increment_qr_views', { qr_id: qr.id });
    }
  } catch (e) {
    console.warn('view increment failed', e);
  }

  const page = data as LandingPageRow;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: page.business_name,
    description: page.description || undefined,
    image: page.logo_url || undefined,
    telephone: page.phone || undefined,
    email: page.email || undefined,
    address: page.address ? { '@type': 'PostalAddress', streetAddress: page.address } : undefined,
    url: `${APP_URL}/q/${page.slug}`,
  };

  return (
    <>
      <PublicLandingView page={page} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
