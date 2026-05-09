import type { Plane } from "../domain/plane.types"
import type {
  PlaneWorkerIncomingMessage,
  PlaneWorkerOutgoingMessage,
} from "../workers/planeWorker.types"

type PlanesStateListener = (planes: Plane[]) => void

//plane worker client class that manages communication with the shared plane worker
export class PlaneWorkerClient {
  private worker: SharedWorker
  private port: MessagePort
  private listeners: PlanesStateListener[] = []

  constructor() {
    this.worker = new SharedWorker(
      new URL("../workers/planeSharedWorker.ts", import.meta.url),
      {
        type: "module",
      },
    )

    this.port = this.worker.port
    this.port.start()
    this.setupMessageHandler()
  }

  // handles messages received from the worker
  private setupMessageHandler() {
    this.port.onmessage = (event: MessageEvent<PlaneWorkerOutgoingMessage>) => {
      const message = event.data

      if (message.type === "PLANES_STATE") {
        this.listeners.forEach((listener) => {
          listener(message.payload)
        })
      }
    }
  }

  private postMessage(message: PlaneWorkerIncomingMessage) {
    this.port.postMessage(message)
  }

  // registers a listener for planes state updates and returns an unsubscribe function
  onPlanesState(listener: PlanesStateListener) {
    this.listeners.push(listener)

    return () => {
      this.listeners = this.listeners.filter(
        (existingListener) => existingListener !== listener,
      )
    }
  }

  // requests the current planes state from the worker
  requestPlanes() {
    this.postMessage({
      type: "GET_PLANES",
    })
  }

  // sends a plane name update to the worker
  updatePlaneName(id: number, name: string) {
    this.postMessage({
      type: "UPDATE_PLANE_NAME",
      payload: {
        id,
        name,
      },
    })
  }
}
