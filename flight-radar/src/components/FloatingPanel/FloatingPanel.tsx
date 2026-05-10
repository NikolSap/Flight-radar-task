import type { ReactNode } from "react"
import type { PanelPosition } from "../../utils/calculateFloatingPanelPosition"

type FloatingPanelProps = {
  position: PanelPosition
  onDragStart?: (event: React.MouseEvent<HTMLDivElement>) => void
  onClose?: () => void
  children: ReactNode
}


export function FloatingPanel({
  position,
  onDragStart,
  onClose,
  children,
}: FloatingPanelProps) {
  return (
    <div
      className="floating-panel"
      style={{
        left: position.left,
        top: position.top,
      }}
    >
      <div
        className="floating-panel-drag-handle"
        onMouseDown={onDragStart}
      >
        Drag panel

        {onClose && (
          <button
            type="button"
            className="close-button"
            onClick={onClose}
            aria-label="Close panel"
          >
            ×
          </button>
        )}
      </div>

      {children}
    </div>
  )
}