import test from 'node:test'
import assert from 'node:assert/strict'

import { disposeMap } from '../src/lib/mapLifecycle.js'

test('disposeMap clears the instance ref so Strict Mode can create the map again', () => {
  let mapRemoveCalls = 0
  let markerRemoveCalls = 0
  const map = { remove: () => { mapRemoveCalls += 1 } }
  const mapRef = { current: map }
  const markersRef = {
    current: new Map([
      ['one', { remove: () => { markerRemoveCalls += 1 } }],
    ]),
  }

  disposeMap(map, mapRef, markersRef)

  assert.equal(mapRef.current, null)
  assert.equal(markersRef.current.size, 0)
  assert.equal(mapRemoveCalls, 1)
  assert.equal(markerRemoveCalls, 1)
})
