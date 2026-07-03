import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@^2.45.0"

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const MATCHING_TIMEOUT_MS = 30000
const SEARCH_RADIUS_METERS = 3000
const MAX_DRIVERS_TO_NOTIFY = 10

interface RideEvent {
  type: "INSERT"
  table: string
  schema: string
  new: {
    id: string
    rider_id: string
    pickup_location: { coordinates: [number, number] }
    pickup_address: string | null
    dropoff_address: string | null
    estimated_fare: number | null
    created_at: string
  }
}

interface DriverInfo {
  driver_id: string
  full_name: string
  distance_meters: number
  heading: number | null
}

async function findNearbyDrivers(
  lng: number,
  lat: number,
  radiusMeters: number
): Promise<DriverInfo[]> {
  const { data, error } = await supabase.rpc("find_nearby_drivers", {
    p_lng: lng,
    p_lat: lat,
    p_radius_meters: radiusMeters,
  })

  if (error) {
    console.error("Error finding nearby drivers:", error)
    return []
  }

  return (data as DriverInfo[]) ?? []
}

async function notifyDriver(
  driverId: string,
  rideInfo: {
    ride_id: string
    pickup_address: string | null
    dropoff_address: string | null
    estimated_fare: number | null
  }
): Promise<void> {
  const { error } = await supabase
    .channel(`driver:${driverId}:requests`)
    .send({
      type: "broadcast",
      event: "new_ride_request",
      payload: rideInfo,
    })

  if (error) {
    console.error(`Error notifying driver ${driverId}:`, error)
  }
}

async function waitForDriverAcceptance(
  rideId: string,
  driverIds: string[],
  timeoutMs: number
): Promise<string | null> {
  const startTime = Date.now()
  const pollInterval = 1000

  while (Date.now() - startTime < timeoutMs) {
    await new Promise((r) => setTimeout(r, pollInterval))

    const { data: ride } = await supabase
      .from("rides")
      .select("status, driver_id")
      .eq("id", rideId)
      .single()

    if (ride?.status === "assigned" && ride.driver_id) {
      return ride.driver_id
    }

    const { data: cancelled } = await supabase
      .from("rides")
      .select("status")
      .eq("id", rideId)
      .single()

    if (cancelled?.status === "cancelled") {
      return null
    }
  }

  return null
}

Deno.serve(async (req: Request) => {
  if (req.method === "POST") {
    const event: RideEvent = await req.json()

    if (event.type !== "INSERT" || event.table !== "rides") {
      return new Response("Ignored", { status: 200 })
    }

    const ride = event.new
    const [lng, lat] = ride.pickup_location.coordinates

    console.log(`New ride ${ride.id} at [${lat}, ${lng}], searching for drivers...`)

    const drivers = await findNearbyDrivers(lng, lat, SEARCH_RADIUS_METERS)

    if (drivers.length === 0) {
      console.log(`No drivers found near ride ${ride.id}`)
      await supabase
        .from("rides")
        .update({ status: "cancelled", cancel_reason: "no_drivers_available" })
        .eq("id", ride.id)

      return new Response(JSON.stringify({ matched: false, reason: "no_drivers" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    const topDrivers = drivers.slice(0, MAX_DRIVERS_TO_NOTIFY)
    const driverIds = topDrivers.map((d) => d.driver_id)

    for (const driver of topDrivers) {
      await notifyDriver(driver.driver_id, {
        ride_id: ride.id,
        pickup_address: ride.pickup_address,
        dropoff_address: ride.dropoff_address,
        estimated_fare: ride.estimated_fare,
      })
    }

    const acceptedDriverId = await waitForDriverAcceptance(ride.id, driverIds, MATCHING_TIMEOUT_MS)

    if (acceptedDriverId) {
      console.log(`Ride ${ride.id} accepted by driver ${acceptedDriverId}`)
      return new Response(
        JSON.stringify({ matched: true, driver_id: acceptedDriverId }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    } else {
      console.log(`Ride ${ride.id} timed out or was cancelled`)
      const { data: ride } = await supabase
        .from("rides")
        .select("status")
        .eq("id", ride.id)
        .single()

      if (ride?.status === "pending") {
        await supabase
          .from("rides")
          .update({ status: "cancelled", cancel_reason: "matching_timeout" })
          .eq("id", ride.id)
      }

      return new Response(
        JSON.stringify({ matched: false, reason: "timeout" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    }
  }

  return new Response("Method not allowed", { status: 405 })
})
