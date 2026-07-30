import type { MetadataRoute } from 'next';
import { createServerSupabase } from '@/lib/supabase/server';
import { getAllPosts } from '@/lib/blog';
import { APP_URL } from '@/constants';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes = [
    { path: '', priority: 1, freq: 'daily' as const },
    { path: '/features', priority: 0.7, freq: 'weekly' as const },
    { path: '/templates', priority: 0.7, freq: 'weekly' as const },
    { path: '/pricing', priority: 0.8, freq: 'weekly' as const },
    { path: '/blog', priority: 0.7, freq: 'daily' as const },
    { path: '/about', priority: 0.5, freq: 'monthly' as const },
    { path: '/contact', priority: 0.5, freq: 'monthly' as const },
    { path: '/privacy', priority: 0.3, freq: 'monthly' as const },
    { path: '/terms', priority: 0.3, freq: 'monthly' as const },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${APP_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));

  // Blog posts
  const posts = getAllPosts();
  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${APP_URL}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // Public landing pages
  let pageEntries: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from('landing_pages')
      .select('slug, updated_at')
      .eq('is_published', true);
    pageEntries = (data ?? []).map((p) => ({
      url: `${APP_URL}/q/${p.slug}`,
      lastModified: new Date(p.updated_at as string),
      changeFrequency: 'weekly',
      priority: 0.5,
    }));
  } catch {
    // database unavailable during build — skip dynamic pages
  }

  return [...staticEntries, ...postEntries, ...pageEntries];
}
