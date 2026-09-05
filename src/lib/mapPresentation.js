export const STANDARD_BASEMAP_CONFIG = Object.freeze({
  theme: 'default',
  lightPreset: 'day',
  showPlaceLabels: true,
  showPointOfInterestLabels: false,
  showTransitLabels: false,
  showLandmarkIcons: false,
  showLandmarkIconLabels: false,
  show3dObjects: true,
  show3dBuildings: true,
  show3dTrees: true,
  show3dLandmarks: true,
  show3dFacades: true,
  showPedestrianRoads: true,
  showRoadLabels: true,
  colorRoadLabels: '#7a878d',
})

const SCENIC_POI_CLASSES = [
  'arts_and_entertainment',
  'historic',
  'landmark',
  'park_like',
  'place_like',
  'visitor_amenities',
]

export function createPoiNameLayer() {
  return {
    id: 'poi-name-labels',
    type: 'symbol',
    source: 'mapbox-streets',
    'source-layer': 'poi_label',
    slot: 'top',
    minzoom: 12,
    filter: [
      'all',
      ['has', 'name'],
      ['<=', ['coalesce', ['get', 'filterrank'], 5], 3],
      ['match', ['get', 'class'], SCENIC_POI_CLASSES, true, false],
    ],
    layout: {
      'text-field': ['coalesce', ['get', 'name_en'], ['get', 'name']],
      'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
      'text-size': ['interpolate', ['linear'], ['zoom'], 12, 10, 16, 13],
      'text-letter-spacing': 0.01,
      'text-max-width': 12,
      'text-padding': 4,
      'text-optional': true,
      'symbol-sort-key': ['coalesce', ['get', 'filterrank'], 5],
    },
    paint: {
      'text-color': '#8a4f3d',
      'text-halo-color': 'rgba(255, 250, 242, 0.96)',
      'text-halo-width': 1.4,
      'text-halo-blur': 0.3,
      'text-emissive-strength': 0.7,
    },
  }
}
