const token = import.meta.env.VITE_MAPBOX_TOKEN

const SAFE_CLASS_PRIORITY = {
  path: 0,
  pedestrian: 1,
  street_limited: 2,
  street: 3,
  tertiary: 4,
  secondary: 5,
  primary: 6,
}

const PATH_TYPE_PRIORITY = {
  sidewalk: -3,
  footway: -3,
  crossing: -2,
  path: -1,
  hiking: -1,
  trail: -1,
}

function rankRoad(feature) {
  const p = feature.properties || {}
  const classRank = SAFE_CLASS_PRIORITY[p.class] ?? 99
  const typeRank = PATH_TYPE_PRIORITY[p.type] ?? 0
  const distance = p.tilequery?.distance ?? 999
  return (classRank * 1000) + (typeRank * 100) + distance
}

/**
 * Privacy Safe Anchor:
 * 1) Query nearby Mapbox Streets building + road features.
 * 2) Detect if original drop is inside a building.
 * 3) Prefer nearby sidewalk/footway/pedestrian/street coordinates.
 * 4) Exclude restricted roads and service/driveway-style roads.
 * 5) If the point is inside a building and no safe anchor is found, block publish.
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
  const features = data.features || []

  const insideBuilding = features.some((f) =>
    f.properties?.tilequery?.layer === 'building' &&
    Number(f.properties?.tilequery?.distance) === 0
  )

  const roadCandidates = features
    .filter((f) => {
      const p = f.properties || {}
      if (p.tilequery?.layer !== 'road') return false
      if (p.tilequery?.geometry !== 'linestring') return false
      if (p.access === 'restricted') return false
      if (p.class === 'service' || p.class === 'track') return false
      if ((p.type || '').includes('driveway')) return false
      return Object.hasOwn(SAFE_CLASS_PRIORITY, p.class)
    })
    .sort((a, b) => rankRoad(a) - rankRoad(b))

  const best = roadCandidates[0]

  if (best) {
    return {
      coordinate: best.geometry.coordinates,
      insideBuilding,
      snapped: true,
      anchorClass: best.properties?.class,
      anchorType: best.properties?.type,
      distanceMeters: best.properties?.tilequery?.distance ?? null,
    }
  }

  if (insideBuilding) {
    throw new Error('No nearby public path found. Move a little closer to the street and try again.')
  }

  // If not inside a mapped building, keep the original point.
  // It will still be merged into a ~20m location node by Supabase.
  return {
    coordinate: [lng, lat],
    insideBuilding: false,
    snapped: false,
    anchorClass: null,
    anchorType: null,
    distanceMeters: 0,
  }
}
