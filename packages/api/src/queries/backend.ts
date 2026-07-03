import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiPost, apiPatch } from '../lib/backend-client'

export function useRequestRide() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: {
      pickupLat: number
      pickupLng: number
      dropoffLat: number
      dropoffLng: number
      pickupAddress: string
      dropoffAddress: string
    }) => {
      const result = await apiPost<{ rideId: string }>('/api/rides', params)
      return result.rideId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-ride'] })
    },
  })
}

export function useCancelRide() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: { ride_id: string; reason: string }) => {
      await apiPatch(`/api/rides/${params.ride_id}/cancel`, { reason: params.reason })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-ride'] })
      queryClient.invalidateQueries({ queryKey: ['ride-history'] })
    },
  })
}

export function useStartRide() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (rideId: string) => {
      await apiPatch(`/api/rides/${rideId}/start`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-ride'] })
    },
  })
}

export function useCompleteRide() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: {
      ride_id: string
      final_fare: number
      distance_meters: number
      duration_seconds: number
    }) => {
      await apiPatch(`/api/rides/${params.ride_id}/complete`, {
        finalFare: params.final_fare,
        distanceMeters: params.distance_meters,
        durationSeconds: params.duration_seconds,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-ride'] })
      queryClient.invalidateQueries({ queryKey: ['ride-history'] })
    },
  })
}

export function useUpdateDriverLocation() {
  return useMutation({
    mutationFn: async (params: {
      driver_id: string
      lat: number
      lng: number
      heading?: number
      speed?: number
    }) => {
      await apiPatch(`/api/drivers/${params.driver_id}/location`, {
        lat: params.lat,
        lng: params.lng,
        heading: params.heading,
        speed: params.speed,
      })
    },
  })
}

export function useSetDriverOnline() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: { driver_id: string; is_online: boolean }) => {
      await apiPatch(`/api/drivers/${params.driver_id}/online`, { isOnline: params.is_online })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-location'] })
    },
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: {
      ride_id: string
      gateway: string
      amount: number
    }) => {
      const result = await apiPost<{ paymentId: string }>('/api/payments', {
        rideId: params.ride_id,
        gateway: params.gateway,
        amount: params.amount,
      })
      return result.paymentId
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['payment', vars.ride_id] })
    },
  })
}

export function useRateRide() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: {
      ride_id: string
      rating: number
      comment?: string
    }) => {
      await apiPost('/api/ratings', {
        rideId: params.ride_id,
        rating: params.rating,
        comment: params.comment,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ride-history'] })
    },
  })
}

export function useCalculateFare() {
  return useMutation({
    mutationFn: async (params: {
      pickupLat: number
      pickupLng: number
      dropoffLat: number
      dropoffLng: number
    }) => {
      return apiPost<{
        distanceMeters: number
        durationSeconds: number
        estimatedFare: number
        surgeMultiplier: number
      }>('/api/fares/calculate', params)
    },
  })
}
