export type RideStatus =
  | 'pending'
  | 'assigned'
  | 'driver_arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'payment_pending'
  | 'paid'

export type UserRole = 'rider' | 'driver' | 'admin'

export type PaymentGateway = 'stripe' | 'paypal' | 'wompi' | 'cash'

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'

export interface GeoPoint {
  lat: number
  lng: number
}

export interface Place {
  id: string
  name: string
  address: string
  location: GeoPoint
  placeId?: string
}

export interface DriverInfo {
  id: string
  fullName: string
  avatarUrl?: string
  phone?: string
  rating: number
  vehiclePlate?: string
  location: GeoPoint
  distanceMeters?: number
  etaSeconds?: number
}
