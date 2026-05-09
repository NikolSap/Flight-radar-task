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
  let left = clickPosition.x + options.horizontalOffset
  let top = clickPosition.y + options.verticalOffset

  if (left + options.panelWidth > containerRect.width) {
    left = clickPosition.x - options.panelWidth - options.horizontalOffset
  }

  if (top + options.panelHeight > containerRect.height) {
    top = containerRect.height - options.panelHeight - options.margin
  }

  if (top < options.margin) {
    top = options.margin
  }

  return { left, top }
}
