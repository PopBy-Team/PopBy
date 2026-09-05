import test from 'node:test'
import assert from 'node:assert/strict'

import { createApi } from '../src/lib/api.js'

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
