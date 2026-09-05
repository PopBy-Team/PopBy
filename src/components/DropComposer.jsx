import { useMemo, useState } from 'react'
import { publishThought, uploadThoughtPhoto } from '../lib/api'
import { getSafeAnchor } from '../lib/privacy'
import { friendlyPublishError } from '../lib/guidance'
import { CATEGORIES } from '../data/categories'
const BACKGROUNDS = [
  { value: 'solid', label: 'Solid' },
  { value: 'lined', label: 'Lined' },
  { value: 'grid', label: 'Grid' },
  { value: 'photo', label: 'Photo' },
]

function wordCount(value) {
  const clean = value.trim()
  return clean ? clean.split(/\s+/).length : 0
}

export default function DropComposer({
  rawCoordinate,
  userLocation,
  deviceId,
  onClose,
  onPublished,
}) {
  const [category, setCategory] = useState('Moment')
  const [backgroundType, setBackgroundType] = useState('solid')
  const [body, setBody] = useState('')
  const [musicUrl, setMusicUrl] = useState('')
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [privacyNote, setPrivacyNote] = useState('')

  const words = useMemo(() => wordCount(body), [body])
  const selectedCategory = CATEGORIES.find((item) => item.name === category)

  async function publish() {
    setError(null)
    setPrivacyNote('')

    if (words > 200) {
      setError({
        title: '200-word maximum',
        body: 'Shorten this Thought before dropping it.',
      })
      return
    }

    if (backgroundType === 'photo' && !file) {
      setError({
        title: 'Add a photo',
        body: 'Choose a current-scene photo, or switch to a note background.',
      })
      return
    }

    try {
      setBusy(true)

      const privacy = await getSafeAnchor(rawCoordinate)
      if (privacy.snapped) {
        setPrivacyNote('Privacy check complete — the public pin will use a nearby safer path/street anchor.')
      } else {
        setPrivacyNote('Privacy check complete — this point is outside a mapped building and will still merge into a ~20m location node.')
      }

      const imageUrl = backgroundType === 'photo'
        ? await uploadThoughtPhoto(file, deviceId)
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
        p_body: body.trim() || null,
        p_background_type: backgroundType,
        p_image_url: imageUrl,
        p_music_url: musicUrl.trim() || null,
      })

      await onPublished?.()
      onClose()
    } catch (e) {
      setError(friendlyPublishError(e.message))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="sheet-backdrop" onMouseDown={(e) => {
      if (e.target === e.currentTarget) onClose()
    }}>
      <section className="composer sheet">
        <div className="sheet-handle" />

        <div className="sheet-header">
          <div>
            <div className="eyebrow">Drop a Thought</div>
            <h2>What did you notice?</h2>
          </div>
          <button className="ghost-button" onClick={onClose}>×</button>
        </div>

        <div className="drop-rules">
          <strong>Drop nearby</strong>
          <span>within 50m of you</span>
          <i />
          <span>5/hour per device</span>
          <i />
          <span>3/hour at one location</span>
        </div>

        <div className="composer-step-label">
          <span>1</span>
          <div>
            <strong>Choose a category</strong>
            <small>What kind of thing did you notice?</small>
          </div>
        </div>

        <div className="category-row">
          {CATEGORIES.map((item) => (
            <button
              key={item.name}
              className={item.name === category ? 'chip selected' : 'chip'}
              onClick={() => setCategory(item.name)}
            >
              {item.icon} {item.name}
            </button>
          ))}
        </div>
        <div className="category-help">
          {selectedCategory?.help}
        </div>

        <div className="composer-step-label">
          <span>2</span>
          <div>
            <strong>Choose the card look</strong>
            <small>A real photo or a simple note background.</small>
          </div>
        </div>

        <div className="background-row">
          {BACKGROUNDS.map((item) => (
            <button
              key={item.value}
              className={item.value === backgroundType ? 'chip selected' : 'chip'}
              onClick={() => setBackgroundType(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {backgroundType === 'photo' && (
          <label className="file-box">
            <span>
              <strong>Current-scene photo</strong>
              <small>JPEG/PNG · max 6 MB</small>
            </span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
        )}

        <div className="composer-step-label">
          <span>3</span>
          <div>
            <strong>Add the Thought</strong>
            <small>Words and music are optional.</small>
          </div>
        </div>

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="A small thing worth remembering…"
          rows={5}
        />
        <div className={words > 200 ? 'counter danger' : 'counter'}>
          {words}/200 words
        </div>

        <input
          value={musicUrl}
          onChange={(e) => setMusicUrl(e.target.value)}
          placeholder="Music link (optional)"
          inputMode="url"
        />

        <details className="privacy-details">
          <summary>How PopBy protects this location</summary>
          <p>
            We don’t store the raw point you long-pressed. Before publishing,
            PopBy checks mapped buildings, prefers a nearby safer public
            path/street anchor, then merges nearby drops into a ~20m location
            node.
          </p>
        </details>

        {privacyNote && <p className="privacy-note">{privacyNote}</p>}

        {error && (
          <div className="inline-error" role="alert">
            <strong>{error.title}</strong>
            <span>{error.body}</span>
          </div>
        )}

        <button className="primary-button" disabled={busy} onClick={publish}>
          {busy ? 'Checking location…' : 'Drop Thought'}
        </button>
      </section>
    </div>
  )
}
