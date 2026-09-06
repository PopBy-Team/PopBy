import test from 'node:test'
import assert from 'node:assert/strict'

import {
  BGM_INVALID_COPY,
  BGM_SOURCE_HINT,
  normalizeMusicLink,
  parseMusicLink,
} from '../src/lib/musicLink.js'

test('BGM guidance uses the approved quiet source and invalid-link copy', () => {
  assert.equal(BGM_SOURCE_HINT, 'Tracks only · Spotify, Apple Music, YouTube Music')
  assert.equal(BGM_INVALID_COPY, 'Invalid link. Or enter track name in box above.')
})

test('music links accept only supported single-track provider URLs', () => {
  assert.deepEqual(parseMusicLink('open.spotify.com/track/abc?si=tracking'), {
    url: 'https://open.spotify.com/track/abc',
    provider: 'spotify',
    error: null,
  })

  assert.deepEqual(parseMusicLink('https://music.apple.com/au/song/song-name/123456'), {
    url: 'https://music.apple.com/au/song/song-name/123456',
    provider: 'apple-music',
    error: null,
  })

  assert.deepEqual(parseMusicLink('https://music.apple.com/au/album/album-name/555?i=777&uo=4'), {
    url: 'https://music.apple.com/au/album/album-name/555?i=777',
    provider: 'apple-music',
    error: null,
  })

  assert.deepEqual(parseMusicLink('https://music.youtube.com/watch?v=abc123&list=RDabc'), {
    url: 'https://music.youtube.com/watch?v=abc123',
    provider: 'youtube-music',
    error: null,
  })
})

test('music links reject unsafe, arbitrary, and non-track links', () => {
  assert.deepEqual(parseMusicLink('javascript:alert(1)'), {
    url: null,
    provider: null,
    error: 'invalid',
  })

  for (const value of [
    'https://example.com/song',
    'https://youtube.com/watch?v=abc',
    'https://youtu.be/abc',
    'https://open.spotify.com/album/abc',
    'https://open.spotify.com/track/not%2Fa-track-id',
    'https://open.spotify.com/show/abc',
    'https://music.apple.com/australia/song/song-name/123456',
    'https://music.apple.com/au/song/song-name/not-a-number',
    'https://music.apple.com/au/album/album-name/555',
    'https://music.youtube.com/watch?v=not%2Fa-video-id',
    'https://music.youtube.com/playlist?list=abc',
    'https://user:password@open.spotify.com/track/abc',
  ]) {
    assert.ok(['invalid', 'unsupported'].includes(parseMusicLink(value).error), value)
    assert.equal(parseMusicLink(value).url, null)
  }
})

test('music links reject input beyond the 300-character contract', () => {
  assert.equal(
    parseMusicLink(`https://open.spotify.com/track/${'a'.repeat(301)}`).error,
    'too_long',
  )
})

test('empty links stay optional and the compatibility normalizer exposes provider data', () => {
  assert.deepEqual(parseMusicLink(''), { url: null, provider: null, error: null })
  assert.deepEqual(parseMusicLink(null), { url: null, provider: null, error: null })
  assert.deepEqual(normalizeMusicLink('HTTPS://OPEN.SPOTIFY.COM/track/ABC'), {
    url: 'https://open.spotify.com/track/ABC',
    provider: 'spotify',
    error: null,
  })
  assert.equal(parseMusicLink('not a link').error, 'invalid')
})
