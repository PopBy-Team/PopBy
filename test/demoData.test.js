import test from 'node:test'
import assert from 'node:assert/strict'

import {
  DEMO_LOCATIONS,
  DEMO_THOUGHTS,
  getDemoMapLocations,
} from '../src/data/demo.js'
import { distanceMeters } from '../src/lib/geo.js'
import { parseMusicLink } from '../src/lib/musicLink.js'

const DEMO_GPS = [144.9788, -37.8005]

test('the nearby demo cluster shows Nature, Art, and Eat at all three size tiers', () => {
  const nearby = getDemoMapLocations('00000000-0000-4000-8000-000000002001')
    .filter((location) => distanceMeters(DEMO_GPS, [location.lng, location.lat]) <= 50)
    .sort((a, b) => a.thought_count - b.thought_count)

  assert.deepEqual(nearby.map((location) => location.thought_count), [2, 5, 10])
  assert.deepEqual(
    new Set(nearby.map((location) => location.dominant_category)),
    new Set(['Nature', 'Art', 'Eat']),
  )
  assert.ok(nearby.some((location) => location.is_mine))
})

test('nearby demo cards cover every appearance tier and supported BGM provider', () => {
  const nearbyIds = new Set(DEMO_LOCATIONS.slice(0, 3).map((location) => location.id))
  const cards = DEMO_THOUGHTS.filter((thought) => nearbyIds.has(thought.location_id))

  assert.equal(cards.length, 17)
  assert.deepEqual(
    new Set(cards.map((thought) => thought.background_type)),
    new Set(['solid', 'lined', 'grid', 'dots', 'photo']),
  )
  assert.deepEqual(
    new Set(cards.map((thought) => thought.font_family)),
    new Set(['caveat', 'patrick-hand', 'homemade-apple', 'island-moments']),
  )
  assert.deepEqual(new Set(cards.map((thought) => thought.font_size)), new Set([12, 14, 16]))
  assert.ok(cards.some((thought) => thought.body === null))
  assert.ok(cards.some((thought) => thought.background_type === 'photo' && thought.image_url))

  const providers = cards
    .filter((thought) => thought.music_url)
    .map((thought) => parseMusicLink(thought.music_url).provider)
  assert.deepEqual(new Set(providers), new Set(['spotify', 'apple-music', 'youtube-music']))
})
