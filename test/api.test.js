import test from 'node:test'
import assert from 'node:assert/strict'

import { createApi } from '../src/lib/api.js'
import { distanceMeters } from '../src/lib/geo.js'

function recordingClient(result = { data: [], error: null }) {
  const calls = []
  return {
    calls,
    rpc: async (...args) => {
      calls.push(args)
      return result
    },
  }
}

function memoryStorage() {
  const values = new Map()
  return {
    getItem(key) {
      return values.get(key) ?? null
    },
    setItem(key, value) {
      values.set(key, String(value))
    },
  }
}

test('getMapLocations passes the device identity to its RPC', async () => {
  const client = recordingClient()
  const api = createApi(client)
  const deviceId = '00000000-0000-4000-8000-000000000001'

  await api.getMapLocations(deviceId)

  assert.deepEqual(client.calls[0], [
    'get_map_locations',
    { p_device_id: deviceId },
  ])
})

test('getLocationThoughts requests mine-only cards through its RPC', async () => {
  const client = recordingClient()
  const api = createApi(client)

  await api.getLocationThoughts('location-id', 'device-id', true)

  assert.deepEqual(client.calls[0], [
    'get_location_thoughts',
    {
      p_location_id: 'location-id',
      p_device_id: 'device-id',
      p_mine_only: true,
    },
  ])
})

test('unlockLocation keeps longitude and latitude in the RPC contract order', async () => {
  const client = recordingClient({ data: true, error: null })
  const api = createApi(client)

  await api.unlockLocation('device-id', 'location-id', [144.9788, -37.8005])

  assert.deepEqual(client.calls[0], [
    'record_unlock',
    {
      p_device_id: 'device-id',
      p_location_id: 'location-id',
      p_user_lat: -37.8005,
      p_user_lng: 144.9788,
    },
  ])
})

test('RPC errors are thrown without losing the server message', async () => {
  const client = recordingClient({ data: null, error: { message: 'Get closer' } })
  const api = createApi(client)

  await assert.rejects(
    () => api.getSuburbProgress('Fitzroy'),
    { message: 'Get closer' },
  )
})

test('demo mode returns a lively Fitzroy map without a database connection', async () => {
  const api = createApi(null, { demoMode: true })

  const locations = await api.getMapLocations('demo-device')

  assert.equal(locations.length, 6)
  assert.equal(
    locations.reduce((total, location) => total + location.thought_count, 0),
    16,
  )
  assert.ok(locations.every((location) => location.suburb === 'Fitzroy'))
  assert.ok(locations.filter((location) => location.thought_count >= 4).length >= 2)
  assert.ok(new Set(locations.map((location) => location.dominant_category)).size >= 5)
})

test('demo progress reflects the visible seed activity', async () => {
  const api = createApi(null, { demoMode: true })

  const progress = await api.getSuburbProgress('Fitzroy')

  assert.deepEqual(progress, {
    active_locations: 6,
    total_thoughts: 16,
    unique_contributors: 8,
    successful_unlocks: 10,
    progress: 0.2,
  })
})

test('demo locations include close, approaching, and far unlock states', async () => {
  const api = createApi(null, { demoMode: true })
  const locations = await api.getMapLocations('demo-device')
  const distances = locations.map((location) =>
    distanceMeters([144.9788, -37.8005], [location.lng, location.lat])
  )

  assert.equal(distances.filter((distance) => distance <= 50).length, 1)
  assert.equal(
    distances.filter((distance) => distance > 50 && distance <= 120).length,
    1,
  )
  assert.ok(distances.filter((distance) => distance > 120).length >= 1)
})

test('demo unlock rejects a user who is farther than 50 metres away', async () => {
  const api = createApi(null, { demoMode: true, storage: memoryStorage() })
  const [location] = await api.getMapLocations('demo-device')

  await assert.rejects(
    () => api.unlockLocation(
      'demo-device',
      location.location_id,
      [144.95, -37.82],
    ),
    { message: 'Get closer' },
  )
})

test('a successful demo unlock persists and reopens public cards safely', async () => {
  const storage = memoryStorage()
  const firstApi = createApi(null, { demoMode: true, storage })
  const [location] = await firstApi.getMapLocations('demo-device')

  await firstApi.unlockLocation(
    'demo-device',
    location.location_id,
    [location.lng, location.lat],
  )

  const reloadedApi = createApi(null, { demoMode: true, storage })
  const reloadedLocations = await reloadedApi.getMapLocations('demo-device')
  const cards = await reloadedApi.getLocationThoughts(
    location.location_id,
    'demo-device',
    false,
  )

  assert.equal(reloadedLocations[0].is_unlocked, true)
  assert.equal(cards.length, 5)
  assert.deepEqual(Object.keys(cards[0]).sort(), [
    'background_color',
    'background_type',
    'body',
    'category',
    'created_at',
    'font_family',
    'font_size',
    'id',
    'image_url',
    'is_own',
    'music_url',
  ])
  assert.equal(cards[0].is_own, false)
})

