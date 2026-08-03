import { Suspense } from 'react';
import { CallbackHandler } from './callback-handler';

export const dynamic = 'force-dynamic';

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackHandler />
    </Suspense>
  );
}
