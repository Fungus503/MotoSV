import { Redis } from 'ioredis'
import { env } from '../config'
import { logger } from './logger'

let redis: Redis | null = null

try {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    retryStrategy(times) {
      if (times > 3) return null
      return Math.min(times * 200, 2000)
    },
    lazyConnect: true,
  })

  client.on('error', (err) => {
    logger.warn({ err }, 'Redis connection error')
  })

  redis = client
} catch {
  logger.warn('Redis client could not be created — running without cache')
}

export { redis }
