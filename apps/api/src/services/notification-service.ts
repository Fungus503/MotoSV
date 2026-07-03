import { supabase } from '../lib/supabase'
import { logger } from '../lib/logger'

export interface PushPayload {
  type: 'ride_status' | 'new_ride_request' | 'message' | 'payment'
  title: string
  body: string
  data?: Record<string, unknown>
  user_id: string
}

async function sendExpoPush(
  token: string,
  payload: { title: string; body: string; data?: Record<string, unknown> },
): Promise<boolean> {
  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        to: token,
        title: payload.title,
        body: payload.body,
        data: payload.data,
        sound: 'default',
        priority: 'high',
      }),
    })

    if (!response.ok) {
      logger.warn({ status: response.status, token }, 'Expo push failed')
      return false
    }
    return true
  } catch (error) {
    logger.error({ error, token }, 'Expo push error')
    return false
  }
}

export async function sendToUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>,
): Promise<void> {
  const { data: tokens, error } = await supabase
    .from('push_tokens')
    .select('token')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (error) {
    logger.error({ error, userId }, 'Error fetching push tokens')
    return
  }

  for (const t of tokens ?? []) {
    await sendExpoPush(t.token, { title, body, data })
  }
}

export async function processNotification(payload: PushPayload): Promise<boolean> {
  logger.info({ type: payload.type, userId: payload.user_id }, 'Processing notification')

  await sendToUser(payload.user_id, payload.title, payload.body, payload.data)

  return true
}
