import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

async function loadPresentation() {
  try {
    return await import('../src/lib/mapPresentation.js')
  } catch (error) {
    assert.fail(`map presentation module should load: ${error.code || error.message}`)
  }
}

test('the Standard basemap stays colorful while built-in POI symbols are replaced', async () => {
  const { STANDARD_BASEMAP_CONFIG } = await loadPresentation()

  assert.equal(STANDARD_BASEMAP_CONFIG.theme, 'default')
  assert.equal(STANDARD_BASEMAP_CONFIG.lightPreset, 'day')
  assert.equal(STANDARD_BASEMAP_CONFIG.showPlaceLabels, true)
  assert.equal(STANDARD_BASEMAP_CONFIG.showPointOfInterestLabels, false)
  assert.equal(STANDARD_BASEMAP_CONFIG.showLandmarkIcons, false)
})

test('the Standard basemap enables its 3D scene', async () => {
  const { STANDARD_BASEMAP_CONFIG } = await loadPresentation()

  assert.equal(STANDARD_BASEMAP_CONFIG.show3dObjects, true)
  assert.equal(STANDARD_BASEMAP_CONFIG.show3dBuildings, true)
  assert.equal(STANDARD_BASEMAP_CONFIG.show3dTrees, true)
})

test('the custom POI layer renders names without requesting an icon', async () => {
  const { createPoiNameLayer } = await loadPresentation()
  const layer = createPoiNameLayer()

  assert.equal(layer.type, 'symbol')
  assert.equal(layer['source-layer'], 'poi_label')
  assert.ok(layer.layout['text-field'])
  assert.equal(Object.hasOwn(layer.layout, 'icon-image'), false)
})

test('building and attraction names use a different color from street labels', async () => {
  const { createPoiNameLayer, STANDARD_BASEMAP_CONFIG } = await loadPresentation()
  const layer = createPoiNameLayer()

  assert.match(STANDARD_BASEMAP_CONFIG.colorRoadLabels, /^#[0-9a-f]{6}$/i)
  assert.notEqual(
    layer.paint['text-color'],
    STANDARD_BASEMAP_CONFIG.colorRoadLabels,
  )
})

test('street labels use a soft, lighter mid-tone color', async () => {
  const { STANDARD_BASEMAP_CONFIG } = await loadPresentation()
  const hex = STANDARD_BASEMAP_CONFIG.colorRoadLabels.slice(1)
  const channels = [0, 2, 4].map((offset) =>
    Number.parseInt(hex.slice(offset, offset + 2), 16)
  )

  assert.ok(channels.every((channel) => channel >= 115))
})

test('far Thought dots glow like pale-yellow fireflies inside a finger-sized hit layer', async () => {
  const { createFarThoughtLayers } = await loadPresentation()
  const [visualLayer, hitLayer] = createFarThoughtLayers()

  assert.equal(visualLayer.id, 'far-thought-dots')
  assert.equal(visualLayer.paint['circle-radius'], 4.5)
  assert.equal(visualLayer.paint['circle-color'], '#fff0a8')
  assert.ok(visualLayer.paint['circle-blur'] > 0)
  assert.ok(visualLayer.paint['circle-emissive-strength'] > 0)
  assert.ok(visualLayer.paint['circle-stroke-width'] > 0)
  assert.equal(hitLayer.id, 'far-thought-hit-area')
  assert.equal(hitLayer.paint['circle-radius'], 22)
  assert.ok(hitLayer.paint['circle-opacity'] > 0)
  assert.ok(hitLayer.paint['circle-opacity'] <= 0.01)
})

test('far mode hides detail labels while retaining suburb and locality names', async () => {
  const { getMapLabelPolicy } = await loadPresentation()

  assert.deepEqual(getMapLabelPolicy('far'), {
    showPoiNames: false,
    showRoadLabels: false,
    showPlaceLabels: true,
  })
  assert.deepEqual(getMapLabelPolicy('medium'), {
    showPoiNames: true,
    showRoadLabels: true,
    showPlaceLabels: true,
  })
})

test('label policy updates both the custom POI layer and Standard basemap labels', async () => {
  const { applyMapLabelPolicy } = await loadPresentation()
  const calls = []
  const map = {
    getLayer: (id) => id === 'poi-name-labels',
    setLayoutProperty: (...args) => calls.push(['layout', ...args]),
    setConfigProperty: (...args) => calls.push(['config', ...args]),
  }

  applyMapLabelPolicy(map, 'far')

  assert.deepEqual(calls, [
    ['layout', 'poi-name-labels', 'visibility', 'none'],
    ['config', 'basemap', 'showRoadLabels', false],
    ['config', 'basemap', 'showPlaceLabels', true],
  ])
})

test('progress dismisses only after a zoom ends in category-icon mode', async () => {
  const { shouldDismissProgress } = await loadPresentation()

  assert.equal(shouldDismissProgress(false, 'initial', 'near'), false)
  assert.equal(shouldDismissProgress(false, 'zoomend', 'far'), false)
  assert.equal(shouldDismissProgress(false, 'zoomend', 'medium'), true)
  assert.equal(shouldDismissProgress(false, 'zoomend', 'near'), true)
  assert.equal(shouldDismissProgress(true, 'zoomend', 'far'), true)
})

test('HTML markers stay centered at the Safe Anchor coordinate in the 3D view', async () => {
  const {
    createThoughtMarkerOptions,
    syncThoughtMarkerCoordinate,
  } = await loadPresentation()
  const element = { role: 'button' }
  const marker = {
    setLngLatCalls: [],
    setLngLat(value) {
      this.setLngLatCalls.push(value)
      return this
    },
  }

  assert.deepEqual(createThoughtMarkerOptions(element), {
    element,
    anchor: 'center',
    offset: [0, 0],
    altitude: 0,
    pitchAlignment: 'viewport',
    rotationAlignment: 'viewport',
    occludedOpacity: 1,
  })

  assert.deepEqual(
    syncThoughtMarkerCoordinate(marker, { lng: '144.9788', lat: '-37.8005' }),
    [144.9788, -37.8005],
  )
  assert.deepEqual(marker.setLngLatCalls, [[144.9788, -37.8005]])
})

test('location changes refresh HTML markers even while the map style is settling', async () => {
  const { refreshLocationPresentation } = await loadPresentation()
  const locationsGeoJSON = {
    type: 'FeatureCollection',
    features: [],
  }
  let renderedGeoJSON = null
  let renderedMarkerMap = null
  const map = {
    isStyleLoaded: () => false,
    getSource: (id) => id === 'thought-dots'
      ? { setData: (data) => { renderedGeoJSON = data } }
      : null,
  }

  refreshLocationPresentation(map, locationsGeoJSON, (currentMap) => {
    renderedMarkerMap = currentMap
  })

  assert.equal(renderedGeoJSON, locationsGeoJSON)
  assert.equal(renderedMarkerMap, map)
})

test('Thought marker CSS preserves Mapbox absolute positioning during zoom', async () => {
  const css = await readFile(new URL('../src/styles.css', import.meta.url), 'utf8')
  const markerRule = css.match(/\.thought-marker\s*\{[^}]+\}/)?.[0] || ''

  assert.match(markerRule, /position:\s*absolute/)
  assert.match(markerRule, /z-index:\s*1/)
  assert.match(markerRule, /top:\s*0/)
  assert.match(markerRule, /left:\s*0/)
})
