'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Logo } from '@/components/shared/logo';
import { Loader2 } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      if (!supabaseUrl || !supabaseAnonKey) {
        setError('Missing Supabase configuration');
        return;
      }

      const redirect = params.get('redirect') || '/dashboard';
      const code = params.get('code');

      if (!code) {
        router.replace(redirect);
        return;
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
      });

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        setError(exchangeError.message);
        return;
      }

      // Ensure a profile row exists for OAuth users (they may not have full_name)
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
