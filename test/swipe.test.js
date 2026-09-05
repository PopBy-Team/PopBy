import test from 'node:test'
import assert from 'node:assert/strict'

import { getSwipeDirection } from '../src/lib/swipe.js'

test('a deliberate horizontal gesture navigates the card deck', () => {
  assert.equal(getSwipeDirection({ startX: 280, startY: 300, endX: 190, endY: 315 }), 'next')
  assert.equal(getSwipeDirection({ startX: 100, startY: 300, endX: 180, endY: 292 }), 'previous')
})

test('vertical scrolling and short movement do not change cards', () => {
  assert.equal(getSwipeDirection({ startX: 180, startY: 200, endX: 140, endY: 300 }), null)
  assert.equal(getSwipeDirection({ startX: 180, startY: 200, endX: 145, endY: 205 }), null)
})
