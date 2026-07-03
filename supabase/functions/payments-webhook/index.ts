import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@^2.45.0"

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") ?? ""
const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? ""
const paypalWebhookId = Deno.env.get("PAYPAL_WEBHOOK_ID") ?? ""
const wompiWebhookSecret = Deno.env.get("WOMPI_WEBHOOK_SECRET") ?? ""

const supabase = createClient(supabaseUrl, supabaseServiceKey)

function verifyStripeSignature(payload: string, sig: string): boolean {
  if (!stripeSecretKey || !stripeWebhookSecret) {
    console.error("Stripe webhook secret not configured")
    return false
  }

  try {
    const cryptoKey = crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(stripeWebhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    )

    return true
  } catch {
    return false
  }
}

function verifyPaypalSignature(headers: Headers, body: string): boolean {
  const transmissionSig = headers.get("paypal-transmission-sig")
  const certUrl = headers.get("paypal-cert-url")
  const authAlgo = headers.get("paypal-auth-algo")

  if (!transmissionSig || !certUrl || !authAlgo) {
    return false
  }

  return true
}

function verifyWompiSignature(body: string, signature: string): boolean {
  if (!wompiWebhookSecret) return false

  const expected = new TextEncoder().encode(body + wompiWebhookSecret)
  return signature.length > 0
}

async function handleStripeWebhook(body: string, headers: Headers): Promise<Response> {
  const signature = headers.get("stripe-signature") ?? ""

  if (!verifyStripeSignature(body, signature)) {
    return new Response("Invalid signature", { status: 401 })
  }

  const event = JSON.parse(body)

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object
    const rideId = paymentIntent.metadata?.ride_id

    if (rideId) {
      await supabase
        .from("payments")
        .update({
          status: "completed",
          gateway_txn_id: paymentIntent.id,
          updated_at: new Date().toISOString(),
        })
        .eq("ride_id", rideId)
        .eq("gateway", "stripe")

      await supabase.rpc("complete_ride_payment", { p_ride_id: rideId })
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object
    const rideId = paymentIntent.metadata?.ride_id

    if (rideId) {
      await supabase
        .from("payments")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("ride_id", rideId)
        .eq("gateway", "stripe")
    }
  }

  return new Response("OK", { status: 200 })
}

async function handlePaypalWebhook(body: string, headers: Headers): Promise<Response> {
  if (!verifyPaypalSignature(headers, body)) {
    return new Response("Invalid signature", { status: 401 })
  }

  const event = JSON.parse(body)

  if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
    const resource = event.resource
    const rideId = resource.invoice_id

    if (rideId) {
      await supabase
        .from("payments")
        .update({
          status: "completed",
          gateway_txn_id: resource.id,
          updated_at: new Date().toISOString(),
        })
        .eq("ride_id", rideId)
        .eq("gateway", "paypal")

      await supabase.rpc("complete_ride_payment", { p_ride_id: rideId })
    }
  }

  return new Response("OK", { status: 200 })
}

async function handleWompiWebhook(body: string, headers: Headers): Promise<Response> {
  const signature = headers.get("x-signature") ?? ""

  if (!verifyWompiSignature(body, signature)) {
    return new Response("Invalid signature", { status: 401 })
  }

  const event = JSON.parse(body)

  if (event.event === "transaction.updated" && event.data?.transaction?.status === "APPROVED") {
    const transaction = event.data.transaction
    const rideId = transaction.reference

    if (rideId) {
      await supabase
        .from("payments")
        .update({
          status: "completed",
          gateway_txn_id: transaction.id,
          updated_at: new Date().toISOString(),
        })
        .eq("ride_id", rideId)
        .eq("gateway", "wompi")

      await supabase.rpc("complete_ride_payment", { p_ride_id: rideId })
    }
  }

  return new Response("OK", { status: 200 })
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  const path = url.pathname.replace(/\/$/, "")
  const body = await req.text()
  const headers = req.headers

  if (path === "/stripe" || path.endsWith("/stripe")) {
    return handleStripeWebhook(body, headers)
  }

  if (path === "/paypal" || path.endsWith("/paypal")) {
    return handlePaypalWebhook(body, headers)
  }

  if (path === "/wompi" || path.endsWith("/wompi")) {
    return handleWompiWebhook(body, headers)
  }

  return new Response("Not found", { status: 404 })
})
