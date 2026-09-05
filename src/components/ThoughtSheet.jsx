import { useEffect, useMemo, useRef, useState } from 'react'
import { buildThoughtDeck } from '../lib/cardOrder'
import { deleteThought, recordDwell, reportThought } from '../lib/api'
import { markTipShown, shouldShowTip } from '../lib/guidance'
import { CATEGORY_ICONS } from '../data/categories'
import { cardAppearanceClassNames } from '../lib/cardAppearance'
import { getSwipeDirection } from '../lib/swipe'

export default function ThoughtSheet({
  thoughts,
  deviceId,
  onClose,
  onReported,
  onDeleted,
}) {
  const deck = useMemo(() => buildThoughtDeck(thoughts), [thoughts])
  const [index, setIndex] = useState(0)
  const [showCardGuide, setShowCardGuide] = useState(() => shouldShowTip('card'))
  const [optionsOpen, setOptionsOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const touchStart = useRef(null)
  const enteredAt = useRef(performance.now())

  const current = deck[index]

  useEffect(() => {
    if (index >= deck.length && deck.length > 0) setIndex(deck.length - 1)
  }, [deck.length, index])

  useEffect(() => {
    enteredAt.current = performance.now()
    setOptionsOpen(false)
    setConfirming(false)
    setActionError('')

    return () => {
      if (!current) return
      const ms = Math.round(performance.now() - enteredAt.current)
      if (ms < 250) return
      void recordDwell(deviceId, current.id, ms).catch(() => {})
    }
  }, [index, current?.id, deviceId])

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  if (!current) return null

  function next() {
    setIndex((value) => (value + 1) % deck.length)
  }

  function previous() {
    setIndex((value) => (value - 1 + deck.length) % deck.length)
  }

  function dismissCardGuide() {
    markTipShown('card')
    setShowCardGuide(false)
  }

  async function runAction() {
    try {
      setBusy(true)
      setActionError('')

      if (current.is_own) {
        await deleteThought(deviceId, current.id)
        await onDeleted?.(current.id)
        if (deck.length === 1) onClose()
        return
      }

      await reportThought(deviceId, current.id)
      await onReported?.(current.id)
      onClose()
    } catch (error) {
      setActionError(error.message || 'Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const photoStyle = current.background_type === 'photo' && current.image_url
    ? { backgroundImage: `linear-gradient(rgba(18,17,14,.16), rgba(18,17,14,.30)), url("${current.image_url}")` }
    : undefined

  return (
    <div
      className="thought-reader-stage"
      role="dialog"
      aria-modal="true"
      aria-label="Thoughts at this location"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      {showCardGuide && (
        <div className="swipe-hint">
          <span>Newest first · swipe left or right</span>
          <button type="button" onClick={dismissCardGuide}>Got it</button>
        </div>
      )}

      <div className="thought-card-shell">
        <article
          className={`thought-card centered-thought-card ${cardAppearanceClassNames(current)}`}
          style={photoStyle}
          onPointerDown={(event) => {
            event.stopPropagation()
            touchStart.current = { x: event.clientX, y: event.clientY }
          }}
          onPointerUp={(event) => {
            if (!touchStart.current) return
            const direction = getSwipeDirection({
              startX: touchStart.current.x,
              startY: touchStart.current.y,
              endX: event.clientX,
              endY: event.clientY,
            })
            if (direction === 'next') next()
            if (direction === 'previous') previous()
            touchStart.current = null
          }}
          onPointerCancel={() => { touchStart.current = null }}
        >
          <header className="reader-card-header">
            <span className="reader-category-icon" aria-label={current.category}>
              {CATEGORY_ICONS[current.category] || '✨'}
            </span>
            <button
              className="thought-options-button"
              type="button"
              onClick={() => {
                setOptionsOpen((value) => !value)
                setConfirming(false)
                setActionError('')
              }}
              aria-label="Thought options"
              aria-expanded={optionsOpen}
            >
              ⋮
            </button>
          </header>

          {optionsOpen && (
            <div className="thought-options-menu" role="menu">
              {!confirming ? (
                <button
                  type="button"
                  role="menuitem"
                  className={current.is_own ? 'delete-option' : ''}
                  onClick={() => setConfirming(true)}
                >
                  {current.is_own ? 'Delete Thought' : 'Report Thought'}
                </button>
              ) : (
                <>
                  <strong>{current.is_own ? 'Delete your Thought?' : 'Report this Thought?'}</strong>
                  <span>
                    {current.is_own
                      ? 'This permanently removes it from PopBy.'
                      : 'Two unique reports automatically hide public abuse.'}
                  </span>
                  {actionError && <em role="alert">{actionError}</em>}
                  <div>
                    <button type="button" onClick={() => setConfirming(false)}>Cancel</button>
                    <button
                      type="button"
                      className={current.is_own ? 'confirm-delete' : 'confirm-report'}
                      disabled={busy}
                      onClick={runAction}
                    >
                      {busy ? 'Working…' : current.is_own ? 'Delete' : 'Report'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="card-body reader-card-body">
            {current.body || <em>No words. Just this moment.</em>}
          </div>

          <footer className="reader-card-footer">
            {current.music_url ? (
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
            ) : <span />}

            <time className="reader-card-time">
              {new Date(current.created_at).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </time>
          </footer>
        </article>
      </div>

      {deck.length > 1 && (
        <div className="reader-position" aria-live="polite">
          {index + 1} / {deck.length}
        </div>
      )}
    </div>
  )
}
