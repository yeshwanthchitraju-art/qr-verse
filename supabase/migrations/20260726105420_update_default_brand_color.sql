/*
# Update default brand color

## Overview
Updates the default `brand_color` on `profiles` from the old indigo (#6366f1)
to the new primary blue (#2563eb) to match the refreshed brand palette.

## Changes
- profiles.brand_color default: '#6366f1' -> '#2563eb'
*/

ALTER TABLE public.profiles ALTER COLUMN brand_color SET DEFAULT '#2563eb';
