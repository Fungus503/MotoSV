import { Hono } from 'hono'
import { z } from 'zod'
import { auth } from '../middleware/auth'
import { calculateFare } from '../services/fare-service'

export const faresRouter = new Hono()

faresRouter.use('*', auth)

const calculateSchema = z.object({
  pickupLat: z.number().min(-90).max(90),
  pickupLng: z.number().min(-180).max(180),
  dropoffLat: z.number().min(-90).max(90),
  dropoffLng: z.number().min(-180).max(180),
})

faresRouter.post('/calculate', async (c) => {
  const body = await c.req.json()
  const parsed = calculateSchema.safeParse(body)

  if (!parsed.success) {
    return c.json({ error: 'Invalid input', details: parsed.error.flatten() }, 400)
  }

  const result = await calculateFare(parsed.data)
  return c.json(result)
})
