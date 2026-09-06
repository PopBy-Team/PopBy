import { useEffect, useMemo, useState } from 'react'
import { publishThought, uploadThoughtPhoto } from '../lib/api'
import { getSafeAnchor } from '../lib/privacy'
import {
  friendlyPublishError,
  markFirstThoughtPublished,
  shouldShowFirstPublishHint,
} from '../lib/guidance'
import { CATEGORIES, CATEGORY_ICONS } from '../data/categories'
import {
  MUSIC_LINK_MAX_LENGTH,
  THOUGHT_WORD_LIMIT,
  countWords,
  hasThoughtText,
} from '../lib/contentRules'
import {
  BGM_INVALID_COPY,
  BGM_SOURCE_HINT,
  normalizeMusicLink,
} from '../lib/musicLink'
import { formatThoughtTimestamp } from '../lib/cardPresentation'
import {
  BACKGROUND_OPTIONS,
  FONT_OPTIONS,
  FONT_SIZE_OPTIONS,
  backgroundOptionToAppearance,
  cardAppearanceClassNames,
  isComposerTextLocked,
} from '../lib/cardAppearance'
import LiveCamera from './LiveCamera'

function backgroundValue(backgroundType, backgroundColor) {
  if (backgroundType === 'solid') return backgroundColor
  return backgroundType
}

