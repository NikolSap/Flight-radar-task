// MobX store that manages planes state, selection, viewport filtering and communication with the plane worker
import { makeAutoObservable } from "mobx"
import type { Plane } from "../domain/plane.types"
import type { PlaneWorkerClient } from "../services/PlaneWorkerClient"
import type { ViewportBounds } from "../domain/viewport.types"

export class PlaneStore {
  planes: Plane[] = []
  selectedPlaneId: number | null = null
  viewportBounds: ViewportBounds | null = null
  private workerClient: PlaneWorkerClient | null = null

  constructor(initialPlanes: Plane[]) {
    this.planes = initialPlanes
    makeAutoObservable(this)
  }

  // Returns the currently selected plane or null if no plane is selected
  get selectedPlane() {
    return (
      this.planes.find((plane) => plane.id === this.selectedPlaneId) ?? null
    )
  }

  selectPlane(id: number) {
    this.selectedPlaneId = id
  }

  clearSelectedPlane() {
    this.selectedPlaneId = null
  }

  // Connects the plane store to the worker and requests the latest planes state
  connectWorker(workerClient: PlaneWorkerClient) {
    this.workerClient = workerClient

    workerClient.onPlanesState((planes) => {
      this.setPlanes(planes)
    })

    workerClient.requestPlanes()
  }

  setPlanes(planes: Plane[]) {
    this.planes = planes
  }

  // Updates the plane name locally and syncs the change with the worker
  updatePlaneName(id: number, newName: string) {
    this.planes = this.planes.map((plane) => {
      if (plane.id !== id) {
        return plane
      }

      return {
        ...plane,
        name: newName,
      }
    })

    this.workerClient?.updatePlaneName(id, newName)
  }

  addPlane(newPlane: Plane) {
    this.planes = [...this.planes, newPlane]
  }

  setViewportBounds(bounds: ViewportBounds) {
    this.viewportBounds = bounds
  }

  // Returns only planes that are inside the current viewport bounds
  get visiblePlanes() {
    if (!this.viewportBounds) {
      return this.planes
    }

    return this.planes.filter((plane) => {
      const { lat, lon } = plane.geoLocation
      const { minLat, maxLat, minLon, maxLon } = this.viewportBounds

      return lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon
    })
  }
}
