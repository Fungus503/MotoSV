import { describe, it, expect } from 'vitest'

interface Driver {
  driver_id: string
  lat: number
  lng: number
  is_online: boolean
  is_on_ride: boolean
}

interface RideRequest {
  lat: number
  lng: number
}

function simulateMatching(
  drivers: Driver[],
  request: RideRequest,
  radiusKm: number,
  maxResults: number
): string[] {
  const R = 6371
  const toRad = (deg: number) => (deg * Math.PI) / 180

  const distances = drivers
    .filter((d) => d.is_online && !d.is_on_ride)
    .map((d) => {
      const dLat = toRad(d.lat - request.lat)
      const dLng = toRad(d.lng - request.lng)
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(request.lat)) * Math.cos(toRad(d.lat)) * Math.sin(dLng / 2) ** 2
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return { driver_id: d.driver_id, distance_km: R * c }
    })
    .filter((d) => d.distance_km <= radiusKm)
    .sort((a, b) => a.distance_km - b.distance_km)
    .slice(0, maxResults)
    .map((d) => d.driver_id)

  return distances
}

describe('Matching Engine — Load Simulation', () => {
  const createDrivers = (count: number, onlinePct: number): Driver[] =>
    Array.from({ length: count }, (_, i) => ({
      driver_id: `d${i}`,
      lat: 13.6989 + (Math.random() - 0.5) * 0.1,
      lng: -89.1895 + (Math.random() - 0.5) * 0.1,
      is_online: Math.random() < onlinePct,
      is_on_ride: false,
    }))

  it('finds nearby drivers among 500 online', () => {
    const drivers = createDrivers(500, 1.0)
    const request: RideRequest = { lat: 13.6989, lng: -89.1895 }

    const start = performance.now()
    const result = simulateMatching(drivers, request, 3, 10)
    const elapsed = performance.now() - start

    expect(result.length).toBeLessThanOrEqual(10)
    expect(elapsed).toBeLessThan(50)
  })

  it('handles 100 concurrent requests', () => {
    const drivers = createDrivers(200, 0.5)
    const requests = Array.from({ length: 100 }, () => ({
      lat: 13.6989 + (Math.random() - 0.5) * 0.2,
      lng: -89.1895 + (Math.random() - 0.5) * 0.2,
    }))

    const start = performance.now()
    for (const req of requests) {
      simulateMatching(drivers, req, 5, 10)
    }
    const totalTime = performance.now() - start
    const avgTime = totalTime / requests.length

    expect(avgTime).toBeLessThan(10)
  })

  it('returns empty when no drivers online', () => {
    const drivers = createDrivers(100, 0)
    const result = simulateMatching(drivers, { lat: 13.7, lng: -89.19 }, 3, 10)
    expect(result).toHaveLength(0)
  })

  it('prioritizes closest drivers', () => {
    const drivers = [
      { driver_id: 'far', lat: 13.8, lng: -89.2, is_online: true, is_on_ride: false },
      { driver_id: 'close', lat: 13.699, lng: -89.19, is_online: true, is_on_ride: false },
    ]
    const result = simulateMatching(drivers, { lat: 13.6989, lng: -89.1895 }, 50, 5)
    expect(result[0]).toBe('close')
  })
})
