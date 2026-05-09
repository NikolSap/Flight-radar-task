/// <reference lib="webworker" />
import { mockPlanes } from "../data/mockPlanes"
import type { Plane } from "../domain/plane.types"
import type {
  PlaneWorkerIncomingMessage,
  PlaneWorkerOutgoingMessage,
} from "./planeWorker.types"

//  the SharedWorker keeps the central plane state
//  all browser tabs connected to this worker share this same data
let planes: Plane[] = [...mockPlanes]
const ports: MessagePort[] = []
const workerSelf = self as unknown as SharedWorkerGlobalScope

// sends a message to every connected tab
function broadcast(message: PlaneWorkerOutgoingMessage) {
  ports.forEach((port) => {
    port.postMessage(message)
  })
}

// sends the current plane list to a specific tab
function sendPlanesState(port: MessagePort) {
  port.postMessage({
    type: "PLANES_STATE",
    payload: planes,
  } satisfies PlaneWorkerOutgoingMessage)
}

// updates the central plane state inside the SharedWorker
function updatePlaneName(id: number, name: string) {
  planes = planes.map((plane) => {
    if (plane.id !== id) {
      return plane
    }

    return {
      ...plane,
      name,
    }
  })
}

// handles new tab connections to the SharedWorker
workerSelf.onconnect = (event: MessageEvent) => {
  const port = event.ports[0]

  ports.push(port)
  port.start()

  sendPlanesState(port)

  port.onmessage = (messageEvent: MessageEvent<PlaneWorkerIncomingMessage>) => {
    const message = messageEvent.data

    switch (message.type) {
      case "GET_PLANES": {
        sendPlanesState(port)
        break
      }

      case "UPDATE_PLANE_NAME": {
        updatePlaneName(message.payload.id, message.payload.name)

        broadcast({
          type: "PLANES_STATE",
          payload: planes,
        })

        break
      }

      default: {
        break
      }
    }
  }
}

export {}
