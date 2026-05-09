import type { Plane } from "../domain/plane.types"

// Messages sent from the app to the SharedWorker
export type PlaneWorkerIncomingMessage =
  | {
      // Request the current plane list
      type: "GET_PLANES"
    }
  | {
      // Update a specific plane name in the shared worker state
      type: "UPDATE_PLANE_NAME"
      payload: {
        id: number
        name: string
      }
    }

// Messages sent from the SharedWorker to the app
export type PlaneWorkerOutgoingMessage = {
  type: "PLANES_STATE"
  payload: Plane[]
}
