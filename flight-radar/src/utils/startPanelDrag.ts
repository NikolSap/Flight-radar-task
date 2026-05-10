import type { PanelPosition } from "./calculateFloatingPanelPosition"

export function startPanelDrag(
  event: React.MouseEvent<HTMLDivElement>,
  currentPosition: PanelPosition,
  onPositionChange: (position: PanelPosition) => void,
) {
  const startX = event.clientX
  const startY = event.clientY
  const startLeft = currentPosition.left
  const startTop = currentPosition.top

  const handleMouseMove = (moveEvent: MouseEvent) => {
    const deltaX = moveEvent.clientX - startX
    const deltaY = moveEvent.clientY - startY

    onPositionChange({
      left: startLeft + deltaX,
      top: startTop + deltaY,
    })
  }

  const handleMouseUp = () => {
    window.removeEventListener("mousemove", handleMouseMove)
    window.removeEventListener("mouseup", handleMouseUp)
  }

  window.addEventListener("mousemove", handleMouseMove)
  window.addEventListener("mouseup", handleMouseUp)
}