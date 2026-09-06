import test from 'node:test'
import assert from 'node:assert/strict'

import { getAreaLabel } from '../src/data/suburbs.js'

test('area labels follow known suburb polygons and fall back to Melbourne', () => {
  assert.equal(getAreaLabel([144.9788, -37.8005]), 'MELBOURNE · FITZROY')
  assert.equal(getAreaLabel([144.965, -37.799]), 'MELBOURNE · CARLTON')
  assert.equal(getAreaLabel([145.05, -37.86]), 'MELBOURNE')
  assert.equal(getAreaLabel(null), 'MELBOURNE')
})
