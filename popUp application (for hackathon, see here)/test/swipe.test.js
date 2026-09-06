import test from 'node:test'
import assert from 'node:assert/strict'

import * as cardNavigation from '../src/lib/swipe.js'

test('a light tap switches cards using the left and right halves', () => {
  assert.equal(typeof cardNavigation.getTapDirection, 'function')
  assert.equal(cardNavigation.getTapDirection?.({
    startX: 280, startY: 300, endX: 282, endY: 302, centerX: 190,
  }), 'next')
  assert.equal(cardNavigation.getTapDirection?.({
    startX: 100, startY: 300, endX: 102, endY: 298, centerX: 190,
  }), 'previous')
})

test('dragging or scrolling does not change cards', () => {
  assert.equal(cardNavigation.getTapDirection?.({
    startX: 180, startY: 200, endX: 180, endY: 240, centerX: 190,
  }), null)
  assert.equal(cardNavigation.getTapDirection?.({
    startX: 180, startY: 200, endX: 198, endY: 205, centerX: 190,
  }), null)
})
