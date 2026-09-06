import { useEffect, useMemo, useRef, useState } from 'react'
import { CATEGORIES } from '../data/categories'
import {
  getCategoryFanPositions,
  getFanPresentationTarget,
  getFanSelectionClass,
} from '../lib/categoryFan'
import { animateAnchorDrift } from '../lib/anchorDrift'

export default function DropCategoryFan({
  map,
  coordinate,
  onSelect,
  onCancel,
  onResolveAnchor,
  onResolveError,
}) {
  const [screenPoint, setScreenPoint] = useState(null)
  const [pinScreenPoint, setPinScreenPoint] = useState(null)
  const [presentation, setPresentation] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const selectionTimerRef = useRef(null)
  const driftRef = useRef(null)
  const pinCoordinateRef = useRef(coordinate)
  const positions = useMemo(
    () => getCategoryFanPositions(CATEGORIES.length, {
      radiusX: 124,
      radiusY: 124,
      direction: presentation?.direction || 'up',
    }),
    [presentation?.direction],
  )

  useEffect(() => {
    if (!map || !coordinate) return undefined

    const container = map.getContainer()
    const target = getFanPresentationTarget({
      width: container.clientWidth,
      height: container.clientHeight,
      topRail: 54,
      bottomInset: 24,
    })
    setPresentation(target)

    map.easeTo({
      center: coordinate,
      offset: [0, target.y - (container.clientHeight / 2)],
      duration: 320,
    })

    const update = () => {
      const point = map.project(coordinate)
      setScreenPoint({ x: point.x, y: point.y })
      const pinPoint = map.project(pinCoordinateRef.current || coordinate)
      setPinScreenPoint({ x: pinPoint.x, y: pinPoint.y })
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
      if (selectionTimerRef.current) window.clearTimeout(selectionTimerRef.current)
      driftRef.current?.cancel()
      map.off('render', update)
      map.off('dragstart', cancelOnDrag)
      window.removeEventListener('keydown', cancelOnEscape)
    }
  }, [map, coordinate, onCancel])

  async function chooseCategory(category) {
    if (selectedCategory) return
    setSelectedCategory(category)

    try {
      const privacy = await onResolveAnchor?.(coordinate, category)
      const safeCoordinate = privacy?.coordinate || coordinate
      const shouldDrift = Boolean(
        privacy?.insideBuilding
        && Number(privacy?.distanceMeters || 0) > 0.5
      )

      if (shouldDrift) {
        await new Promise((resolve) => {
          driftRef.current = animateAnchorDrift({
            from: coordinate,
            to: safeCoordinate,
            duration: 650,
            onUpdate: (nextCoordinate) => {
              pinCoordinateRef.current = nextCoordinate
              const point = map.project(nextCoordinate)
              setPinScreenPoint({ x: point.x, y: point.y })
            },
            onComplete: resolve,
          })
        })
      } else {
        await new Promise((resolve) => {
          selectionTimerRef.current = window.setTimeout(resolve, 160)
        })
      }

      onSelect?.(category, privacy || {
        coordinate,
        insideBuilding: false,
        snapped: false,
        distanceMeters: 0,
      })
    } catch (error) {
      setSelectedCategory(null)
      onResolveError?.(error)
    }
  }

  if (!screenPoint || !pinScreenPoint) return null

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
        className="drop-coordinate-pin"
        style={{ left: pinScreenPoint.x, top: pinScreenPoint.y }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 32 40">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16 38C13 31 5 24 5 15.5A11 11 0 0 1 27 15.5C27 24 19 31 16 38ZM16 10.5A5 5 0 1 0 16 20.5A5 5 0 0 0 16 10.5Z"
          />
        </svg>
      </div>

      <div
        className="drop-fan-anchor"
        style={{ left: screenPoint.x, top: screenPoint.y }}
      >
        {CATEGORIES.map((category, index) => (
          <button
            key={category.name}
            className={`drop-category-bubble ${getFanSelectionClass(selectedCategory, category.name)}`.trim()}
            type="button"
            disabled={Boolean(selectedCategory)}
            onClick={() => chooseCategory(category.name)}
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
