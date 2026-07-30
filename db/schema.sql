/*
# QRVerse — Complete Database Schema

Run this against any fresh Supabase (or Postgres) project to set up the full
QRVerse data model with Row Level Security. See README.md for details.

Usage with Supabase:
  1. Create a new Supabase project at https://supabase.com
  2. Open the SQL Editor (or use the Supabase CLI: supabase db execute)
  3. Paste and run this entire file.

The schema is idempotent — safe to re-run.
*/

/* ==========================================================================
# QRVerse Core Schema
========================================================================== */

## Overview
Builds the multi-tenant data model for QRVerse: a dynamic QR code platform where
businesses create customizable landing pages, generate dynamic (editable) QR codes,
and track scan analytics. QR codes encode only a short `/r/<shortId>` redirect path
so the destination can be changed at any time without reprinting the QR.

## 1. New Tables

- `profiles`: per-user display profile (1:1 with auth.users). Holds name, avatar url,
  brand color, and theme preference. Owned by the user.
- `qr_codes`: a dynamic QR owned by a user. Has a `short_id` (the only value encoded
  into the QR image), a `destination_type` (landing_page | url), the destination target,
  folders, favorite flag, archived flag, styling JSON, and counters.
- `landing_pages`: a business landing page tied to a QR code. Holds business info,
  social links, services, gallery, theme config, and a unique `slug` used at `/q/[slug]`.
- `scans`: append-only analytics event per QR scan / landing page view. Captures
  browser, os, device, country, city, referrer, and event kind (scan | view | click).

## 2. Relationships
- profiles.id → auth.users.id (1:1, cascade delete)
- qr_codes.user_id → auth.users.id (cascade)
- qr_codes.landing_page_id → landing_pages.id (set null on delete)
- landing_pages.user_id → auth.users.id (cascade)
- scans.qr_id → qr_codes.id (cascade)
- scans.landing_page_id → landing_pages.id (cascade)

## 3. Security (RLS)
- profiles: owner-only CRUD (authenticated).
- qr_codes: owner-only CRUD; SELECT/INSERT/UPDATE/DELETE scoped to auth.uid() = user_id.
- landing_pages: owner-only writes; public read (anon, authenticated) so the public
  landing page at /q/[slug] renders for anonymous visitors.
- scans: anyone can INSERT a scan event (anonymous scans must be recordable);
  owner can read their own scans via the QR ownership. No public SELECT.

## 4. Indexes
- qr_codes(user_id), qr_codes(short_id) unique, qr_codes(folder)
- landing_pages(user_id), landing_pages(slug) unique
- scans(qr_id), scans(landing_page_id), scans(created_at)
*/

-- profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  avatar_url text,
  company text,
  brand_color text NOT NULL DEFAULT '#2563eb',
  theme text NOT NULL DEFAULT 'system',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
CREATE POLICY "select_own_profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON public.profiles;
CREATE POLICY "insert_own_profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON public.profiles;
CREATE POLICY "delete_own_profile" ON public.profiles
  FOR DELETE TO authenticated USING (auth.uid() = id);

-- landing_pages (must exist before qr_codes references it)
CREATE TABLE IF NOT EXISTS public.landing_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  slug text NOT NULL,
  qr_id uuid,
  template text NOT NULL DEFAULT 'minimal',
  -- business info
  business_name text NOT NULL,
  description text,
  logo_url text,
  cover_url text,
  category text,
  website text,
  phone text,
  email text,
  whatsapp text,
  address text,
  latitude double precision,
  longitude double precision,
  hours jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- content blocks
  social jsonb NOT NULL DEFAULT '{}'::jsonb,
  custom_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  services jsonb NOT NULL DEFAULT '[]'::jsonb,
  products jsonb NOT NULL DEFAULT '[]'::jsonb,
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  testimonials jsonb NOT NULL DEFAULT '[]'::jsonb,
  cta_buttons jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- theming
  theme_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- state
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX IF NOT EXISTS landing_pages_slug_unique ON public.landing_pages (slug);

DROP POLICY IF EXISTS "select_landing_pages_owner" ON public.landing_pages;
CREATE POLICY "select_landing_pages_owner" ON public.landing_pages
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- public read so /q/[slug] works for anonymous visitors
DROP POLICY IF EXISTS "select_landing_pages_public" ON public.landing_pages;
CREATE POLICY "select_landing_pages_public" ON public.landing_pages
  FOR SELECT TO anon, authenticated USING (is_published = true);

