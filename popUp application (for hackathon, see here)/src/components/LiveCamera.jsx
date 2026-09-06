import { useEffect, useRef, useState } from 'react'
import { captureVideoFrame, stopMediaStream } from '../lib/camera'

export default function LiveCamera({ onCapture, onCancel }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [attempt, setAttempt] = useState(0)
  const [status, setStatus] = useState('starting')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function start() {
      setStatus('starting')
      setError('')
      stopMediaStream(streamRef.current)
      streamRef.current = null

      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('error')
        setError('Live camera needs HTTPS or localhost on a supported phone browser.')
        return
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        })
        if (!active) {
          stopMediaStream(stream)
          return
        }

        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
        }
        setStatus('ready')
      } catch {
        setStatus('error')
        setError('Camera access was blocked. Allow camera permission, then try again.')
      }
    }

    void start()
    return () => {
      active = false
      stopMediaStream(streamRef.current)
      streamRef.current = null
    }
  }, [attempt])

  function cancel() {
    stopMediaStream(streamRef.current)
    streamRef.current = null
    onCancel?.()
  }

  async function capture() {
    try {
      setStatus('capturing')
      const blob = await captureVideoFrame(videoRef.current, canvasRef.current)
      stopMediaStream(streamRef.current)
      streamRef.current = null
      onCapture?.(blob)
    } catch (captureError) {
      setStatus('error')
      setError(captureError.message)
    }
  }

  return (
    <div className="live-camera" role="dialog" aria-modal="true" aria-label="Take a live photo">
      <video ref={videoRef} playsInline muted aria-label="Live rear camera preview" />
      <canvas ref={canvasRef} hidden />

      <div className="camera-shade" aria-hidden="true" />
      <button className="camera-cancel" type="button" onClick={cancel}>
        Cancel
      </button>

      {status === 'starting' && <div className="camera-status">Opening camera…</div>}
      {status === 'error' && (
        <div className="camera-error" role="alert">
          <strong>Camera unavailable</strong>
          <span>{error}</span>
          <button type="button" onClick={() => setAttempt((value) => value + 1)}>
            Try again
          </button>
        </div>
      )}

      {(status === 'ready' || status === 'capturing') && (
        <button
          className="camera-shutter"
          type="button"
          onClick={capture}
          disabled={status === 'capturing'}
          aria-label="Take photo now"
        >
          <span />
        </button>
      )}
    </div>
  )
}
