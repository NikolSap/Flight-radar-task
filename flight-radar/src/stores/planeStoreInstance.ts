import { PlaneStore } from "./PlaneStore"
import { getInitialPlanes } from "../services/planeDataService"
import { planeWorkerClient } from "../services/planeWorkerClientInstance"

// Creates one shared PlaneStore instance with the initial planes data
export const planeStore = new PlaneStore(getInitialPlanes())
// Connects the shared store instance to the plane worker
planeStore.connectWorker(planeWorkerClient)
