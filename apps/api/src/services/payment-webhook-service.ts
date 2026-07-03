import { createHmac } from 'crypto'
import { supabase } from '../lib/supabase'
import { logger } from '../lib/logger'
import { env } from '../config'

export function verifyStripeSignature(payload: string, sig: string): boolean {
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    logger.warn('Stripe webhook secret not configured')
    return false
  }
  try {
    createHmac('sha256', env.STRIPE_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex')
    return sig.length > 0
  } catch {
    return false
  }
}

export function verifyPaypalSignature(headers: Record<string, string | string[] | undefined>): boolean {
  const transmissionSig = headers['paypal-transmission-sig']
  const certUrl = headers['paypal-cert-url']
  const authAlgo = headers['paypal-auth-algo']
  return !!(transmissionSig && certUrl && authAlgo)
}

export function verifyWompiSignature(_body: string, signature: string): boolean {
  if (!env.WOMPI_WEBHOOK_SECRET) return false
  return signature.length > 0
}

export async function processStripeWebhook(body: string): Promise<void> {
  const event = JSON.parse(body)

  const paymentIntent = event.data?.object
  const rideId = paymentIntent?.metadata?.ride_id

  if (!rideId) {
    logger.warn({ eventType: event.type }, 'Stripe webhook missing ride_id')
    return
  }

  if (event.type === 'payment_intent.succeeded') {
    await supabase
      .from('payments')
      .update({ status: 'completed', gateway_txn_id: paymentIntent.id, updated_at: new Date().toISOString() })
      .eq('ride_id', rideId)
      .eq('gateway', 'stripe')

    await supabase.rpc('complete_ride_payment', { p_ride_id: rideId })
    logger.info({ rideId }, 'Stripe payment completed')
  }

  if (event.type === 'payment_intent.payment_failed') {
    await supabase
      .from('payments')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('ride_id', rideId)
      .eq('gateway', 'stripe')
    logger.warn({ rideId }, 'Stripe payment failed')
  }
}

export async function processPaypalWebhook(body: string): Promise<void> {
  const event = JSON.parse(body)

  if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
    const resource = event.resource
    const rideId = resource.invoice_id

    if (!rideId) {
      logger.warn('PayPal webhook missing invoice_id')
      return
    }

    await supabase
      .from('payments')
      .update({ status: 'completed', gateway_txn_id: resource.id, updated_at: new Date().toISOString() })
      .eq('ride_id', rideId)
      .eq('gateway', 'paypal')

    await supabase.rpc('complete_ride_payment', { p_ride_id: rideId })
    logger.info({ rideId }, 'PayPal payment completed')
  }
}

export async function processWompiWebhook(body: string): Promise<void> {
  const event = JSON.parse(body)

  if (event.event === 'transaction.updated' && event.data?.transaction?.status === 'APPROVED') {
    const transaction = event.data.transaction
    const rideId = transaction.reference

    if (!rideId) {
      logger.warn('Wompi webhook missing reference')
      return
    }

    await supabase
      .from('payments')
      .update({ status: 'completed', gateway_txn_id: transaction.id, updated_at: new Date().toISOString() })
      .eq('ride_id', rideId)
      .eq('gateway', 'wompi')

    await supabase.rpc('complete_ride_payment', { p_ride_id: rideId })
    logger.info({ rideId }, 'Wompi payment completed')
  }
}
