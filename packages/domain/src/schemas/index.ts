import { z } from 'zod'
import { PAYMENT_GATEWAYS, RIDE_STATUSES, USER_ROLES } from '../constants'

export const phoneSchema = z.string().regex(/^\+?[1-9]\d{6,14}$/, 'Invalid phone number')

export const geopointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

export const requestRideSchema = z.object({
  pickupLat: z.number().min(-90).max(90),
  pickupLng: z.number().min(-180).max(180),
  dropoffLat: z.number().min(-90).max(90),
  dropoffLng: z.number().min(-180).max(180),
  pickupAddress: z.string().min(1).max(500),
  dropoffAddress: z.string().min(1).max(500),
})

export const updateProfileSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  avatarUrl: z.string().url().optional(),
})

export const rateRideSchema = z.object({
  rideId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
})

export const createPaymentSchema = z.object({
  rideId: z.string().uuid(),
  gateway: z.enum(PAYMENT_GATEWAYS),
  amount: z.number().positive(),
})

export const envSchema = z.object({
  EXPO_PUBLIC_SUPABASE_URL: z.string().url(),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().min(1),
  EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  EXPO_PUBLIC_SENTRY_DSN: z.string().url().optional(),
})

export type RequestRideInput = z.infer<typeof requestRideSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type RateRideInput = z.infer<typeof rateRideSchema>
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>
export type EnvConfig = z.infer<typeof envSchema>
