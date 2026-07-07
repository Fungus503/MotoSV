import { Hono } from 'hono'
import { z } from 'zod'
import { auth, requireRole } from '../middleware/auth'
import { rateLimit } from '../middleware/rate-limit'
import { deleteUser } from '../services/admin-service'

export const adminRouter = new Hono()

adminRouter.use('*', auth)
adminRouter.use('*', requireRole('admin'))
adminRouter.use('*', rateLimit({ max: 10, windowMs: 60000 }))

const userIdParam = z.object({
  id: z.string().uuid(),
})

adminRouter.delete('/users/:id', async (c) => {
  const parsed = userIdParam.safeParse({ id: c.req.param('id') })

  if (!parsed.success) {
    return c.json({ error: 'Invalid user ID' }, 400)
  }

  try {
    await deleteUser(parsed.data.id)
    return c.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete user'
    return c.json({ error: message }, 500)
  }
})
