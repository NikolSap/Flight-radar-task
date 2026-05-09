import { PlaneWorkerClient } from "./PlaneWorkerClient"

// creates a single shared worker client instance used across the app
export const planeWorkerClient = new PlaneWorkerClient()
