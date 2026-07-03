import { Hono } from 'hono'
import { z } from 'zod'
import { auth } from '../middleware/auth'
import { createRatingAs } from '../services/rating-service'

export const ratingsRouter = new Hono()

ratingsRouter.use('*', auth)

const createSchema = z.object({
  rideId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
})

ratingsRouter.post('/', async (c) => {
  const user = c.get('user')
  const body = await c.req.json()
  const parsed = createSchema.safeParse(body)

  if (!parsed.success) {
    return c.json({ error: 'Invalid input', details: parsed.error.flatten() }, 400)
  }

  try {
    await createRatingAs(parsed.data, user.sub)
    return c.json({ success: true }, 201)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create rating'
    return c.json({ error: message }, 400)
  }
})
