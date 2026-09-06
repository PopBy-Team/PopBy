import {
  DEMO_LOCATIONS,
  DEMO_THOUGHTS,
  getDemoMapLocations,
  getDemoProgress,
} from '../data/demo.js'
import { distanceMeters } from './geo.js'
import { isValidCardAppearance, normalizeCardAppearance } from './cardAppearance.js'
import {
  MUSIC_LINK_MAX_LENGTH,
  THOUGHT_WORD_LIMIT,
  countWords,
} from './contentRules.js'
import { normalizeMusicLink } from './musicLink.js'

const CARD_FIELDS = [
  'id',
  'category',
  'body',
  'background_type',
  'background_color',
  'font_family',
  'font_size',
  'image_url',
  'music_url',
  'created_at',
]

const CATEGORIES = new Set(['Animals', 'Nature', 'Eat', 'Art', 'Place', 'Sound', 'Moment'])

function createMemoryStorage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  }
}

function readSet(storage, key) {
  try {
    const value = JSON.parse(storage.getItem(key) || '[]')
    return new Set(Array.isArray(value) ? value : [])
  } catch {
    return new Set()
  }
}

function writeSet(storage, key, values) {
  storage.setItem(key, JSON.stringify([...values]))
}

function readArray(storage, key) {
  try {
    const value = JSON.parse(storage.getItem(key) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function writeArray(storage, key, values) {
  storage.setItem(key, JSON.stringify(values))
}

function unlockKey(deviceId) {
  return `popby_demo_unlocks_${deviceId}`
}

function reportKey(thoughtId) {
  return `popby_demo_reports_${thoughtId}`
}

function publicCard(thought, deviceId) {
  const appearance = normalizeCardAppearance(thought)
  return {
    ...Object.fromEntries(CARD_FIELDS.map((field) => [field, thought[field]])),
    background_type: appearance.backgroundType,
    background_color: appearance.backgroundColor,
    font_family: appearance.fontFamily,
    font_size: appearance.fontSize,
    is_own: thought.device_id === deviceId,
  }
}

export function createDemoApi({ storage } = {}) {
  const persistence = storage ||
    (typeof window !== 'undefined' ? window.localStorage : createMemoryStorage())

  const allLocations = () => [
    ...DEMO_LOCATIONS,
    ...readArray(persistence, 'popby_demo_custom_locations'),
  ]
  const customThoughts = () => readArray(persistence, 'popby_demo_custom_thoughts')
  const allThoughts = () => {
    const deletedIds = readSet(persistence, 'popby_demo_deleted_thoughts')
    return [...DEMO_THOUGHTS, ...customThoughts()]
      .filter((thought) => !deletedIds.has(thought.id))
  }

  return {
    getMapLocations(deviceId) {
      const unlocked = readSet(persistence, unlockKey(deviceId))
      const hiddenIds = readSet(persistence, 'popby_demo_hidden_thoughts')
      return getDemoMapLocations(deviceId, {
        hiddenIds,
        locations: allLocations(),
        thoughts: allThoughts(),
      }).map((location) => ({
        ...location,
        is_unlocked: unlocked.has(location.location_id),
      }))
    },

    getSuburbProgress(suburb) {
      return getDemoProgress(suburb)
    },

    getLocationThoughts(locationId, deviceId, mineOnly) {
      const unlocked = readSet(persistence, unlockKey(deviceId))
      const hiddenIds = readSet(persistence, 'popby_demo_hidden_thoughts')
      if (!mineOnly && !unlocked.has(locationId)) return []

      return allThoughts()
        .filter((thought) =>
          thought.location_id === locationId &&
          !thought.hidden &&
          !hiddenIds.has(thought.id) &&
          (!mineOnly || thought.device_id === deviceId)
        )
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .map((thought) => publicCard(thought, deviceId))
    },

    unlockLocation(deviceId, locationId, userLocation) {
      const hiddenIds = readSet(persistence, 'popby_demo_hidden_thoughts')
      const location = getDemoMapLocations(deviceId, {
        hiddenIds,
        locations: allLocations(),
        thoughts: allThoughts(),
      })
        .find((item) => item.location_id === locationId)

      if (!location) throw new Error('Location not found')
      if (distanceMeters(userLocation, [location.lng, location.lat]) > 50) {
        throw new Error('Get closer')
      }

      const unlocked = readSet(persistence, unlockKey(deviceId))
      unlocked.add(locationId)
      writeSet(persistence, unlockKey(deviceId), unlocked)
      return true
    },

    reportThought(deviceId, thoughtId) {
      if (!allThoughts().some((thought) => thought.id === thoughtId)) {
        throw new Error('Thought not found')
      }

      const reports = readSet(persistence, reportKey(thoughtId))
      reports.add(deviceId)
      writeSet(persistence, reportKey(thoughtId), reports)

      if (reports.size >= 2) {
        const hiddenIds = readSet(persistence, 'popby_demo_hidden_thoughts')
        hiddenIds.add(thoughtId)
        writeSet(persistence, 'popby_demo_hidden_thoughts', hiddenIds)
      }

      return reports.size
    },

    publishThought(input) {
      if (input.p_suburb !== 'Fitzroy') throw new Error('Awaiting unlock')
      if (!CATEGORIES.has(input.p_category)) throw new Error('Invalid category')
      const appearanceInput = {
        background_type: input.p_background_type ?? 'solid',
        background_color: input.p_background_color ?? 'white',
        font_family: input.p_font_family ?? 'caveat',
        font_size: input.p_font_size ?? 12,
      }
      if (!isValidCardAppearance(appearanceInput)) throw new Error('Invalid card appearance')
      const appearance = normalizeCardAppearance(appearanceInput)

      if (countWords(input.p_body) > THOUGHT_WORD_LIMIT) {
        throw new Error('150-word maximum')
      }
      if (String(input.p_music_url || '').trim().length > MUSIC_LINK_MAX_LENGTH) {
        throw new Error('Music link is too long')
      }
      const music = normalizeMusicLink(input.p_music_url)
      if (music.error) throw new Error('Invalid music link')

      const user = [Number(input.p_user_lng), Number(input.p_user_lat)]
      const drop = [Number(input.p_drop_lng), Number(input.p_drop_lat)]
      const safe = [Number(input.p_safe_lng), Number(input.p_safe_lat)]
      if (distanceMeters(user, drop) > 50) {
        throw new Error('Drop within 50m of your current location')
      }
      if (distanceMeters(drop, safe) > 60) {
        throw new Error('Privacy anchor is too far from the original drop')
      }

      const recentCutoff = Date.now() - (60 * 60 * 1000)
      const existingCustomThoughts = customThoughts()
      const deviceRecent = existingCustomThoughts.filter((thought) =>
        thought.device_id === input.p_device_id &&
        new Date(thought.created_at).getTime() > recentCutoff
      )
      if (deviceRecent.length >= 5) throw new Error('Hourly drop limit reached')

      let location
      if (input.p_target_location_id) {
        location = allLocations().find((item) =>
          item.id === input.p_target_location_id &&
          distanceMeters(safe, [item.lng, item.lat]) <= 20
        )
        if (!location) throw new Error('Selected location is no longer available')
      } else {
        location = allLocations()
          .map((item) => ({
            item,
            distance: distanceMeters(safe, [item.lng, item.lat]),
          }))
          .filter(({ distance }) => distance <= 20)
          .sort((a, b) => a.distance - b.distance)[0]?.item
      }

      if (!location) {
        location = {
          id: crypto.randomUUID(),
          lng: safe[0],
          lat: safe[1],
        }
        const locations = readArray(persistence, 'popby_demo_custom_locations')
        writeArray(persistence, 'popby_demo_custom_locations', [...locations, location])
      }

      const nodeRecent = existingCustomThoughts.filter((thought) =>
        thought.location_id === location.id &&
        new Date(thought.created_at).getTime() > recentCutoff
      )
      if (nodeRecent.length >= 3) {
        throw new Error('This location is taking a short break')
      }

      const thought = {
        id: crypto.randomUUID(),
        location_id: location.id,
        device_id: input.p_device_id,
        category: input.p_category,
        body: String(input.p_body || '').trim() || null,
        background_type: appearance.backgroundType,
        background_color: appearance.backgroundColor,
        font_family: appearance.fontFamily,
        font_size: appearance.fontSize,
        image_url: input.p_image_url || null,
        music_url: music.url,
        hidden: false,
        created_at: new Date().toISOString(),
      }
      writeArray(
        persistence,
        'popby_demo_custom_thoughts',
        [...existingCustomThoughts, thought],
      )
      return thought.id
    },

    deleteThought(deviceId, thoughtId) {
      const thought = allThoughts().find((item) =>
        item.id === thoughtId && item.device_id === deviceId
      )
      if (!thought) throw new Error('Thought not found')

      const deletedIds = readSet(persistence, 'popby_demo_deleted_thoughts')
      deletedIds.add(thoughtId)
      writeSet(persistence, 'popby_demo_deleted_thoughts', deletedIds)
      return true
    },

    recordDwell(deviceId, thoughtId, milliseconds) {
      const key = `popby_demo_dwell_${deviceId}`
      let events = []
      try {
        const stored = JSON.parse(persistence.getItem(key) || '[]')
        if (Array.isArray(stored)) events = stored
      } catch {
        events = []
      }

      events.push({ thought_id: thoughtId, ms: milliseconds, created_at: new Date().toISOString() })
      persistence.setItem(key, JSON.stringify(events.slice(-50)))
    },
  }
}
