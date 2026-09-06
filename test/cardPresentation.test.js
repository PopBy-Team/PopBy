import test from 'node:test'
import assert from 'node:assert/strict'

import {
  advanceSwipeIndicator,
  formatThoughtTimestamp,
  getSwipeIndicatorState,
} from '../src/lib/cardPresentation.js'

test('reader timestamps contain the full date and minute', () => {
  const text = formatThoughtTimestamp('2026-09-06T08:15:00.000Z', 'en-AU')
  assert.match(text, /2026/)
  assert.match(text, /Sep/)
  assert.match(text, /06|6/)
  assert.match(text, /15/)
})

test('every swipe receives a fresh animation sequence', () => {
  assert.deepEqual(getSwipeIndicatorState(), { direction: 'idle', sequence: 0 })
  assert.deepEqual(
    advanceSwipeIndicator({ direction: 'next', sequence: 1 }, 'next'),
    { direction: 'next', sequence: 2 },
  )
})
