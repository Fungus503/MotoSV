import { describe, it, expect } from 'vitest'

interface DriverInfo {
  driver_id: string
  full_name: string
  distance_meters: number
  heading: number | null
}

function findNearbyDrivers(
  drivers: DriverInfo[],
  radiusMeters: number,
  maxResults: number
): DriverInfo[] {
  return drivers
    .filter((d) => d.distance_meters <= radiusMeters)
    .sort((a, b) => a.distance_meters - b.distance_meters)
    .slice(0, maxResults)
}

function waitForDriverAcceptance(
  startTime: number,
  timeoutMs: number,
  currentTime: number,
  rideStatus: string | null,
  driverId: string | null
): string | null {
  if (currentTime - startTime >= timeoutMs) {
    return null
  }

  if (rideStatus === 'assigned' && driverId) {
    return driverId
  }

  if (rideStatus === 'cancelled') {
    return null
  }

  return null
}

describe('Matching Engine Logic', () => {
  const mockDrivers: DriverInfo[] = [
    { driver_id: 'd1', full_name: 'Driver Uno', distance_meters: 200, heading: 90 },
    { driver_id: 'd2', full_name: 'Driver Dos', distance_meters: 500, heading: 180 },
    { driver_id: 'd3', full_name: 'Driver Tres', distance_meters: 1500, heading: 0 },
    { driver_id: 'd4', full_name: 'Driver Cuatro', distance_meters: 3000, heading: 270 },
    { driver_id: 'd5', full_name: 'Driver Cinco', distance_meters: 5000, heading: null },
  ]

  describe('findNearbyDrivers', () => {
    it('filters drivers within radius and sorts by distance', () => {
      const result = findNearbyDrivers(mockDrivers, 1000, 10)
      expect(result).toHaveLength(2)
      expect(result[0].driver_id).toBe('d1')
      expect(result[1].driver_id).toBe('d2')
    })

    it('returns empty array when no drivers within radius', () => {
      const result = findNearbyDrivers(mockDrivers, 100, 10)
      expect(result).toHaveLength(0)
    })

    it('limits results to maxResults', () => {
      const closeDrivers = mockDrivers.map((d) => ({
        ...d,
        distance_meters: Math.min(d.distance_meters, 2000),
      }))
      const result = findNearbyDrivers(closeDrivers, 2000, 2)
      expect(result).toHaveLength(2)
      expect(result[0].driver_id).toBe('d1')
      expect(result[1].driver_id).toBe('d2')
    })

    it('returns all drivers when maxResults exceeds count', () => {
      const result = findNearbyDrivers(mockDrivers, 10000, 100)
      expect(result).toHaveLength(5)
    })

    it('handles empty driver list', () => {
      const result = findNearbyDrivers([], 1000, 10)
      expect(result).toHaveLength(0)
    })
  })

  describe('waitForDriverAcceptance', () => {
    const startTime = 0
    const timeoutMs = 30000

    it('returns driverId when ride is assigned', () => {
      const result = waitForDriverAcceptance(startTime, timeoutMs, 5000, 'assigned', 'd1')
      expect(result).toBe('d1')
    })

    it('returns null when ride is cancelled', () => {
      const result = waitForDriverAcceptance(startTime, timeoutMs, 5000, 'cancelled', null)
      expect(result).toBeNull()
    })

    it('returns null on timeout', () => {
      const result = waitForDriverAcceptance(startTime, timeoutMs, 35000, 'pending', null)
      expect(result).toBeNull()
    })

    it('returns null when ride is pending and no driver assigned', () => {
      const result = waitForDriverAcceptance(startTime, timeoutMs, 5000, 'pending', null)
      expect(result).toBeNull()
    })
  })
})
