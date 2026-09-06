import { useEffect, useMemo, useRef, useState } from 'react'
import { buildThoughtDeck } from '../lib/cardOrder'
import { deleteThought, recordDwell, reportThought } from '../lib/api'
import { markTipShown, shouldShowTip } from '../lib/guidance'
import { CATEGORY_ICONS } from '../data/categories'
import { cardAppearanceClassNames } from '../lib/cardAppearance'
import { getTapDirection } from '../lib/swipe'
import {
  advanceSwipeIndicator,
  formatThoughtTimestamp,
  getSwipeIndicatorState,
} from '../lib/cardPresentation'

export default function ThoughtSheet({
  thoughts,
  location,
  deviceId,
  onClose,
  onReported,
  onDeleted,
  onAdd,
}) {
  const deck = useMemo(() => buildThoughtDeck(thoughts), [thoughts])
  const [index, setIndex] = useState(0)
  const [showCardGuide, setShowCardGuide] = useState(() => shouldShowTip('card'))
  const [optionsOpen, setOptionsOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [swipeState, setSwipeState] = useState(() => getSwipeIndicatorState())
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
    setSwipeState((value) => advanceSwipeIndicator(value, 'next'))
    setIndex((value) => (value + 1) % deck.length)
  }

  function previous() {
    setSwipeState((value) => advanceSwipeIndicator(value, 'previous'))
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
      className={showCardGuide ? 'thought-reader-stage has-card-guide' : 'thought-reader-stage'}
      role="dialog"
      aria-modal="true"
      aria-label="Thoughts at this location"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      {showCardGuide && (
        <div className="swipe-hint">
          <span>Newest first · tap either side</span>
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
            if (event.target.closest?.('button, a, input, textarea, [role="menu"]')) {
              touchStart.current = null
              return
            }
            const bounds = event.currentTarget.getBoundingClientRect()
            const direction = getTapDirection({
              startX: touchStart.current.x,
              startY: touchStart.current.y,
              endX: event.clientX,
              endY: event.clientY,
              centerX: bounds.left + (bounds.width / 2),
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
              <span aria-hidden="true">⋮</span>
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
                <span className="play">🎵</span>
                <strong>Open BGM</strong>
              </a>
            ) : <span />}

            <time className="reader-card-time">
              {formatThoughtTimestamp(current.created_at)}
            </time>
          </footer>

          {deck.length > 1 && (
            <div
              key={`${swipeState.direction}-${swipeState.sequence}`}
              className={`reader-swipe-dots is-${swipeState.direction}`}
              aria-label={`Thought ${index + 1} of ${deck.length}`}
              aria-live="polite"
            >
              <i />
              <i />
              <i />
            </div>
          )}
        </article>
        <button
          className="reader-add-button"
          type="button"
          onClick={() => onAdd?.(location)}
        >
          Add
        </button>
      </div>

    </div>
  )
}
