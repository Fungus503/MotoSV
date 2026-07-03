import type { Context } from 'hono'
import { logger } from '../lib/logger'
import { env } from '../config'

export function errorHandler(err: Error, c: Context) {
  logger.error({ err, path: c.req.path, method: c.req.method }, 'Unhandled error')

  return c.json(
    {
      error: 'Internal server error',
      ...(env.NODE_ENV === 'development' && { message: err.message }),
    },
    500,
  )
}

export function notFound(c: Context) {
  return c.json({ error: 'Not found' }, 404)
}
