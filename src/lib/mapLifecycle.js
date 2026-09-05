export function disposeMap(map, mapRef, markersRef) {
  for (const marker of markersRef.current.values()) {
    marker.remove()
  }
  markersRef.current.clear()

  map.remove()
  if (mapRef.current === map) mapRef.current = null
}
