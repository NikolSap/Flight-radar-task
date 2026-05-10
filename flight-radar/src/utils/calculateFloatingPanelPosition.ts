export type PanelPosition = {
  left: number
  top: number
}

export type ClickPosition = {
  x: number
  y: number
}

type PanelPositionOptions = {
  panelWidth?: number
  panelHeight?: number
  horizontalOffset?: number
  verticalOffset?: number
  margin?: number
}

// calculates where a floating panel should open after clicking on the map
export function calculateFloatingPanelPosition(
  clickPosition: ClickPosition,
  containerRect: DOMRect,
  options: PanelPositionOptions = {},
): PanelPosition {
  const {
    panelWidth = 360,
    panelHeight = 300,
    horizontalOffset = 12,
    verticalOffset = 12,
    margin = 12,
  } = options

  let left = clickPosition.x + horizontalOffset
  let top = clickPosition.y + verticalOffset

  if (left + panelWidth > containerRect.width) {
    left = clickPosition.x - panelWidth - horizontalOffset
  }

  if (top + panelHeight > containerRect.height) {
    top = containerRect.height - panelHeight - margin
  }

  if (top < margin) {
    top = margin
  }

  return { left, top }
}
