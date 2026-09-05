function rectangle(west, south, east, north, name, status) {
  return {
    type: 'Feature',
    properties: { name, status },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [west, south],
        [east, south],
        [east, north],
        [west, north],
        [west, south],
      ]],
    },
  }
}

/**
 * Approximate demo boundaries only.
 * For a polished submission, redraw/replace them with official suburb GeoJSON.
 */
export function makeSuburbsGeoJSON(carltonUnlocked = false) {
  return {
    type: 'FeatureCollection',
    features: [
      rectangle(144.9736, -37.8074, 144.9843, -37.7931, 'Fitzroy', 'unlocked'),
      rectangle(144.9547, -37.8074, 144.9736, -37.7910, 'Carlton', carltonUnlocked ? 'unlocked' : 'locked'),
      rectangle(144.9843, -37.8098, 144.9985, -37.7931, 'Collingwood', 'locked'),
      rectangle(144.9736, -37.7931, 144.9950, -37.7780, 'Fitzroy North', 'locked'),
    ],
  }
}

export function pointInsideFitzroy([lng, lat]) {
  // Same approximate boundary used by the demo map.
  return (
    lng >= 144.9736 &&
    lng <= 144.9843 &&
    lat >= -37.8074 &&
    lat <= -37.7931
  )
}
