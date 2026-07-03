import { setup } from 'xstate'

export const rideMachine = setup({
  types: {
    context: {} as {
      rideId: string | null
      riderId: string | null
      driverId: string | null
      cancelReason: string | null
    },
    events: {} as
      | { type: 'REQUEST' }
      | { type: 'ASSIGN'; driverId: string }
      | { type: 'DRIVER_ARRIVED' }
      | { type: 'START' }
      | { type: 'COMPLETE'; finalFare: number }
      | { type: 'PAY' }
      | { type: 'CANCEL'; reason: string }
      | { type: 'NO_DRIVERS' },
  },
}).createMachine({
  id: 'ride',
  initial: 'idle',
  context: {
    rideId: null,
    riderId: null,
    driverId: null,
    cancelReason: null,
  },
  states: {
    idle: {
      on: { REQUEST: 'pending' },
    },
    pending: {
      entry: 'assignRideId',
      on: {
        ASSIGN: { target: 'assigned', actions: 'assignDriver' },
        CANCEL: { target: 'cancelled', actions: 'setCancelReason' },
        NO_DRIVERS: { target: 'cancelled', actions: 'setNoDriversReason' },
      },
    },
    assigned: {
      on: {
        DRIVER_ARRIVED: 'driver_arrived',
        CANCEL: { target: 'cancelled', actions: 'setCancelReason' },
      },
    },
    driver_arrived: {
      on: {
        START: 'in_progress',
        CANCEL: { target: 'cancelled', actions: 'setCancelReason' },
      },
    },
    in_progress: {
      on: {
        COMPLETE: { target: 'payment_pending', actions: 'setFinalFare' },
      },
    },
    payment_pending: {
      on: {
        PAY: 'paid',
      },
    },
    paid: {
      type: 'final',
    },
    cancelled: {
      type: 'final',
    },
  },
})
