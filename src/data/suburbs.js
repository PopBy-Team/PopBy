import { booleanPointInPolygon, point } from '@turf/turf'

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
 * Fitzroy locality boundary from Vicmap Admin LOCALITY_POLYGON, simplified to
 * six decimal places for the browser bundle.
 *
 * Source: State Government of Victoria, Vicmap Admin (CC BY 4.0).
 * https://discover.data.vic.gov.au/dataset/vicmap-admin-rest-api
 */
export const FITZROY_FEATURE = {
  type: 'Feature',
  properties: { name: 'Fitzroy', status: 'unlocked' },
  geometry: {
    type: 'Polygon',
    coordinates: [[
      [144.974884, -37.797929],
      [144.975319, -37.795417],
      [144.975707, -37.793124],
      [144.975707, -37.793122],
      [144.975722, -37.793034],
      [144.975746, -37.7929],
      [144.977142, -37.79305],
      [144.977325, -37.793068],
      [144.978241, -37.793162],
      [144.978302, -37.793168],
      [144.978816, -37.793221],
      [144.979325, -37.793275],
      [144.979573, -37.793303],
      [144.979631, -37.793309],
      [144.980521, -37.793399],
      [144.981574, -37.793511],
      [144.982754, -37.793634],
      [144.98395, -37.793762],
      [144.985152, -37.793885],
      [144.98428, -37.798947],
      [144.982559, -37.808908],
      [144.982448, -37.808897],
      [144.982446, -37.808896],
      [144.973306, -37.807922],
      [144.973305, -37.807921],
      [144.973194, -37.80791],
      [144.973209, -37.807821],
      [144.974014, -37.803097],
      [144.974333, -37.801201],
      [144.974884, -37.797929],
    ]],
  },
}

const WEB_MERCATOR_WORLD_RING = [
  [-180, -85.051129],
  [180, -85.051129],
  [180, 85.051129],
  [-180, 85.051129],
  [-180, -85.051129],
]

export function makeFitzroyMaskGeoJSON() {
  return {
    type: 'Feature',
    properties: { kind: 'outside-fitzroy' },
    geometry: {
      type: 'Polygon',
      coordinates: [
        WEB_MERCATOR_WORLD_RING,
        [...FITZROY_FEATURE.geometry.coordinates[0]].reverse(),
      ],
    },
  }
}

export function makeSuburbsGeoJSON(carltonUnlocked = false) {
  return {
    type: 'FeatureCollection',
    features: [
      FITZROY_FEATURE,
      rectangle(144.9547, -37.8074, 144.9736, -37.7910, 'Carlton', carltonUnlocked ? 'unlocked' : 'locked'),
      rectangle(144.9843, -37.8098, 144.9985, -37.7931, 'Collingwood', 'locked'),
      rectangle(144.9736, -37.7931, 144.9950, -37.7780, 'Fitzroy North', 'locked'),
    ],
  }
}

export function pointInsideFitzroy([lng, lat]) {
  return booleanPointInPolygon(point([lng, lat]), FITZROY_FEATURE)
}
