import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

import {
  DEMO_LOCATIONS,
  DEMO_THOUGHTS,
  getDemoMapLocations,
} from '../src/data/demo.js'
import { distanceMeters } from '../src/lib/geo.js'
import { parseMusicLink } from '../src/lib/musicLink.js'

const DEMO_GPS = [144.9797486703319, -37.801367209908406]

test('the demo GPS stays visible beside the Whitlam Place Thought cluster', async () => {
  const source = await readFile(new URL('../src/lib/device.js', import.meta.url), 'utf8')
  const match = source.match(/DEMO_LOCATION\s*=\s*\[([^\]]+)\]/)
  const configuredGps = match?.[1].split(',').map(Number)
  assert.deepEqual(configuredGps, DEMO_GPS)

  const nearbyLocations = DEMO_LOCATIONS.slice(0, 3)
  const distances = nearbyLocations.map((location) =>
    distanceMeters(DEMO_GPS, [location.lng, location.lat])
  )
  assert.ok(distances.every((distance) => distance >= 25 && distance <= 50))

  for (let first = 0; first < nearbyLocations.length; first += 1) {
    for (let second = first + 1; second < nearbyLocations.length; second += 1) {
      assert.ok(
        distanceMeters(
          [nearbyLocations[first].lng, nearbyLocations[first].lat],
          [nearbyLocations[second].lng, nearbyLocations[second].lat],
        ) > 20,
        'nearby seed nodes should remain distinct under the 20m merge rule',
      )
    }
  }
})

test('the nearby demo cluster shows Sound, Nature, and Animals at all three size tiers', () => {
  const nearby = getDemoMapLocations('00000000-0000-4000-8000-000000002001')
    .filter((location) => distanceMeters(DEMO_GPS, [location.lng, location.lat]) <= 50)
    .sort((a, b) => a.thought_count - b.thought_count)

  assert.deepEqual(nearby.map((location) => location.thought_count), [2, 5, 10])
  assert.deepEqual(
    new Set(nearby.map((location) => location.dominant_category)),
    new Set(['Sound', 'Nature', 'Animals']),
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
  assert.deepEqual(new Set(cards.map((thought) => thought.font_size)), new Set([14, 16, 18]))
  assert.ok(cards.every((thought) => thought.body?.trim().length >= 1))
  assert.ok(cards.some((thought) => thought.background_type === 'photo' && thought.image_url))

  const whitlamPhoto = cards.find((thought) =>
    thought.image_url?.includes('Gough_Whitlam_-_Its_Time_-_Whitlam_Park_or_Place.jpg')
  )
  assert.equal(whitlamPhoto?.category, 'Nature')
  assert.match(whitlamPhoto?.body || '', /Photo: Star A Star · CC BY-SA 4\.0/)

  const providers = cards
    .filter((thought) => thought.music_url)
    .map((thought) => parseMusicLink(thought.music_url).provider)
  assert.deepEqual(new Set(providers), new Set(['spotify', 'apple-music', 'youtube-music']))
})
