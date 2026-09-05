import { useEffect, useMemo, useState } from 'react'
import { publishThought, uploadThoughtPhoto } from '../lib/api'
import { getSafeAnchor } from '../lib/privacy'
import {
  friendlyPublishError,
  markFirstThoughtPublished,
  shouldShowFirstPublishHint,
} from '../lib/guidance'
import { CATEGORY_ICONS } from '../data/categories'
import {
  BACKGROUND_OPTIONS,
  FONT_OPTIONS,
  FONT_SIZE_OPTIONS,
  backgroundOptionToAppearance,
  cardAppearanceClassNames,
} from '../lib/cardAppearance'
import LiveCamera from './LiveCamera'

function wordCount(value) {
  const clean = value.trim()
  return clean ? clean.split(/\s+/).length : 0
}

function backgroundValue(backgroundType, backgroundColor) {
  if (backgroundType === 'solid') return backgroundColor
  return backgroundType
}

export default function DropComposer({
  rawCoordinate,
  initialCategory = 'Moment',
  userLocation,
  deviceId,
  onClose,
  onPublished,
}) {
  const [backgroundType, setBackgroundType] = useState('solid')
  const [backgroundColor, setBackgroundColor] = useState('white')
  const [fontFamily, setFontFamily] = useState('caveat')
  const [fontSize, setFontSize] = useState(14)
  const [body, setBody] = useState('')
  const [musicUrl, setMusicUrl] = useState('')
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [activeTool, setActiveTool] = useState(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [showFirstHint, setShowFirstHint] = useState(() => shouldShowFirstPublishHint())

  const words = useMemo(() => wordCount(body), [body])
  const appearanceClasses = cardAppearanceClassNames({
    backgroundType,
    backgroundColor,
    fontFamily,
    fontSize,
  })
  const selectedBackgroundValue = backgroundValue(backgroundType, backgroundColor)

  useEffect(() => {
    if (!photo) {
      setPhotoPreview('')
      return undefined
    }

    const url = URL.createObjectURL(photo)
    setPhotoPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [photo])

  async function publish() {
    setError(null)

    if (words > 200) {
      setError({
        title: '200-word maximum',
        body: 'Shorten this Thought before dropping it.',
      })
      return
    }

    if (backgroundType === 'photo' && !photo) {
      setError({
        title: 'Take a live photo',
        body: 'Open the camera from the background menu and take this scene now.',
      })
      return
    }

    try {
      setBusy(true)
      const privacy = await getSafeAnchor(rawCoordinate)
      const imageUrl = backgroundType === 'photo'
        ? await uploadThoughtPhoto(photo, deviceId)
        : null

      const [safeLng, safeLat] = privacy.coordinate
      const [dropLng, dropLat] = rawCoordinate
      const [userLng, userLat] = userLocation

      await publishThought({
        p_device_id: deviceId,
        p_user_lat: userLat,
        p_user_lng: userLng,
        p_drop_lat: dropLat,
        p_drop_lng: dropLng,
        p_safe_lat: safeLat,
        p_safe_lng: safeLng,
        p_suburb: 'Fitzroy',
        p_category: initialCategory,
        p_body: body.trim() || null,
        p_background_type: backgroundType,
        p_background_color: backgroundColor,
        p_font_family: fontFamily,
        p_font_size: fontSize,
        p_image_url: imageUrl,
        p_music_url: musicUrl.trim() || null,
      })

      markFirstThoughtPublished()
      setShowFirstHint(false)
      await onPublished?.()
      onClose()
    } catch (publishError) {
      setError(friendlyPublishError(publishError.message))
    } finally {
      setBusy(false)
    }
  }

  function selectBackground(option) {
    if (option.type === 'photo') {
      setActiveTool(null)
      setCameraOpen(true)
      return
    }

    const next = backgroundOptionToAppearance(option)
    setBackgroundType(next.backgroundType)
    setBackgroundColor(next.backgroundColor)
    setPhoto(null)
    setActiveTool(null)
  }

  const photoStyle = backgroundType === 'photo' && photoPreview
    ? { backgroundImage: `linear-gradient(rgba(20,18,14,.18), rgba(20,18,14,.32)), url("${photoPreview}")` }
    : undefined

  return (
    <div
      className="card-stage"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      {showFirstHint && (
        <div className="first-drop-hint" role="note">
          <strong>Drop nearby</strong>
          <span>within 50m · 5/hour per device · 3/hour at one location</span>
        </div>
      )}

      <section
        className={`composer-card ${appearanceClasses}`}
        style={photoStyle}
        role="dialog"
        aria-modal="true"
        aria-label="Create a Thought card"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <header className="composer-card-header">
          <span className="composer-category-icon" aria-label={initialCategory}>
            {CATEGORY_ICONS[initialCategory]}
          </span>
          <button
            className="composer-publish"
            type="button"
            onClick={publish}
            disabled={busy}
          >
            {busy ? 'Checking…' : 'Drop'}
          </button>
        </header>

        <div className="composer-writing-area">
          <textarea
            className="composer-card-input"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="What did you notice?"
            aria-label="Thought text"
            autoFocus
          />
          <span className={words > 200 ? 'composer-word-count danger' : 'composer-word-count'}>
            {words}/200
          </span>
        </div>

        <input
          className="composer-music-input"
          value={musicUrl}
          onChange={(event) => setMusicUrl(event.target.value)}
          placeholder="🎵 Add music link (optional)"
          aria-label="Music link"
          inputMode="url"
        />

        {error && (
          <div className="composer-error" role="alert">
            <strong>{error.title}</strong>
            <span>{error.body}</span>
          </div>
        )}

        <time className="composer-card-time">
          {new Date().toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </time>

        <div className="composer-tool-area">
          {activeTool === 'background' && (
            <div className="composer-popover background-popover" role="group" aria-label="Choose background">
              {BACKGROUND_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={selectedBackgroundValue === option.value ? 'selected' : ''}
                  onClick={() => selectBackground(option)}
                  aria-label={option.label}
                >
                  <span className={`background-swatch swatch-${option.value}`} aria-hidden="true" />
                  <small>{option.label}</small>
                </button>
              ))}
            </div>
          )}

          {activeTool === 'font' && (
            <div className="composer-popover font-popover" role="group" aria-label="Choose font">
              {FONT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`font-${option.value} ${fontFamily === option.value ? 'selected' : ''}`}
                  onClick={() => {
                    setFontFamily(option.value)
                    setActiveTool(null)
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {activeTool === 'size' && (
            <div className="composer-popover size-popover" role="group" aria-label="Choose text size">
              {FONT_SIZE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={fontSize === option.value ? 'selected' : ''}
                  onClick={() => {
                    setFontSize(option.value)
                    setActiveTool(null)
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          <div className="composer-toolbar" aria-label="Card style tools">
            <button
              type="button"
              className={activeTool === 'background' ? 'active' : ''}
              onClick={() => setActiveTool((value) => value === 'background' ? null : 'background')}
              aria-label="Background"
              aria-expanded={activeTool === 'background'}
            >
              <span className={`toolbar-background-preview swatch-${selectedBackgroundValue}`} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={activeTool === 'font' ? 'active' : ''}
              onClick={() => setActiveTool((value) => value === 'font' ? null : 'font')}
              aria-label="Font"
              aria-expanded={activeTool === 'font'}
            >
              <span className="toolbar-aa" aria-hidden="true">Aa</span>
            </button>
            <button
              type="button"
              className={activeTool === 'size' ? 'active' : ''}
              onClick={() => setActiveTool((value) => value === 'size' ? null : 'size')}
              aria-label="Text size"
              aria-expanded={activeTool === 'size'}
            >
              <span aria-hidden="true">{fontSize}</span>
            </button>
          </div>
        </div>
      </section>

      {cameraOpen && (
        <LiveCamera
          onCancel={() => setCameraOpen(false)}
          onCapture={(blob) => {
            setPhoto(blob)
            setBackgroundType('photo')
            setBackgroundColor('white')
            setCameraOpen(false)
          }}
        />
      )}
    </div>
  )
}
