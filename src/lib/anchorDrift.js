export function interpolateCoordinate(from, to, progress) {
  const clamped = Math.max(0, Math.min(1, Number(progress) || 0))
  return [
    from[0] + ((to[0] - from[0]) * clamped),
    from[1] + ((to[1] - from[1]) * clamped),
  ]
}

function easeOutBack(progress) {
  const overshoot = 1.2
  const shifted = progress - 1
  return 1 + ((overshoot + 1) * shifted ** 3) + (overshoot * shifted ** 2)
}

export function animateAnchorDrift({
  from,
  to,
  duration = 650,
  onUpdate = () => {},
  onComplete = () => {},
  now = () => performance.now(),
  requestFrame = (callback) => requestAnimationFrame(callback),
  cancelFrame = (id) => cancelAnimationFrame(id),
} = {}) {
  let frameId = null
  let startTime = null
  let cancelled = false

  const frame = () => {
    if (cancelled) return
    const currentTime = now()
    if (startTime === null) startTime = currentTime
    const progress = Math.min(1, (currentTime - startTime) / Math.max(1, duration))
    const eased = progress >= 1 ? 1 : easeOutBack(progress)
    onUpdate(interpolateCoordinate(from, to, eased))

    if (progress >= 1) {
      onComplete()
      return
    }
    frameId = requestFrame(frame)
  }

  frameId = requestFrame(frame)

  return {
    cancel() {
      if (cancelled) return
      cancelled = true
      if (frameId !== null) cancelFrame(frameId)
    },
  }
}
