'use client';

import { useState } from 'react';
import { isGuestLocal } from '@/lib/guest-history';
import { GuestBanner } from '@/components/dashboard/guest-banner';

export function GuestBannerClient() {
  const [show] = useState(() => isGuestLocal());

  if (!show) return null;
  return <GuestBanner />;
}
