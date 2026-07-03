import { Hono } from 'hono'
import { z } from 'zod'
import { auth } from '../middleware/auth'
import { requestRide, cancelRide, startRide, completeRide } from '../services/ride-service'
import { getMatchingQueue } from '../workers/matching.worker'

export const ridesRouter = new Hono()

ridesRouter.use('*', auth)

const requestSchema = z.object({
  pickupLat: z.number().min(-90).max(90),
  pickupLng: z.number().min(-180).max(180),
  dropoffLat: z.number().min(-90).max(90),
  dropoffLng: z.number().min(-180).max(180),
  pickupAddress: z.string().min(1).max(500),
  dropoffAddress: z.string().min(1).max(500),
})

ridesRouter.post('/', async (c) => {
  const user = c.get('user')
  const body = await c.req.json()
  const parsed = requestSchema.safeParse(body)

  if (!parsed.success) {
    return c.json({ error: 'Invalid input', details: parsed.error.flatten() }, 400)
  }

  try {
    const rideId = await requestRide(parsed.data, user.sub)

    try {
      const queue = getMatchingQueue()
      await queue.add('match-ride', {
        ride_id: rideId,
        rider_id: user.sub,
        pickup_lat: parsed.data.pickupLat,
        pickup_lng: parsed.data.pickupLng,
        pickup_address: parsed.data.pickupAddress,
        dropoff_address: parsed.data.dropoffAddress,
        estimated_fare: null,
      })
    } catch (queueError) {
      // Matching queue unavailable — ride created, matching must be triggered externally
      console.warn('Matching queue unavailable:', queueError)
    }

    return c.json({ rideId }, 201)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create ride'
    return c.json({ error: message }, 400)
  }
})

const cancelSchema = z.object({
  reason: z.string().min(1).max(200),
})

ridesRouter.patch('/:id/cancel', async (c) => {
  const user = c.get('user')
  const rideId = c.req.param('id')
  const body = await c.req.json()
  const parsed = cancelSchema.safeParse(body)

  if (!parsed.success) {
    return c.json({ error: 'Invalid input' }, 400)
  }

  try {
    await cancelRide(rideId, parsed.data.reason, user.sub)
    return c.json({ success: true })
  } catch (err) {
    return c.json({ error: 'Failed to cancel ride' }, 400)
  }
})

ridesRouter.patch('/:id/start', async (c) => {
  const user = c.get('user')
  const rideId = c.req.param('id')

  try {
    await startRide(rideId, user.sub)
    return c.json({ success: true })
  } catch (err) {
    return c.json({ error: 'Failed to start ride' }, 400)
  }
})

const completeSchema = z.object({
  finalFare: z.number().positive(),
  distanceMeters: z.number().positive(),
  durationSeconds: z.number().positive(),
})

ridesRouter.patch('/:id/complete', async (c) => {
  const user = c.get('user')
  const rideId = c.req.param('id')
  const body = await c.req.json()
  const parsed = completeSchema.safeParse(body)

  if (!parsed.success) {
    return c.json({ error: 'Invalid input', details: parsed.error.flatten() }, 400)
  }

  try {
    await completeRide(rideId, parsed.data, user.sub)
    return c.json({ success: true })
  } catch (err) {
    return c.json({ error: 'Failed to complete ride' }, 400)
  }
})
