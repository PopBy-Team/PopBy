import test from 'node:test'
import assert from 'node:assert/strict'

import {
  CURRENT_LOCATION_FOCUS_RADIUS_KM,
  EXPANDED_AREA_FOCUS_RADIUS_KM,
  MAP_MAX_ZOOM,
  fitFeatureToMiddleHalf,
  fitMapToRadius,
  getMarkerPresentation,
  getMarkerSize,
  getViewportMode,
  getViewportWidthMeters,
} from '../src/lib/geo.js'
import * as geo from '../src/lib/geo.js'
import { FITZROY_FEATURE } from '../src/data/suburbs.js'

test('getViewportMode switches at the meter-based range boundaries', () => {
  assert.equal(getViewportMode(1501), 'far')
  assert.equal(getViewportMode(1500), 'medium')
  assert.equal(getViewportMode(1350), 'medium')
  assert.equal(getViewportMode(1349), 'near')
})

test('the initial 3D view is close enough to reveal Standard buildings', () => {
  assert.ok(geo.MAP_3D_VIEW.zoom >= 15.5)
  assert.ok(geo.MAP_3D_VIEW.pitch >= 45)
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

test('marker presentation keeps every mobile tap target at least 44px without changing visual tiers', () => {
  assert.deepEqual(getMarkerPresentation(1, 'near'), {
    visualSize: 24,
    touchSize: 44,
    iconSize: 13,
  })
  assert.deepEqual(getMarkerPresentation(5, 'near'), {
    visualSize: 32,
    touchSize: 44,
    iconSize: 18,
  })
  assert.deepEqual(getMarkerPresentation(12, 'near'), {
    visualSize: 40,
    touchSize: 44,
    iconSize: 22,
  })
  assert.deepEqual(getMarkerPresentation(12, 'medium'), {
    visualSize: 28,
    touchSize: 44,
    iconSize: 15,
  })
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

  assert.equal(CURRENT_LOCATION_FOCUS_RADIUS_KM, 0.2)
  assert.equal(EXPANDED_AREA_FOCUS_RADIUS_KM, 0.4)

  assert.equal(typeof geo.MAP_3D_VIEW, 'object')
  assert.equal(receivedBounds.length, 2)
  assert.ok(receivedBounds[0][0] < coordinate[0])
  assert.ok(receivedBounds[0][1] < coordinate[1])
  assert.ok(receivedBounds[1][0] > coordinate[0])
  assert.ok(receivedBounds[1][1] > coordinate[1])
  assert.deepEqual(receivedOptions, {
    padding: 36,
    duration: 900,
    pitch: geo.MAP_3D_VIEW.pitch,
    bearing: geo.MAP_3D_VIEW.bearing,
    maxZoom: MAP_MAX_ZOOM,
  })
})

test('initial Fitzroy fit lets the pitched suburb occupy about half of a portrait viewport', () => {
  const calls = []
  let finalZoom
  fitFeatureToMiddleHalf({
    fitBounds: (...args) => calls.push(args),
    getZoom: () => 14.2,
    setZoom: (zoom) => { finalZoom = zoom },
  }, FITZROY_FEATURE, {
    width: 390,
    height: 844,
    topRail: 54,
  })

  assert.equal(MAP_MAX_ZOOM, 20)
  assert.equal(calls.length, 1)
  assert.equal(calls[0][1].padding.top, 55)
  assert.equal(calls[0][1].padding.bottom, 55)
  assert.equal(calls[0][1].padding.left, 18)
  assert.equal(calls[0][1].duration, 0)
  assert.equal(finalZoom, 14.95)
})
