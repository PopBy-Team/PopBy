import { supabase } from './supabase.js'

const PHOTO_LIMIT_BYTES = 6 * 1024 * 1024

function requireClient(client) {
  if (!client) {
    throw new Error('Supabase is not configured')
  }
  return client
}

async function unwrap(request) {
  const { data, error } = await request
  if (error) {
    throw Object.assign(new Error(error.message || 'Supabase request failed'), error)
  }
  return data
}

function safeExtension(filename = '') {
  const candidate = filename.split('.').pop()?.toLowerCase()
  return candidate && /^[a-z0-9]{1,8}$/.test(candidate) ? candidate : 'jpg'
}

export function createApi(client) {
  return {
    getMapLocations(deviceId) {
      return unwrap(requireClient(client).rpc('get_map_locations', {
        p_device_id: deviceId,
      }))
    },

    async getSuburbProgress(suburb) {
      const rows = await unwrap(requireClient(client).rpc('get_suburb_progress', {
        p_suburb: suburb,
      }))
      return rows?.[0] ?? null
    },

    getLocationThoughts(locationId, deviceId, mineOnly) {
      return unwrap(requireClient(client).rpc('get_location_thoughts', {
        p_location_id: locationId,
        p_device_id: deviceId,
        p_mine_only: mineOnly,
      }))
    },

    unlockLocation(deviceId, locationId, [userLng, userLat]) {
      return unwrap(requireClient(client).rpc('record_unlock', {
        p_device_id: deviceId,
        p_location_id: locationId,
        p_user_lat: userLat,
        p_user_lng: userLng,
      }))
    },

    publishThought(input) {
      return unwrap(requireClient(client).rpc('publish_thought', input))
    },

    reportThought(deviceId, thoughtId) {
      return unwrap(requireClient(client).rpc('report_thought', {
        p_device_id: deviceId,
        p_thought_id: thoughtId,
      }))
    },

    recordDwell(deviceId, thoughtId, milliseconds) {
      return unwrap(requireClient(client).rpc('record_dwell', {
        p_device_id: deviceId,
        p_thought_id: thoughtId,
        p_ms: Math.min(Math.max(Math.round(milliseconds), 0), 120000),
      }))
    },

    async uploadThoughtPhoto(file, deviceId) {
      if (!file) return null
      if (file.size > PHOTO_LIMIT_BYTES) {
        throw new Error('Photo limit is 6 MB for this MVP.')
      }

      const path = `${deviceId}/${crypto.randomUUID()}.${safeExtension(file.name)}`
      const storage = requireClient(client).storage.from('thought-images')
      await unwrap(storage.upload(path, file, { upsert: false }))
      return storage.getPublicUrl(path).data.publicUrl
    },
  }
}

const api = createApi(supabase)

export const getMapLocations = (...args) => api.getMapLocations(...args)
export const getSuburbProgress = (...args) => api.getSuburbProgress(...args)
export const getLocationThoughts = (...args) => api.getLocationThoughts(...args)
export const unlockLocation = (...args) => api.unlockLocation(...args)
export const publishThought = (...args) => api.publishThought(...args)
export const reportThought = (...args) => api.reportThought(...args)
export const recordDwell = (...args) => api.recordDwell(...args)
export const uploadThoughtPhoto = (...args) => api.uploadThoughtPhoto(...args)
