export function stopMediaStream(stream) {
  for (const track of stream?.getTracks?.() || []) track.stop()
}

export function captureVideoFrame(video, canvas, quality = 0.9) {
  const width = Number(video?.videoWidth || 0)
  const height = Number(video?.videoHeight || 0)
  if (!width || !height) return Promise.reject(new Error('Camera is not ready yet'))

  const context = canvas?.getContext?.('2d')
  if (!context) return Promise.reject(new Error('Camera capture is unavailable'))

  canvas.width = width
  canvas.height = height
  context.drawImage(video, 0, 0, width, height)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Camera capture failed'))
        return
      }
      resolve(blob)
    }, 'image/jpeg', quality)
  })
}
