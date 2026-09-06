export function getCategoryFanPositions(
  count,
  { radiusX = 124, radiusY = 124, direction = 'up' } = {},
) {
  if (!Number.isInteger(count) || count <= 0) return []
  const directionSign = direction === 'down' ? -1 : 1
  if (count === 1) {
    return [{ x: 0, y: -Math.round(radiusY) * directionSign }]
  }

  const startDegrees = 190
  const endDegrees = 350
  const step = (endDegrees - startDegrees) / (count - 1)

  return Array.from({ length: count }, (_, index) => {
    const radians = ((startDegrees + (step * index)) * Math.PI) / 180
    return {
      x: Math.round(Math.cos(radians) * radiusX),
      y: Math.round(Math.sin(radians) * radiusY * directionSign),
    }
  })
}

export function getFanPresentationTarget({
  width,
  height,
  topRail = 0,
  bottomInset = 0,
}) {
  const x = Math.round(width / 2)
  const y = Math.round(height * 0.62)
  const roomAbove = y - topRail
  const roomBelow = height - bottomInset - y

  return {
    x,
    y,
    direction: roomAbove >= roomBelow ? 'up' : 'down',
  }
}

export function getFanSelectionClass(selectedCategory, category) {
  if (!selectedCategory) return ''
  return selectedCategory === category ? 'is-selected' : 'is-muted'
}
