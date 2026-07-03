import { Hono } from 'hono'
import { z } from 'zod'
import { auth } from '../middleware/auth'
import { getDriverLocation, updateDriverLocation, setDriverOnline, findNearbyDrivers } from '../services/driver-service'

export const driversRouter = new Hono()

driversRouter.use('*', auth)

driversRouter.get('/nearby', async (c) => {
  const lat = c.req.query('lat')
  const lng = c.req.query('lng')
  const radius = c.req.query('radius')

  if (!lat || !lng) {
    return c.json({ error: 'lat and lng query params required' }, 400)
  }

  const pLat = parseFloat(lat)
  const pLng = parseFloat(lng)
  const pRadius = radius ? parseInt(radius, 10) : 3000

  if (isNaN(pLat) || isNaN(pLng)) {
    return c.json({ error: 'Invalid lat/lng values' }, 400)
  }

  try {
    const drivers = await findNearbyDrivers(pLat, pLng, pRadius)
    return c.json(drivers)
  } catch (err) {
    return c.json({ error: 'Failed to find nearby drivers' }, 500)
  }
})

driversRouter.get('/:id/location', async (c) => {
  const driverId = c.req.param('id')

  const location = await getDriverLocation(driverId)

  if (!location) {
    return c.json({ error: 'Driver location not found' }, 404)
  }

  return c.json(location)
})

const updateLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  heading: z.number().optional(),
  speed: z.number().optional(),
})

driversRouter.patch('/:id/location', async (c) => {
  const driverId = c.req.param('id')
  const user = c.get('user')

  if (user.sub !== driverId) {
    return c.json({ error: 'You can only update your own location' }, 403)
  }

  const body = await c.req.json()
  const parsed = updateLocationSchema.safeParse(body)

  if (!parsed.success) {
    return c.json({ error: 'Invalid input', details: parsed.error.flatten() }, 400)
  }

  try {
    await updateDriverLocation(driverId, parsed.data)
    return c.json({ success: true })
  } catch (err) {
    return c.json({ error: 'Failed to update location' }, 500)
  }
})

const onlineSchema = z.object({
  isOnline: z.boolean(),
})

driversRouter.patch('/:id/online', async (c) => {
  const driverId = c.req.param('id')
  const user = c.get('user')

  if (user.sub !== driverId) {
    return c.json({ error: 'You can only update your own status' }, 403)
  }

  const body = await c.req.json()
  const parsed = onlineSchema.safeParse(body)

  if (!parsed.success) {
    return c.json({ error: 'Invalid input' }, 400)
  }

  try {
    await setDriverOnline(driverId, parsed.data.isOnline)
    return c.json({ success: true })
  } catch (err) {
    return c.json({ error: 'Failed to update online status' }, 500)
  }
})