test('two unique demo reports hide a Thought while duplicate reports count once', async () => {
  const storage = memoryStorage()
  const api = createApi(null, { demoMode: true, storage })
  const [location] = await api.getMapLocations('reader-device')
  await api.unlockLocation(
    'reader-device',
    location.location_id,
    [location.lng, location.lat],
  )
  const [thought] = await api.getLocationThoughts(
    location.location_id,
    'reader-device',
    false,
  )

  assert.equal(await api.reportThought('reader-device', thought.id), 1)
  assert.equal(await api.reportThought('reader-device', thought.id), 1)
  assert.equal(await api.reportThought('second-device', thought.id), 2)

  const remainingCards = await api.getLocationThoughts(
    location.location_id,
    'reader-device',
    false,
  )
  const [updatedLocation] = await api.getMapLocations('reader-device')

  assert.equal(remainingCards.some((card) => card.id === thought.id), false)
  assert.equal(updatedLocation.thought_count, 4)
})

test('demo dwell recording accepts the same capped duration contract as Supabase', async () => {
  const api = createApi(null, { demoMode: true, storage: memoryStorage() })

  await assert.doesNotReject(() =>
    api.recordDwell('reader-device', 'thought-id', 180000)
  )
})

test('demo publishing stores only the Safe Anchor and merges within 20 metres', async () => {
  const storage = memoryStorage()
  const api = createApi(null, { demoMode: true, storage })
  const [existing] = await api.getMapLocations('author-device')

  const thoughtId = await api.publishThought({
    p_device_id: '00000000-0000-4000-8000-000000009001',
    p_user_lat: -37.8005,
    p_user_lng: 144.9788,
    p_drop_lat: -37.8005,
    p_drop_lng: 144.9788,
    p_safe_lat: existing.lat,
    p_safe_lng: existing.lng,
    p_suburb: 'Fitzroy',
    p_category: 'Moment',
    p_body: 'A new demo Thought.',
    p_background_type: 'solid',
    p_image_url: null,
    p_music_url: null,
  })

  const locations = await api.getMapLocations(
    '00000000-0000-4000-8000-000000009001',
  )
  const merged = locations.find((location) => location.location_id === existing.location_id)
  const ownCards = await api.getLocationThoughts(
    existing.location_id,
    '00000000-0000-4000-8000-000000009001',
    true,
  )

  assert.match(thoughtId, /^[0-9a-f-]{36}$/)
  assert.equal(locations.length, 6)
  assert.equal(merged.thought_count, 6)
  assert.equal(merged.is_mine, true)
  assert.equal(ownCards[0].body, 'A new demo Thought.')
  assert.equal(Object.hasOwn(ownCards[0], 'drop_lat'), false)
  assert.equal(Object.hasOwn(ownCards[0], 'drop_lng'), false)
})

test('demo publishing creates a new node at the Safe Anchor when no node is within 20 metres', async () => {
  const api = createApi(null, { demoMode: true, storage: memoryStorage() })
  const safeCoordinate = [144.97915, -37.8005]

  await api.publishThought({
    p_device_id: '00000000-0000-4000-8000-000000009002',
    p_user_lat: -37.8005,
    p_user_lng: 144.9788,
    p_drop_lat: -37.8005,
    p_drop_lng: 144.9788,
    p_safe_lat: safeCoordinate[1],
    p_safe_lng: safeCoordinate[0],
    p_suburb: 'Fitzroy',
    p_category: 'Nature',
    p_body: null,
    p_background_type: 'grid',
    p_image_url: null,
    p_music_url: null,
  })

  const locations = await api.getMapLocations(
    '00000000-0000-4000-8000-000000009002',
  )
  const created = locations.find((location) => location.is_mine)

  assert.equal(locations.length, 7)
  assert.equal(created.lng, safeCoordinate[0])
  assert.equal(created.lat, safeCoordinate[1])
})

function demoPublishInput(deviceId, [lng, lat], body = 'Rate limit check') {
  return {
    p_device_id: deviceId,
    p_user_lat: lat,
    p_user_lng: lng,
    p_drop_lat: lat,
    p_drop_lng: lng,
    p_safe_lat: lat,
    p_safe_lng: lng,
    p_suburb: 'Fitzroy',
    p_category: 'Moment',
    p_body: body,
    p_background_type: 'solid',
    p_image_url: null,
    p_music_url: null,
  }
}

