import { createHash } from "crypto";

// Best-effort in-memory sliding-window limiter. It is per-serverless-instance (not shared across cold
// starts), so it throttles bursts rather than guaranteeing a global cap. It pairs with the honeypot and
// server-side validation on the public lead endpoint. For a durable, cross-instance limit, swap the
// `buckets` map for Upstash Redis (`@upstash/ratelimit`) behind the same `checkRateLimit` signature.

const buckets = new Map<string, number[]>();
const MAX_TRACKED_KEYS = 5000;

/**
 * Returns true if the action is allowed, false if the caller has exceeded `limit` within `windowMs`.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number, now: number = Date.now()): boolean {
  const recent = (buckets.get(key) ?? []).filter((timestamp) => now - timestamp < windowMs);

  if (recent.length >= limit) {
    buckets.set(key, recent);
    return false;
  }

  recent.push(now);
  buckets.set(key, recent);

  if (buckets.size > MAX_TRACKED_KEYS) {
    pruneExpired(now, windowMs);
  }

  return true;
}

// Hash the client identifier so we never retain raw IPs in process memory.
export function hashIdentifier(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function pruneExpired(now: number, windowMs: number) {
  buckets.forEach((timestamps, key) => {
    const fresh = timestamps.filter((timestamp) => now - timestamp < windowMs);

    if (fresh.length === 0) {
      buckets.delete(key);
    } else {
      buckets.set(key, fresh);
    }
  });
}
