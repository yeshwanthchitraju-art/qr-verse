'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { setGuestLocalOff } from '@/lib/guest-history';
import { safeRedirect } from '@/utils';
import { Logo } from '@/components/shared/logo';
import { Loader as Loader2 } from 'lucide-react';

export function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      const redirect = safeRedirect(params.get('redirect'));
      const code = params.get('code');

      if (!code) {
        router.replace(redirect);
        return;
      }

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        setError(exchangeError.message);
        return;
      }

      setGuestLocalOff();

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (!existing) {
          const fullName =
            (user.user_metadata?.full_name as string) ||
            (user.user_metadata?.name as string) ||
            '';
          const avatarUrl = (user.user_metadata?.avatar_url as string) || null;

          await supabase.from('profiles').insert({
            id: user.id,
            full_name: fullName,
            avatar_url: avatarUrl,
          });
        }
      }

      router.replace(redirect);
      router.refresh();
    }

    handleCallback();
  }, [params, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Logo />
      <div className="mt-8 flex flex-col items-center gap-3">
        {error ? (
          <>
            <p className="text-sm font-medium text-destructive">Authentication failed</p>
            <p className="max-w-sm text-xs text-muted-foreground">{error}</p>
            <a href="/login" className="mt-2 text-sm font-medium text-brand hover:underline">
              Back to sign in
            </a>
          </>
        ) : (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-brand" />
            <p className="text-sm text-muted-foreground">Completing sign in...</p>
          </>
        )}
      </div>
    </div>
  );
}
