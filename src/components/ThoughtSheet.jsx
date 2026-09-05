import { useEffect, useMemo, useRef, useState } from 'react'
import { buildThoughtDeck } from '../lib/cardOrder'
import { recordDwell, reportThought } from '../lib/api'
import { markTipShown, shouldShowTip } from '../lib/guidance'

function cardClass(thought) {
  return `thought-card bg-${thought.background_type || 'solid'}`
}

export default function ThoughtSheet({
  thoughts,
  deviceId,
  mineMode,
  onClose,
  onReported,
}) {
  const deck = useMemo(() => buildThoughtDeck(thoughts), [thoughts])
  const [index, setIndex] = useState(0)
  const [showCardGuide, setShowCardGuide] = useState(() => shouldShowTip('card'))
  const [reportPrompt, setReportPrompt] = useState(false)
  const [reporting, setReporting] = useState(false)
  const touchStart = useRef(null)
  const enteredAt = useRef(performance.now())

  const current = deck[index]

  useEffect(() => {
    enteredAt.current = performance.now()
    return () => {
      if (!current) return
      const ms = Math.round(performance.now() - enteredAt.current)
      if (ms < 250) return
      void recordDwell(deviceId, current.id, ms).catch(() => {})
    }
  }, [index, current?.id])

  if (!current) return null

  function next() {
    setIndex((i) => (i + 1) % deck.length)
  }

  function previous() {
    setIndex((i) => (i - 1 + deck.length) % deck.length)
  }

  function dismissCardGuide() {
    markTipShown('card')
    setShowCardGuide(false)
  }

  async function report() {
    try {
      setReporting(true)
      await reportThought(deviceId, current.id)

      await onReported?.()
      onClose()
    } catch (error) {
      alert(error.message)
    } finally {
      setReporting(false)
    }
  }

  const photoStyle = current.background_type === 'photo' && current.image_url
    ? { backgroundImage: `linear-gradient(rgba(0,0,0,.22), rgba(0,0,0,.22)), url("${current.image_url}")` }
    : undefined

  return (
    <div className="sheet-backdrop" onMouseDown={(e) => {
      if (e.target === e.currentTarget) onClose()
    }}>
      <section className="thought-sheet sheet">
        <div className="sheet-handle" />

        <div className="thought-topbar">
          <span>{mineMode ? 'Mine · your Thoughts only' : `${index + 1} / ${deck.length}`}</span>
          <div>
            {!mineMode && (
              <button
                className="ghost-button small"
                onClick={() => setReportPrompt((v) => !v)}
                aria-label="Thought options"
              >
                •••
              </button>
            )}
            <button className="ghost-button" onClick={onClose}>×</button>
          </div>
        </div>

        {showCardGuide && (
          <div className="inline-guide">
            <div>
              <strong>Read at your own pace</strong>
              <span>
                The newest card appears first. Swipe left/right for more; use •••
                to report a public Thought.
              </span>
            </div>
            <button onClick={dismissCardGuide}>Got it</button>
          </div>
        )}

        {reportPrompt && !mineMode && (
          <div className="report-confirm">
            <div>
              <strong>Report this Thought?</strong>
              <span>
                Each device can report once. 2 unique reports automatically hide
                the Thought.
              </span>
            </div>
            <div>
              <button className="secondary-button" onClick={() => setReportPrompt(false)}>
                Cancel
              </button>
              <button className="danger-button" disabled={reporting} onClick={report}>
                {reporting ? 'Reporting…' : 'Report'}
              </button>
            </div>
          </div>
        )}

        <article
          className={cardClass(current)}
          style={photoStyle}
          onTouchStart={(e) => {
            touchStart.current = e.touches[0].clientX
          }}
          onTouchEnd={(e) => {
            if (touchStart.current == null) return
            const delta = e.changedTouches[0].clientX - touchStart.current
            if (delta < -50) next()
            if (delta > 50) previous()
            touchStart.current = null
          }}
        >
          <div className="card-meta">
            <strong>{current.category}</strong>
            <span>{new Date(current.created_at).toLocaleString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}</span>
          </div>

          <div className="card-body">
            {current.body || <em>No words. Just this moment.</em>}
          </div>

          {current.music_url && (
            <a
              className="music-player"
              href={current.music_url}
              target="_blank"
              rel="noreferrer"
            >
              <span className="play">▶</span>
              <span>
                <strong>Music</strong>
                <small>Open track</small>
              </span>
            </a>
          )}
        </article>

        <div className="card-controls">
          <button className="ghost-button wide" onClick={previous}>←</button>
          <span>Swipe</span>
          <button className="ghost-button wide" onClick={next}>→</button>
        </div>
      </section>
    </div>
  )
}
