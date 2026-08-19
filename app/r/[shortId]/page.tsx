import { redirect, notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { createServerSupabase } from '@/lib/supabase/server';
import { parseUserAgent, shortHash } from '@/utils';

export const dynamic = 'force-dynamic';

interface Props { params: { shortId: string } }

export default async function RedirectPage({ params }: Props) {
  const supabase = await createServerSupabase();
  const { data: rpcData, error: rpcError } = await supabase.rpc(
    'resolve_public_qr_redirect',
    { p_short_id: params.shortId },
  );
  const data = Array.isArray(rpcData) ? rpcData[0] : rpcData;

  if (rpcError || !data) {
    notFound();
  }

  const qrId = String(data.qr_id);
  const landingPage = data.landing_page_id && data.landing_slug
    ? { id: String(data.landing_page_id), slug: String(data.landing_slug) }
    : null;

  // Record the scan event (best-effort; never block the redirect)
  try {
    const h = headers();
    const ua = h.get('user-agent') || '';
    const referer = h.get('referer') || null;
    const fwd = h.get('x-forwarded-for') || '';
    const ipHash = shortHash(fwd.split(',')[0] || 'unknown');
    const { browser, os, device } = parseUserAgent(ua);

    await supabase.from('scans').insert({
      qr_id: qrId,
      landing_page_id: landingPage?.id ?? null,
      event_type: 'scan',
      user_agent: ua,
      referer,
      ip_hash: ipHash,
      device,
      os,
      browser,
    });

    await supabase.rpc('increment_qr_scans', { qr_id: qrId });
  } catch (e) {
    console.warn('scan record failed', e);
  }

  let target = '/';
  if (data.destination_type === 'url' && data.destination_url) {
    target = String(data.destination_url);
  } else if (landingPage?.slug) {
    target = `/q/${landingPage.slug}`;
  }

  redirect(target);
}
