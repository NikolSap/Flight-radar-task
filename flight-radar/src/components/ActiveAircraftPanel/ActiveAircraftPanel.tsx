import { observer } from "mobx-react-lite"
import { useState } from "react"
import { planeStore } from "../../stores/planeStoreInstance"
import type { Plane } from "../../domain/plane.types"
import { getPlaneLabel } from "../../domain/plane.utils"
import "./ActiveAircraftPanel.css"

type PlaneDraftNames = Record<number, string>
type PlaneErrors = Record<number, string>

// displays all visible aircraft and allows editing their names in one panel
export const ActiveAircraftPanel = observer(() => {
  const [draftNames, setDraftNames] = useState<PlaneDraftNames>({})
  const [errorsByPlaneId, setErrorsByPlaneId] = useState<PlaneErrors>({})

  const getInputValue = (plane: Plane) => {
    return draftNames[plane.id] ?? plane.name
  }

  const handleNameChange = (planeId: number, newName: string) => {
    setDraftNames((currentNames) => ({
      ...currentNames,
      [planeId]: newName,
    }))

    if (newName.trim() !== "") {
      setErrorsByPlaneId((currentErrors) => ({
        ...currentErrors,
        [planeId]: "",
      }))
    }
  }

  // validates all edited plane names and saves them to the store
  const handleSaveAll = () => {
    const nextErrors: PlaneErrors = {}
    let hasError = false

    Object.entries(draftNames).forEach(([planeIdAsString, draftName]) => {
      const planeId = Number(planeIdAsString)
      const trimmedName = draftName.trim()

      if (trimmedName === "") {
        nextErrors[planeId] = "Plane name cannot be empty."
        hasError = true
      }
    })

    if (hasError) {
      setErrorsByPlaneId(nextErrors)
      return
    }

    Object.entries(draftNames).forEach(([planeIdAsString, draftName]) => {
      const planeId = Number(planeIdAsString)
      const trimmedName = draftName.trim()
      planeStore.updatePlaneName(planeId, trimmedName)
    })

    setDraftNames({})
    setErrorsByPlaneId({})
  }

  return (
    <div className="active-aircraft-panel">
      <div className="aircraft-header">
        <div className="active-aircraft-header">
          <h3>
            {" "}
            {planeStore.visiblePlanes.length
              ? "Active aircraft"
              : "No active aircraft"}
          </h3>
        </div>
        {planeStore.visiblePlanes.length > 0 && (
          <button
            type="button"
            className="save-button"
            onClick={handleSaveAll}
          >
            Save
          </button>
        )}
      </div>

      <div className="aircraft-list">
        {planeStore.visiblePlanes.map((currPlane) => {
          const inputValue = getInputValue(currPlane)
          const errorMsg = errorsByPlaneId[currPlane.id]
          const planeLabel = getPlaneLabel(currPlane.country)
          return (
            <div
              key={currPlane.id}
              className="aircraft-card"
            >
              <div className="form-group">
                <label htmlFor={`plane-name-${currPlane.id}`}>Plane Name</label>

                <input
                  id={`plane-name-${currPlane.id}`}
                  value={inputValue}
                  onChange={(event) =>
                    handleNameChange(currPlane.id, event.target.value)
                  }
                  className={errorMsg ? "input-error" : ""}
                />
                {errorMsg && <p className="error-message">{errorMsg}</p>}
              </div>
              <div className="plane-details">
                <div className="detail-row">
                  <span className="detail-label">Type</span>

                  <span
                    className={`plane-status status-${planeLabel.toLowerCase()}`}
                  >
                    {planeLabel}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Country</span>
                  <span className="detail-value">{currPlane.country}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Latitude</span>
                  <span className="detail-value">
                    {currPlane.geoLocation.lat}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Longitude</span>
                  <span className="detail-value">
                    {currPlane.geoLocation.lon}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})
