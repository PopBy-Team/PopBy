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

export function createFarThoughtLayers() {
  return [
    {
      id: 'far-thought-dots',
      type: 'circle',
      source: 'thought-dots',
      paint: {
        'circle-radius': 4.5,
        'circle-color': '#f4c66b',
        'circle-opacity': 0.96,
        'circle-blur': 0.28,
        'circle-stroke-color': 'rgba(238, 171, 64, .46)',
        'circle-stroke-width': 4,
        'circle-emissive-strength': 1,
      },
    },
    {
      id: 'far-thought-hit-area',
      type: 'circle',
      source: 'thought-dots',
      paint: {
        'circle-radius': 22,
        'circle-color': '#000000',
        'circle-opacity': 0.001,
      },
    },
  ]
}

export function getThoughtMarkerState(location = {}) {
  const isViewed = Boolean(location.isUnlocked)
  return {
    isMine: Boolean(location.isMine),
    isClose: Boolean(location.isClose) && !isViewed,
    isViewed,
  }
}

export function getMapLabelPolicy(mode) {
  const far = mode === 'far'

  return {
    showPoiNames: !far,
    showRoadLabels: !far,
    showPlaceLabels: true,
  }
}

export function applyMapLabelPolicy(map, mode) {
  const policy = getMapLabelPolicy(mode)

  if (map.getLayer('poi-name-labels')) {
    map.setLayoutProperty(
      'poi-name-labels',
      'visibility',
      policy.showPoiNames ? 'visible' : 'none',
    )
  }

  map.setConfigProperty?.('basemap', 'showRoadLabels', policy.showRoadLabels)
  map.setConfigProperty?.('basemap', 'showPlaceLabels', policy.showPlaceLabels)

  return policy
}

export function shouldDismissProgress(currentlyDismissed, eventType, viewportMode) {
  if (currentlyDismissed) return true
  return eventType === 'zoomend' && viewportMode !== 'far'
}

export function createThoughtMarkerOptions(element) {
  return {
    element,
    anchor: 'center',
    offset: [0, 0],
    altitude: 0,
    pitchAlignment: 'viewport',
    rotationAlignment: 'viewport',
    occludedOpacity: 1,
  }
}

export function syncThoughtMarkerCoordinate(marker, location) {
  const coordinate = [Number(location.lng), Number(location.lat)]
  marker.setLngLat(coordinate)
  return coordinate
}

export function refreshLocationPresentation(map, locationsGeoJSON, syncMarkers) {
  map.getSource?.('thought-dots')?.setData(locationsGeoJSON)
  syncMarkers?.(map)
}

export function createLocationPresentationSync(map, syncMarkers) {
  let latestGeoJSON = null

  const applyLatest = () => {
    if (!latestGeoJSON) return
    map.getSource?.('thought-dots')?.setData(latestGeoJSON)
    syncMarkers?.(map, latestGeoJSON)
    map.triggerRepaint?.()
  }

  map.on?.('styledata', applyLatest)

  return {
    update(geoJSON) {
      latestGeoJSON = geoJSON
      applyLatest()
    },
    destroy() {
      map.off?.('styledata', applyLatest)
      latestGeoJSON = null
    },
  }
}

export function syncCurrentLocationMarker(marker, coordinate) {
  if (!marker || !coordinate) return null
  const next = [Number(coordinate[0]), Number(coordinate[1])]
  marker.setLngLat(next)
  return next
}
