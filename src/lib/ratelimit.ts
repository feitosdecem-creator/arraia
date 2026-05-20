// Simple in-memory rate limiter.
// Persists within warm Lambda instances on Vercel.
// For fully distributed rate limiting, replace with Upstash Redis.

type Entry = { count: number; resetAt: number }
const store = new Map<string, Entry>()

function getIp(req: { headers: { get(k: string): string | null } }): string {
  const forwarded = req.headers.get('x-forwarded-for')
  return (forwarded?.split(',')[0] ?? 'unknown').trim()
}

function check(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now()

  // Lazy cleanup to prevent unbounded growth
  if (store.size > 10_000) {
    for (const [k, v] of store) {
      if (v.resetAt < now) store.delete(k)
    }
  }

  const entry = store.get(key)
  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterMs: 0 }
  }
  if (entry.count >= limit) {
    return { allowed: false, retryAfterMs: entry.resetAt - now }
  }
  entry.count++
  return { allowed: true, retryAfterMs: 0 }
}

export function rateLimitIp(
  req: { headers: { get(k: string): string | null } },
  scope: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterMs: number } {
  return check(`${scope}:${getIp(req)}`, limit, windowMs)
}

export function rateLimitKey(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterMs: number } {
  return check(key, limit, windowMs)
}
