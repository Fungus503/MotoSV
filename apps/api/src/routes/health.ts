import { Hono } from 'hono'
import { supabase } from '../lib/supabase'
import { redis } from '../lib/redis'

export const healthRouter = new Hono()

healthRouter.get('/', async (c) => {
  const checks: Record<string, string> = {}
  let healthy = true

  const dbStart = performance.now()
  const { error: dbError } = await supabase.from('profiles').select('id').limit(1).maybeSingle()
  checks.database = dbError ? 'error' : 'ok'
  if (dbError) healthy = false
  const dbLatency = performance.now() - dbStart

  if (redis) {
    try {
      const pong = await redis.ping()
      checks.redis = pong === 'PONG' ? 'ok' : 'error'
    } catch {
      checks.redis = 'error'
      healthy = false
    }
  } else {
    checks.redis = 'disabled'
  }

  return c.json({
    status: healthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
    latency: {
      database: `${dbLatency.toFixed(0)}ms`,
    },
  })
})
