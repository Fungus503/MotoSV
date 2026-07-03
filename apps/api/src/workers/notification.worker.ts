import { Queue, Worker } from 'bullmq'
import { redis } from '../lib/redis'
import { logger } from '../lib/logger'
import { processNotification, type PushPayload } from '../services/notification-service'

let notificationQueue: Queue | null = null
let notificationWorker: Worker | null = null

export function getNotificationQueue(): Queue {
  if (!notificationQueue) {
    if (!redis) throw new Error('Redis required for notification queue')
    notificationQueue = new Queue('notifications', { connection: redis as any })
  }
  return notificationQueue
}

async function processNotificationJob(job: { data: PushPayload }) {
  await processNotification(job.data)
  return { sent: true }
}

export function startNotificationWorker() {
  if (notificationWorker || !redis) return

  notificationWorker = new Worker('notifications', processNotificationJob as any, {
    connection: redis as any,
    concurrency: 10,
  })

  notificationWorker.on('completed', (job) => {
    logger.debug({ userId: job.data.user_id, type: job.data.type }, 'Notification sent')
  })

  notificationWorker.on('failed', (job, err) => {
    logger.error({ userId: job?.data.user_id, err }, 'Notification failed')
  })

  logger.info('Notification worker started')
}

export function stopNotificationWorker() {
  if (notificationWorker) {
    notificationWorker.close()
    notificationWorker = null
  }
}
