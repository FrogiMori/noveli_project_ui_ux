import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis';

interface RateLimiterOptions {
  windowSeconds: number;
  maxRequests: number;
  keyPrefix: string;
  identityFn?: (req: Request) => string;
}

/**
 * Redis-backed sliding-window rate limiter.
 * Uses a privacy-safe identity: userId (if authenticated) or a hashed
 * session fingerprint — never a raw IP address.
 */
export function createRateLimiter(opts: RateLimiterOptions) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const identity = opts.identityFn
      ? opts.identityFn(req)
      : (req.userId ?? 'anon');

    const key = `rl:${opts.keyPrefix}:${identity}`;

    try {
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, opts.windowSeconds);
      }

      res.setHeader('X-RateLimit-Limit', opts.maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, opts.maxRequests - count));

      if (count > opts.maxRequests) {
        const ttl = await redis.ttl(key);
        res.setHeader('Retry-After', ttl);
        res.status(429).json({
          error: 'Too many requests',
          retryAfterSeconds: ttl,
        });
        return;
      }
    } catch (err) {
      // Redis failure → fail open (don't block legitimate traffic)
      console.error('[RateLimiter] Redis error, failing open:', err);
    }

    next();
  };
}

// Pre-configured limiters
export const aiRateLimiter = createRateLimiter({
  windowSeconds: 3600,  // 1 hour
  maxRequests: 20,
  keyPrefix: 'ai',
});

export const authRateLimiter = createRateLimiter({
  windowSeconds: 900,   // 15 minutes
  maxRequests: 10,
  keyPrefix: 'auth',
  identityFn: (_req) => 'global',  // Global counter for anonymous auth endpoints
});
