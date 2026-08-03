export function safeRedirect(target: string | null | undefined): string {
  const fallback = '/dashboard';
  if (!target) return fallback;
  if (target.startsWith('/') && !target.startsWith('//')) return target;
  return fallback;
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function relativeTime(date: string | Date): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = Math.max(0, now - then);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 30) return new Date(date).toLocaleDateString();
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

export function generateShortId(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || generateShortId(6);
}

export function parseUserAgent(ua: string): { device: string; os: string; browser: string } {
  const device = /iPad|Tablet/i.test(ua) ? 'tablet'
    : /Mobile|Android|iPhone/i.test(ua) ? 'mobile'
    : 'desktop';
  const os = /Windows/i.test(ua) ? 'Windows'
    : /Mac OS|Macintosh/i.test(ua) ? 'macOS'
    : /Android/i.test(ua) ? 'Android'
    : /iPhone|iPad|iOS/i.test(ua) ? 'iOS'
    : /Linux/i.test(ua) ? 'Linux'
    : 'Unknown';
  const browser = /Edg/i.test(ua) ? 'Edge'
    : /Chrome/i.test(ua) ? 'Chrome'
    : /Firefox/i.test(ua) ? 'Firefox'
    : /Safari/i.test(ua) ? 'Safari'
    : 'Unknown';
  return { device, os, browser };
}

export function shortHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
