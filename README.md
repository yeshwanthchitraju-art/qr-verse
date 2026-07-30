# QRVerse — Dynamic QR Codes & Business Landing Pages

QRVerse is a production-quality SaaS platform for creating **dynamic QR codes**, beautiful **business landing pages**, and tracking **scan analytics** in real time.

The QR encodes only a short redirect ID (`qrverse.app/r/abc123`), so you can change the destination anytime — without reprinting the QR.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Quick start](#quick-start)
- [Database setup](#database-setup)
- [Environment variables](#environment-variables)
- [Enabling Google and GitHub OAuth](#enabling-google-and-github-oauth)
- [Enabling guest mode (anonymous auth)](#enabling-guest-mode-anonymous-auth)
- [Deploy to Vercel](#deploy-to-vercel)
- [Migrate to another Supabase account](#migrate-to-another-supabase-account)
- [SEO](#seo)
- [Future-ready architecture](#future-ready-architecture)
- [Extending the app](#extending-the-app)

---

## Features

### Marketing site
- **Home** — hero with animated QR + phone demo, feature grid, how-it-works, template gallery, analytics preview, testimonials, pricing, FAQ, CTA
- **Features, Templates, Pricing, About, Contact, Privacy, Terms** — full secondary pages
- **Blog** — CMS-ready markdown blog with categories, tags, related posts, RSS feed

### Authentication
- Email/password signup & login
- Google OAuth login
- GitHub OAuth login
- **Guest mode** — visitors can create and save landing pages without signing up
- Protected dashboard via middleware (guests and registered users both allowed)
- Session persistence
- Automatic profile creation for OAuth users (name + avatar)
- Guest-to-account upgrade (add email/password or use OAuth to keep pages forever)

### Dashboard
- Premium sidebar + topbar shell
- Command palette (⌘K / Ctrl+K)
- Overview with stats and recent QR codes

### Create QR wizard (4 steps)
1. **Business info** — logo, name, description, category, contact details, hours
2. **Social & links** — 10 social platforms + unlimited custom buttons
3. **Landing page design** — 12 templates, accent color, fonts, corner radius, button style, services, products, gallery, testimonials
4. **QR styling** — dot pattern, corners, gradient, logo, padding, PNG/SVG download

With a **live phone preview** that updates as you type.

### QR management
- List with folders, search, favorite, archive, duplicate, delete
- Detail page with editable destination (the core "dynamic" feature)
- PNG and SVG download, copy link

### Public landing pages (`/q/[slug]`)
- Rendered with the chosen template theme
- Business info, action buttons (call, WhatsApp, email, website, directions)
- Services, products, gallery, testimonials, hours, location, socials
- LocalBusiness structured data (JSON-LD)

### Dynamic redirect (`/r/[shortId]`)
- Records a scan event (device, browser, OS, referrer, hashed IP)
- Increments scan counter
- Redirects to the editable destination

### Analytics
- Scans & views over time (30-day chart)
- Device, browser, OS breakdowns
- Top performing QR codes
- CSV export

### Settings & account
- Light / dark / system theme
- Profile editing
- Brand color

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 13 (App Router) |
| UI | React 18, TypeScript (strict), TailwindCSS, shadcn/ui, Lucide icons |
| Animation | Framer Motion |
| Forms | React Hook Form + Zod |
| Server state | TanStack Query |
| Client state | Zustand (wizard only) |
| Charts | Recharts |
| QR generation | qr-code-styling |
| Database & auth | Supabase (PostgreSQL) |

---

## Project structure

```
app/                  Next.js App Router routes
  blog/               Blog listing + post pages
  dashboard/          Protected dashboard (QR codes, analytics, settings)
  q/[slug]/           Public business landing pages
  r/[shortId]/        Dynamic QR redirect (records scan, then redirects)
  opengraph-image.svg  Default social share image
components/
  ui/                 shadcn/ui primitives
  marketing/          Nav, footer, hero demo, feature grid, analytics preview
  dashboard/          Sidebar, topbar, command palette
  qr/                 QR preview component
  shared/             Logo
features/
  qr-wizard/          4-step wizard + phone preview + theme utils + store
  public-landing/     Public landing page renderer
content/blog/         Markdown blog posts
lib/
  blog.ts             Markdown parser + post loader
  supabase/           Client, server, admin singletons
db/
  schema.sql          Complete database schema (portable)
providers/            Theme, query, auth context
constants/            App config, templates, nav, pricing
types/                Shared TypeScript types
utils/                Slug, shortId, UA parsing, QR styling defaults
```

Server components by default; client components only where interactivity is required (`'use client'`). Charts and the QR preview are dynamically imported to keep the initial bundle small.

---

## Quick start

The Supabase project is already provisioned and credentials are pre-populated in `.env`.

```bash
npm install
npm run dev
```

Open http://localhost:3000. Create an account at `/signup`, then visit `/dashboard` to build your first QR code.

To verify the build:

```bash
npm run build
```

---

## Database setup

The full schema (4 tables, RLS policies, indexes, triggers, counter functions) is in [`db/schema.sql`](db/schema.sql). It is idempotent and safe to re-run.

### Option A: Run via the Supabase SQL Editor (recommended for new accounts)

1. Go to your Supabase project dashboard → **SQL Editor**
2. Open `db/schema.sql`, copy the entire contents
3. Paste into the SQL Editor and click **Run**

This creates all tables, enables RLS, and sets up policies.

### Option B: Run via the Supabase CLI

```bash
npm install -g supabase
supabase db execute --file db/schema.sql
```

### Tables created

| Table | Purpose |
|-------|---------|
| `profiles` | User display profile (1:1 with `auth.users`) |
| `landing_pages` | Business landing page content + theme config |
| `qr_codes` | Dynamic QR with short_id, destination, styling, counters |
| `scans` | Append-only analytics events |

### Row Level Security

- `profiles`, `qr_codes` — owner-scoped CRUD (`auth.uid() = user_id`)
- `landing_pages` — owner writes; **public read** for published pages (anon + authenticated)
- `scans` — anyone may INSERT (anonymous scans must be recordable); owners read their own

---

## Environment variables

All required variables are pre-configured in this project. For a new deployment, set these:

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App URL (required for SEO + redirects)
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Cloudinary (optional — for media uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Stripe (future — billing is scaffolded but not enabled)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Search Console verification (optional)
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
NEXT_PUBLIC_BING_SITE_VERIFICATION=
```

See [`.env.example`](.env.example) for the full list.

---

## Enabling Google and GitHub OAuth

Google and GitHub login are built into the app. To activate them in your Supabase project:

### Google OAuth

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and create a project (or use an existing one)
2. Navigate to **APIs & Services → Credentials → Create Credentials → OAuth client ID**
3. Choose **Web application** as the application type
4. Add your Supabase callback URL as an authorized redirect URI:
   ```
   https://YOUR-PROJECT.supabase.co/auth/v1/callback
   ```
5. Copy the **Client ID** and **Client Secret**
6. In your Supabase dashboard, go to **Authentication → Providers → Google**
7. Toggle Google on, paste the Client ID and Client Secret, and save

### GitHub OAuth

1. Go to [GitHub Developer Settings → OAuth Apps → New OAuth App](https://github.com/settings/developers)
2. Set the **Authorization callback URL** to:
   ```
   https://YOUR-PROJECT.supabase.co/auth/v1/callback
   ```
3. Copy the **Client ID** and generate a **Client Secret**
4. In your Supabase dashboard, go to **Authentication → Providers → GitHub**
5. Toggle GitHub on, paste the Client ID and Client Secret, and save

After enabling, the "Continue with Google" and "Continue with GitHub" buttons on the login and signup pages will work. OAuth users get a profile row created automatically (with their name and avatar from the provider).

The app handles the OAuth callback at `/auth/callback`, exchanges the code for a session, creates a profile if needed, and redirects to the dashboard.

---

## Enabling guest mode (anonymous auth)

Guest mode lets visitors try the full dashboard — create QR codes, build landing pages, and save them — without signing up. It uses Supabase's anonymous auth, which gives each guest a real `auth.uid()` so the existing ownership-based RLS policies work unchanged.

To enable it:

1. In your Supabase dashboard, go to **Authentication → Settings**
2. Under **Auth Providers**, toggle **"Allow anonymous sign-ins"** to ON
3. Save

After enabling, the "Try free" button on the marketing site and the "Continue as a guest" link on the login page will create an anonymous session and drop the visitor into the dashboard.

### How guest data works

- Each guest gets a real `auth.uid()` and session — their saved pages and QR codes are owned by that ID and protected by the same RLS policies as registered users.
- A `guest_sessions` table tracks every guest session (with a `is_upgraded` flag for those who later register).
- The `get_guest_count()` RPC returns the total number of guests for admin analytics.
- When a guest upgrades (adds email/password or uses OAuth), their `auth.uid()` stays the same — so all their saved pages and QR codes carry over automatically. No data migration needed.

---

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, click **Import Project** and select the repo.
3. Add the environment variables listed above (at minimum the Supabase URL, anon key, service role key, and app URL).
4. Click **Deploy**.

The Next.js build outputs to `.next` and runs on Vercel out of the box. No additional configuration needed.

---

## Migrate to another Supabase account

To move QRVerse to a different Supabase project:

1. **Create a new Supabase project** at https://supabase.com
2. **Run the schema**: open `db/schema.sql` in the Supabase SQL Editor and run it
3. **Update your env vars** with the new project's URL, anon key, and service role key
4. **Redeploy** your app

The schema is self-contained and idempotent. No external dependencies, no Bolt-specific references, no hardcoded project IDs.

---

## SEO

QRVerse ships with complete, production-ready SEO:

- **Dynamic metadata** on every page (title, description, OpenGraph, Twitter cards)
- **Canonical URLs** on all routes
- **JSON-LD structured data**: Organization, SoftwareApplication, FAQPage, Blog, Article, BreadcrumbList, LocalBusiness
- **Sitemap** (`/sitemap.xml`) — includes static pages, blog posts, and public landing pages (auto-updated)
- **Robots** (`/robots.txt`) — allows crawling of public content, blocks dashboard and redirect routes
- **RSS feed** (`/rss.xml`) — blog posts in RSS 2.0 format
- **Open Graph image** (`/opengraph-image.svg`) — default social share image
- **Web manifest** (`/manifest.webmanifest`) — PWA-ready
- **Search Console verification** placeholders (Google + Bing) via env vars
- **Semantic HTML**, ARIA labels, proper heading hierarchy
- **Blog** with Article schema, breadcrumbs, and related posts

---

## Future-ready architecture

These features are scaffolded but not yet enabled, designed to extend without refactoring:

- **Stripe billing** — plan tiers (Free / Pro / Business / Enterprise) are defined in `constants/index.ts`. Pro and Business show "Coming soon" in the UI. Add Stripe checkout later with no schema changes.
- **Cloudinary media** — the Media page has the upload UI shell. Add Cloudinary credentials to enable persistent image hosting.
- **Custom domains** — reserved for the Pro plan.
- **Password-protected pages, scheduled redirects, webhooks** — schema and routes are designed to extend cleanly.

---

## Extending the app

### Add a blog post

Create a new markdown file in `content/blog/` with frontmatter:

```markdown
---
title: "Your Post Title"
description: "A short summary for SEO and listings."
date: "2025-02-01"
author: "Your Name"
category: "Guides"
tags: "qr codes, marketing"
---

Your post content in markdown...
```

It automatically appears on the blog page, in the RSS feed, and in the sitemap.

### Add a landing page template

1. Add the template to the `TEMPLATES` array in `constants/index.ts`
2. The template appears in the wizard and on the templates page automatically

### Change the brand color

The brand color is defined as a CSS variable in `app/globals.css` (`--brand`). Update it there and it propagates across the entire app. Per-user brand colors are stored in `profiles.brand_color`.

---

## License

Proprietary. Built as a commercial SaaS starter.
