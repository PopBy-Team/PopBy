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
} from '../src/lib/guidance.js'

function memoryStorage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    keys: () => [...values.keys()],
  }
}

test('onboarding contains the six required product lessons', () => {
  assert.equal(ONBOARDING_STEPS.length, 6)
  assert.deepEqual(
    ONBOARDING_STEPS.map((step) => step.eyebrow),
    ['Welcome to PopBy', 'Explore', 'Unlock', 'Drop', 'Privacy', 'Mine'],
  )
  assert.match(ONBOARDING_STEPS[0].body, /No sign-up, profile or followers/)
  assert.match(ONBOARDING_STEPS[4].body, /building check/i)
  assert.match(ONBOARDING_STEPS[4].body, /safer path\/street anchor/i)
  assert.match(ONBOARDING_STEPS[4].note, /raw point.*not stored/i)
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
})

test('map status explains loading and an empty Mine without covering public maps', () => {
  assert.deepEqual(getMapStatus({ loading: true, mineMode: false, locationCount: 0 }), {
    title: 'Finding nearby Thoughts…',
    body: 'Checking Fitzroy’s shared places.',
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
