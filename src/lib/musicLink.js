import { MUSIC_LINK_MAX_LENGTH } from './contentRules.js'

export const BGM_SOURCE_HINT = 'Tracks only · Spotify, Apple Music, YouTube Music'
export const BGM_INVALID_COPY = 'Invalid link. Or enter track name in box above.'

const PROVIDERS = Object.freeze({
  SPOTIFY: 'spotify',
  APPLE_MUSIC: 'apple-music',
  YOUTUBE_MUSIC: 'youtube-music',
})

function emptyResult(error = null) {
  return { url: null, provider: null, error }
}

function parseSpotify(url) {
  const match = url.pathname.match(/^\/track\/([a-z0-9]+)\/?$/i)
  if (!match) return emptyResult('unsupported')
  return {
    url: `https://open.spotify.com/track/${match[1]}`,
    provider: PROVIDERS.SPOTIFY,
    error: null,
  }
}

function parseAppleMusic(url) {
  const songMatch = url.pathname.match(/^\/([a-z]{2})\/song\/([^/?#\s]+)\/([0-9]+)\/?$/i)
  if (songMatch) {
    return {
      url: `https://music.apple.com/${songMatch[1]}/song/${songMatch[2]}/${songMatch[3]}`,
      provider: PROVIDERS.APPLE_MUSIC,
      error: null,
    }
  }

  const albumMatch = url.pathname.match(/^\/([a-z]{2})\/album\/([^/?#\s]+)\/([0-9]+)\/?$/i)
  const songId = url.searchParams.get('i')
  if (!albumMatch || !/^[0-9]+$/.test(songId || '')) return emptyResult('unsupported')
  return {
    url: `https://music.apple.com/${albumMatch[1]}/album/${albumMatch[2]}/${albumMatch[3]}?i=${encodeURIComponent(songId)}`,
    provider: PROVIDERS.APPLE_MUSIC,
    error: null,
  }
}

function parseYouTubeMusic(url) {
  const videoId = url.pathname === '/watch' ? url.searchParams.get('v') : null
  if (!/^[a-z0-9_-]+$/i.test(videoId || '')) return emptyResult('unsupported')
  return {
    url: `https://music.youtube.com/watch?v=${encodeURIComponent(videoId)}`,
    provider: PROVIDERS.YOUTUBE_MUSIC,
    error: null,
  }
}

export function parseMusicLink(value = '') {
  const clean = String(value ?? '').trim()
  if (!clean) return emptyResult()
  if (clean.length > MUSIC_LINK_MAX_LENGTH) {
    return emptyResult('too_long')
  }

  const candidate = /^https?:\/\//i.test(clean) ? clean : `https://${clean}`

  try {
    const url = new URL(candidate)
    if (
      !['http:', 'https:'].includes(url.protocol)
      || !url.hostname.includes('.')
      || url.username
      || url.password
    ) {
      return emptyResult('invalid')
    }

    const hostname = url.hostname.toLowerCase()
    if (hostname === 'open.spotify.com') return parseSpotify(url)
    if (hostname === 'music.apple.com') return parseAppleMusic(url)
    if (hostname === 'music.youtube.com') return parseYouTubeMusic(url)
    return emptyResult('unsupported')
  } catch {
    return emptyResult('invalid')
  }
}

export const normalizeMusicLink = parseMusicLink
