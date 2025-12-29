import { kv } from "@vercel/kv";

export interface Paste {
  id: string;
  content: string;
  createdAt: number;
  expiresAt: number | null; // timestamp in milliseconds
  maxViews: number | null;
  viewCount: number;
}

const PASTE_PREFIX = "paste:";
const TTL_PREFIX = "ttl:";

/**
 * Get the current time, respecting TEST_MODE and x-test-now-ms header
 */
export function getCurrentTime(testNowMs?: string | null): number {
  if (process.env.TEST_MODE === "1" && testNowMs) {
    const parsed = parseInt(testNowMs, 10);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  return Date.now();
}

/**
 * Create a paste in KV storage
 */
export async function createPaste(
  paste: Omit<Paste, "viewCount">,
  testNowMs?: string | null
): Promise<string> {
  const now = getCurrentTime(testNowMs);
  const pasteData: Paste = {
    ...paste,
    viewCount: 0,
  };

  const key = `${PASTE_PREFIX}${paste.id}`;
  await kv.set(key, pasteData);

  // If TTL is set, also store a reference for cleanup (optional, but helps)
  if (paste.expiresAt) {
    const ttlKey = `${TTL_PREFIX}${paste.id}`;
    const ttlSeconds = Math.max(1, Math.ceil((paste.expiresAt - now) / 1000));
    await kv.set(ttlKey, paste.id, { ex: ttlSeconds });
  }

  return paste.id;
}

/**
 * Get a paste from KV storage
 */
export async function getPaste(id: string): Promise<Paste | null> {
  const key = `${PASTE_PREFIX}${id}`;
  const paste = await kv.get<Paste>(key);
  return paste;
}

/**
 * Check if a paste is available (not expired, not exceeded view limit)
 */
export function isPasteAvailable(
  paste: Paste,
  testNowMs?: string | null
): boolean {
  const now = getCurrentTime(testNowMs);

  // Check TTL
  if (paste.expiresAt !== null && now >= paste.expiresAt) {
    return false;
  }

  // Check view limit
  if (paste.maxViews !== null && paste.viewCount >= paste.maxViews) {
    return false;
  }

  return true;
}

/**
 * Increment view count for a paste
 */
export async function incrementViewCount(id: string): Promise<void> {
  const key = `${PASTE_PREFIX}${id}`;
  const paste = await kv.get<Paste>(key);
  
  if (paste) {
    paste.viewCount += 1;
    await kv.set(key, paste);
  }
}

/**
 * Delete a paste
 */
export async function deletePaste(id: string): Promise<void> {
  const key = `${PASTE_PREFIX}${id}`;
  const ttlKey = `${TTL_PREFIX}${id}`;
  await kv.del(key);
  await kv.del(ttlKey);
}
