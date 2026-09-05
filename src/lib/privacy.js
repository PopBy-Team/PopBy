const token = import.meta.env?.VITE_MAPBOX_TOKEN

const SAFE_CLASS_PRIORITY = {
  pedestrian: 4,
  street_limited: 5,
  street: 6,
  tertiary: 7,
  secondary: 8,
  primary: 9,
}

const PATH_TYPE_PRIORITY = {
  sidewalk: 0,
  footway: 1,
  crossing: 2,
  path: 3,
}

function rankRoad(feature) {
  const p = feature.properties || {}
  const priority = p.class === 'path'
    ? PATH_TYPE_PRIORITY[p.type]
    : SAFE_CLASS_PRIORITY[p.class]
  const distance = Number(p.tilequery?.distance ?? 999)
  return (priority * 1000) + distance
}

export function selectSafeAnchor(features = []) {
  const insideBuilding = features.some((feature) =>
    feature.properties?.tilequery?.layer === 'building' &&
    feature.properties?.tilequery?.geometry === 'polygon' &&
    Number(feature.properties?.tilequery?.distance) === 0
  )

  const best = features
    .filter((feature) => {
      const properties = feature.properties || {}
      const type = String(properties.type || '').toLowerCase()
      if (properties.tilequery?.layer !== 'road') return false
      if (properties.tilequery?.geometry !== 'linestring') return false
      if (properties.access === 'restricted') return false
      if (type.includes('driveway')) return false
      if (!Array.isArray(feature.geometry?.coordinates)) return false
      if (properties.class === 'path') {
        return Object.hasOwn(PATH_TYPE_PRIORITY, properties.type)
      }
      return Object.hasOwn(SAFE_CLASS_PRIORITY, properties.class)
    })
    .sort((a, b) => rankRoad(a) - rankRoad(b))[0]

  if (!best) {
    throw new Error(
      'No nearby public path found. Move a little closer to the street and try again.',
    )
  }

  return {
    coordinate: best.geometry.coordinates,
    insideBuilding,
    snapped: true,
    anchorClass: best.properties?.class,
    anchorType: best.properties?.type,
    distanceMeters: Number(best.properties?.tilequery?.distance ?? 0),
  }
}

/**
 * Privacy Safe Anchor:
 * 1) Query nearby Mapbox Streets building + road features.
 * 2) Detect if original drop is inside a building.
 * 3) Prefer nearby sidewalk/footway/pedestrian/street coordinates.
 * 4) Exclude restricted roads and service/driveway-style roads.
 * 5) If no accepted Safe Anchor is found, block publish.
 *
 * Only the returned safe coordinate should be stored as the public coordinate.
 */
export async function getSafeAnchor([lng, lat]) {
  if (!token) throw new Error('Missing VITE_MAPBOX_TOKEN')

  const params = new URLSearchParams({
    radius: '40',
    layers: 'building,road',
    limit: '50',
    access_token: token,
  })

  const url =
    `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/tilequery/` +
    `${lng},${lat}.json?${params.toString()}`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Privacy check failed (${response.status})`)
  }

  const data = await response.json()
  return selectSafeAnchor(data.features || [])
}
