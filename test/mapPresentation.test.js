import test from 'node:test'
import assert from 'node:assert/strict'

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
