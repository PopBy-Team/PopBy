import test from 'node:test'
import assert from 'node:assert/strict'

import { captureVideoFrame, stopMediaStream } from '../src/lib/camera.js'

test('stopMediaStream stops every active camera track', () => {
  const calls = []
  stopMediaStream({
    getTracks: () => [
      { stop: () => calls.push('video') },
      { stop: () => calls.push('audio') },
    ],
  })

  assert.deepEqual(calls, ['video', 'audio'])
})

test('captureVideoFrame copies the current camera frame into a JPEG Blob', async () => {
  const drawCalls = []
  const video = { videoWidth: 1280, videoHeight: 720 }
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ({
      drawImage: (...args) => drawCalls.push(args),
    }),
    toBlob(callback, type) {
      callback(new Blob(['photo'], { type }))
    },
  }

  const blob = await captureVideoFrame(video, canvas)

  assert.equal(canvas.width, 1280)
  assert.equal(canvas.height, 720)
  assert.deepEqual(drawCalls, [[video, 0, 0, 1280, 720]])
  assert.equal(blob.type, 'image/jpeg')
})

test('captureVideoFrame rejects before upload when the camera has no frame', async () => {
  await assert.rejects(
    () => captureVideoFrame(
      { videoWidth: 0, videoHeight: 0 },
      { getContext: () => ({ drawImage() {} }) },
    ),
    { message: 'Camera is not ready yet' },
  )
})
