// Local storage history for guest users (no Supabase session).
// Signed-in users store history in Supabase; guests store it here.

const GUEST_FLAG_KEY = 'qrverse_guest';
const QR_HISTORY_KEY = 'qrverse_guest_qr_history';
const LANDING_HISTORY_KEY = 'qrverse_guest_landing_history';

export interface GuestQrItem {
  id: string;
  name: string;
  short_id: string;
  folder: string;
  destination_type: 'landing_page' | 'url';
  destination_url: string | null;
  styling: Record<string, unknown>;
  is_favorite: boolean;
  is_archived: boolean;
  scans_count: number;
  views_count: number;
  created_at: string;
  landing: { slug: string; business_name: string; logo_url: string | null } | null;
}

export interface GuestLandingItem {
  id: string;
  slug: string;
  business_name: string;
  description: string | null;
  logo_url: string | null;
  template: string;
  created_at: string;
}

function safeGet(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // storage full or blocked
  }
}

function safeRemove(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function isGuestLocal(): boolean {
  return safeGet(GUEST_FLAG_KEY) === '1';
}

export function setGuestLocal(on: boolean): void {
  if (on) {
    safeSet(GUEST_FLAG_KEY, '1');
    document.cookie = 'guest_mode=1; path=/; max-age=2592000';
  } else {
    safeRemove(GUEST_FLAG_KEY);
    document.cookie = 'guest_mode=; path=/; max-age=0';
  }
}

export function clearGuestHistory(): void {
  safeRemove(QR_HISTORY_KEY);
  safeRemove(LANDING_HISTORY_KEY);
}

function readList<T>(key: string): T[] {
  const raw = safeGet(key);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as T[]) : [];
  } catch {
    return [];
  }
}

function writeList<T>(key: string, list: T[]): void {
  safeSet(key, JSON.stringify(list));
}

// ---- QR history ----
export function getGuestQrHistory(): GuestQrItem[] {
  return readList<GuestQrItem>(QR_HISTORY_KEY).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function addGuestQr(item: GuestQrItem): void {
  const list = readList<GuestQrItem>(QR_HISTORY_KEY);
  list.push(item);
  writeList(QR_HISTORY_KEY, list);
}

export function updateGuestQr(id: string, patch: Partial<GuestQrItem>): void {
  const list = readList<GuestQrItem>(QR_HISTORY_KEY);
  const idx = list.findIndex((q) => q.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...patch };
    writeList(QR_HISTORY_KEY, list);
  }
}

export function deleteGuestQr(id: string): void {
  const list = readList<GuestQrItem>(QR_HISTORY_KEY).filter((q) => q.id !== id);
  writeList(QR_HISTORY_KEY, list);
}

export function duplicateGuestQr(item: GuestQrItem): void {
  addGuestQr({
    ...item,
    id: crypto.randomUUID(),
    name: `${item.name} (copy)`,
    short_id: Math.random().toString(36).slice(2, 10),
    created_at: new Date().toISOString(),
    is_favorite: false,
    scans_count: 0,
    views_count: 0,
  });
}

// ---- Landing history ----
export function getGuestLandingHistory(): GuestLandingItem[] {
  return readList<GuestLandingItem>(LANDING_HISTORY_KEY).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function addGuestLanding(item: GuestLandingItem): void {
  const list = readList<GuestLandingItem>(LANDING_HISTORY_KEY);
  list.push(item);
  writeList(LANDING_HISTORY_KEY, list);
}
