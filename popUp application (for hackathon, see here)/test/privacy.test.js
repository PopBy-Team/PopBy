import test from 'node:test'
import assert from 'node:assert/strict'

test('privacy rules can be loaded outside the Vite browser runtime', async () => {
  await assert.doesNotReject(() => import('../src/lib/privacy.js'))
})

function road({
  roadClass = 'street',
  type = '',
  distance = 10,
  coordinate = [144.9788, -37.8005],
  access,
  geometry = 'linestring',
} = {}) {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: coordinate },
    properties: {
      class: roadClass,
      type,
      access,
      tilequery: { layer: 'road', geometry, distance },
    },
  }
}

test('Safe Anchor prefers sidewalk and footway candidates before streets', async () => {
  const privacy = await import('../src/lib/privacy.js')
  assert.equal(typeof privacy.selectSafeAnchor, 'function')

  const result = privacy.selectSafeAnchor([
    road({ roadClass: 'street', distance: 1, coordinate: [1, 1] }),
    road({ roadClass: 'path', type: 'footway', distance: 4, coordinate: [2, 2] }),
    road({ roadClass: 'path', type: 'sidewalk', distance: 22, coordinate: [3, 3] }),
  ])

  assert.deepEqual(result.coordinate, [3, 3])
  assert.equal(result.anchorClass, 'path')
  assert.equal(result.anchorType, 'sidewalk')
  assert.equal(result.snapped, true)
})

test('Safe Anchor rejects restricted and unsafe road classes or driveway types', async () => {
  const privacy = await import('../src/lib/privacy.js')
  assert.equal(typeof privacy.selectSafeAnchor, 'function')

  const result = privacy.selectSafeAnchor([
    road({ roadClass: 'service', distance: 1 }),
    road({ roadClass: 'track', distance: 1 }),
    road({ roadClass: 'construction', distance: 1 }),
    road({ roadClass: 'motorway', distance: 1 }),
    road({ roadClass: 'motorway_link', distance: 1 }),
    road({ roadClass: 'trunk', distance: 1 }),
    road({ roadClass: 'trunk_link', distance: 1 }),
    road({ roadClass: 'path', type: 'driveway', distance: 1 }),
    road({ roadClass: 'street', access: 'restricted', distance: 1 }),
    road({ roadClass: 'street', geometry: 'polygon', distance: 1 }),
    road({ roadClass: 'primary', distance: 30, coordinate: [9, 9] }),
  ])

  assert.deepEqual(result.coordinate, [9, 9])
  assert.equal(result.anchorClass, 'primary')
})

test('Building Check requires a zero-distance building polygon', async () => {
  const privacy = await import('../src/lib/privacy.js')
  assert.equal(typeof privacy.selectSafeAnchor, 'function')
  const building = (geometry, distance) => ({
    geometry: { type: 'Point', coordinates: [0, 0] },
    properties: { tilequery: { layer: 'building', geometry, distance } },
  })

  assert.equal(
    privacy.selectSafeAnchor([building('linestring', 0), road()]).insideBuilding,
    false,
  )
  assert.equal(
    privacy.selectSafeAnchor([building('polygon', 0), road()]).insideBuilding,
    true,
  )
})

test('Safe Anchor blocks publishing when no accepted public path is available', async () => {
  const privacy = await import('../src/lib/privacy.js')
  assert.equal(typeof privacy.selectSafeAnchor, 'function')

  assert.throws(
    () => privacy.selectSafeAnchor([road({ roadClass: 'service' })]),
    { message: /No nearby public path found/ },
  )
})