test('demo publishing enforces five Thoughts per device in a rolling hour', async () => {
  const api = createApi(null, { demoMode: true, storage: memoryStorage() })
  const coordinates = [
    [144.97886, -37.80046],
    [144.97945, -37.8002],
    [144.97695, -37.80135],
    [144.9819, -37.80205],
    [144.97565, -37.79865],
    [144.98265, -37.79775],
  ]

  for (const coordinate of coordinates.slice(0, 5)) {
    await api.publishThought(demoPublishInput(
      '00000000-0000-4000-8000-000000009100',
      coordinate,
    ))
  }

  await assert.rejects(
    () => api.publishThought(demoPublishInput(
      '00000000-0000-4000-8000-000000009100',
      coordinates[5],
    )),
    { message: 'Hourly drop limit reached' },
  )
})

test('demo publishing limits a location node to three new Thoughts per hour', async () => {
  const api = createApi(null, { demoMode: true, storage: memoryStorage() })
  const coordinate = [144.97886, -37.80046]

  for (let index = 0; index < 3; index += 1) {
    await api.publishThought(demoPublishInput(
      `00000000-0000-4000-8000-00000000920${index}`,
      coordinate,
    ))
  }

  await assert.rejects(
    () => api.publishThought(demoPublishInput(
      '00000000-0000-4000-8000-000000009299',
      coordinate,
    )),
    { message: 'This location is taking a short break' },
  )
})

test('photo uploads use a random device-scoped object key instead of the raw filename', async () => {
  const uploads = []
  const client = {
    storage: {
      from(bucket) {
        assert.equal(bucket, 'thought-images')
        return {
          async upload(path, file, options) {
            uploads.push({ path, file, options })
            return { data: { path }, error: null }
          },
          getPublicUrl(path) {
            return { data: { publicUrl: `https://images.example/${path}` } }
          },
        }
      },
    },
  }
  const api = createApi(client)
  const deviceId = '00000000-0000-4000-8000-000000009900'

  const url = await api.uploadThoughtPhoto(
    { name: 'my-exact-location.png', size: 1024 },
    deviceId,
  )

  assert.match(uploads[0].path, new RegExp(`^${deviceId}/[0-9a-f-]{36}\\.png$`))
  assert.equal(uploads[0].path.includes('my-exact-location'), false)
  assert.equal(uploads[0].options.upsert, false)
  assert.equal(url, `https://images.example/${uploads[0].path}`)
})

test('photo uploads reject files larger than 6 MB before contacting Storage', async () => {
  const api = createApi({ storage: { from: () => assert.fail('Storage should not be called') } })

  await assert.rejects(
    () => api.uploadThoughtPhoto(
      { name: 'large.jpg', size: (6 * 1024 * 1024) + 1 },
      '00000000-0000-4000-8000-000000009901',
    ),
    { message: 'Photo limit is 6 MB for this MVP.' },
  )
})

test('deleteThought sends only the device and Thought IDs to the owner-checked RPC', async () => {
  const client = recordingClient({ data: true, error: null })
  const api = createApi(client)

  await api.deleteThought('device-id', 'thought-id')

  assert.deepEqual(client.calls[0], [
    'delete_thought',
    { p_device_id: 'device-id', p_thought_id: 'thought-id' },
  ])
})

test('demo Thoughts expose ownership and only the author can delete', async () => {
  const storage = memoryStorage()
  const api = createApi(null, { demoMode: true, storage })
  const author = '00000000-0000-4000-8000-000000009950'
  const [location] = await api.getMapLocations(author)
  const thoughtId = await api.publishThought({
    ...demoPublishInput(author, [location.lng, location.lat], 'Mine to remove.'),
    p_background_color: 'sage',
    p_font_family: 'patrick-hand',
    p_font_size: 12,
  })

  const [owned] = await api.getLocationThoughts(location.location_id, author, true)
  assert.equal(owned.id, thoughtId)
  assert.equal(owned.is_own, true)
  assert.equal(owned.background_color, 'sage')
  assert.equal(owned.font_family, 'patrick-hand')
  assert.equal(owned.font_size, 12)

  await assert.rejects(
    () => api.deleteThought('00000000-0000-4000-8000-000000009951', thoughtId),
    { message: 'Thought not found' },
  )

  assert.equal(await api.deleteThought(author, thoughtId), true)
  assert.deepEqual(
    await api.getLocationThoughts(location.location_id, author, true),
    [],
  )
})
