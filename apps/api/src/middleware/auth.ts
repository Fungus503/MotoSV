import type { Context, Next } from 'hono'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { env } from '../config'
import { logger } from '../lib/logger'

const JWKS_URL = new URL(`${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`)
const JWKS = createRemoteJWKSet(JWKS_URL)

export interface AuthUser {
  sub: string
  email?: string
  phone?: string
  role: string
}

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser
  }
}

export async function auth(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    logger.warn({ path: c.req.path, ip: c.req.header('x-forwarded-for') }, 'Auth: missing token')
    return c.json({ error: 'Missing or invalid Authorization header' }, 401)
  }

  const token = authHeader.slice(7)

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${env.SUPABASE_URL}/auth/v1`,
    })

    c.set('user', {
      sub: payload.sub as string,
      email: payload.email as string | undefined,
      phone: payload.phone as string | undefined,
      role: (payload.role as string) ?? 'authenticated',
    })

    await next()
  } catch (err) {
    logger.warn({ path: c.req.path }, 'Auth: invalid or expired token')
    return c.json({ error: 'Invalid or expired token' }, 401)
  }
}

export async function optionalAuth(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')

  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.slice(7)
      const { payload } = await jwtVerify(token, JWKS, {
        issuer: `${env.SUPABASE_URL}/auth/v1`,
      })
      c.set('user', {
        sub: payload.sub as string,
        email: payload.email as string | undefined,
        phone: payload.phone as string | undefined,
        role: (payload.role as string) ?? 'authenticated',
      })
    } catch {
      // Token invalid, continue without user
    }
  }

  await next()
}

export function requireRole(...roles: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user')
    if (!user || !roles.includes(user.role)) {
      logger.warn({ path: c.req.path, user: user?.sub }, 'Auth: forbidden')
      return c.json({ error: 'Forbidden' }, 403)
    }
    await next()
  }
}
