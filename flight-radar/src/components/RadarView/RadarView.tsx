// main radar view that initializes Deck.gl, syncs planes from the MobX store and manages the floating panels
import { useCallback, useEffect, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { reaction } from "mobx"
import { DeckRadar } from "../../map/DeckRadar"
import { planeStore } from "../../stores/planeStoreInstance"
import { PlaneEditPanel } from "../PlaneEditPanel/PlaneEditPanel"
import {
  calculateFloatingPanelPosition,
  type ClickPosition,
  type PanelPosition,
} from "../../utils/calculateFloatingPanelPosition"
import { FLOATING_PANEL_POSITION_OPTIONS } from "../../constants/radarViewConstants"
import { ActiveAircraftPanel } from "../ActiveAircraftPanel/ActiveAircraftPanel"
import { FloatingPanel } from "../FloatingPanel/FloatingPanel"
import { startPanelDrag } from "../../utils/startPanelDrag"

import "./RadarView.css"

export const RadarView = observer(() => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const radarRef = useRef<DeckRadar | null>(null)
  const [panelPosition, setPanelPosition] = useState<PanelPosition | null>(null)
  const [isAircraftPanelOpen, setIsAircraftPanelOpen] = useState(false)
  const lastClickPositionRef = useRef<ClickPosition | null>(null)
  const [aircraftPanelPosition, setAircraftPanelPosition] =
    useState<PanelPosition>({
      left: 18,
      top: 60,
    })

  // selects a plane and positions the edit panel near the click location
  const handlePlaneClick = useCallback(
    (planeId: number, position: ClickPosition) => {
      planeStore.selectPlane(planeId)
      lastClickPositionRef.current = position
      const container = containerRef.current
      if (!container) {
        return
      }
      const containerRect = container.getBoundingClientRect()
      const nextPanelPosition = calculateFloatingPanelPosition(
        position,
        containerRect,
        FLOATING_PANEL_POSITION_OPTIONS,
      )
      setPanelPosition(nextPanelPosition)
    },
    [],
  )

  // initializes the DeckRadar instance and handles resize cleanup
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current

    if (!canvas || !container) {
      return
    }
    radarRef.current = new DeckRadar(canvas, handlePlaneClick, (bounds) => {
      planeStore.setViewportBounds(bounds)
    })
    radarRef.current.updatePlanes(planeStore.visiblePlanes)

    const resizeObserver = new ResizeObserver(() => {
      radarRef.current?.resize()
      const lastClickPosition = lastClickPositionRef.current
      if (!lastClickPosition || !planeStore.selectedPlane) {
        return
      }
      const containerRect = container.getBoundingClientRect()
      const nextPanelPosition = calculateFloatingPanelPosition(
        lastClickPosition,
        containerRect,
        FLOATING_PANEL_POSITION_OPTIONS,
      )
      setPanelPosition(nextPanelPosition)
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      radarRef.current?.destroy()
      radarRef.current = null
    }
  }, [handlePlaneClick])

  // updates the radar layers when visible planes change
  useEffect(() => {
    const dispose = reaction(
      () =>({
        visiblePlanes: planeStore.visiblePlanes.map((plane) => ({
          id: plane.id,
          name: plane.name,
          country: plane.country,
          lat: plane.geoLocation.lat,
          lon: plane.geoLocation.lon,
        })),
      selectedPlaneId: planeStore.selectedPlaneId,
      }),
      ({ visiblePlanes, selectedPlaneId }) => {
        radarRef.current?.updatePlanes(planeStore.visiblePlanes)
       if(selectedPlaneId===null){
        return;
       }

       const isSelectedPlaneVisible =  visiblePlanes.some((plane)=> plane.id === selectedPlaneId)
       if(!isSelectedPlaneVisible){
        planeStore.clearSelectedPlane();
        setPanelPosition(null)
       }
      },
      {
        delay: 100,
      },
    )
    return () => {
      dispose()
    }
  }, [])

  //closes the edit panel when no plane is selected
  useEffect(() => {
    const dispose = reaction(
      () => planeStore.selectedPlaneId,
      (selectedPlaneId) => {
        if (selectedPlaneId === null) {
          setPanelPosition(null)
        }
      },
    )
    return () => {
      dispose()
    }
  }, [])

  const handleAircraftPanelDragStart = (
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    startPanelDrag(event, aircraftPanelPosition, setAircraftPanelPosition)
  }

  const handleSelectedPlanePanelDragStart = (
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (!panelPosition) {
      return
    }

    startPanelDrag(event, panelPosition, setPanelPosition)
  }

  return (
    <div ref={containerRef} className="radar-container">
      <div className="radar-title">2D Flight Radar</div>
      <button
        type="button"
        className="active-aircraft-toggle"
        onClick={() => setIsAircraftPanelOpen((isOpen) => !isOpen)}
      >
        {isAircraftPanelOpen ? "Close Active Aircraft" : "Active Aircraft"}
      </button>

      <canvas ref={canvasRef} className="radar-canvas" />

      {planeStore.selectedPlane && panelPosition  && (
        <FloatingPanel
          position={panelPosition}
          onDragStart={handleSelectedPlanePanelDragStart}
        >
          <PlaneEditPanel />
        </FloatingPanel>
      )}

      {isAircraftPanelOpen && (
        <FloatingPanel
          position={aircraftPanelPosition}
          onDragStart={handleAircraftPanelDragStart}
          onClose={() => setIsAircraftPanelOpen(false)}
        >
          <ActiveAircraftPanel />
        </FloatingPanel>
      )}
    </div>
  )
})
