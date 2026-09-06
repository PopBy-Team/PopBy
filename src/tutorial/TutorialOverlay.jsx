import { useEffect, useId, useMemo, useState } from 'react'
import { CATEGORY_ICONS } from '../data/categories'
import { getSpotlightBlockers, getSpotlightRect } from './tutorialGeometry'
import { STEP_UI, TUTORIAL, isTutorialFocusCandidate } from './tutorialSteps'
import './tutorial.css'

function useTutorialTargetRect(targetId) {
  const [rect, setRect] = useState(null)

  useEffect(() => {
    if (!targetId) {
      setRect(null)
      return undefined
    }

    let frame = 0
    let previous = ''
    const update = () => {
      const node = document.querySelector(`[data-tutorial-id="${targetId}"]`)
      if (node) {
        const next = node.getBoundingClientRect()
        const key = [next.left, next.top, next.width, next.height]
          .map((value) => Math.round(value * 2) / 2)
          .join(':')
        if (key !== previous) {
          previous = key
          setRect({
            left: next.left,
            top: next.top,
            width: next.width,
            height: next.height,
          })
        }
      } else if (previous) {
        previous = ''
        setRect(null)
      }
      frame = window.requestAnimationFrame(update)
    }

    update()
    return () => window.cancelAnimationFrame(frame)
  }, [targetId])

  return rect
}

function TutorialDemo({ type, zoom }) {
  if (type === 'zoom') {
    return (
      <div className="tutorial-zoom-demo" aria-hidden="true">
        <i />
        <span>↔</span>
        <i />
        <b className={zoom.in ? 'done' : ''}>in</b>
        <b className={zoom.out ? 'done' : ''}>out</b>
      </div>
    )
  }

  if (type === 'categories') {
    return (
      <div className="tutorial-category-demo" aria-hidden="true">
        {Object.values(CATEGORY_ICONS).map((icon) => <span key={icon}>{icon}</span>)}
      </div>
    )
  }

  if (type === 'availability') {
    return (
      <div className="tutorial-availability-demo" aria-hidden="true">
        <span><i className="is-far" />locked</span>
        <span><i className="is-near">🌳</i>open · 50m</span>
      </div>
    )
  }

  if (type === 'cardTap') {
    return (
      <div className="tutorial-card-tap-demo" aria-hidden="true">
        <span>tap left</span><i>↔</i><span>tap right</span>
      </div>
    )
  }

  if (type === 'font') {
    return <div className="tutorial-font-demo" aria-hidden="true"><i>Aa</i><b>Aa</b></div>
  }

  if (type === 'fontSize') {
    return <div className="tutorial-size-demo" aria-hidden="true"><i>Aa</i><i>Aa</i><i>Aa</i></div>
  }

  return null
}

function getCopyStyle(spotlight, placement, viewport) {
  if (!spotlight || placement === 'center') return undefined

  const center = spotlight.left + (spotlight.width / 2)
  const copyWidth = Math.min(320, viewport.width - 36)
  const left = Math.min(
    viewport.width - copyWidth - 18,
    Math.max(18, center - (copyWidth / 2)),
  )
  const preferBelow = placement === 'below'
  const candidateTop = preferBelow
    ? spotlight.top + spotlight.height + 26
    : spotlight.top - 172

  return {
    left,
    top: Math.max(82, Math.min(viewport.height - 210, candidateTop)),
    width: copyWidth,
  }
}

