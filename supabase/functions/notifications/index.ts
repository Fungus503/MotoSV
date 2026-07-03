import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@^2.45.0"

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface PushPayload {
  type: "ride_status" | "new_ride_request" | "message" | "payment"
  title: string
  body: string
  data?: Record<string, unknown>
  user_id: string
}

async function sendExpoPush(token: string, payload: {
  title: string
  body: string
  data?: Record<string, unknown>
}): Promise<boolean> {
  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      to: token,
      title: payload.title,
      body: payload.body,
      data: payload.data,
      sound: "default",
      priority: "high",
    }),
  })

  if (!response.ok) {
    console.error(`Expo push failed: ${response.status} ${await response.text()}`)
    return false
  }

  return true
}

async function getUserPushTokens(userId: string): Promise<string[]> {
  const { data: tokens, error } = await supabase
    .from("push_tokens")
    .select("token")
    .eq("user_id", userId)
    .eq("is_active", true)

  if (error) {
    console.error(`Error fetching push tokens for user ${userId}:`, error)
    return []
  }

  return tokens?.map((t: { token: string }) => t.token) ?? []
}

async function handleRideStatusNotification(payload: PushPayload): Promise<void> {
  const tokens = await getUserPushTokens(payload.user_id)

  for (const token of tokens) {
    await sendExpoPush(token, {
      title: payload.title,
      body: payload.body,
      data: payload.data,
    })
  }
}

async function handleNewRideRequest(payload: PushPayload): Promise<void> {
  const tokens = await getUserPushTokens(payload.user_id)

  for (const token of tokens) {
    await sendExpoPush(token, {
      title: payload.title,
      body: payload.body,
      data: payload.data,
    })
  }
}

async function handleMessageNotification(payload: PushPayload): Promise<void> {
  const tokens = await getUserPushTokens(payload.user_id)

  for (const token of tokens) {
    await sendExpoPush(token, {
      title: payload.title,
      body: payload.body,
      data: payload.data,
    })
  }
}

async function handlePaymentNotification(payload: PushPayload): Promise<void> {
  const tokens = await getUserPushTokens(payload.user_id)

  for (const token of tokens) {
    await sendExpoPush(token, {
      title: payload.title,
      body: payload.body,
      data: payload.data,
    })
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  const payload: PushPayload = await req.json()

  if (!payload.type || !payload.user_id) {
    return new Response("Missing required fields: type, user_id", { status: 400 })
  }

  try {
    switch (payload.type) {
      case "ride_status":
        await handleRideStatusNotification(payload)
        break
      case "new_ride_request":
        await handleNewRideRequest(payload)
        break
      case "message":
        await handleMessageNotification(payload)
        break
      case "payment":
        await handlePaymentNotification(payload)
        break
      default:
        return new Response(`Unknown notification type: ${payload.type}`, { status: 400 })
    }

    return new Response(JSON.stringify({ sent: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Notification error:", error)
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
