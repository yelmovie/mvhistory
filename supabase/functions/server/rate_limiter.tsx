/**
 * In-memory rate limiter for Supabase Edge Functions.
 *
 * Limitation: state resets on every cold start.  This is acceptable for
 * Edge Functions because the rate limit is a best-effort cost guard, not
 * a security boundary.  For stricter limiting, use Supabase DB or Redis.
 *
 * Algorithm: fixed 60-second window per IP.
 */

interface WindowEntry {
  count: number;
  windowStart: number; // ms since epoch
}

const WINDOW_MS = 60_000; // 1 minute

// Shared across requests in the same isolate lifetime
const store = new Map<string, WindowEntry>();

/**
 * Check whether the caller identified by `ip` has exceeded `limitPerMin`
 * requests in the current 60-second window.
 *
 * @returns true  = within limit (allow request)
 * @returns false = limit exceeded (return 429)
 */
export function checkRateLimit(ip: string, limitPerMin: number): boolean {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    // New window
    store.set(ip, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= limitPerMin) {
    return false; // exceeded
  }

  entry.count += 1;
  return true;
}

/**
 * Return seconds remaining in the current window for an IP.
 * Useful for Retry-After headers.
 */
export function retryAfterSeconds(ip: string): number {
  const entry = store.get(ip);
  if (!entry) return 0;
  const elapsed = Date.now() - entry.windowStart;
  return Math.max(0, Math.ceil((WINDOW_MS - elapsed) / 1000));
}

/** Periodically purge stale entries to avoid unbounded memory growth. */
export function pruneExpiredEntries(): void {
  const now = Date.now();
  for (const [ip, entry] of store.entries()) {
    if (now - entry.windowStart >= WINDOW_MS) {
      store.delete(ip);
    }
  }
}