export default function TutorialOverlay({
  step,
  zoom,
  locationError,
  onAdvance,
  onRetryLocation,
  onSkip,
}) {
  const config = STEP_UI[step]
  const targetRect = useTutorialTargetRect(config?.target)
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }))
  const maskId = useId().replaceAll(':', '')

  useEffect(() => {
    const update = () => setViewport({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', update)
    window.visualViewport?.addEventListener('resize', update)
    return () => {
      window.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('resize', update)
    }
  }, [])

  useEffect(() => {
    if (!config || step === TUTORIAL.OFF) return undefined

    const keepFocusInsideGuide = (event) => {
      if (event.key !== 'Tab') return

      const candidates = [
        config.target === 'map' ? document.querySelector('.mapboxgl-canvas') : null,
        config.target
          ? document.querySelector(`[data-tutorial-id="${config.target}"]`)
          : null,
        document.querySelector('.tutorial-capture'),
        document.querySelector('.tutorial-retry'),
        document.querySelector('.tutorial-skip'),
      ].filter((node, index, values) => (
        isTutorialFocusCandidate(node) && values.indexOf(node) === index
      ))

      if (!candidates.length) return
      const currentIndex = candidates.indexOf(document.activeElement)
      const nextIndex = event.shiftKey
        ? (currentIndex <= 0 ? candidates.length - 1 : currentIndex - 1)
        : (currentIndex + 1) % candidates.length
      event.preventDefault()
      candidates[nextIndex].focus?.()
    }

    document.addEventListener('keydown', keepFocusInsideGuide)
    return () => document.removeEventListener('keydown', keepFocusInsideGuide)
  }, [config, step])

  const spotlight = useMemo(() => getSpotlightRect(targetRect, {
    ...viewport,
    padding: config?.target === 'map' ? 0 : config?.shape === 'circle' ? 14 : 10,
  }), [config?.shape, config?.target, targetRect, viewport])
  const blockers = useMemo(
    () => getSpotlightBlockers(spotlight, viewport),
    [spotlight, viewport],
  )

  if (!config || step === TUTORIAL.OFF) return null

  const radius = config.shape === 'circle'
    ? Math.max(spotlight?.width || 0, spotlight?.height || 0) / 2
    : 18
  const copyStyle = getCopyStyle(spotlight, config.placement, viewport)
  const displayText = locationError && step === TUTORIAL.LOCATE
    ? 'Location is off.'
    : config.text
  const displaySubtext = locationError && step === TUTORIAL.LOCATE
    ? 'Allow it, try again, or Skip.'
    : config.subtext

  return (
    <div
      className={`tutorial-layer tutorial-step-${step} ${config.emphasis === 'strong' ? 'is-strong' : ''}`}
      aria-live="polite"
    >
      <svg
        className="tutorial-mask"
        viewBox={`0 0 ${viewport.width} ${viewport.height}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <mask id={maskId}>
            <rect width="100%" height="100%" fill="white" />
            {spotlight && (
              <rect
                x={spotlight.left}
                y={spotlight.top}
                width={spotlight.width}
                height={spotlight.height}
                rx={radius}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(9,10,10,.78)"
          mask={`url(#${maskId})`}
        />
      </svg>

      {config.mode !== 'none' && blockers.map((blocker, index) => (
        <div
          key={index}
          className="tutorial-blocker"
          style={blocker}
          onPointerDown={(event) => event.preventDefault()}
          aria-hidden="true"
        />
      ))}

      {spotlight && (
        <div
          className={`tutorial-spotlight is-${config.shape}`}
          style={{
            left: spotlight.left,
            top: spotlight.top,
            width: spotlight.width,
            height: spotlight.height,
            borderRadius: radius,
          }}
          aria-hidden="true"
        />
      )}

      {config.mode === 'capture' && spotlight && (
        <button
          className="tutorial-capture"
          type="button"
          style={{
            left: spotlight.left,
            top: spotlight.top,
            width: spotlight.width,
            height: spotlight.height,
            borderRadius: radius,
          }}
          onClick={onAdvance}
          aria-label={`${config.text} Continue tutorial`}
        />
      )}

      <div className="tutorial-copy" style={copyStyle}>
        <span className="tutorial-kicker">PopBy field guide</span>
        <strong>{displayText}</strong>
        {displaySubtext && <p>{displaySubtext}</p>}
        <TutorialDemo type={config.demo} zoom={zoom} />
        {locationError && step === TUTORIAL.LOCATE && (
          <button className="tutorial-retry" type="button" onClick={onRetryLocation}>
            Try again
          </button>
        )}
      </div>

      {step !== TUTORIAL.COMPLETE && (
        <button className="tutorial-skip" type="button" onClick={onSkip}>
          Skip
        </button>
      )}
    </div>
  )
}
