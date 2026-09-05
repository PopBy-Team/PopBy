import { useEffect, useMemo, useState } from 'react'
import { CATEGORIES } from '../data/categories'
import { getCategoryFanPositions } from '../lib/categoryFan'

export default function DropCategoryFan({
  map,
  coordinate,
  onSelect,
  onCancel,
}) {
  const [screenPoint, setScreenPoint] = useState(null)
  const positions = useMemo(
    () => getCategoryFanPositions(CATEGORIES.length),
    [],
  )

  useEffect(() => {
    if (!map || !coordinate) return undefined

    const update = () => {
      const point = map.project(coordinate)
      setScreenPoint({ x: point.x, y: point.y })
    }

    const cancelOnDrag = () => onCancel?.()
    const cancelOnEscape = (event) => {
      if (event.key === 'Escape') onCancel?.()
    }

    update()
    map.on('render', update)
    map.on('dragstart', cancelOnDrag)
    window.addEventListener('keydown', cancelOnEscape)

    return () => {
      map.off('render', update)
      map.off('dragstart', cancelOnDrag)
      window.removeEventListener('keydown', cancelOnEscape)
    }
  }, [map, coordinate, onCancel])

  if (!screenPoint) return null

  return (
    <div
      className="drop-fan-layer"
      role="dialog"
      aria-modal="true"
      aria-label="Choose a Thought category"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onCancel?.()
      }}
    >
      <div
        className="drop-fan-anchor"
        style={{ left: screenPoint.x, top: screenPoint.y }}
      >
        <div className="drop-coordinate-pin" aria-hidden="true">
          <svg viewBox="0 0 32 40">
            <path d="M16 38C13 31 5 24 5 15.5A11 11 0 0 1 27 15.5C27 24 19 31 16 38Z" />
            <circle cx="16" cy="15.5" r="4" />
          </svg>
        </div>

        {CATEGORIES.map((category, index) => (
          <button
            key={category.name}
            className="drop-category-bubble"
            type="button"
            onClick={() => onSelect?.(category.name)}
            style={{
              '--fan-x': `${positions[index].x}px`,
              '--fan-y': `${positions[index].y}px`,
              '--fan-index': index,
            }}
            aria-label={`Choose ${category.name}`}
          >
            <span aria-hidden="true">{category.icon}</span>
            <small>{category.name}</small>
          </button>
        ))}
      </div>
    </div>
  )
}
