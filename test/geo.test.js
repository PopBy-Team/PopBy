import test from 'node:test'
import assert from 'node:assert/strict'

import {
  fitMapToRadius,
  getMarkerSize,
  getViewportMode,
  getViewportWidthMeters,
} from '../src/lib/geo.js'

test('getViewportMode switches at the meter-based range boundaries', () => {
  assert.equal(getViewportMode(1501), 'far')
  assert.equal(getViewportMode(1500), 'medium')
  assert.equal(getViewportMode(700), 'medium')
  assert.equal(getViewportMode(699), 'near')
})

test('getMarkerSize keeps medium markers consistent and tiers near markers', () => {
  assert.equal(getMarkerSize(1, 'medium'), 28)
  assert.equal(getMarkerSize(12, 'medium'), 28)
  assert.equal(getMarkerSize(1, 'near'), 24)
  assert.equal(getMarkerSize(3, 'near'), 24)
  assert.equal(getMarkerSize(4, 'near'), 32)
  assert.equal(getMarkerSize(9, 'near'), 32)
  assert.equal(getMarkerSize(10, 'near'), 40)
})

test('getViewportWidthMeters measures the horizontal viewport near its center latitude', () => {
  const map = {
    getBounds: () => ({ getWest: () => 144.9746, getEast: () => 144.9830 }),
    getCenter: () => ({ lat: -37.8005 }),
  }

  const width = getViewportWidthMeters(map)
  assert.ok(width > 730 && width < 750, `expected about 740m, received ${width}`)
})

test('fitMapToRadius fits a map around the requested coordinate', () => {
  let receivedBounds
  let receivedOptions
  const map = {
    fitBounds(bounds, options) {
      receivedBounds = bounds
      receivedOptions = options
    },
  }

  const coordinate = [144.9788, -37.8005]
  fitMapToRadius(map, coordinate)

  assert.equal(receivedBounds.length, 2)
  assert.ok(receivedBounds[0][0] < coordinate[0])
  assert.ok(receivedBounds[0][1] < coordinate[1])
  assert.ok(receivedBounds[1][0] > coordinate[0])
  assert.ok(receivedBounds[1][1] > coordinate[1])
  assert.deepEqual(receivedOptions, { padding: 36, duration: 900 })
})
