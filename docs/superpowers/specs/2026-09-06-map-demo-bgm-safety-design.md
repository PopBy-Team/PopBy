# PopBy Map, Demo, and BGM Safety Refinement Design

## Goal

Refine the mobile-only PopBy experience so the map chrome is quieter, the
Fitzroy demo demonstrates the complete product in one nearby cluster, dropping
a Thought feels spatial and understandable, and BGM links cannot be used as
arbitrary outbound links.

This change preserves the existing privacy sequence:

`raw long-press → Building Check → Safe Anchor → 20m node merge`

Raw long-press and live GPS coordinates remain transient frontend validation
state and are never stored.

## BGM decision

### Considered approaches

1. **Allowlisted official music deep links — selected.** Accept only a single
   track from Spotify, Apple Music, or YouTube Music. Keep the current
   user-initiated external `Open BGM` action. Do not fetch or store audio,
   artwork, titles, or provider metadata.
2. **Official embedded players — defer.** Spotify embeds are supported but use
   third-party cookies. Apple Music browser playback requires MusicKit setup,
   developer tokens, and subscriber authorization. YouTube embeds carry player
   size, attribution, privacy, autoplay, and playback-integrity requirements
   that do not fit a compact Thought card well.
3. **PopBy-hosted playback — reject.** Uploading, copying, or streaming audio
   would require materially more storage, moderation, rights management, and
   likely music licensing. It is outside the MVP.

### Accepted URL shapes

- `https://open.spotify.com/track/<track-id>`
- `https://music.apple.com/<storefront>/song/<slug>/<song-id>`
- `https://music.apple.com/<storefront>/album/<slug>/<album-id>?i=<song-id>`
- `https://music.youtube.com/watch?v=<video-id>`

The validator rejects regular YouTube, `youtu.be`, playlists, albums without a
track ID, podcasts, arbitrary HTTP(S) sites, shortened links, credentials in a
URL, and non-HTTP(S) protocols. It strips irrelevant tracking parameters where
safe and returns the provider for internal validation and accessibility copy.

Before the user types, the composer shows this quiet source hint beneath the
BGM field:

`Tracks only · Spotify, Apple Music, YouTube Music`

A valid link receives no success message. Published cards keep the generic
user-initiated action `🎵 Open BGM`; they do not name the provider or imply that
the track plays inside PopBy.

Validation runs in the composer, demo API, and Supabase `publish_thought` RPC.
Existing cards remain readable. Invalid new input displays exactly:

`Invalid link. Or enter track name in box above.`

The fallback means the user can type a track name in the Thought body. An
allowlist materially reduces arbitrary-link and phishing risk, but it is not a
guarantee that every song is suitable. Existing report/hide moderation remains
the abuse backstop.

## Area-agnostic onboarding and instructions

Guidance describes the product in terms of the area currently open on the map,
not Fitzroy specifically, so the same copy remains correct as new suburbs open.
The onboarding makes both sides of the product loop explicit: people can
explore Thoughts nearby and create their own whenever they want.

The key onboarding copy is:

- Welcome title: `Notice what’s already around you.`
- Welcome body:
  `Explore Thoughts around you. Create one right where you are, whenever you feel like it.`
- Explore title: `Explore Thoughts`
- Explore body:
  `Zoom in, move within 50m, then tap a marker to explore the Thoughts left there.`
- Explore note:
  `Bright areas are open to explore. Grey areas are waiting to be unlocked.`
- Create title: `Create a Thought`
- Create body:
  `Long-press a nearby public path or an existing Thought location inside any open area. Choose a category, then create your card.`
- Create note:
  `Optional BGM accepts Spotify, Apple Music and YouTube Music track links only.`

Existing anonymous identity, unlock, privacy, and Mine explanations remain,
but any launch-area-specific wording becomes dynamic or generic. The user-facing
verb is `Create`, not `Drop`, except where existing data or internal function
names retain `drop` for compatibility.

## Map chrome and area identity

- Remove the white capsule/background from the top `PopBy` wordmark.
- Replace `Demo GPS · Fitzroy` with the correctly spelled uppercase
  `MELBOURNE · FITZROY`, with no white background.
- The area label reflects the suburb under the map centre, using the central
  suburb geometry source. Known areas render `MELBOURNE · <SUBURB>`; outside a
  known polygon it falls back to `MELBOURNE`.
- Keep the top rail rule: controls and overlays do not rise above the bottom of
  the PopBy wordmark.

## Current-location focus, rotation, and zoom ownership

- The current-location button fits a **200m radius** around the live/demo
  location.
- Centralize this as `CURRENT_LOCATION_FOCUS_RADIUS_KM = 0.2` and also define
  `EXPANDED_AREA_FOCUS_RADIUS_KM = 0.4` beside a prominent comment: restore the
  400m radius immediately when PopBy opens another active suburb.
- Preserve Mapbox two-finger rotate gestures.
- Add a compact compass near the lower-right controls. It rotates with the map
  and resets to the original PopBy bearing when tapped.
- Browser-page pinch zoom is dynamically disabled while the Thought reader or
  drop creation flow is open, then restored on close. Mapbox pinch zoom and
  rotation remain enabled on the unobstructed map.

## Marker states

- Remove the blue glow/ring from the current device's own Thought locations.
  Mine continues to filter data but does not recolour markers.
- A location that has already been explored/unlocked uses a quiet translucent
  grey fill and no hard charcoal ring, giving a slightly extinguished state.
- A nearby locked location retains the warm unlockable emphasis.
- FAR-mode fireflies move from pale lemon to a slightly deeper warm amber while
  retaining a soft glow and a 44px hit area.
