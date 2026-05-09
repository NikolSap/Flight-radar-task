import { mockPlanes } from "../data/mockPlanes"
import type { Plane } from "../domain/plane.types"

// provides mock planes data and keeps the data source easy to replace with an API
export function getInitialPlanes(): Plane[] {
  return mockPlanes
}
