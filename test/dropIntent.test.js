import test from 'node:test'
import assert from 'node:assert/strict'

import { getDropPermission } from '../src/lib/dropIntent.js'

test('adding to a point requires a current location', () => {
  assert.deepEqual(getDropPermission(null, [144.9788, -37.8005]), {
    allowed: false,
    distanceMeters: Infinity,
    reason: 'location_required',
  })
})

test('adding is allowed only at an open Fitzroy point within 50m', () => {
  assert.equal(
    getDropPermission([144.9788, -37.8005], [144.9789, -37.8005]).allowed,
    true,
  )
  assert.equal(
    getDropPermission([144.95, -37.82], [144.9789, -37.8005]).reason,
    'too_far',
  )
  assert.equal(
    getDropPermission([144.97, -37.81], [144.97, -37.81]).reason,
    'outside_active_area',
  )
})