- All coordinates continue to come from persisted Safe Anchor road nodes;
  marker DOM transforms remain owned by Mapbox so pins do not drift on zoom.

## Demo story and seed data

Place three road-anchored demo nodes within 50m of the Fitzroy demo GPS point.
They use three dominant categories and all three existing count tiers:

- Nature, 2 Thoughts → 24px marker
- Art, 5 Thoughts → 32px marker
- Eat, 10 Thoughts → 40px marker

The 17 cards collectively cover solid Morandi colours, lined, grid, dots, and
photo backgrounds; all four fonts; 12/14/16 sizes; own and public Thoughts;
valid Spotify, Apple Music, and YouTube Music BGM links; empty optional text;
and a spread of timestamps. Remaining demo nodes may stay farther away for map
exploration, but the three-node cluster must be usable in a single 50m demo.

`src/data/demo.js` and `supabase/seed_demo.sql` remain equivalent. Seed IDs stay
deterministic and upserts remain safe to rerun.

## Compact category fan

- Seven categories stay in the existing approved order and appear at equal
  angular intervals on one shallow arc.
- The fan occupies roughly one-fifth of a portrait phone vertically: use a
  shallow approximately 132px × 88px arc rather than the current tall ellipse.
- Category bubbles are non-overlapping true circles with a dim off-white,
  partially transparent resting background. The selected circle brightens to
  full opacity while the others dim further.
- Halve the location pin to approximately 36px × 45px. Remove its outline and
  keep the centre hollow.
- Entry uses a short spring/overshoot. After settling, the pin makes a very
  small vertical idle bob. Respect `prefers-reduced-motion`.
- Edge clamping and automatic upper/lower fan direction continue to keep every
  bubble on screen.

## Safe Anchor explanation and drift animation

Safe Anchor is resolved immediately after category selection, before opening
the composer. The raw point remains only in transient memory. When Building
Check reports that the point was inside a mapped building and the Safe Anchor
moves it:

1. animate the visible pin from the raw point to the road anchor over roughly
   650ms using interpolated Mapbox coordinates;
2. open the composer using the resolved Safe Anchor result;
3. show an auto-dismissing bubble for roughly 2.4 seconds:

   `Moved to the nearest street · public paths work best.`

The bubble is informational, not blocking. If no Safe Anchor exists, retain the
existing blocking `Move toward a public path` error. Publish still sends both
raw and safe coordinates so the database rechecks the 50m and 60m rules.

## Composer details

- First-use strip copy becomes:
  - title: `Nearby`
  - body: `Within 50m, 5 per hour, 3 per location`
- The top-left category control uses a true circular background.
- The BGM field uses a fixed `🎵` icon.
- `Pick BGM` is a 10pt-equivalent light-grey placeholder.
- Before input, the inline source hint is exactly:
  `Tracks only · Spotify, Apple Music, YouTube Music`
- Valid input produces no confirmation message.
- Invalid/unsupported BGM copy is exactly:
  `Invalid link. Or enter track name in box above.`
- Published cards use the generic label `🎵 Open BGM` with no provider name.
- Keep the current send icon, category switcher, 150-word limit, live-camera
  background, appearance tools, privacy validation, and inline error style.

## Data and interfaces

New or refined pure interfaces:

```js
parseMusicLink(input)
// => { url: string|null, provider: 'spotify'|'apple-music'|'youtube-music'|null,
//      error: null|'invalid'|'unsupported'|'too_long' }

getAreaLabel(coordinate)
// => a known `MELBOURNE · <SUBURB>` label, otherwise `MELBOURNE`

fitMapToRadius(map, coordinate, CURRENT_LOCATION_FOCUS_RADIUS_KM)

animateAnchorDrift(map, marker, fromCoordinate, toCoordinate, options)
// returns cleanup/cancel handle and never persists either coordinate
```

The existing `music_url` database column remains sufficient. A new idempotent
Supabase upgrade updates only the publish RPC validation needed for the music
allowlist; it does not add audio storage or erase existing cards.

## Error handling

- Unsupported/invalid BGM never opens an outbound URL and uses the specified
  inline sentence.
- Existing unavailable track links remain provider responsibility; PopBy does
  not claim permanent availability.
- Safe Anchor lookup failures retain friendly existing messages.
- Drift animation cancellation removes transient markers and timers.
- Unknown centre locations show only `MELBOURNE`, never a guessed suburb.

## Testing and verification

- Unit tests for accepted/rejected provider URL shapes and canonicalization.
- Demo API tests prove backend-equivalent allowlist enforcement.
- Geometry tests prove 0.2km recenter and the staged 0.4km expansion constant.
- Area-label tests cover known and unknown coordinates.
- Marker presentation tests cover own, unlocked, nearby, and FAR colours.
- Category-fan tests cover equal spacing, compact height, direction, and edge
  clamping.
- Animation tests cover interpolation, completion, and cancellation.
- Browser QA at 320×568 and 390×844 plus a short landscape viewport verifies
  top/bottom chrome, three marker tiers, compass, reader/composer zoom lock,
  composer copy, and drift bubble placement.
- Run the complete Node test suite and production Vite build.

## Reference constraints

- Spotify Embeds and their third-party cookie implications:
  https://developer.spotify.com/documentation/embeds
- YouTube required player size, attribution, and playback rules:
  https://developers.google.com/youtube/terms/required-minimum-functionality
- Apple Music browser playback and developer-token/user authorization:
  https://developer.apple.com/musickit/
- Australian online music licensing overview:
  https://www.apraamcos.com.au/music-licences/select-a-licence/online-mini-licence
