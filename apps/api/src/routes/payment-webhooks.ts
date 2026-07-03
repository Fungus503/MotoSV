import { Hono } from 'hono'
import { verifyStripeSignature, verifyPaypalSignature, verifyWompiSignature, processStripeWebhook, processPaypalWebhook, processWompiWebhook } from '../services/payment-webhook-service'
import { logger } from '../lib/logger'

export const paymentWebhooksRouter = new Hono()

paymentWebhooksRouter.post('/stripe', async (c) => {
  const body = await c.req.text()
  const sig = c.req.header('stripe-signature') ?? ''

  if (!verifyStripeSignature(body, sig)) {
    logger.warn('Invalid Stripe webhook signature')
    return c.json({ error: 'Invalid signature' }, 401)
  }

  try {
    await processStripeWebhook(body)
    return c.text('OK', 200)
  } catch (err) {
    logger.error({ err }, 'Stripe webhook processing error')
    return c.json({ error: 'Internal error' }, 500)
  }
})

paymentWebhooksRouter.post('/paypal', async (c) => {
  const body = await c.req.text()
  const headers = {
    'paypal-transmission-sig': c.req.header('paypal-transmission-sig'),
    'paypal-cert-url': c.req.header('paypal-cert-url'),
    'paypal-auth-algo': c.req.header('paypal-auth-algo'),
  }

  if (!verifyPaypalSignature(headers)) {
    logger.warn('Invalid PayPal webhook signature')
    return c.json({ error: 'Invalid signature' }, 401)
  }

  try {
    await processPaypalWebhook(body)
    return c.text('OK', 200)
  } catch (err) {
    logger.error({ err }, 'PayPal webhook processing error')
    return c.json({ error: 'Internal error' }, 500)
  }
})

paymentWebhooksRouter.post('/wompi', async (c) => {
  const body = await c.req.text()
  const sig = c.req.header('x-signature') ?? ''

  if (!verifyWompiSignature(body, sig)) {
    logger.warn('Invalid Wompi webhook signature')
    return c.json({ error: 'Invalid signature' }, 401)
  }

  try {
    await processWompiWebhook(body)
    return c.text('OK', 200)
  } catch (err) {
    logger.error({ err }, 'Wompi webhook processing error')
    return c.json({ error: 'Internal error' }, 500)
  }
})
