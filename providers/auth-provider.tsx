'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { isGuestLocal, setGuestLocal, clearGuestHistory } from '@/lib/guest-history';
import type { ProfileRow } from '@/types';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: ProfileRow | null;
  loading: boolean;
  isGuest: boolean;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  isGuest: false,
  signInAsGuest: () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [guest, setGuest] = useState(false);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (!data) {
      const { data: created } = await supabase
        .from('profiles')
        .insert({ id: userId, full_name: '' })
        .select('*')
        .maybeSingle();
      setProfile(created as ProfileRow | null);
    } else {
      setProfile(data as ProfileRow);
    }
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session) {
        setGuest(false);
        setSession(data.session);
        loadProfile(data.session.user.id).finally(() => mounted && setLoading(false));
      } else {
        // Only fall back to local guest mode if there is no real session
        if (isGuestLocal()) {
          setGuest(true);
        }
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (newSession) {
        setGuest(false);
        setSession(newSession);
        (async () => {
          await loadProfile(newSession.user.id);
          setLoading(false);
        })();
      } else {
        setSession(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      loading,
      isGuest: guest,
      signInAsGuest: () => {
        setGuestLocal(true);
        setGuest(true);
      },
      signOut: async () => {
        if (guest) {
          setGuestLocal(false);
          clearGuestHistory();
          setGuest(false);
          return;
        }
        await supabase.auth.signOut();
        setProfile(null);
        setSession(null);
      },
      refreshProfile: async () => {
        if (session?.user) await loadProfile(session.user.id);
      },
    }),
    [session, profile, loading, guest]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
