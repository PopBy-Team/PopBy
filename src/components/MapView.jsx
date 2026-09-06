import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { CATEGORY_ICONS } from '../data/categories'
import {
  FITZROY_FEATURE,
  getAreaLabel,
  makeFitzroyMaskGeoJSON,
  makeSuburbsGeoJSON,
} from '../data/suburbs'
import {
  fitFeatureToMiddleHalf,
  fitMapToRadius,
  MAP_MAX_ZOOM,
  MAP_3D_VIEW,
  getMarkerPresentation,
  getViewportMode,
  getViewportWidthMeters,
} from '../lib/geo'
import {
  attachElementLongPress,
  attachMapLongPress,
  disposeMap,
} from '../lib/mapLifecycle'
import {
  applyMapLabelPolicy,
  createLocationPresentationSync,
  createFarThoughtLayers,
  createPoiNameLayer,
  createThoughtMarkerOptions,
  getThoughtMarkerState,
  STANDARD_BASEMAP_CONFIG,
  syncCurrentLocationMarker,
  syncThoughtMarkerCoordinate,
} from '../lib/mapPresentation'
import DropCategoryFan from './DropCategoryFan'

const FITZROY_CENTER = [144.9788, -37.8005]

function toGeoJSON(locations) {
  return {
    type: 'FeatureCollection',
    features: locations.map((loc) => ({
      type: 'Feature',
      properties: {
        id: loc.location_id,
        count: loc.thought_count,
      },
      geometry: {
        type: 'Point',
        coordinates: [loc.lng, loc.lat],
      },
    })),
  }
}

