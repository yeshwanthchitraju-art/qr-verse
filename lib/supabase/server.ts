import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const url: string = supabaseUrl;
const anonKey: string = supabaseAnonKey;

export async function createServerSupabase() {
  const cookieStore = cookies();
  const all = cookieStore.getAll();
  const authCookies: Record<string, string> = {};
  for (const c of all) {
    if (c.name.startsWith('sb-')) {
      authCookies[c.name] = c.value;
    }
  }

  const cookieHeader = Object.entries(authCookies).map(([k, v]) => `${k}=${v}`).join('; ');

  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Cookie: cookieHeader } },
  });
}
