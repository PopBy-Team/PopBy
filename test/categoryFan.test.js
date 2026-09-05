import test from 'node:test'
import assert from 'node:assert/strict'

import { getCategoryFanPositions } from '../src/lib/categoryFan.js'

test('seven category bubbles form a compact ordered arc above the drop pin', () => {
  const positions = getCategoryFanPositions(7, 112)

  assert.equal(positions.length, 7)
  assert.ok(positions.every(({ y }) => y < 0))
  assert.ok(positions.every((item, index) =>
    index === 0 || item.x > positions[index - 1].x
  ))
  assert.equal(positions[3].y, Math.min(...positions.map(({ y }) => y)))
  assert.ok(positions.at(-1).x - positions[0].x <= 220)
})

test('an empty category list produces no fan coordinates', () => {
  assert.deepEqual(getCategoryFanPositions(0), [])
})
