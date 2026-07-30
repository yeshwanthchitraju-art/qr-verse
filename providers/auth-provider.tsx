'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import type { ProfileRow } from '@/types';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: ProfileRow | null;
  loading: boolean;
  isGuest: boolean;
  signInAsGuest: () => Promise<void>;
  upgradeGuest: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  isGuest: false,
  signInAsGuest: async () => {},
  upgradeGuest: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

const GUEST_KEY = 'qrverse-guest-init';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  const isGuest = !!(session?.user && (session.user.is_anonymous === true));

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (!data) {
      const { data: created } = await supabase
        .from('profiles')
        .insert({ id: userId, full_name: isGuest ? 'Guest' : '' })
        .select('*')
        .maybeSingle();
      setProfile(created as ProfileRow | null);
    } else {
      setProfile(data as ProfileRow);
    }
  };

  const ensureGuestSession = async (userId: string) => {
    const { data: existing } = await supabase
      .from('guest_sessions')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    if (!existing) {
      await supabase.from('guest_sessions').insert({ user_id: userId });
    }
  };

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) {
        const anon = data.session.user.is_anonymous === true;
        Promise.all([
          loadProfile(data.session.user.id),
          anon ? ensureGuestSession(data.session.user.id) : Promise.resolve(),
        ]).finally(() => mounted && setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      (async () => {
        setSession(newSession);
        if (newSession?.user) {
          const anon = newSession.user.is_anonymous === true;
          await loadProfile(newSession.user.id);
          if (anon) await ensureGuestSession(newSession.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      })();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      loading,
      isGuest,
      signInAsGuest: async () => {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
      },
      upgradeGuest: async (email: string, password: string) => {
        const { error } = await supabase.auth.updateUser({
          email,
          password,
          data: { full_name: profile?.full_name || '' },
        });
        if (error) throw error;
        // mark guest session as upgraded (best-effort)
        if (session?.user) {
          await supabase.rpc('mark_guest_upgraded', { target_user_id: session.user.id });
        }
      },
      signOut: async () => {
        await supabase.auth.signOut();
        setProfile(null);
        setSession(null);
        try { localStorage.removeItem(GUEST_KEY); } catch { /* ignore */ }
      },
      refreshProfile: async () => {
        if (session?.user) await loadProfile(session.user.id);
      },
    }),
    [session, profile, loading, isGuest]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
