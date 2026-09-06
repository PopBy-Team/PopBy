import { bbox, circle, distance, point } from '@turf/turf'

export const VIEWPORT_THRESHOLDS = {
  farMeters: 1500,
  // A pitched 3D viewport sees substantially more ground than its fitted
  // radius. This keeps the 200m location focus in the count-tiered NEAR mode.
  nearMeters: 1350,
}

export const MAP_3D_VIEW = Object.freeze({
  zoom: 15.55,
  pitch: 48,
  bearing: -18,
})

export const MAP_MAX_ZOOM = 20

export const CURRENT_LOCATION_FOCUS_RADIUS_KM = 0.2

// Restore this 400m radius immediately when PopBy opens another active suburb.
export const EXPANDED_AREA_FOCUS_RADIUS_KM = 0.4

// Mapbox's pitch visually compresses north/south geometry. A small fit padding
// keeps Fitzroy at roughly half of a portrait phone instead of a distant sliver.
export const FITZROY_INITIAL_VERTICAL_PADDING_RATIO = 0.065
export const FITZROY_INITIAL_ZOOM_BOOST = 0.75

export const MOBILE_MIN_TOUCH_TARGET = 44

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

export function getMarkerPresentation(count, mode) {
  const visualSize = getMarkerSize(count, mode)

  return {
    visualSize,
    touchSize: MOBILE_MIN_TOUCH_TARGET,
    iconSize: Math.max(13, Math.round(visualSize * 0.55)),
  }
}

export function fitMapToRadius(
  map,
  coordinate,
  radiusKm = CURRENT_LOCATION_FOCUS_RADIUS_KM,
) {
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
      maxZoom: MAP_MAX_ZOOM,
    },
  )
}

export function fitFeatureToMiddleHalf(
  map,
  feature,
  { height, topRail = 0 } = {},
) {
  const [west, south, east, north] = bbox(feature)
  const verticalPadding = Math.max(
    topRail,
    Math.round(height * FITZROY_INITIAL_VERTICAL_PADDING_RATIO),
  )
  const padding = {
    top: verticalPadding,
    right: 18,
    bottom: verticalPadding,
    left: 18,
  }
  const options = {
    padding,
    duration: 0,
    pitch: map.getPitch?.() ?? MAP_3D_VIEW.pitch,
    bearing: map.getBearing?.() ?? MAP_3D_VIEW.bearing,
    maxZoom: MAP_MAX_ZOOM,
  }

  map.fitBounds([[west, south], [east, north]], options)
  if (typeof map.getZoom === 'function' && typeof map.setZoom === 'function') {
    map.setZoom(Math.min(MAP_MAX_ZOOM, map.getZoom() + FITZROY_INITIAL_ZOOM_BOOST))
  }
  return { bounds: [[west, south], [east, north]], options }
}