export default function MapView({
  locations,
  progress,
  onUserLocation,
  onLocationClick,
  onLocationLongPress,
  onLongPress,
  onLockedSuburbClick,
  onViewportModeChange,
  onAreaLabelChange,
  userLocation,
  dropCoordinate,
  onDropCategorySelect,
  onDropAnchorResolve,
  onDropResolveError,
  onDropCancel,
}) {
  const [bearing, setBearing] = useState(MAP_3D_VIEW.bearing)
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef(new Map())
  const markerHoldCleanupsRef = useRef(new Map())
  const currentLocationMarkerRef = useRef(null)
  const syncCurrentLocationRef = useRef(null)
  const presentationSyncRef = useRef(null)
  const syncMarkersRef = useRef(null)
  const locationsRef = useRef(locations)
  const clickRef = useRef(onLocationClick)
  const locationLongPressRef = useRef(onLocationLongPress)
  const onUserLocationRef = useRef(onUserLocation)
  const currentLocationRef = useRef(userLocation)
  const geolocateRef = useRef(null)
  const longPressRef = useRef(onLongPress)
  const lockedClickRef = useRef(onLockedSuburbClick)
  const viewportModeChangeRef = useRef(onViewportModeChange)
  const areaLabelChangeRef = useRef(onAreaLabelChange)

  useEffect(() => { clickRef.current = onLocationClick }, [onLocationClick])
  useEffect(() => {
    locationLongPressRef.current = onLocationLongPress
  }, [onLocationLongPress])
  useEffect(() => { onUserLocationRef.current = onUserLocation }, [onUserLocation])
  useEffect(() => { currentLocationRef.current = userLocation }, [userLocation])
  useEffect(() => { longPressRef.current = onLongPress }, [onLongPress])
  useEffect(() => { lockedClickRef.current = onLockedSuburbClick }, [onLockedSuburbClick])
  useEffect(() => {
    viewportModeChangeRef.current = onViewportModeChange
  }, [onViewportModeChange])
  useEffect(() => {
    areaLabelChangeRef.current = onAreaLabelChange
  }, [onAreaLabelChange])

  useEffect(() => {
    if (mapRef.current) return

    let lastViewportMode = null

    const map = new mapboxgl.Map({
      accessToken: import.meta.env.VITE_MAPBOX_TOKEN,
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/standard',
      center: FITZROY_CENTER,
      zoom: MAP_3D_VIEW.zoom,
      pitch: MAP_3D_VIEW.pitch,
      bearing: MAP_3D_VIEW.bearing,
      config: {
        basemap: STANDARD_BASEMAP_CONFIG,
      },
      maxZoom: MAP_MAX_ZOOM,
    })

    mapRef.current = map
    map.dragRotate.enable()
    map.touchZoomRotate.enable()
    map.touchZoomRotate.enableRotation()

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
      showUserLocation: false,
      showAccuracyCircle: true,
      fitBoundsOptions: { maxZoom: 16 },
    })
    geolocateRef.current = geolocate
    map.addControl(geolocate, 'bottom-right')

    geolocate.on('geolocate', (event) => {
      const coordinate = [event.coords.longitude, event.coords.latitude]
      currentLocationRef.current = coordinate
      syncCurrentLocationRef.current?.(coordinate)
      onUserLocationRef.current?.(coordinate)
      fitMapToRadius(map, coordinate)
    })

    const syncCurrentLocation = (coordinate) => {
      if (!coordinate) return

      if (!currentLocationMarkerRef.current) {
        const element = document.createElement('div')
        element.className = 'current-location-dot'
        element.setAttribute('aria-hidden', 'true')
        currentLocationMarkerRef.current = new mapboxgl.Marker({
          element,
          anchor: 'center',
          pitchAlignment: 'viewport',
          rotationAlignment: 'viewport',
        }).setLngLat(coordinate).addTo(map)
      }

      syncCurrentLocationMarker(currentLocationMarkerRef.current, coordinate)
    }
    syncCurrentLocationRef.current = syncCurrentLocation

    map.on('load', () => {
      map.addSource('suburbs', {
        type: 'geojson',
        data: makeSuburbsGeoJSON(progress >= 1),
      })

      map.addSource('fitzroy-mask', {
        type: 'geojson',
        data: makeFitzroyMaskGeoJSON(),
      })

      map.addSource('mapbox-streets', {
        type: 'vector',
        url: 'mapbox://mapbox.mapbox-streets-v8',
      })

      map.addLayer(createPoiNameLayer())

      map.addLayer({
        id: 'outside-fitzroy-mask',
        type: 'fill',
        source: 'fitzroy-mask',
        slot: 'top',
        paint: {
          'fill-color': '#16191d',
          'fill-opacity': 0.48,
          'fill-emissive-strength': 0.15,
        },
      })

      map.addLayer({
        id: 'fitzroy-boundary',
        type: 'line',
        source: 'suburbs',
        slot: 'top',
        filter: ['==', ['get', 'name'], 'Fitzroy'],
        paint: {
          'line-color': '#f0c96d',
          'line-width': ['interpolate', ['linear'], ['zoom'], 11, 1.25, 16, 2.25],
          'line-opacity': 0.92,
        },
      })

      map.addLayer({
        id: 'locked-suburb-hit-area',
        type: 'fill',
        source: 'suburbs',
        slot: 'top',
        filter: ['==', ['get', 'status'], 'locked'],
        paint: {
          'fill-color': '#000000',
          'fill-opacity': 0.001,
        },
      })

      map.addSource('thought-dots', {
        type: 'geojson',
        data: toGeoJSON(locationsRef.current),
      })

      for (const layer of createFarThoughtLayers()) map.addLayer(layer)

      fitFeatureToMiddleHalf(map, FITZROY_FEATURE, {
        width: map.getContainer().clientWidth,
        height: map.getContainer().clientHeight,
        topRail: 54,
      })
      syncCurrentLocation(currentLocationRef.current)
      areaLabelChangeRef.current?.(getAreaLabel([
        map.getCenter().lng,
        map.getCenter().lat,
      ]))

      map.on('click', 'locked-suburb-hit-area', (event) => {
        const feature = event.features?.[0]
        if (feature?.properties?.status === 'locked') {
          lockedClickRef.current?.(feature.properties.name)
        }
      })

      map.on('click', 'far-thought-hit-area', (event) => {
        const id = event.features?.[0]?.properties?.id
        const loc = locationsRef.current.find((x) => x.location_id === id)
        if (loc) clickRef.current?.(loc)
      })

      attachMapLongPress(map, (coordinate) => longPressRef.current?.(coordinate))
      syncMarkers(map)

      map.on('zoomend', () => {
        const viewportMode = getViewportMode(getViewportWidthMeters(map))
        viewportModeChangeRef.current?.(viewportMode)
      })

      map.on('moveend', () => {
        const center = map.getCenter()
        areaLabelChangeRef.current?.(getAreaLabel([center.lng, center.lat]))
      })

      map.on('rotate', () => setBearing(map.getBearing()))
    })

    const syncMarkers = (currentMap = map) => {
      const styleReady = currentMap.isStyleLoaded()
      const viewportWidthMeters = getViewportWidthMeters(currentMap)
      const viewportMode = getViewportMode(viewportWidthMeters)
      const showMarkers = viewportMode !== 'far'
      const currentIds = new Set(locationsRef.current.map((l) => l.location_id))

      if (styleReady && lastViewportMode !== viewportMode) {
        const isInitialMode = lastViewportMode === null
        applyMapLabelPolicy(currentMap, viewportMode)
        lastViewportMode = viewportMode
        if (!isInitialMode) viewportModeChangeRef.current?.(viewportMode)
      }

      if (styleReady && currentMap.getLayer('far-thought-dots')) {
        for (const layerId of ['far-thought-dots', 'far-thought-hit-area']) {
          currentMap.setLayoutProperty(
            layerId,
            'visibility',
            viewportMode === 'far' ? 'visible' : 'none',
          )
        }
      }

      for (const [id, marker] of markersRef.current.entries()) {
        if (!currentIds.has(id)) {
          markerHoldCleanupsRef.current.get(id)?.()
          markerHoldCleanupsRef.current.delete(id)
          marker.remove()
          markersRef.current.delete(id)
        }
      }

      for (const loc of locationsRef.current) {
        let marker = markersRef.current.get(loc.location_id)
        if (!marker) {
          const el = document.createElement('button')
          el.type = 'button'
          el.className = 'thought-marker'
          el.setAttribute('aria-label', 'Open Thoughts at this location')
          const openMarker = () => {
            const latest = locationsRef.current.find(
              (x) => x.location_id === loc.location_id
            )
            if (latest) clickRef.current?.(latest)
          }
          const cleanupHold = attachElementLongPress(el, () => {
            const latest = locationsRef.current.find(
              (x) => x.location_id === loc.location_id
            )
            if (latest) locationLongPressRef.current?.(latest)
          })
          markerHoldCleanupsRef.current.set(loc.location_id, cleanupHold)
          el.addEventListener('click', (event) => {
            event.stopPropagation()
            openMarker()
          })
          el.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return
            event.preventDefault()
            event.stopPropagation()
            openMarker()
          })

          marker = new mapboxgl.Marker(createThoughtMarkerOptions(el))
            .setLngLat([Number(loc.lng), Number(loc.lat)])
            .addTo(currentMap)

          // Mapbox assigns image semantics to Marker elements. These markers are
          // interactive, so restore button semantics after Marker initialization.
          el.setAttribute('role', 'button')
          el.tabIndex = 0

          markersRef.current.set(loc.location_id, marker)
        }

        const el = marker.getElement()
        syncThoughtMarkerCoordinate(marker, loc)
        const markerPresentation = getMarkerPresentation(
          Number(loc.thought_count || 1),
          viewportMode,
        )
        el.textContent = ''
        el.dataset.icon = CATEGORY_ICONS[loc.dominant_category] || '✨'
        el.setAttribute(
          'aria-label',
          `Open ${loc.dominant_category || 'nearby'} Thoughts at this location`,
        )
        el.style.width = `${markerPresentation.touchSize}px`
        el.style.height = `${markerPresentation.touchSize}px`
        el.style.fontSize = `${markerPresentation.iconSize}px`
        el.style.setProperty('--marker-size', `${markerPresentation.visualSize}px`)
        el.style.display = showMarkers ? 'grid' : 'none'
        const markerState = getThoughtMarkerState(loc)
        el.classList.toggle('is-mine', markerState.isMine)
        el.classList.toggle('is-close', markerState.isClose)
        el.classList.toggle('is-viewed', markerState.isViewed)
      }
    }
    syncMarkersRef.current = syncMarkers
    presentationSyncRef.current = createLocationPresentationSync(map, syncMarkers)

    map.on('move', () => syncMarkers(map))

    return () => {
      presentationSyncRef.current?.destroy()
      presentationSyncRef.current = null
      for (const cleanupHold of markerHoldCleanupsRef.current.values()) cleanupHold()
      markerHoldCleanupsRef.current.clear()
      currentLocationMarkerRef.current?.remove()
      currentLocationMarkerRef.current = null
      syncCurrentLocationRef.current = null
      syncMarkersRef.current = null
      geolocateRef.current = null
      disposeMap(map, mapRef, markersRef)
    }
  }, [])

  useEffect(() => {
    locationsRef.current = locations
    const map = mapRef.current
    if (!map) return

    presentationSyncRef.current?.update(toGeoJSON(locations))
  }, [locations])

  useEffect(() => {
    currentLocationRef.current = userLocation
    syncCurrentLocationRef.current?.(userLocation)
  }, [userLocation])

  useEffect(() => {
    const map = mapRef.current
    const source = map?.getSource('suburbs')
    source?.setData(makeSuburbsGeoJSON(progress >= 1))
  }, [progress])

  function recenter() {
    const map = mapRef.current
    const coordinate = currentLocationRef.current

    if (map && coordinate) {
      fitMapToRadius(map, coordinate)
      return
    }

    geolocateRef.current?.trigger()
  }

  function resetBearing() {
    mapRef.current?.easeTo({
      bearing: MAP_3D_VIEW.bearing,
      duration: 360,
    })
  }

  return (
    <>
      <div ref={containerRef} className="map" role="region" aria-label="PopBy map" />
      <button
        className="map-compass"
        type="button"
        onClick={resetBearing}
        aria-label="Reset map direction"
        title="Reset map direction"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          style={{ transform: `rotate(${-bearing}deg)` }}
        >
          <path d="m12 3 4.2 14.6L12 15l-4.2 2.6L12 3Z" />
        </svg>
      </button>
      <button
        className="recenter-button"
        type="button"
        onClick={recenter}
        aria-label="Back to my location"
        title="Back to my location"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
      </button>
      {dropCoordinate && (
        <DropCategoryFan
          map={mapRef.current}
          coordinate={dropCoordinate}
          onSelect={onDropCategorySelect}
          onResolveAnchor={onDropAnchorResolve}
          onResolveError={onDropResolveError}
          onCancel={onDropCancel}
        />
      )}
    </>
  )
}
