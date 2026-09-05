import test from 'node:test'
import assert from 'node:assert/strict'

import * as lifecycle from '../src/lib/mapLifecycle.js'

const { disposeMap } = lifecycle

function fakeCanvas() {
  const listeners = new Map()
  return {
    addEventListener(type, handler) {
      const handlers = listeners.get(type) || new Set()
      handlers.add(handler)
      listeners.set(type, handlers)
    },
    removeEventListener(type, handler) {
      listeners.get(type)?.delete(handler)
    },
    getBoundingClientRect() {
      return { left: 10, top: 20 }
    },
    emit(type, values = {}) {
      const event = {
        button: 0,
        pointerType: 'touch',
        clientX: 60,
        clientY: 50,
        preventDefault() {},
        ...values,
      }
      for (const handler of listeners.get(type) || []) handler(event)
    },
  }
}

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

test('holding the map for 650ms commits the unprojected coordinate', () => {
  assert.equal(typeof lifecycle.attachMapLongPress, 'function')
  const canvas = fakeCanvas()
  const commits = []
  let scheduled
  const map = {
    getCanvas: () => canvas,
    unproject: ([x, y]) => ({ lng: x / 10, lat: y / 10 }),
    once() {},
  }

  lifecycle.attachMapLongPress(map, (coordinate) => commits.push(coordinate), {
    schedule(callback, delay) {
      scheduled = { callback, delay }
      return 1
    },
    cancel() {
      scheduled = null
    },
    vibrate() {},
  })

  canvas.emit('pointerdown')
  assert.equal(scheduled.delay, 650)
  scheduled.callback()
  assert.deepEqual(commits, [[5, 3]])
})

test('moving more than 10px cancels a pending map long-press', () => {
  assert.equal(typeof lifecycle.attachMapLongPress, 'function')
  const canvas = fakeCanvas()
  const commits = []
  let scheduled
  const map = {
    getCanvas: () => canvas,
    unproject: () => ({ lng: 144.9788, lat: -37.8005 }),
    once() {},
  }

  lifecycle.attachMapLongPress(map, (coordinate) => commits.push(coordinate), {
    schedule(callback, delay) {
      scheduled = { callback, delay }
      return 1
    },
    cancel() {
      scheduled = null
    },
    vibrate() {},
  })

  canvas.emit('pointerdown')
  canvas.emit('pointermove', { clientX: 71 })

  assert.equal(scheduled, null)
  assert.deepEqual(commits, [])
})

test('desktop context menu opens the same drop coordinate', () => {
  assert.equal(typeof lifecycle.attachMapLongPress, 'function')
  const canvas = fakeCanvas()
  const commits = []
  let prevented = false
  const map = {
    getCanvas: () => canvas,
    unproject: ([x, y]) => ({ lng: x, lat: y }),
    once() {},
  }

  lifecycle.attachMapLongPress(map, (coordinate) => commits.push(coordinate))
  canvas.emit('contextmenu', {
    preventDefault() {
      prevented = true
    },
  })

  assert.equal(prevented, true)
  assert.deepEqual(commits, [[50, 30]])
})
