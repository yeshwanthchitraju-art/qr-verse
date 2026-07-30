/*
# Enable anonymous auth support and simple user history

## Overview
This migration does two things:
1. Enables anonymous sign-ins at the database level so guest users can
   create content without registering. (Supabase may also need this toggled
   in the dashboard Auth settings, but this covers the DB side.)
2. Adds a simple `user_history` table that stores a lightweight activity log
   for registered users (QR created, QR updated, page published, etc).

## 1. Auth Config
- Sets `EXTERNAL_ANONYMOUS_USERS_ENABLED` to true in the auth config table
  if the table exists. This allows `signInAnonymously()` to work.

## 2. New Table: user_history
- `id` (uuid, primary key)
- `user_id` (uuid, FK to auth.users, cascade delete) — defaults to auth.uid()
- `action` (text) — what happened, e.g. "qr_created", "page_updated"
- `entity_id` (text, nullable) — the ID of the related QR or landing page
- `entity_type` (text, nullable) — "qr_code" or "landing_page"
- `metadata` (jsonb, default '{}') — any extra context
- `created_at` (timestamptz, default now())

## 3. Security (RLS)
- `user_history`: owner-only CRUD. Each user can only see and manage their
  own history rows. Policies scoped to `TO authenticated` with `auth.uid()`
  ownership checks.
*/

-- ---------------------------------------------------------------------------
-- 1. Try to enable anonymous sign-ins (no-op if the config table is locked)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'auth' AND table_name = 'config'
  ) THEN
    UPDATE auth.config
    SET value = 'true'
    WHERE key = 'EXTERNAL_ANONYMOUS_USERS_ENABLED';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 2. user_history table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  entity_id text,
  entity_type text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_history ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS user_history_user_id_idx ON public.user_history (user_id);
CREATE INDEX IF NOT EXISTS user_history_created_at_idx ON public.user_history (created_at);

DROP POLICY IF EXISTS "select_own_history" ON public.user_history;
CREATE POLICY "select_own_history" ON public.user_history
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_history" ON public.user_history;
CREATE POLICY "insert_own_history" ON public.user_history
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_history" ON public.user_history;
CREATE POLICY "update_own_history" ON public.user_history
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_history" ON public.user_history;
CREATE POLICY "delete_own_history" ON public.user_history
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
