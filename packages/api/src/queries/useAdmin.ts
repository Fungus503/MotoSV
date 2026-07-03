import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useZones() {
  return useQuery({
    queryKey: ['zones'],
    queryFn: async () => {
      const { data, error } = await supabase.from('zones').select('*').order('name')
      if (error) throw error; return data ?? []
    },
  })
}

export function useCreateZone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vals: { name: string; slug: string; description?: string; center_lat?: number; center_lng?: number }) => {
      const center = vals.center_lat && vals.center_lng
        ? ST_SetSRID(ST_MakePoint(vals.center_lng, vals.center_lat), 4326)
        : undefined
      const { error } = await supabase.rpc('create_zone' as never, {
        p_name: vals.name, p_slug: vals.slug, p_description: vals.description ?? null,
        p_lat: vals.center_lat ?? null, p_lng: vals.center_lng ?? null,
      } as never)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['zones'] }),
  })
}

export function useDeleteZone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('zones').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['zones'] }),
  })
}

export function useVehicleTypes() {
  return useQuery({
    queryKey: ['vehicle-types'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vehicle_types').select('*').order('name')
      if (error) throw error; return data ?? []
    },
  })
}

export function useCreateVehicleType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vals: { name: string; slug: string; description?: string; icon?: string; capacity: number; luggage_capacity?: number }) => {
      const { error } = await supabase.from('vehicle_types').insert(vals)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicle-types'] }),
  })
}

export function useDeleteVehicleType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vehicle_types').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicle-types'] }),
  })
}

export function useDriverVehicles() {
  return useQuery({
    queryKey: ['driver-vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('driver_vehicles')
        .select('*, driver:driver_id(full_name, phone), vehicle:vehicle_type_id(name)')
        .order('created_at', { ascending: false })
      if (error) throw error; return data ?? []
    },
  })
}

export function useVerifyDriverVehicle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, is_verified }: { id: string; is_verified: boolean }) => {
      const { error } = await supabase.from('driver_vehicles').update({ is_verified }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['driver-vehicles'] }),
  })
}
