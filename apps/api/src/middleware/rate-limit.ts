import type { Context, Next } from 'hono'
import { redis } from '../lib/redis'

interface RateLimitConfig {
  max: number
  windowMs: number
}

const DEFAULTS: RateLimitConfig = { max: 30, windowMs: 60000 }

export function rateLimit(config: Partial<RateLimitConfig> = {}) {
  const { max, windowMs } = { ...DEFAULTS, ...config }

  return async (c: Context, next: Next) => {
    const identifier = c.get('user')?.sub ?? c.req.header('x-forwarded-for') ?? 'anonymous'
    const key = `ratelimit:${identifier}:${c.req.path}`

    if (!redis) {
      return next()
    }

    try {
      const current = await redis.incr(key)

      if (current === 1) {
        await redis.pexpire(key, windowMs)
      }

      const remaining = Math.max(0, max - current)
      c.header('X-RateLimit-Limit', max.toString())
      c.header('X-RateLimit-Remaining', remaining.toString())

      if (current > max) {
        return c.json({ error: 'Too many requests' }, 429)
      }
    } catch {
      // Redis unavailable — allow request through
    }

    await next()
  }
}
