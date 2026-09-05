import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { CATEGORY_ICONS } from '../data/categories'
import { makeSuburbsGeoJSON } from '../data/suburbs'
import {
  fitMapToRadius,
  getMarkerSize,
  getViewportMode,
  getViewportWidthMeters,
} from '../lib/geo'
import { disposeMap } from '../lib/mapLifecycle'

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
  onLongPress,
  onLockedSuburbClick,
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef(new Map())
  const locationsRef = useRef(locations)
  const clickRef = useRef(onLocationClick)
  const userLocationRef = useRef(onUserLocation)
  const longPressRef = useRef(onLongPress)
  const lockedClickRef = useRef(onLockedSuburbClick)

  useEffect(() => { locationsRef.current = locations }, [locations])
  useEffect(() => { clickRef.current = onLocationClick }, [onLocationClick])
  useEffect(() => { userLocationRef.current = onUserLocation }, [onUserLocation])
  useEffect(() => { longPressRef.current = onLongPress }, [onLongPress])
  useEffect(() => { lockedClickRef.current = onLockedSuburbClick }, [onLockedSuburbClick])

  useEffect(() => {
    if (mapRef.current) return

    const map = new mapboxgl.Map({
      accessToken: import.meta.env.VITE_MAPBOX_TOKEN,
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/standard',
      center: FITZROY_CENTER,
      zoom: 14.2,
      pitch: 0,
      bearing: 0,
      config: {
        basemap: {
          theme: 'monochrome',
          lightPreset: 'day',
          showPointOfInterestLabels: false,
          showTransitLabels: false,
          show3dObjects: false,
          showPedestrianRoads: true,
          showRoadLabels: true,
        },
      },
    })

    mapRef.current = map

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
      showAccuracyCircle: true,
      fitBoundsOptions: { maxZoom: 16 },
    })
    map.addControl(geolocate, 'bottom-right')

    geolocate.on('geolocate', (event) => {
      const coordinate = [event.coords.longitude, event.coords.latitude]
      userLocationRef.current?.(coordinate)
      fitMapToRadius(map, coordinate)
    })

    map.on('load', () => {
      map.addSource('suburbs', {
        type: 'geojson',
        data: makeSuburbsGeoJSON(progress >= 1),
      })

      map.addLayer({
        id: 'suburb-fill',
        type: 'fill',
        source: 'suburbs',
        paint: {
          'fill-color': [
            'match',
            ['get', 'status'],
            'unlocked', '#fff0a8',
            '#b8b8b8',
          ],
          'fill-opacity': [
            'match',
            ['get', 'status'],
            'unlocked', 0.20,
            0.35,
          ],
        },
      })

      map.addLayer({
        id: 'suburb-line',
        type: 'line',
        source: 'suburbs',
        paint: {
          'line-color': '#ffffff',
          'line-width': 1.5,
          'line-opacity': 0.8,
        },
      })

      map.addSource('thought-dots', {
        type: 'geojson',
        data: toGeoJSON(locationsRef.current),
      })

      map.addLayer({
        id: 'far-thought-dots',
        type: 'circle',
        source: 'thought-dots',
        paint: {
          'circle-radius': 5,
          'circle-color': '#272727',
          'circle-opacity': 0.75,
        },
      })

      map.on('click', 'suburb-fill', (event) => {
        const feature = event.features?.[0]
        if (feature?.properties?.status === 'locked') {
          lockedClickRef.current?.(feature.properties.name)
        }
      })

      map.on('click', 'far-thought-dots', (event) => {
        const id = event.features?.[0]?.properties?.id
        const loc = locationsRef.current.find((x) => x.location_id === id)
        if (loc) clickRef.current?.(loc)
      })

      setupLongPress(map)
      syncMarkers(map)
    })

    const syncMarkers = (currentMap = map) => {
      if (!currentMap.isStyleLoaded()) return

      const viewportMode = getViewportMode(getViewportWidthMeters(currentMap))
      const showMarkers = viewportMode !== 'far'
      const currentIds = new Set(locationsRef.current.map((l) => l.location_id))

      if (currentMap.getLayer('far-thought-dots')) {
        currentMap.setLayoutProperty(
          'far-thought-dots',
          'visibility',
          viewportMode === 'far' ? 'visible' : 'none',
        )
      }

      for (const [id, marker] of markersRef.current.entries()) {
        if (!currentIds.has(id)) {
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
          el.addEventListener('click', (e) => {
            e.stopPropagation()
            const latest = locationsRef.current.find(
              (x) => x.location_id === loc.location_id
            )
            if (latest) clickRef.current?.(latest)
          })

          marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
            .setLngLat([loc.lng, loc.lat])
            .addTo(currentMap)

          markersRef.current.set(loc.location_id, marker)
        }

        const el = marker.getElement()
        const size = getMarkerSize(Number(loc.thought_count || 1), viewportMode)
        el.textContent = CATEGORY_ICONS[loc.dominant_category] || '✦'
        el.style.width = `${size}px`
        el.style.height = `${size}px`
        el.style.fontSize = `${Math.max(13, size * 0.55)}px`
        el.style.display = showMarkers ? 'grid' : 'none'
        el.classList.toggle('is-mine', Boolean(loc.isMine))
        el.classList.toggle('is-close', Boolean(loc.isClose))
        el.classList.toggle('is-unlocked', Boolean(loc.isUnlocked))
      }
    }

    map.on('move', () => syncMarkers(map))

    function setupLongPress(currentMap) {
      const canvas = currentMap.getCanvas()
      let timer = null
      let start = null

      const clear = () => {
        if (timer) clearTimeout(timer)
        timer = null
        start = null
      }

      const pointerDown = (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return
        const rect = canvas.getBoundingClientRect()
        start = {
          clientX: event.clientX,
          clientY: event.clientY,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        }

        timer = setTimeout(() => {
          const lngLat = currentMap.unproject([start.x, start.y])
          navigator.vibrate?.(20)
          longPressRef.current?.([lngLat.lng, lngLat.lat])
          clear()
        }, 650)
      }

      const pointerMove = (event) => {
        if (!start) return
        if (Math.hypot(event.clientX - start.clientX, event.clientY - start.clientY) > 10) {
          clear()
        }
      }

      canvas.addEventListener('pointerdown', pointerDown)
      canvas.addEventListener('pointermove', pointerMove)
      canvas.addEventListener('pointerup', clear)
      canvas.addEventListener('pointercancel', clear)

      currentMap.once('remove', () => {
        canvas.removeEventListener('pointerdown', pointerDown)
        canvas.removeEventListener('pointermove', pointerMove)
        canvas.removeEventListener('pointerup', clear)
        canvas.removeEventListener('pointercancel', clear)
      })
    }

    return () => disposeMap(map, mapRef, markersRef)
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map?.isStyleLoaded()) return

    const source = map.getSource('thought-dots')
    source?.setData(toGeoJSON(locations))

    map.fire('move')
  }, [locations])

  useEffect(() => {
    const map = mapRef.current
    const source = map?.getSource('suburbs')
    source?.setData(makeSuburbsGeoJSON(progress >= 1))
  }, [progress])

  return <div ref={containerRef} className="map" role="region" aria-label="PopBy map" />
}
