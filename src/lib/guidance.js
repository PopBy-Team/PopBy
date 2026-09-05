const GUIDE_VERSION = 'v2'

const onboardingKey = `popby_onboarding_${GUIDE_VERSION}`

function tipKey(name) {
  return `popby_tip_${GUIDE_VERSION}_${name}`
}

export const ONBOARDING_STEPS = [
  {
    eyebrow: 'Welcome to PopBy',
    title: 'Notice what’s already around you.',
    body:
      'No sign-up, profile or followers. PopBy remembers your Thoughts, unlocks and reports on this browser with an anonymous device ID.',
    note: 'For this MVP, clearing site data resets those local memories.',
    visual: '✦',
  },
  {
    eyebrow: 'Explore',
    title: 'Fitzroy is open. The map grows with the community.',
    body:
      'Drag to explore. Zoom out and Thoughts become dots; zoom in and they become category icons. Larger icons mean more Thoughts at that place. Grey suburbs are waiting to be unlocked.',
    note:
      'Fitzroy reaches 100% only after 15 active locations, 50 Thoughts, 30 contributors and 50 successful unlocks.',
    visual: '↔',
  },
  {
    eyebrow: 'Unlock',
    title: 'Some Thoughts only make sense when you’re there.',
    body:
      'Tap a Thought location. You need to be within 50m to unlock it. “Approaching…” means you’re getting close; “Get closer” means it’s still too far away.',
    note: 'Previously unlocked locations can be opened again later.',
    visual: '◎',
  },
  {
    eyebrow: 'Drop',
    title: 'Leave something behind where you noticed it.',
    body:
      'Long-press a point within 50m of your current location. Pick a category, then add up to 200 words, a card background or current-scene photo, and an optional music link.',
    note:
      'Community limits: max 5 drops per device per hour, and max 3 new Thoughts at the same location per hour.',
    visual: '＋',
  },
  {
    eyebrow: 'Privacy',
    title: 'Your exact drop point isn’t published.',
    body:
      'Before a Thought is saved, PopBy checks for buildings, shifts the public point toward a nearby safer path/street when possible, then merges nearby drops into a ~20m location node.',
    note: 'The raw drop coordinate is used for validation but is not stored.',
    visual: '◌',
  },
  {
    eyebrow: 'Keep & care',
    title: 'Mine keeps your memories easy to find.',
    body:
      'Turn on Mine to show only locations where you left a Thought. Your own Thoughts can be reopened from anywhere. Use ••• on public cards to report abuse.',
    note:
      'Each device can report a Thought once. 2 unique reports automatically hide it.',
    visual: 'Mine',
  },
]

export function isOnboardingComplete() {
  return localStorage.getItem(onboardingKey) === 'done'
}

export function completeOnboarding() {
  localStorage.setItem(onboardingKey, 'done')
}

export function shouldShowTip(name) {
  return localStorage.getItem(tipKey(name)) !== 'shown'
}

export function markTipShown(name) {
  localStorage.setItem(tipKey(name), 'shown')
}

export function resetGuidance() {
  localStorage.removeItem(onboardingKey)
  Object.keys(localStorage)
    .filter((key) => key.startsWith(`popby_tip_${GUIDE_VERSION}_`))
    .forEach((key) => localStorage.removeItem(key))
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
      body: 'We couldn’t find a safe public anchor nearby. Move a little closer to the street or footpath and try again.',
    }
  }

  return {
    title: 'Couldn’t drop this Thought',
    body: message || 'Please try again.',
  }
}
