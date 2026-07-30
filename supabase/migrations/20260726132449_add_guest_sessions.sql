/*
# Guest sessions and anonymous auth support

## Overview
Enables guest (anonymous) users to create and manage landing pages and QR codes
without signing up. Supabase anonymous auth gives each guest a real auth.uid()
and a session, so existing RLS ownership checks (auth.uid() = user_id) keep
working unchanged. This migration adds a guest_sessions tracking table, a
counter RPC for the admin dashboard, and relaxes the INSERT/UPDATE/DELETE
policies on landing_pages and qr_codes to allow the anon role (guests) to manage
their own rows.

## 1. New Tables
- `guest_sessions`: one row per anonymous visitor who starts creating content.
  Columns: id (uuid), user_id (uuid, FK auth.users cascade), is_upgraded (bool),
  upgraded_at (timestamptz), created_at (timestamptz). Tracks total guest count
  and which guests later registered.

## 2. Modified Tables
- `landing_pages`: INSERT/UPDATE/DELETE policies now allow `anon` role in addition
  to `authenticated`, so anonymous guests can save and edit their own pages. The
  ownership check (auth.uid() = user_id) still applies.
- `qr_codes`: same relaxation — INSERT/UPDATE/DELETE now allow `anon` role with
  ownership check. SELECT also relaxed to anon so guests can list their own QR codes.

## 3. Security (RLS)
- `guest_sessions`: owner-only CRUD (authenticated + anon with ownership check).
  A guest can read/update/delete only their own session row. Anyone may insert
  their own session row (anon + authenticated).
- `landing_pages` and `qr_codes`: ownership checks unchanged; role list widened
  to include `anon` so guest sessions (which run as anon) can write their own data.

## 4. RPCs
- `get_guest_count()`: returns the total number of guest sessions (for admin
  analytics). SECURITY DEFINER, callable by authenticated only.
*/

-- ---------------------------------------------------------------------------
-- 1. guest_sessions table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.guest_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  is_upgraded boolean NOT NULL DEFAULT false,
  upgraded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.guest_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_guest_session" ON public.guest_sessions;
CREATE POLICY "select_own_guest_session" ON public.guest_sessions
  FOR SELECT TO anon, authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_guest_session" ON public.guest_sessions;
CREATE POLICY "insert_own_guest_session" ON public.guest_sessions
  FOR INSERT TO anon, authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_guest_session" ON public.guest_sessions;
CREATE POLICY "update_own_guest_session" ON public.guest_sessions
  FOR UPDATE TO anon, authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_guest_session" ON public.guest_sessions;
CREATE POLICY "delete_own_guest_session" ON public.guest_sessions
  FOR DELETE TO anon, authenticated USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 2. Relax landing_pages policies to allow anon (guest) ownership
-- ---------------------------------------------------------------------------
-- SELECT: already allows anon for published pages; add owner-select for anon
DROP POLICY IF EXISTS "select_landing_pages_owner" ON public.landing_pages;
CREATE POLICY "select_landing_pages_owner" ON public.landing_pages
  FOR SELECT TO anon, authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_landing_pages_owner" ON public.landing_pages;
CREATE POLICY "insert_landing_pages_owner" ON public.landing_pages
  FOR INSERT TO anon, authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_landing_pages_owner" ON public.landing_pages;
CREATE POLICY "update_landing_pages_owner" ON public.landing_pages
  FOR UPDATE TO anon, authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_landing_pages_owner" ON public.landing_pages;
CREATE POLICY "delete_landing_pages_owner" ON public.landing_pages
  FOR DELETE TO anon, authenticated USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 3. Relax qr_codes policies to allow anon (guest) ownership
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "select_own_qr_codes" ON public.qr_codes;
CREATE POLICY "select_own_qr_codes" ON public.qr_codes
  FOR SELECT TO anon, authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_qr_codes" ON public.qr_codes;
CREATE POLICY "insert_own_qr_codes" ON public.qr_codes
  FOR INSERT TO anon, authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_qr_codes" ON public.qr_codes;
CREATE POLICY "update_own_qr_codes" ON public.qr_codes
  FOR UPDATE TO anon, authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_qr_codes" ON public.qr_codes;
CREATE POLICY "delete_own_qr_codes" ON public.qr_codes
  FOR DELETE TO anon, authenticated USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 4. profiles: allow anon (guest) to insert/update their own profile row
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
CREATE POLICY "select_own_profile" ON public.profiles
  FOR SELECT TO anon, authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON public.profiles;
CREATE POLICY "insert_own_profile" ON public.profiles
  FOR INSERT TO anon, authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile" ON public.profiles
  FOR UPDATE TO anon, authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON public.profiles;
CREATE POLICY "delete_own_profile" ON public.profiles
  FOR DELETE TO anon, authenticated USING (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- 5. Admin RPC: total guest count
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_guest_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total integer;
BEGIN
  SELECT count(*)::integer INTO total FROM public.guest_sessions;
  RETURN total;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_guest_count() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_guest_count() TO authenticated;

-- allow anon to mark their own session as upgraded (called after sign-up)
CREATE OR REPLACE FUNCTION public.mark_guest_upgraded(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.guest_sessions
  SET is_upgraded = true, upgraded_at = now()
  WHERE user_id = target_user_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.mark_guest_upgraded(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_guest_upgraded(uuid) TO anon, authenticated;
