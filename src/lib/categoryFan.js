export function getCategoryFanPositions(count, radius = 112) {
  if (!Number.isInteger(count) || count <= 0) return []
  if (count === 1) return [{ x: 0, y: -Math.round(radius) }]

  const startDegrees = 200
  const endDegrees = 340
  const step = (endDegrees - startDegrees) / (count - 1)

  return Array.from({ length: count }, (_, index) => {
    const radians = ((startDegrees + (step * index)) * Math.PI) / 180
    return {
      x: Math.round(Math.cos(radians) * radius),
      y: Math.round(Math.sin(radians) * radius),
    }
  })
}
