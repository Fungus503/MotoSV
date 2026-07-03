import { Hono } from 'hono'
import { z } from 'zod'
import { auth } from '../middleware/auth'
import { createPayment } from '../services/payment-service'

export const paymentsRouter = new Hono()

paymentsRouter.use('*', auth)

const createSchema = z.object({
  rideId: z.string().uuid(),
  gateway: z.enum(['stripe', 'paypal', 'wompi', 'cash']),
  amount: z.number().positive(),
})

paymentsRouter.post('/', async (c) => {
  const body = await c.req.json()
  const parsed = createSchema.safeParse(body)

  if (!parsed.success) {
    return c.json({ error: 'Invalid input', details: parsed.error.flatten() }, 400)
  }

  try {
    const paymentId = await createPayment(parsed.data)
    return c.json({ paymentId }, 201)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create payment'
    return c.json({ error: message }, 400)
  }
})
