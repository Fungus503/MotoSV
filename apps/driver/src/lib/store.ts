import { create } from 'zustand'

interface DriverUIState {
  isOnline: boolean
  currentRideId: string | null
  setIsOnline: (v: boolean) => void
  setCurrentRideId: (id: string | null) => void
}

export const useDriverUIStore = create<DriverUIState>((set) => ({
  isOnline: false,
  currentRideId: null,
  setIsOnline: (v) => set({ isOnline: v }),
  setCurrentRideId: (id) => set({ currentRideId: id }),
}))