export default function DropComposer({
  rawCoordinate,
  initialCategory = 'Moment',
  userLocation,
  deviceId,
  targetLocationId = null,
  privacyResult = null,
  showAnchorNotice = false,
  onClose,
  onPublished,
}) {
  const [backgroundType, setBackgroundType] = useState('solid')
  const [backgroundColor, setBackgroundColor] = useState('white')
  const [fontFamily, setFontFamily] = useState('caveat')
  const [fontSize, setFontSize] = useState(14)
  const [category, setCategory] = useState(initialCategory)
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false)
  const [body, setBody] = useState('')
  const [musicUrl, setMusicUrl] = useState('')
  const [musicFeedback, setMusicFeedback] = useState(null)
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [activeTool, setActiveTool] = useState(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [showFirstHint, setShowFirstHint] = useState(() => shouldShowFirstPublishHint())
  const [anchorNoticeVisible, setAnchorNoticeVisible] = useState(showAnchorNotice)

  const words = useMemo(() => countWords(body), [body])
  const appearanceClasses = cardAppearanceClassNames({
    backgroundType,
    backgroundColor,
    fontFamily,
    fontSize,
  })
  const selectedBackgroundValue = backgroundValue(backgroundType, backgroundColor)
  const textEntryLocked = isComposerTextLocked(activeTool)

  useEffect(() => {
    if (!photo) {
      setPhotoPreview('')
      return undefined
    }

    const url = URL.createObjectURL(photo)
    setPhotoPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [photo])

  useEffect(() => {
    if (!showAnchorNotice) return undefined
    setAnchorNoticeVisible(true)
    const timer = window.setTimeout(() => setAnchorNoticeVisible(false), 2400)
    return () => window.clearTimeout(timer)
  }, [showAnchorNotice])

  useEffect(() => {
    if (textEntryLocked) document.activeElement?.blur?.()
  }, [textEntryLocked])

  async function publish() {
    setError(null)

    if (!hasThoughtText(body)) {
      setError({
        title: 'Write one small thing',
        body: 'Thought text is required. Add at least one character before sending.',
      })
      return
    }

    if (words > THOUGHT_WORD_LIMIT) {
      setError({
        title: '150-word maximum',
        body: 'Shorten this Thought before sending it.',
      })
      return
    }

    const normalizedMusic = normalizeMusicLink(musicUrl)
    if (normalizedMusic.error) {
      setMusicFeedback(normalizedMusic.error)
      return
    }
    setMusicFeedback(null)

    if (backgroundType === 'photo' && !photo) {
      setError({
        title: 'Take a live photo',
        body: 'Open the camera from the background menu and take this scene now.',
      })
      return
    }

    try {
      setBusy(true)
      const privacy = privacyResult || await getSafeAnchor(rawCoordinate)
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
        p_category: category,
        p_body: body.trim(),
        p_background_type: backgroundType,
        p_background_color: backgroundColor,
        p_font_family: fontFamily,
        p_font_size: fontSize,
        p_image_url: imageUrl,
        p_music_url: normalizedMusic.url,
        p_target_location_id: targetLocationId,
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
      className={showFirstHint ? 'card-stage has-first-hint' : 'card-stage'}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      {showFirstHint && (
        <div className="first-drop-hint" role="note">
          <strong>Nearby</strong>
          <span>Within 50m, 5 per hour, 3 per location</span>
        </div>
      )}

      {anchorNoticeVisible && (
        <div className="anchor-moved-notice" role="status">
          Moved to the nearest street · public paths work best.
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
          <div className="composer-category-control">
            <button
              className="composer-category-icon"
              type="button"
              onClick={() => setCategoryMenuOpen((value) => !value)}
              aria-label={`Change category. Current category: ${category}`}
              aria-expanded={categoryMenuOpen}
            >
              {CATEGORY_ICONS[category]}
            </button>
            {categoryMenuOpen && (
              <div className="composer-category-menu" role="group" aria-label="Choose category">
                {CATEGORIES.map((option) => (
                  <button
                    key={option.name}
                    type="button"
                    className={option.name === category ? 'selected' : ''}
                    onClick={() => {
                      setCategory(option.name)
                      setCategoryMenuOpen(false)
                    }}
                  >
                    <span aria-hidden="true">{option.icon}</span>
                    <small>{option.name}</small>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            className="composer-publish"
            type="button"
            onClick={publish}
            disabled={busy}
            aria-label="Send Thought"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 12.5 20 4l-6.5 16-2.3-6.1L4 12.5Z" />
              <path d="m11.2 13.9 4.1-4.2" />
            </svg>
            {busy && <span className="sr-only">Checking location…</span>}
          </button>
        </header>

        <div className="composer-writing-area">
          <textarea
            className="composer-card-input"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="You’re marking your spot…"
            aria-label="Thought text"
            readOnly={textEntryLocked}
            autoFocus
          />
          <span className={words > THOUGHT_WORD_LIMIT ? 'composer-word-count danger' : 'composer-word-count'}>
            {words}/{THOUGHT_WORD_LIMIT}
          </span>
        </div>

        <label className="composer-bgm-row">
          <span aria-hidden="true">🎵</span>
          <input
            value={musicUrl}
            onChange={(event) => {
              setMusicUrl(event.target.value)
              if (musicFeedback) {
                setMusicFeedback(normalizeMusicLink(event.target.value).error)
              }
            }}
            onBlur={() => setMusicFeedback(normalizeMusicLink(musicUrl).error)}
            placeholder="Pick BGM"
            aria-label="BGM link"
            aria-describedby="composer-bgm-help"
            inputMode="url"
            maxLength={MUSIC_LINK_MAX_LENGTH}
            readOnly={textEntryLocked}
          />
        </label>
        {(musicFeedback || !musicUrl.trim()) && (
          <span
            id="composer-bgm-help"
            className={musicFeedback
              ? 'composer-bgm-feedback is-invalid'
              : 'composer-bgm-feedback'}
            role="status"
          >
            {musicFeedback ? BGM_INVALID_COPY : BGM_SOURCE_HINT}
          </span>
        )}

        {error && (
          <div className="composer-error" role="alert">
            <strong>{error.title}</strong>
            {error.body && <span>{error.body}</span>}
          </div>
        )}

        <time className="composer-card-time">
          {formatThoughtTimestamp(new Date())}
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
                  {option.type === 'photo' ? (
                    <span className={`background-swatch swatch-${option.value}`} aria-hidden="true">📷</span>
                  ) : (
                    <span className={`background-swatch swatch-${option.value}`} aria-hidden="true" />
                  )}
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
