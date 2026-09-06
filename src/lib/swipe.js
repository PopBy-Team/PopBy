export function getSwipeDirection({
  startX,
  startY,
  endX,
  endY,
  threshold = 48,
}) {
  const deltaX = endX - startX
  const deltaY = endY - startY

  if (Math.abs(deltaX) < threshold) return null
  if (Math.abs(deltaX) <= Math.abs(deltaY)) return null
  return deltaX < 0 ? 'next' : 'previous'
}

export function getTapDirection({
  startX,
  startY,
  endX,
  endY,
  centerX,
  maxMovement = 12,
}) {
  const movement = Math.hypot(endX - startX, endY - startY)
  if (movement > maxMovement) return null
  return endX < centerX ? 'previous' : 'next'
}
