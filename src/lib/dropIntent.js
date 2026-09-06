import { pointInsideFitzroy } from '../data/suburbs.js'
import { distanceMeters } from './geo.js'

export function getDropPermission(userCoordinate, locationCoordinate) {
  if (!userCoordinate) {
    return {
      allowed: false,
      distanceMeters: Infinity,
      reason: 'location_required',
    }
  }

  if (!pointInsideFitzroy(locationCoordinate)) {
    return {
      allowed: false,
      distanceMeters: Infinity,
      reason: 'outside_active_area',
    }
  }

  const selectedDistance = distanceMeters(userCoordinate, locationCoordinate)
  if (selectedDistance > 50) {
    return {
      allowed: false,
      distanceMeters: selectedDistance,
      reason: 'too_far',
    }
  }

  return {
    allowed: true,
    distanceMeters: selectedDistance,
    reason: null,
  }
}