DROP POLICY IF EXISTS "insert_landing_pages_owner" ON public.landing_pages;
CREATE POLICY "insert_landing_pages_owner" ON public.landing_pages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_landing_pages_owner" ON public.landing_pages;
CREATE POLICY "update_landing_pages_owner" ON public.landing_pages
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_landing_pages_owner" ON public.landing_pages;
CREATE POLICY "delete_landing_pages_owner" ON public.landing_pages
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- qr_codes
CREATE TABLE IF NOT EXISTS public.qr_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  landing_page_id uuid REFERENCES public.landing_pages(id) ON DELETE SET NULL,
  short_id text NOT NULL,
  name text NOT NULL DEFAULT 'Untitled QR',
  folder text NOT NULL DEFAULT 'Default',
  destination_type text NOT NULL DEFAULT 'landing_page',
  destination_url text,
  styling jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_favorite boolean NOT NULL DEFAULT false,
  is_archived boolean NOT NULL DEFAULT false,
  scans_count integer NOT NULL DEFAULT 0,
  views_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX IF NOT EXISTS qr_codes_short_id_unique ON public.qr_codes (short_id);
CREATE INDEX IF NOT EXISTS qr_codes_user_id_idx ON public.qr_codes (user_id);
CREATE INDEX IF NOT EXISTS qr_codes_folder_idx ON public.qr_codes (folder);

DROP POLICY IF EXISTS "select_own_qr_codes" ON public.qr_codes;
CREATE POLICY "select_own_qr_codes" ON public.qr_codes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_qr_codes" ON public.qr_codes;
CREATE POLICY "insert_own_qr_codes" ON public.qr_codes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_qr_codes" ON public.qr_codes;
CREATE POLICY "update_own_qr_codes" ON public.qr_codes
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_qr_codes" ON public.qr_codes;
CREATE POLICY "delete_own_qr_codes" ON public.qr_codes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- scans (analytics events)
CREATE TABLE IF NOT EXISTS public.scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_id uuid REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  landing_page_id uuid REFERENCES public.landing_pages(id) ON DELETE CASCADE,
  event_type text NOT NULL DEFAULT 'scan',
  user_agent text,
  referer text,
  ip_hash text,
  country text,
  city text,
  device text,
  os text,
  browser text,
  button_key text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS scans_qr_id_idx ON public.scans (qr_id);
CREATE INDEX IF NOT EXISTS scans_landing_page_id_idx ON public.scans (landing_page_id);
CREATE INDEX IF NOT EXISTS scans_created_at_idx ON public.scans (created_at);

-- anyone (anonymous scanners) may insert scan events
DROP POLICY IF EXISTS "insert_scans_any" ON public.scans;
CREATE POLICY "insert_scans_any" ON public.scans
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- owner can read scans for their QR codes
DROP POLICY IF EXISTS "select_own_scans" ON public.scans;
CREATE POLICY "select_own_scans" ON public.scans
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.qr_codes WHERE qr_codes.id = scans.qr_id AND qr_codes.user_id = auth.uid())
  );

-- updated_at trigger helper
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS qr_codes_touch_updated_at ON public.qr_codes;
CREATE TRIGGER qr_codes_touch_updated_at BEFORE UPDATE ON public.qr_codes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS landing_pages_touch_updated_at ON public.landing_pages;
CREATE TRIGGER landing_pages_touch_updated_at BEFORE UPDATE ON public.landing_pages
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS profiles_touch_updated_at ON public.profiles;
CREATE TRIGGER profiles_touch_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
/*
# Add scan/view counter RPCs

## Overview
Adds two Postgres functions to safely increment the denormalized scan and view
counters on qr_codes. The dashboard reads these counters for fast overview
rendering without aggregating the scans table each load.

## Functions
- `increment_qr_scans(qr_id uuid)`: increments scans_count by 1.
- `increment_qr_views(qr_id uuid)`: increments views_count by 1.

Both are SECURITY DEFINER, owned by postgres, and callable by anon + authenticated
so that the public redirect route and public landing pages can update them.
*/

CREATE OR REPLACE FUNCTION public.increment_qr_scans(qr_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.qr_codes SET scans_count = scans_count + 1 WHERE id = qr_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_qr_views(qr_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.qr_codes SET views_count = views_count + 1 WHERE id = qr_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.increment_qr_scans(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_qr_views(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_qr_scans(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_qr_views(uuid) TO anon, authenticated;
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
