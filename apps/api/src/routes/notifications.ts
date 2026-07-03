import { Hono } from 'hono'
import { z } from 'zod'
import { auth } from '../middleware/auth'
import { rateLimit } from '../middleware/rate-limit'
import { getNotificationQueue } from '../workers/notification.worker'

export const notificationsRouter = new Hono()

notificationsRouter.use('*', auth)
notificationsRouter.use('*', rateLimit({ max: 30, windowMs: 60000 }))

const notifySchema = z.object({
  type: z.enum(['ride_status', 'new_ride_request', 'message', 'payment']),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(500),
  data: z.record(z.unknown()).optional(),
  user_id: z.string().uuid(),
})

notificationsRouter.post('/', async (c) => {
  const body = await c.req.json()
  const parsed = notifySchema.safeParse(body)

  if (!parsed.success) {
    return c.json({ error: 'Invalid input', details: parsed.error.flatten() }, 400)
  }

  try {
    const queue = getNotificationQueue()
    await queue.add('send-notification', parsed.data)
    return c.json({ queued: true }, 202)
  } catch (err) {
    return c.json({ error: 'Notification queue unavailable' }, 503)
  }
})
