interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodic cleanup of expired records every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 300_000);
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  identifier: string,
  limit = 60,
  windowMs = 60_000,
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetAt) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(identifier, newRecord);
    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      resetAt: newRecord.resetAt,
    };
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  record.count += 1;
  return {
    allowed: true,
    limit,
    remaining: limit - record.count,
    resetAt: record.resetAt,
  };
}

export const RATE_LIMIT_TIERS = {
  GENERAL_API: { limit: 60, windowMs: 60_000 },
  CHECKOUT_PAYMENT: { limit: 10, windowMs: 60_000 },
  PROJECT_SUBMISSION: { limit: 5, windowMs: 60_000 },
  AUTH: { limit: 20, windowMs: 60_000 },
} as const;
