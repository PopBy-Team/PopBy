export function disposeMap(map, mapRef, markersRef) {
  for (const marker of markersRef.current.values()) {
    marker.remove()
  }
  markersRef.current.clear()

  map.remove()
  if (mapRef.current === map) mapRef.current = null
}

const BASE_VIEWPORT_CONTENT = 'width=device-width, initial-scale=1.0, viewport-fit=cover'
const LOCKED_VIEWPORT_CONTENT = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'

export function getPageViewportContent(locked) {
  return locked ? LOCKED_VIEWPORT_CONTENT : BASE_VIEWPORT_CONTENT
}

export function setPageZoomLocked(locked, documentRef = document) {
  const viewport = documentRef.querySelector('meta[name="viewport"]')
  if (!viewport) return () => {}

  viewport.setAttribute('content', getPageViewportContent(locked))
  return () => {
    viewport.setAttribute('content', BASE_VIEWPORT_CONTENT)
  }
}

export function attachMapLongPress(
  map,
  onLongPress,
  {
    schedule = setTimeout,
    cancel = clearTimeout,
    vibrate = () => {
      if (typeof navigator !== 'undefined') navigator.vibrate?.(20)
    },
  } = {},
) {
  const canvas = map.getCanvas()
  let timer = null
  let start = null

  const clear = () => {
    if (timer !== null) cancel(timer)
    timer = null
    start = null
  }

  const canvasPoint = (event) => {
    const rect = canvas.getBoundingClientRect()
    return {
      clientX: event.clientX,
      clientY: event.clientY,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }

  const commit = (point) => {
    const lngLat = map.unproject([point.x, point.y])
    vibrate()
    onLongPress?.([lngLat.lng, lngLat.lat])
  }

  const pointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    clear()
    start = canvasPoint(event)
    timer = schedule(() => {
      commit(start)
      clear()
    }, 650)
  }

  const pointerMove = (event) => {
    if (!start) return
    if (Math.hypot(event.clientX - start.clientX, event.clientY - start.clientY) > 10) {
      clear()
    }
  }

  const contextMenu = (event) => {
    event.preventDefault()
    clear()
    commit(canvasPoint(event))
  }

  const cleanup = () => {
    clear()
    canvas.removeEventListener('pointerdown', pointerDown)
    canvas.removeEventListener('pointermove', pointerMove)
    canvas.removeEventListener('pointerup', clear)
    canvas.removeEventListener('pointercancel', clear)
    canvas.removeEventListener('contextmenu', contextMenu)
  }

  canvas.addEventListener('pointerdown', pointerDown)
  canvas.addEventListener('pointermove', pointerMove)
  canvas.addEventListener('pointerup', clear)
  canvas.addEventListener('pointercancel', clear)
  canvas.addEventListener('contextmenu', contextMenu)
  map.once('remove', cleanup)

  return cleanup
}

export function attachElementLongPress(
  element,
  onLongPress,
  {
    schedule = setTimeout,
    cancel = clearTimeout,
    vibrate = () => {
      if (typeof navigator !== 'undefined') navigator.vibrate?.(20)
    },
  } = {},
) {
  let timer = null
  let start = null
  let suppressClick = false

  const clear = () => {
    if (timer !== null) cancel(timer)
    timer = null
    start = null
  }

  const pointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    clear()
    start = { x: event.clientX, y: event.clientY }
    timer = schedule(() => {
      if (!start) return
      suppressClick = true
      vibrate()
      onLongPress?.()
      clear()
    }, 650)
  }

  const pointerMove = (event) => {
    if (!start) return
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10) {
      clear()
    }
  }

  const click = (event) => {
    if (!suppressClick) return
    event.preventDefault()
    event.stopPropagation()
    suppressClick = false
  }

  const cleanup = () => {
    clear()
    element.removeEventListener('pointerdown', pointerDown)
    element.removeEventListener('pointermove', pointerMove)
    element.removeEventListener('pointerup', clear)
    element.removeEventListener('pointercancel', clear)
    element.removeEventListener('click', click)
  }

  element.addEventListener('pointerdown', pointerDown)
  element.addEventListener('pointermove', pointerMove)
  element.addEventListener('pointerup', clear)
  element.addEventListener('pointercancel', clear)
  element.addEventListener('click', click)

  return cleanup
}
