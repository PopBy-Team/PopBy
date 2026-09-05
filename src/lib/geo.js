import { bbox, circle, distance, point } from '@turf/turf'

export const VIEWPORT_THRESHOLDS = {
  farMeters: 1500,
  nearMeters: 700,
}

export const MAP_3D_VIEW = Object.freeze({
  zoom: 15.55,
  pitch: 48,
  bearing: -18,
})

export function distanceMeters(a, b) {
  if (!a || !b) return Infinity
  return distance(point(a), point(b), { units: 'meters' })
}

export function getViewportWidthMeters(map) {
  const bounds = map.getBounds()
  const latitude = map.getCenter().lat

  return distance(
    point([bounds.getWest(), latitude]),
    point([bounds.getEast(), latitude]),
    { units: 'meters' },
  )
}

export function getViewportMode(widthMeters) {
  if (widthMeters > VIEWPORT_THRESHOLDS.farMeters) return 'far'
  if (widthMeters >= VIEWPORT_THRESHOLDS.nearMeters) return 'medium'
  return 'near'
}

export function getMarkerSize(count, mode) {
  if (mode === 'medium') return 28
  if (count <= 3) return 24
  if (count <= 9) return 32
  return 40
}

export function fitMapToRadius(map, coordinate, radiusKm = 0.37) {
  const [west, south, east, north] = bbox(circle(coordinate, radiusKm, {
    units: 'kilometers',
  }))

  map.fitBounds(
    [[west, south], [east, north]],
    {
      padding: 36,
      duration: 900,
      pitch: MAP_3D_VIEW.pitch,
      bearing: MAP_3D_VIEW.bearing,
    },
  )
}
