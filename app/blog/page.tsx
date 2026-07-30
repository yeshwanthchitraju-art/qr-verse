import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight, Search } from 'lucide-react';
import { MarketingNav } from '@/components/marketing/marketing-nav';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { getAllPosts, getAllCategories } from '@/lib/blog';
import { APP_URL } from '@/constants';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Guides, use cases, and best practices for dynamic QR codes and business landing pages.',
  alternates: { canonical: `${APP_URL}/blog` },
  openGraph: {
    title: 'QRVerse Blog',
    description: 'Guides, use cases, and best practices for dynamic QR codes.',
    url: `${APP_URL}/blog`,
  },
};

export default function BlogPage() {
  const posts = getAllPosts();
  const categories = getAllCategories();
  const [featured, ...rest] = posts;

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'QRVerse Blog',
    url: `${APP_URL}/blog`,
  };

  return (
    <div className="min-h-screen">
      <MarketingNav />
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Blog</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Guides, use cases, and best practices for dynamic QR codes.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="mt-16 text-center text-muted-foreground">No posts yet. Check back soon.</div>
        ) : (
          <>
            {/* Featured post */}
            <Link
              href={`/blog/${featured.slug}`}
              className="group mt-14 grid gap-6 rounded-2xl border bg-card p-6 transition-all hover:shadow-lg md:grid-cols-2 md:p-8"
            >
              <div className="flex flex-col justify-center">
                <span className="inline-flex w-fit items-center rounded-full bg-brand-muted px-3 py-1 text-xs font-medium text-brand">
                  Featured
                </span>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight group-hover:text-brand">
                  {featured.title}
                </h2>
                <p className="mt-3 text-muted-foreground">{featured.description}</p>
                <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(featured.date).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {featured.readingTime} min read</span>
                </div>
              </div>
              <div className="flex min-h-[180px] items-center justify-center rounded-xl brand-gradient opacity-90">
                <span className="text-5xl font-bold text-white">{featured.category.charAt(0)}</span>
              </div>
            </Link>

            {/* Categories */}
            {categories.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2">
                {categories.map((c) => (
                  <span key={c} className="rounded-full border bg-background px-3.5 py-1.5 text-sm font-medium text-muted-foreground">
                    {c}
                  </span>
                ))}
              </div>
            )}

            {/* Post grid */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col rounded-2xl border bg-card p-6 transition-all hover:shadow-md"
                >
                  <span className="text-xs font-medium text-brand">{post.category}</span>
                  <h3 className="mt-3 text-lg font-semibold tracking-tight group-hover:text-brand">
                    {post.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">{post.description}</p>
                  <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(post.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {post.readingTime} min</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
      <MarketingFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
    </div>
  );
}
