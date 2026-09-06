import test from 'node:test'
import assert from 'node:assert/strict'

import {
  ONBOARDING_STEPS,
  completeOnboarding,
  isOnboardingComplete,
  markTipShown,
  resetGuidance,
  shouldShowTip,
  friendlyPublishError,
  getMapStatus,
  markFirstThoughtPublished,
  shouldShowFirstPublishHint,
} from '../src/lib/guidance.js'
import * as guidance from '../src/lib/guidance.js'

function memoryStorage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    keys: () => [...values.keys()],
  }
}

test('onboarding keeps the user-authored product lessons', () => {
  assert.equal(ONBOARDING_STEPS.length, 6)
  assert.deepEqual(
    ONBOARDING_STEPS.map((step) => step.eyebrow),
    ['Welcome to PopBy', 'Explore', 'Unlock', 'Create', 'Privacy', 'Mine'],
  )
  assert.match(ONBOARDING_STEPS[0].body, /right where you are, whenever you feel like it/i)
  assert.equal(ONBOARDING_STEPS[1].legend.length, 7)
  assert.deepEqual(
    ONBOARDING_STEPS[1].legend.map(({ name, icon }) => `${name}:${icon}`),
    ['Animals:🐾', 'Nature:🌳', 'Eat:🍴', 'Art:🎨', 'Place:📍', 'Sound:🎵', 'Moment:✨'],
  )
  assert.match(ONBOARDING_STEPS[3].note, /at least one character/i)
})

test('onboarding completion and coach tips persist until reset', () => {
  const storage = memoryStorage()

  assert.equal(isOnboardingComplete(storage), false)
  completeOnboarding(storage)
  assert.equal(isOnboardingComplete(storage), true)

  assert.equal(shouldShowTip('mine', storage), true)
  markTipShown('mine', storage)
  assert.equal(shouldShowTip('mine', storage), false)

  resetGuidance(storage)
  assert.equal(isOnboardingComplete(storage), false)
  assert.equal(shouldShowTip('mine', storage), true)
})

test('expected publish rules are translated into friendly messages', () => {
  assert.deepEqual(friendlyPublishError('Hourly drop limit reached'), {
    title: '5-drop limit reached',
    body: 'You’ve left 5 Thoughts in the last hour. You can drop again once the oldest one falls outside that 1-hour window.',
  })
  assert.deepEqual(friendlyPublishError('This location is taking a short break'), {
    title: 'This spot is full for now',
    body: 'This location already received 3 new Thoughts within the last hour. Try another nearby spot.',
  })
  assert.deepEqual(friendlyPublishError('No nearby public path found'), {
    title: 'Move toward a public path',
    body: 'We couldn’t find a safer nearby path or street anchor. Move a little closer to one and try again.',
  })
  assert.deepEqual(friendlyPublishError('200-word maximum'), {
    title: '200-word maximum',
    body: 'Shorten this Thought before dropping it.',
  })
  assert.deepEqual(friendlyPublishError('150-word maximum'), {
    title: '150-word maximum',
    body: 'Shorten this Thought before sending it.',
  })
  assert.deepEqual(friendlyPublishError('Music link is too long'), {
    title: 'BGM link is too long',
    body: 'Keep the link under 300 characters, or write the song name in your Thought instead.',
  })
  assert.deepEqual(friendlyPublishError('Music URL must use http or https'), {
    title: 'That BGM link does not work',
    body: 'Use a normal web link, or write the song name in your Thought instead.',
  })
})

test('map status explains loading and an empty Mine without covering public maps', () => {
  assert.deepEqual(getMapStatus({ loading: true, mineMode: false, locationCount: 0 }), {
    title: 'Finding nearby Thoughts…',
    body: 'Checking the open area’s shared places.',
  })
  assert.deepEqual(getMapStatus({ loading: false, mineMode: true, locationCount: 0 }), {
    title: 'No memories here yet',
    body: 'Turn Mine off to explore, then long-press nearby to leave your first Thought.',
  })
  assert.equal(
    getMapStatus({ loading: false, mineMode: false, locationCount: 0 }),
    null,
  )
  assert.equal(
    getMapStatus({ loading: false, mineMode: true, locationCount: 1 }),
    null,
  )
})

test('drop rules remain visible until the first Thought publishes successfully', () => {
  const storage = memoryStorage()

  assert.equal(shouldShowFirstPublishHint(storage), true)
  markFirstThoughtPublished(storage)
  assert.equal(shouldShowFirstPublishHint(storage), false)
})

test('Create guidance explains nearby creation and hourly limits', () => {
  const create = ONBOARDING_STEPS.find((step) => step.eyebrow === 'Create')
  assert.match(create.body, /nearby public path/i)
  assert.match(create.note, /5 per hour/i)
})

test('locked areas use only the concise not-open-yet message', () => {
  assert.equal(typeof guidance.getLockedAreaTip, 'function')
  assert.deepEqual(guidance.getLockedAreaTip('Carlton'), {
    position: 'top-left',
    title: 'Carlton isn’t open yet',
  })
})

test('an unavailable selected node receives friendly copy', () => {
  assert.deepEqual(friendlyPublishError('Selected location is no longer available'), {
    title: 'Choose this spot again',
    body: 'This shared point moved or is no longer available. Return to the map and hold it again.',
  })
})

test('unsupported provider errors become concise BGM guidance', () => {
  assert.deepEqual(friendlyPublishError('Invalid music link'), {
    title: 'That BGM link does not work',
    body: 'Use a Spotify, Apple Music or YouTube Music track link, or enter the track name in your Thought.',
  })
})
