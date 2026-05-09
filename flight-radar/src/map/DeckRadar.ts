// Deck.gl radar controller that renders planes, labels, click events, viewport bounds updates, resizing, and cleanup
import { Deck, WebMercatorViewport } from "@deck.gl/core"
import { ScatterplotLayer, TextLayer } from "@deck.gl/layers"
import type { Plane } from "../domain/plane.types"
import { getPlaneColor, getPlaneLabel } from "../domain/plane.utils"
import type { ViewportBounds } from "../domain/viewport.types"
import {
  INITIAL_RADAR_VIEW_STATE,
  RADAR_CONTROLLER_OPTIONS,
  PLANE_MARKER_RADIUS,
  RADAR_PICKING_RADIUS,
  PLANE_LABEL_OFFSET,
  PLANE_LABEL_SIZE,
  PLANE_MARKER_LINE_COLOR,
  PLANE_LABEL_COLOR,
  PLANE_MARKER_LINE_WIDTH,
} from "../constants/deckRadarConstants"

type PlaneClickPosition = {
  x: number
  y: number
}

type PlaneClickHandler = (planeId: number, position: PlaneClickPosition) => void

type ViewportBoundsHandler = (bounds: ViewportBounds) => void

export class DeckRadar {
  private deck: Deck
  private canvas: HTMLCanvasElement
  private onPlaneClick: PlaneClickHandler
  private onViewportBoundsChange: ViewportBoundsHandler

  constructor(
    canvas: HTMLCanvasElement,
    onPlaneClick: PlaneClickHandler,
    onViewportBoundsChange: ViewportBoundsHandler,
  ) {
    this.canvas = canvas
    this.onPlaneClick = onPlaneClick
    this.onViewportBoundsChange = onViewportBoundsChange

    this.deck = new Deck({
      canvas: this.canvas,
      width: this.canvas.clientWidth,
      height: this.canvas.clientHeight,
      useDevicePixels: window.devicePixelRatio,

      initialViewState: INITIAL_RADAR_VIEW_STATE,
      controller: RADAR_CONTROLLER_OPTIONS,

      pickingRadius: RADAR_PICKING_RADIUS,
      layers: [],
      onViewStateChange: ({ viewState }) => {
        this.emitViewportBounds(viewState)
        return viewState
      },
    })
  }

  //updates the rendered plane markers and labels
  updatePlanes(planes: Plane[]) {
    this.deck.setProps({
      layers: [this.createPlanesLayer(planes), this.createLabelsLayer(planes)],
    })
  }

  // creates the clickable plane markers layer
  private createPlanesLayer(planes: Plane[]) {
    return new ScatterplotLayer<Plane>({
      id: "planes-layer",
      data: planes,
      getPosition: (plane) => [plane.geoLocation.lon, plane.geoLocation.lat],
      getRadius: PLANE_MARKER_RADIUS,
      radiusUnits: "pixels",
      getFillColor: (plane) => getPlaneColor(plane.country),
      stroked: true,
      getLineColor: PLANE_MARKER_LINE_COLOR,
      lineWidthMinPixels: PLANE_MARKER_LINE_WIDTH,
      pickable: true,
      onClick: (info) => {
        if (!info.object) {
          return false
        }
        this.onPlaneClick(info.object.id, {
          x: info.x ?? 0,
          y: info.y ?? 0,
        })

        return true
      },
    })
  }

  // creates the plane labels layer displayed next to each marker
  private createLabelsLayer(planes: Plane[]) {
    return new TextLayer<Plane>({
      id: "planes-labels-layer",
      data: planes,
      getPosition: (plane) => [plane.geoLocation.lon, plane.geoLocation.lat],
      getText: (plane) => `${getPlaneLabel(plane.country)}\n${plane.name}`,
      getSize: PLANE_LABEL_SIZE,
      sizeUnits: "pixels",
      getColor: PLANE_LABEL_COLOR,
      getTextAnchor: "start",
      getAlignmentBaseline: "center",
      getPixelOffset: PLANE_LABEL_OFFSET,
      updateTriggers: {
        getText: planes
          .map((plane) => `${plane.id}-${plane.country}-${plane.name}`)
          .join("|"),
      },
    })
  }

  ///calculates the current viewport bounds to filter and display only visible planes
  private emitViewportBounds(viewState: any) {
    const parentElement = this.canvas.parentElement
    if (!parentElement) {
      return
    }
    const rect = parentElement.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const viewport = new WebMercatorViewport({
      ...viewState,
      width: width,
      height: height,
    })

    const [minLon, minLat, maxLon, maxLat] = viewport.getBounds()
    this.onViewportBoundsChange({
      minLat,
      maxLat,
      minLon,
      maxLon,
    })
  }

  resize() {
    const parentElement = this.canvas.parentElement
    if (!parentElement) {
      return
    }
    const rect = parentElement.getBoundingClientRect()
    this.deck.setProps({
      width: rect.width,
      height: rect.height,
    })
  }

  destroy() {
    this.deck.finalize()
  }
}
