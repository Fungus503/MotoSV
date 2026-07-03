import { Queue, Worker } from 'bullmq'
import { redis } from '../lib/redis'
import { logger } from '../lib/logger'
import { findNearbyDrivers, notifyDrivers, cancelRideNoDrivers, cancelRideTimeout, isRideAssigned } from '../services/matching-service'

const MATCHING_TIMEOUT_MS = 30000
const SEARCH_RADIUS_METERS = 3000
const MAX_DRIVERS_TO_NOTIFY = 10
const POLL_INTERVAL_MS = 2000

interface MatchingJobData {
  ride_id: string
  rider_id: string
  pickup_lng: number
  pickup_lat: number
  pickup_address: string | null
  dropoff_address: string | null
  estimated_fare: number | null
}

let matchingQueue: Queue | null = null
let matchingWorker: Worker | null = null

export function getMatchingQueue(): Queue {
  if (!matchingQueue) {
    if (!redis) throw new Error('Redis required for matching queue')
    matchingQueue = new Queue('matching', { connection: redis as any })
  }
  return matchingQueue
}

async function processMatchingJob(job: { data: MatchingJobData }) {
  const { ride_id, pickup_lat, pickup_lng, pickup_address, dropoff_address, estimated_fare } = job.data

  logger.info({ ride_id }, 'Matching: searching for nearby drivers')

  const drivers = await findNearbyDrivers(pickup_lng, pickup_lat, SEARCH_RADIUS_METERS)

  if (drivers.length === 0) {
    logger.info({ ride_id }, 'Matching: no drivers found')
    await cancelRideNoDrivers(ride_id)
    return { matched: false, reason: 'no_drivers' }
  }

  const topDrivers = drivers.slice(0, MAX_DRIVERS_TO_NOTIFY)
  const driverIds = topDrivers.map((d) => d.driver_id)

  logger.info({ ride_id, driverCount: topDrivers.length }, 'Matching: notifying drivers')

  await notifyDrivers(driverIds, {
    ride_id,
    pickup_address,
    dropoff_address,
    estimated_fare,
  })

  const startTime = Date.now()

  while (Date.now() - startTime < MATCHING_TIMEOUT_MS) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))

    const result = await isRideAssigned(ride_id)
    if (result === 'CANCELLED') {
      logger.info({ ride_id }, 'Matching: ride was cancelled during matching')
      return { matched: false, reason: 'cancelled' }
    }
    if (result !== null) {
      logger.info({ ride_id, driver_id: result }, 'Matching: driver accepted')
      return { matched: true, driver_id: result }
    }
  }

  logger.info({ ride_id }, 'Matching: timeout reached')
  await cancelRideTimeout(ride_id)
  return { matched: false, reason: 'timeout' }
}

export function startMatchingWorker() {
  if (matchingWorker || !redis) return

  matchingWorker = new Worker('matching', processMatchingJob as any, {
    connection: redis as any,
    concurrency: 5,
    lockDuration: MATCHING_TIMEOUT_MS + 5000,
  })

  matchingWorker.on('completed', (job) => {
    logger.info({ ride_id: job.data.ride_id, result: job.returnvalue }, 'Matching completed')
  })

  matchingWorker.on('failed', (job, err) => {
    logger.error({ ride_id: job?.data.ride_id, err }, 'Matching failed')
  })

  logger.info('Matching worker started')
}

export function stopMatchingWorker() {
  if (matchingWorker) {
    matchingWorker.close()
    matchingWorker = null
  }
}
