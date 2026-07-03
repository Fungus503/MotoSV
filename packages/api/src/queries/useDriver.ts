import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../client'

export function useDriverLocation(userId: string | undefined) {
  return useQuery({
    queryKey: ['driver-location', userId],
    queryFn: async () => {
      if (!userId) return null
      const { data, error } = await supabase
        .from('driver_locations')
        .select('*')
        .eq('driver_id', userId)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return data
    },
    enabled: !!userId,
    refetchInterval: 10000,
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
      const { error } = await supabase.rpc('update_driver_location' as never, params as never)
      if (error) throw error
    },
  })
}

export function useSetDriverOnline() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: { driver_id: string; is_online: boolean }) => {
      const { error } = await supabase.rpc('set_driver_online' as never, params as never)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-location'] })
    },
  })
}

export function useDriverDocuments(driverId: string | undefined) {
  return useQuery({
    queryKey: ['driver-documents', driverId],
    queryFn: async () => {
      if (!driverId) return []
      const { data, error } = await supabase
        .from('driver_documents')
        .select('*')
        .eq('driver_id', driverId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    enabled: !!driverId,
  })
}

export function useDriverEarnings(driverId: string | undefined) {
  return useQuery({
    queryKey: ['driver-earnings', driverId],
    queryFn: async () => {
      if (!driverId) return { total: 0, trips: 0, today: 0, weekly: 0 }
      const { data: trips, error } = await supabase
        .from('rides')
        .select('final_fare, created_at')
        .eq('driver_id', driverId)
        .eq('status', 'paid')
      if (error) throw error
      const today = new Date().toISOString().slice(0, 10)
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
      return {
        total: (trips ?? []).reduce((s, t) => s + Number(t.final_fare ?? 0), 0),
        trips: (trips ?? []).length,
        today: (trips ?? [])
          .filter((t) => t.created_at?.startsWith(today))
          .reduce((s, t) => s + Number(t.final_fare ?? 0), 0),
        weekly: (trips ?? [])
          .filter((t) => t.created_at && t.created_at >= weekAgo)
          .reduce((s, t) => s + Number(t.final_fare ?? 0), 0),
      }
    },
    enabled: !!driverId,
  })
}

export function useDriverActiveRide(driverId: string | undefined) {
  return useQuery({
    queryKey: ['driver-active-ride', driverId],
    queryFn: async () => {
      if (!driverId) return null
      const { data, error } = await supabase
        .from('rides')
        .select('*, rider:rider_id(full_name, avatar_url, phone)')
        .eq('driver_id', driverId)
        .in('status', ['assigned', 'driver_arrived', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return data
    },
    enabled: !!driverId,
    refetchInterval: 5000,
  })
}
