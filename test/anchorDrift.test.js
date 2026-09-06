import test from 'node:test'
import assert from 'node:assert/strict'

import {
  animateAnchorDrift,
  interpolateCoordinate,
} from '../src/lib/anchorDrift.js'

test('anchor drift interpolation clamps progress and moves longitude and latitude', () => {
  assert.deepEqual(interpolateCoordinate([0, 10], [10, 30], -1), [0, 10])
  assert.deepEqual(interpolateCoordinate([0, 10], [10, 30], 0.5), [5, 20])
  assert.deepEqual(interpolateCoordinate([0, 10], [10, 30], 2), [10, 30])
})

test('anchor drift completes at the safe coordinate', () => {
  const frames = []
  const updates = []
  let completed = false
  let time = 0
  const requestFrame = (callback) => {
    frames.push(callback)
    return frames.length
  }

  animateAnchorDrift({
    from: [1, 2],
    to: [3, 6],
    duration: 100,
    now: () => time,
    requestFrame,
    cancelFrame: () => {},
    onUpdate: (coordinate) => updates.push(coordinate),
    onComplete: () => { completed = true },
  })

  time = 0
  frames.shift()(0)
  time = 100
  frames.shift()(100)

  assert.deepEqual(updates.at(-1), [3, 6])
  assert.equal(completed, true)
})

test('cancelling anchor drift prevents future updates', () => {
  const frames = []
  const cancelled = []
  const updates = []
  const control = animateAnchorDrift({
    from: [0, 0],
    to: [1, 1],
    requestFrame: (callback) => {
      frames.push(callback)
      return 42
    },
    cancelFrame: (id) => cancelled.push(id),
    onUpdate: (coordinate) => updates.push(coordinate),
  })

  control.cancel()
  frames.shift()(0)

  assert.deepEqual(cancelled, [42])
  assert.deepEqual(updates, [])
})
