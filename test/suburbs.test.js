import test from 'node:test'
import assert from 'node:assert/strict'
import { booleanPointInPolygon, point } from '@turf/turf'
import * as suburbs from '../src/data/suburbs.js'

test('pointInsideFitzroy rejects the southeast corner outside the real suburb boundary', () => {
  assert.equal(suburbs.pointInsideFitzroy([144.984, -37.807]), false)
})

test('pointInsideFitzroy keeps the central Fitzroy demo location active', () => {
  assert.equal(suburbs.pointInsideFitzroy([144.9788, -37.8005]), true)
})

test('the outside mask dims the world while leaving Fitzroy as a cutout', () => {
  assert.equal(typeof suburbs.makeFitzroyMaskGeoJSON, 'function')

  const mask = suburbs.makeFitzroyMaskGeoJSON()
  assert.equal(mask.geometry.type, 'Polygon')
  assert.equal(mask.geometry.coordinates.length, 2)
  assert.equal(
    booleanPointInPolygon(point([144.9788, -37.8005]), mask),
    false,
  )
  assert.equal(
    booleanPointInPolygon(point([144.97, -37.8005]), mask),
    true,
  )
})
