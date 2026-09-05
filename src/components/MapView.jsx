import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const FITZROY_CENTER = [144.9788, -37.8005]

export default function MapView() {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if (mapRef.current) return

    const map = new mapboxgl.Map({
      accessToken: import.meta.env.VITE_MAPBOX_TOKEN,

      container: mapContainerRef.current,

      style: 'mapbox://styles/mapbox/standard',

      center: FITZROY_CENTER,

      zoom: 14.3,

      pitch: 0,

      bearing: 0,
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  return (
    <div
      ref={mapContainerRef}
      style={{
        position: 'absolute',
        inset: 0,
      }}
    />
  )
}