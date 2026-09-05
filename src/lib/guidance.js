import { CATEGORIES } from '../data/categories.js'

const GUIDE_VERSION = 'v4'

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
      'No sign-up, profile or followers. PopBy remembers your Thoughts and unlocks on this browser with an anonymous device ID.',
    note: 'Clearing site data resets these MVP local memories.',
    visual: '✦',
  },
  {
    eyebrow: 'Explore',
    title: 'Fitzroy is open.',
    body:
      'Far away, Thoughts glow like pale-yellow fireflies. Closer in, category icons appear, and bigger icons mean more Thoughts.',
    note:
      'Grey suburbs await unlock. Fitzroy needs 15 active locations, 50 Thoughts, 30 contributors and 50 successful unlocks.',
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
    eyebrow: 'Drop',
    title: 'Leave something behind where you noticed it.',
    body:
      'Long-press within 50m, then choose a category, card background and optional content.',
    note:
      'Limits: 5 Thoughts per device per hour, and 3 per location per hour.',
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
      body: 'Checking Fitzroy’s shared places.',
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

  return {
    title: 'Couldn’t drop this Thought',
    body: message || 'Please try again.',
  }
}
