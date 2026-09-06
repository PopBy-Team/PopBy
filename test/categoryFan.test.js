import test from 'node:test'
import assert from 'node:assert/strict'

import {
  getCategoryFanPositions,
  getFanSelectionClass,
  getFanPresentationTarget,
} from '../src/lib/categoryFan.js'

test('seven category bubbles form a compact ordered arc above the drop pin', () => {
  const positions = getCategoryFanPositions(7, {
    radiusX: 132,
    radiusY: 88,
    direction: 'up',
  })

  assert.equal(positions.length, 7)
  assert.ok(positions.every(({ y }) => y < 0))
  assert.ok(positions.every((item, index) =>
    index === 0 || item.x > positions[index - 1].x
  ))
  assert.equal(positions[3].y, Math.min(...positions.map(({ y }) => y)))
  assert.ok(positions.every(({ y }) => Math.abs(y) <= 88))
  for (let index = 1; index < positions.length; index += 1) {
    assert.ok(Math.hypot(
      positions[index].x - positions[index - 1].x,
      positions[index].y - positions[index - 1].y,
    ) >= 44)
  }
})

test('the default fan stays within a shallow one-fifth-phone arc', () => {
  const positions = getCategoryFanPositions(7)
  assert.ok(positions.every(({ y }) => Math.abs(y) <= 88))
})

test('an empty category list produces no fan coordinates', () => {
  assert.deepEqual(getCategoryFanPositions(0), [])
})

test('fan presentation moves to a safe lower-middle target on a phone', () => {
  const target = getFanPresentationTarget({
    width: 390,
    height: 844,
    topRail: 54,
    bottomInset: 34,
  })

  assert.deepEqual(target, { x: 195, y: 523, direction: 'up' })
})

test('fan selection highlights one category and quiets the others', () => {
  assert.equal(getFanSelectionClass(null, 'Nature'), '')
  assert.equal(getFanSelectionClass('Nature', 'Nature'), 'is-selected')
  assert.equal(getFanSelectionClass('Nature', 'Art'), 'is-muted')
})
