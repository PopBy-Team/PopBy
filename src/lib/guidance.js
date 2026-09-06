import { CATEGORIES } from '../data/categories.js'

const GUIDE_VERSION = 'v5'

const onboardingKey = `popby_onboarding_${GUIDE_VERSION}`
const firstPublishKey = 'popby_first_thought_published_v1'

function tipKey(name) {
  return `popby_tip_${GUIDE_VERSION}_${name}`
}

export const ONBOARDING_STEPS = [
  {
    eyebrow: 'Welcome to PopBy',
    title: 'Notice what’s already around you.',
    body:
      'Explore Thoughts around you. Create one right where you are, whenever you feel like it.',
    note:
      'No sign-up, profile or followers. This browser remembers your Thoughts and unlocks anonymously; clearing site data resets them.',
    visual: '✦',
  },
  {
    eyebrow: 'Explore',
    title: 'Explore Thoughts',
    body:
      'Zoom in, move within 50m, then tap a marker to explore the Thoughts left there. Zoomed out, markers become warm firefly dots; closer in, their category icons and sizes appear.',
    note:
      'Bright areas are open to explore. Grey areas are waiting to be unlocked.',
    visual: '↔',
    legend: CATEGORIES.map(({ name, icon }) => ({ name, icon })),
  },
  {
    eyebrow: 'Unlock',
    title: 'Some Thoughts only make sense when you’re there.',
    body:
      'Move within 50m to unlock a Thought location. “Approaching…” means you’re nearly there.',
    note: 'Unlocked public locations can be reopened later.',
    visual: '◎',
  },
  {
    eyebrow: 'Create',
    title: 'Create a Thought',
    body:
      'Long-press a nearby public path or an existing Thought location inside any open area. Choose a category, then create your card.',
    note:
      'Up to 150 words. Optional BGM accepts Spotify, Apple Music and YouTube Music track links only. Limits: 5 per hour, 3 per location.',
    visual: '＋',
  },
  {
    eyebrow: 'Privacy',
    title: 'Your exact drop point isn’t published.',
    body:
      'PopBy uses a building check, a nearby safer path/street anchor, then a shared ~20m location node.',
    note: 'Your raw point is used for validation and is not stored.',
    visual: '⌁',
  },
  {
    eyebrow: 'Mine',
    title: 'Keep your own city memories easy to find.',
    body:
      'Mine shows your own Thought locations and lets you reopen your own cards remotely.',
    note:
      'Other people’s cards stay private in Mine. 2 unique reports hide public abuse.',
    visual: 'Mine',
  },
]

function getStorage(storage) {
  if (storage) return storage
  if (typeof localStorage !== 'undefined') return localStorage
  throw new Error('Browser storage is not available')
}

function listStorageKeys(storage) {
  if (typeof storage.keys === 'function') return storage.keys()
  if (typeof storage.key === 'function' && typeof storage.length === 'number') {
    return Array.from({ length: storage.length }, (_, index) => storage.key(index))
      .filter(Boolean)
  }
  return Object.keys(storage)
}

export function isOnboardingComplete(storage) {
  return getStorage(storage).getItem(onboardingKey) === 'done'
}

export function completeOnboarding(storage) {
  getStorage(storage).setItem(onboardingKey, 'done')
}

export function shouldShowTip(name, storage) {
  return getStorage(storage).getItem(tipKey(name)) !== 'shown'
}

export function markTipShown(name, storage) {
  getStorage(storage).setItem(tipKey(name), 'shown')
}

export function shouldShowFirstPublishHint(storage) {
  return getStorage(storage).getItem(firstPublishKey) !== 'done'
}

export function markFirstThoughtPublished(storage) {
  getStorage(storage).setItem(firstPublishKey, 'done')
}

export function resetGuidance(storage) {
  const target = getStorage(storage)
  target.removeItem(onboardingKey)
  listStorageKeys(target)
    .filter((key) => key.startsWith(`popby_tip_${GUIDE_VERSION}_`))
    .forEach((key) => target.removeItem(key))
}

export function getMapStatus({ loading, mineMode, locationCount }) {
  if (loading) {
    return {
      title: 'Finding nearby Thoughts…',
      body: 'Checking the open area’s shared places.',
    }
  }

  if (mineMode && locationCount === 0) {
    return {
      title: 'No memories here yet',
      body: 'Turn Mine off to explore, then long-press nearby to leave your first Thought.',
    }
  }

  return null
}

export function friendlyPublishError(message = '') {
  if (message.includes('Hourly drop limit reached')) {
    return {
      title: '5-drop limit reached',
      body: 'You’ve left 5 Thoughts in the last hour. You can drop again once the oldest one falls outside that 1-hour window.',
    }
  }

  if (message.includes('This location is taking a short break')) {
    return {
      title: 'This spot is full for now',
      body: 'This location already received 3 new Thoughts within the last hour. Try another nearby spot.',
    }
  }

  if (message.includes('Drop within 50m')) {
    return {
      title: 'Drop nearby',
      body: 'Choose a point within 50m of your current location.',
    }
  }

  if (message.includes('Awaiting unlock')) {
    return {
      title: 'Area not open yet',
      body: 'For this MVP, new Thoughts can only be dropped inside the currently unlocked Fitzroy area.',
    }
  }

  if (message.includes('No nearby public path found')) {
    return {
      title: 'Move toward a public path',
      body: 'We couldn’t find a safer nearby path or street anchor. Move a little closer to one and try again.',
    }
  }

  if (message.includes('200-word maximum')) {
    return {
      title: '200-word maximum',
      body: 'Shorten this Thought before dropping it.',
    }
  }

  if (message.includes('150-word maximum')) {
    return {
      title: '150-word maximum',
      body: 'Shorten this Thought before sending it.',
    }
  }

  if (message.includes('Music link is too long')) {
    return {
      title: 'BGM link is too long',
      body: 'Keep the link under 300 characters, or write the song name in your Thought instead.',
    }
  }

  if (message.includes('Music URL must use http or https')) {
    return {
      title: 'That BGM link does not work',
      body: 'Use a normal web link, or write the song name in your Thought instead.',
    }
  }

  if (message.includes('Invalid music link')) {
    return {
      title: 'That BGM link does not work',
      body: 'Use a Spotify, Apple Music or YouTube Music track link, or enter the track name in your Thought.',
    }
  }

  if (message.includes('Selected location is no longer available')) {
    return {
      title: 'Choose this spot again',
      body: 'This shared point moved or is no longer available. Return to the map and hold it again.',
    }
  }

  return {
    title: 'Couldn’t drop this Thought',
    body: message || 'Please try again.',
  }
}
