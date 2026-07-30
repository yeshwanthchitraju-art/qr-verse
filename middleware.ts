import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  const isDashboard = pathname.startsWith('/dashboard');
  if (!isDashboard) return res;

  if (!url || !anonKey) return res;

  const token = req.cookies.get('sb-access-token')?.value;
  if (!token) {
    // No session at all → redirect to login
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validate the token — both registered and anonymous (guest) users are allowed
  const supabase = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data } = await supabase.auth.getUser(token);
  if (!data.user) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
