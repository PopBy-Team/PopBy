export function getSpotlightRect(rect, viewport, padding = viewport.padding ?? 14) {
  if (!rect) return null

  const left = Math.max(0, Math.round(rect.left - padding))
  const top = Math.max(0, Math.round(rect.top - padding))
  const right = Math.min(viewport.width, Math.round(rect.left + rect.width + padding))
  const bottom = Math.min(viewport.height, Math.round(rect.top + rect.height + padding))

  return {
    left,
    top,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  }
}
export function getSpotlightBlockers(spotlight, viewport) {
  if (!spotlight) {
    return [{ left: 0, top: 0, width: viewport.width, height: viewport.height }]
  }

  const right = spotlight.left + spotlight.width
  const bottom = spotlight.top + spotlight.height

  return [
    { left: 0, top: 0, width: viewport.width, height: spotlight.top },
    { left: 0, top: spotlight.top, width: spotlight.left, height: spotlight.height },
    {
      left: right,
      top: spotlight.top,
      width: Math.max(0, viewport.width - right),
      height: spotlight.height,
    },
    {
      left: 0,
      top: bottom,
      width: viewport.width,
      height: Math.max(0, viewport.height - bottom),
    },
  ]
}
