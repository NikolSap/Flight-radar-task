import { observer } from "mobx-react-lite"
import { useEffect, useState } from "react"
import { planeStore } from "../../stores/planeStoreInstance"
import { getPlaneLabel } from "../../domain/plane.utils"
import "./PlaneEditPanel.css"

// floating panel for viewing and editing the selected plane details
export const PlaneEditPanel = observer(() => {
  const selectedPlane = planeStore.selectedPlane
  const [errorMessage, setErrorMessage] = useState("")
  const [planeDraftName, setPlaneDraftName] = useState("")
  const planeType = selectedPlane ? getPlaneLabel(selectedPlane.country) : ""

  useEffect(() => {
    if (!selectedPlane) {
      return null
    }
    setPlaneDraftName(selectedPlane.name)
    setErrorMessage("")
  }, [selectedPlane?.id])

  if (!selectedPlane) {
    return null
  }

  const handleClosePanel = () => {
    planeStore.clearSelectedPlane()
  }

  // validates and saves the updated plane name
  const handleSave = () => {
    const trimmedName = planeDraftName.trim()

    if (trimmedName === "") {
      setErrorMessage("Plane name cannot be empty.")
      return
    }
    setErrorMessage("")
    planeStore.updatePlaneName(selectedPlane.id, trimmedName)
    planeStore.clearSelectedPlane()
  }

  return (
    <div className="edit-panel">
      <div className="edit-panel-header">
        <h3>Plane Details</h3>

        <button
          type="button"
          className="close-button"
          onClick={handleClosePanel}
          aria-label="Close plane details"
        >
          ×
        </button>
      </div>

      <div className="form-group">
        <label htmlFor="plane-name">Plane Name</label>

        <input
          id="plane-name"
          value={planeDraftName}
          onChange={(event) => setPlaneDraftName(event.target.value)}
          className={errorMessage ? "input-error" : ""}
        />
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>

      <div className="plane-details">
        <div className="detail-row">
          <span className="detail-label">Type</span>

          <span className={`plane-status status-${planeType.toLowerCase()}`}>
            {planeType}
          </span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Country</span>
          <span className="detail-value">{selectedPlane.country}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Latitude</span>
          <span className="detail-value">{selectedPlane.geoLocation.lat}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Longitude</span>
          <span className="detail-value">{selectedPlane.geoLocation.lon}</span>
        </div>
      </div>
      <div className="button-wrapper">
        <button
          type="button"
          className="save-button"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  )
})
