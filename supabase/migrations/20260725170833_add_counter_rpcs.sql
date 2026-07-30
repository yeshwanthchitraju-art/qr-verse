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
