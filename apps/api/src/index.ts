import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { env } from './config'
import { logger } from './lib/logger'
import { redis } from './lib/redis'
import { errorHandler, notFound } from './middleware/error'
import { healthRouter } from './routes/health'
import { rateLimit } from './middleware/rate-limit'
import { startMatchingWorker } from './workers/matching.worker'
import { startNotificationWorker } from './workers/notification.worker'
import { faresRouter } from './routes/fares'
import { notificationsRouter } from './routes/notifications'
import { paymentWebhooksRouter } from './routes/payment-webhooks'
import { ratingsRouter } from './routes/ratings'
import { driversRouter } from './routes/drivers'
import { paymentsRouter } from './routes/payments'
import { ridesRouter } from './routes/rides'

const app = new Hono()

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'apikey'],
  exposeHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
}))

app.use('*', secureHeaders())

app.onError(errorHandler)
app.notFound(notFound)

app.route('/health', healthRouter)
app.route('/api/fares', faresRouter)
app.route('/api/notifications', notificationsRouter)
app.route('/api/webhooks', paymentWebhooksRouter)
app.route('/api/ratings', ratingsRouter)
app.route('/api/drivers', driversRouter)
app.route('/api/payments', paymentsRouter)
app.route('/api/rides', ridesRouter)

app.use('/api/fares/*', rateLimit({ max: 60, windowMs: 60000 }))
app.use('/api/ratings/*', rateLimit({ max: 30, windowMs: 60000 }))
app.use('/api/drivers/*/location', rateLimit({ max: 120, windowMs: 60000 }))
app.use('/api/drivers/*/online', rateLimit({ max: 30, windowMs: 60000 }))
app.use('/api/payments/*', rateLimit({ max: 20, windowMs: 60000 }))
app.use('/api/rides', rateLimit({ max: 30, windowMs: 60000 }))
app.use('/api/rides/*/cancel', rateLimit({ max: 20, windowMs: 60000 }))
app.use('/api/rides/*/start', rateLimit({ max: 30, windowMs: 60000 }))
app.use('/api/rides/*/complete', rateLimit({ max: 30, windowMs: 60000 }))

async function main() {
  if (redis) {
    try {
      await redis.connect()
      logger.info('Redis connected')
    } catch (err) {
      logger.warn({ err }, 'Redis unavailable — running without cache/rate-limiting')
    }
  } else {
    logger.warn('Redis not configured — running without cache/rate-limiting')
  }

  if (redis) {
    startMatchingWorker()
    startNotificationWorker()
  } else {
    logger.warn('Matching + Notification workers disabled — Redis required')
  }

  logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Starting API server')

  serve({
    fetch: app.fetch,
    port: env.PORT,
  })
}

main()
