import { create } from 'zustand'

interface UIState {
  isSearchingDestination: boolean
  selectedPickup: { lat: number; lng: number; address: string } | null
  selectedDropoff: { lat: number; lng: number; address: string } | null
  setSearchingDestination: (v: boolean) => void
  setPickup: (p: { lat: number; lng: number; address: string }) => void
  setDropoff: (d: { lat: number; lng: number; address: string }) => void
  clearRoute: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isSearchingDestination: false,
  selectedPickup: null,
  selectedDropoff: null,
  setSearchingDestination: (v) => set({ isSearchingDestination: v }),
  setPickup: (p) => set({ selectedPickup: p }),
  setDropoff: (d) => set({ selectedDropoff: d }),
  clearRoute: () => set({ selectedPickup: null, selectedDropoff: null }),
}))
