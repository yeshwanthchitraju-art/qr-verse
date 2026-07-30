import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import { MarketingNav } from '@/components/marketing/marketing-nav';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { getPost, getRelatedPosts, renderMarkdown } from '@/lib/blog';
import { APP_URL, APP_NAME } from '@/constants';

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPost(params.slug);
  if (!post) return { title: 'Post not found' };

  return {
    title: post.title,
    description: post.description,
    authors: [{ name: post.author }],
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url: `${APP_URL}/blog/${post.slug}`,
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
    alternates: { canonical: `${APP_URL}/blog/${post.slug}` },
  };
}

export function generateStaticParams() {
  // Pre-render known posts at build; dynamic params still work at runtime
  return [];
}

export default function BlogPostPage({ params }: Props) {
  const post = getPost(params.slug);
  if (!post) notFound();

  const related = getRelatedPosts(post);
  const html = renderMarkdown(post.content);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { '@type': 'Organization', name: post.author },
    publisher: { '@type': 'Organization', name: APP_NAME, url: APP_URL },
    mainEntityOfPage: `${APP_URL}/blog/${post.slug}`,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: APP_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${APP_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${APP_URL}/blog/${post.slug}` },
    ],
  };

  return (
    <div className="min-h-screen">
      <MarketingNav />
      <article className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to blog
        </Link>

        <div className="mt-8">
          <span className="text-sm font-medium text-brand">{post.category}</span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{post.title}</h1>
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span>{post.author}</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(post.date).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {post.readingTime} min read</span>
          </div>
        </div>

        <div
          className="prose prose-neutral mt-10 max-w-none prose-headings:tracking-tight prose-a:text-brand prose-headings:scroll-mt-20"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2 border-t pt-6">
            {post.tags.map((t) => (
              <span key={t} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">#{t}</span>
            ))}
          </div>
        )}
      </article>

      {related.length > 0 && (
        <section className="mx-auto max-w-2xl px-4 pb-20 sm:px-6">
          <h2 className="text-lg font-semibold">Related posts</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/blog/${r.slug}`}
                className="group rounded-xl border bg-card p-5 transition-all hover:shadow-md"
              >
                <span className="text-xs font-medium text-brand">{r.category}</span>
                <h3 className="mt-2 text-sm font-semibold group-hover:text-brand">{r.title}</h3>
                <span className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  Read <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <MarketingFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([articleJsonLd, breadcrumbJsonLd]) }}
      />
    </div>
  );
}
