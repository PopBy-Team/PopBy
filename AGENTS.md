# PopBy MVP — Codex Build Contract

> Place this file at the repository root as `AGENTS.md`.
> Codex: implement the app, do not only describe it. Inspect existing code first, preserve working code, edit files, and run `npm run build` after major phases. Fix build errors before stopping.

## 0. Human quick start

First Codex prompt:

```text
Read AGENTS.md completely. Inspect the repo. Implement Phases 0–2 first. Do not stop at a plan. Run npm install and npm run build, fix build errors, then tell me only the manual credentials/setup I still need.
```

Then:

```text
Read AGENTS.md and implement the next unfinished phase. Preserve working code. Run npm run build and fix errors before stopping.
```

Full autonomous attempt:

```text
Read AGENTS.md and implement the whole PopBy MVP phase-by-phase. Make reasonable assumptions instead of asking architecture questions already answered in AGENTS.md. Use demo data if credentials are unavailable. Run npm run build after each major integration point.
```

---

# 1. Product PRD

## Goal

PopBy is a mobile-first location-based social discovery web app.

Core loop:

**Open map → explore → get closer → unlock → read → long-press → drop → privacy adjustment → Mine**

The product should motivate real-world exploration, not profile-building.

## Stack

- React + Vite, plain JavaScript
- Mapbox GL JS
- Turf.js
- Supabase Postgres + PostGIS + Storage
- Vercel deployment

Do not switch map/backend providers.

## Identity

No sign-up in MVP.

On first visit:

```js
let id = localStorage.getItem('popby_device_id')
if (!id) {
  id = crypto.randomUUID()
  localStorage.setItem('popby_device_id', id)
}
```

Device ID binds:
- Mine
- unlock history
- reports
- drop limits

Do not implement username, avatar, bio, followers, likes, comments, public profile, Apple/Google login.

## Launch area

- Active: Fitzroy, Melbourne
- Next: Carlton
- Show Carlton, Collingwood, Fitzroy North grey/locked.
- Tapping locked suburb shows transient text only: `Awaiting unlock`.
- No modal.

## Fitzroy progress

100% requires all:
- 15 active locations
- 50 visible Thoughts
- 30 unique contributors
- 50 successful unlocks

```js
progress = Math.min(
  activeLocations / 15,
  totalThoughts / 50,
  uniqueContributors / 30,
  successfulUnlocks / 50,
  1
)
```

UI only:

```text
Fitzroy       42%
██████░░░░░░
Next     Carlton
```

Do not build expandable progress details.

Active location = location node with >=1 non-hidden Thought.

## Thought categories

Exactly:
- Animals
- Nature
- Eat
- Art
- Place
- Sound
- Moment

Centralize icon mapping. MVP icons may be:

```js
{
  Animals:'🐾', Nature:'🌿', Eat:'🍜', Art:'🎨',
  Place:'📍', Sound:'♫', Moment:'✦'
}
```

## Thought content

Required:
- category
- automatic timestamp

Optional:
- 0–200 words text
- background: `solid | lined | grid | photo`
- current-scene photo
- music URL

Music is only a player-like external link:

```text
▶ Open track
```

Only allow `http:`/`https:` URLs.

## Unlock

Public location state:
- >120m: normal locked
- 50–120m: tap → `Approaching…`
- >50m: tap → `Get closer`
- <=50m: marker glows, tap unlocks

Database must re-check <=50m with PostGIS.

After successful unlock, that device may reopen that public location remotely.

## Drop

Start with map long-press (~650ms).

Raw selected point must:
- be inside active Fitzroy
- be <=50m from current user/demo location

Limits:
- max 5 Thoughts/device/rolling hour
- max 3 new Thoughts/location node/rolling hour

## Mine

`Mine` toggle.

OFF:
- public locations.

ON:
- only locations containing current device's Thoughts.
- markers glow differently.
- own cards can be remotely opened.
- never reveal other people's cards remotely just because Mine is on.

## Reports

Public card has `•••`.

- same device can report same Thought once
- 2 unique reports → `hidden=true`
- hidden content disappears from feeds and map counts

## Dwell

Record:
- thought_id
- device_id
- dwell ms
- timestamp

Ignore <250ms in frontend; cap one event at 120000ms.
No ranking UI/algorithm in MVP.

---

# 2. Privacy — non-negotiable

Use exactly:

**Building Check → Safe Anchor → 20m Node Merge**

Do not use Map Matching.
Never persist user GPS or raw long-press coordinate.

## Building Check + Tilequery

At publish time query Mapbox Streets v8 Tilequery:

```text
https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/tilequery/{lng},{lat}.json
?radius=40
&layers=building,road
&limit=50
&access_token=<VITE_MAPBOX_TOKEN>
```

Inside mapped building when a result has:
- `properties.tilequery.layer === 'building'`
- `properties.tilequery.geometry === 'polygon'`
- `properties.tilequery.distance === 0`

## Safe Anchor candidates

Only road results where:
- tilequery layer = `road`
- original geometry = `linestring`
- `access !== 'restricted'`

Reject classes:
- service
- track
- construction
- motorway / motorway_link
- trunk / trunk_link

Reject type containing `driveway`.

Priority:
1. path + sidewalk
2. path + footway
3. path + crossing
4. path + path
5. pedestrian
6. street_limited
7. street
8. tertiary
9. secondary
10. primary fallback

Within equal priority use smallest Tilequery distance.

Use returned `feature.geometry.coordinates`; Tilequery already returns the closest point on a line.

Always use an accepted Safe Anchor even if raw point is not inside a building.

If none exists within 40m, block publish:

Title: `Move toward a public path`

Body: `We couldn’t find a safer nearby path or street anchor. Move a little closer to one and try again.`

## 20m merge

After Safe Anchor:
- PostGIS finds nearest existing location within 20m.
- if found, attach Thought.
- otherwise create location at Safe Anchor.

Public pin = node coordinate.
Raw point = validation only, never stored.

## MVP security compromise

For hackathon speed, `src/lib/privacy.js` may call Tilequery in browser using the public Mapbox token.

Database publish RPC must still validate:
- user → raw <=50m
- raw → safe <=60m

Production future: move Tilequery to Supabase Edge Function.

---

# 3. Mapbox UX

Use:

```text
mapbox://styles/mapbox/standard
```

Configure if supported:
- theme `monochrome`
- lightPreset `day`
- showPointOfInterestLabels false
- showTransitLabels false
- show3dObjects false
- showPedestrianRoads true
- showRoadLabels true

Initial center:

```js
[144.9788, -37.8005]
```

Use approximate suburb polygons for hackathon, centralized in `src/data/suburbs.js`.

Fitzroy: bright translucent fill.
Locked suburbs: grey translucent fill.

## Visible-range modes

Do not rely only on zoom number. Estimate viewport width with Turf:

```js
function getViewportWidthMeters(map) {
  const b = map.getBounds()
  const lat = map.getCenter().lat
  return distance(
    point([b.getWest(), lat]),
    point([b.getEast(), lat]),
    {units:'meters'}
  )
}
```

Modes:
- FAR > ~1500m: simple circle dots only.
- MEDIUM roughly 700–1500m: category icons, consistent size.
- NEAR around requested neighborhood scale: category icons sized by count:
  - 1–3 → 24px
  - 4–9 → 32px
  - 10+ → 40px
- never print count.

Interpret “370m around me” as ~370m radius (~740m diameter); keep threshold constants easy to tune.

Implementation:
- FAR dots: GeoJSON + Mapbox circle layer.
- MEDIUM/NEAR: HTML `mapboxgl.Marker`.
- This MVP has only tens of nodes; do not overbuild vector tiles.

## Dominant category

Database map query:
1. group non-hidden Thoughts by category
2. highest count wins
3. tie → category with most recently posted Thought

## Current location

Use `mapboxgl.GeolocateControl` with high accuracy and tracking.

On geolocate:
- store `[lng,lat]`
- fit map to ~370m radius using Turf `circle(...0.37km)` + `bbox` + `fitBounds`.

---

# 4. First-user guidance

Three layers:
1. one-time onboarding
2. contextual coach tips
3. inline rules

Store completion in localStorage and add `?` to replay.

## Onboarding, 6 screens

1. **Welcome to PopBy**
   - Title: `Notice what’s already around you.`
   - Body: `No sign-up, profile or followers. PopBy remembers your Thoughts and unlocks on this browser with an anonymous device ID.`
   - Note: clearing site data resets MVP local memories.

2. **Explore**
   - Title: `Fitzroy is open.`
   - Body: far = dots, closer = category icons, bigger = more Thoughts.
   - Note: grey suburbs await unlock; mention 15/50/30/50 thresholds.

3. **Unlock**
   - Title: `Some Thoughts only make sense when you’re there.`
   - Body: within 50m to unlock; `Approaching` means close.
   - Note: unlocked public locations can reopen later.

4. **Drop**
   - Title: `Leave something behind where you noticed it.`
   - Body: long-press within 50m, choose category/card/content.
   - Note: 5/device/hour, 3/location/hour.

5. **Privacy**
   - Title: `Your exact drop point isn’t published.`
   - Body: building check → safer path/street anchor → shared ~20m node.
   - Note: raw point not stored.

6. **Mine**
   - Title: `Keep your own city memories easy to find.`
   - Body: Mine shows own Thought locations and allows remote own-card viewing.
   - Note: 2 unique reports hide public abuse.

## Contextual copy

No location:
- `Turn on your location`
- `Tap the location button so PopBy can check the 50m rule.`

Far Thought:
- `Get closer`
- `Thoughts unlock within 50m.`

50–120m:
- `Approaching…`
- `You’re nearly there.`

Long-press outside Fitzroy:
- `Drop inside the open area`
- `Fitzroy is the active PopBy area for this MVP.`

Long-press >50m:
- `Too far to drop`
- include approximate selected distance.

Mine first ON:
- `Only your memories are showing`
- `Your own Thought locations can be opened remotely.`

After publish:
- toast `Thought dropped`
- optional one-time hint: `Turn on Mine to find it again.`

Drop Composer top strip must always show:

```text
within 50m of you · 5/hour per device · 3/hour at one location
```

---

# 5. Thought cards

Open in mobile bottom sheet.

Show:
- category
- timestamp
- body
- optional image/background
- optional music link

CSS backgrounds:
- solid warm card
- lined repeating horizontal lines
- grid CSS pattern
- photo with readable overlay

## Deck order

Sort newest → oldest.

- n=1: only card
- n=2: newest, oldest
- n>=3:
  - newest first
  - oldest reserved for last
  - A = positions 2–8
  - B = positions 9–15
  - C = positions 16–(n-1)
  - shuffle each layer once
  - cycle A→B→C, skipping empty layers, until all used
  - append oldest
  - no duplicate before loop

Implement pure `buildThoughtDeck()` in `src/lib/cardOrder.js`.

Support swipe left/right and arrow buttons.
First card open shows small dismissible: `Newest first. Swipe left/right for more.`

---

# 6. Drop Composer

Bottom sheet.

Step 1 Category:
- 7 chips
- selected category helper:
  - Animals: `Animals, pets or urban wildlife.`
  - Nature: `Trees, flowers, weather or small natural details.`
  - Eat: `Food, drinks or something worth tasting.`
  - Art: `Street art, design, objects or creative details.`
  - Place: `A corner, building, shopfront or space worth noticing.`
  - Sound: `Music, voices, ambience or something you heard here.`
  - Moment: `A fleeting feeling or scene that fits nowhere else.`

Step 2 Background:
- Solid, Lined, Grid, Photo
- Photo input:
```html
<input type="file" accept="image/*" capture="environment">
```
- client max 6MB

Step 3 Content:
- optional textarea, live word count, max 200
- optional music URL

Privacy disclosure:
- summary `How PopBy protects this location`
- copy: raw point not stored; building check; nearby safer path/street anchor; ~20m merge.

Button:
- `Drop Thought`
- busy: `Checking location…`

---

# 7. Database schema

Use Supabase Postgres + PostGIS.
Use geography(Point,4326), longitude first.
Add GiST index.

Tables:

```text
locations
  id uuid PK
  suburb text default Fitzroy
  lat float8
  lng float8
  geom geography(Point,4326)
  created_at timestamptz

thoughts
  id uuid PK
  location_id uuid FK
  device_id uuid
  category text
  body text null
  background_type text
  image_url text null
  music_url text null
  hidden boolean default false
  created_at timestamptz

unlocks
  device_id uuid
  location_id uuid FK
  unlocked_at timestamptz
  PK(device_id,location_id)

reports
  thought_id uuid FK
  device_id uuid
  created_at timestamptz
  PK(thought_id,device_id)

dwell_events
  id bigint identity PK
  thought_id uuid FK
  device_id uuid
  ms integer check 0..120000
  created_at timestamptz
```

Checks:
- categories exactly 7 listed above
- background exactly solid/lined/grid/photo

Indexes:
- locations geom GiST
- thoughts(location_id, created_at desc)
- thoughts(device_id, created_at desc)

Security:
- enable RLS.
- no broad anon direct insert/update/delete on app tables.
- use `security definer` RPCs.
- grant required RPC execute to anon.
- RPC results must not expose other users' device IDs.
- never place Supabase secret/service key in Vite.

The local device ID is spoofable; acceptable MVP limitation.

---

# 8. Required Supabase RPC contract

Create in `supabase/schema.sql`.

## `get_map_locations(p_device_id uuid)`

Return:

```text
location_id, suburb, lat, lng, thought_count,
dominant_category, latest_at, is_mine, is_unlocked
```

Only non-hidden Thoughts count.
No device IDs returned.

## `get_location_thoughts(p_location_id uuid,p_device_id uuid,p_mine_only boolean)`

Return only:

```text
id, category, body, background_type, image_url, music_url, created_at
```

If mine_only=true:
- current device's non-hidden cards, no unlock needed.

If false:
- public non-hidden cards only if device previously unlocked location.
- otherwise no rows.

## `get_suburb_progress(p_suburb text)`

Return counts + progress=min four ratios.

## `record_unlock(p_device_id,p_location_id,p_user_lat,p_user_lng)`

- construct user geography
- load node
- require `ST_DWithin(user,node,50)`
- else raise `Get closer`
- insert unlock `on conflict do nothing`
- never save GPS

## `publish_thought(...)`

Inputs:

```text
device_id
user_lat,user_lng
drop_lat,drop_lng
safe_lat,safe_lng
suburb
category
body
background_type
image_url
music_url
```

Validation order:
1. suburb must be Fitzroy
2. category/background valid
3. body <=200 words
4. construct user/raw/safe geography
5. require user→raw <=50m
6. require raw→safe <=60m
7. device last-hour count <5
8. find nearest location within 20m safe anchor
9. create node if none
10. node last-hour Thought count <3
11. insert Thought
12. return Thought ID

Never store raw drop or user GPS.

Errors:
- device limit: `Hourly drop limit reached`
- node limit: `This location is taking a short break`

## `report_thought(p_device_id,p_thought_id)`

- insert on conflict do nothing
- count unique
- >=2 → hidden=true
- return count

## `record_dwell(p_device_id,p_thought_id,p_ms)`

Insert only if 0..120000.

---

# 9. Storage

Bucket: `thought-images`.

Hackathon:
- public read okay
- anon upload okay
- object key `<device-id>/<random-uuid>.<ext>`
- never use raw filename as key
- reject >6MB in client

README must flag anonymous upload as production hardening work.

---

# 10. Target file structure

```text
.
├── AGENTS.md
├── .env.example
├── package.json
├── vite.config.js
├── index.html
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── styles.css
│   ├── components/
│   │   ├── MapView.jsx
│   │   ├── ProgressCard.jsx
│   │   ├── Toast.jsx
│   │   ├── OnboardingTour.jsx
│   │   ├── CoachTip.jsx
│   │   ├── DropComposer.jsx
│   │   └── ThoughtSheet.jsx
│   ├── data/suburbs.js
│   └── lib/
│       ├── supabase.js
│       ├── device.js
│       ├── geo.js
│       ├── privacy.js
│       ├── cardOrder.js
│       ├── guidance.js
│       └── api.js
└── supabase/
    ├── schema.sql
    └── seed_demo.sql
```

Keep plain React state/CSS.
Do not add Redux/Zustand/Tailwind/Next/router unless already present.

---

# 11. Environment

Create `.env.example`:

```env
VITE_MAPBOX_TOKEN=pk.your_mapbox_public_token
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_DEMO_MODE=true
```

Demo location:

```js
[144.9788,-37.8005]
```

Also accept `?demo=1`.
Show tiny `Demo GPS · Fitzroy` badge in demo mode.

Demo mode submits simulated user coordinate; do not remove backend distance validation.

---

# 12. Helper modules

`device.js`
- `getDeviceId()`
- `DEMO_MODE`
- `DEMO_LOCATION`

`geo.js`
- `distanceMeters(a,b)`
- `getViewportWidthMeters(map)`
- 370m radius fit helper

`privacy.js`
- `getSafeAnchor(rawCoordinate)` per Section 2
- return:
```js
{coordinate,insideBuilding,snapped:true,anchorClass,anchorType,distanceMeters}
```

`cardOrder.js`
- pure `buildThoughtDeck(thoughts)`

`guidance.js`
- onboarding copy
- localStorage tip keys
- friendly error mapping

`api.js`
- wrapper functions:
```js
getMapLocations
getSuburbProgress
getLocationThoughts
unlockLocation
publishThought
reportThought
recordDwell
uploadThoughtPhoto
```

---

# 13. Visual direction

Feel:
- calm
- young
- lightweight
- slightly poetic
- not dashboard-like

Use:
- off-white surfaces
- charcoal text
- warm pale highlight
- rounded cards
- soft shadow
- restrained labels

Full-screen map; no normal top nav.

Rough mobile layout:

```text
Fitzroy 42%       PopBy   Mine
████░░
Next Carlton

          MAP

?                          ◎
```

Bottom sheets must respect mobile safe areas.

---

# 14. Implementation phases

Execute in order. If credentials missing, implement code and continue; never invent tokens.

## Phase 0 — scaffold

If existing Vite app, preserve/adapt.
If empty:

```bash
npm create vite@latest . -- --template react
npm install
npm install mapbox-gl @supabase/supabase-js @turf/turf
```

Create `.env.example`.

Acceptance: `npm run build`.

## Phase 1 — map shell

Implement:
- Mapbox Standard full-screen
- Fitzroy center
- calm map config
- Fitzroy + grey suburb polygons
- ProgressCard (not expandable)
- Mine / ? / Toast / GeolocateControl

Acceptance:
- pan/zoom works
- grey tap → Awaiting unlock
- build passes

## Phase 2 — Supabase/PostGIS

Create `supabase/schema.sql`:
- schema, indexes, RLS/grants, RPCs, storage policy if feasible
- `src/lib/supabase.js`
- README manual setup

Acceptance:
- no client secret key
- SQL function names match this spec

## Phase 3 — demo map data

Create `seed_demo.sql`:
- ~6 Fitzroy location nodes
- ~12–18 fictional short Thoughts
- varied categories
- some nodes 4+ Thoughts

Connect `get_map_locations`.
Implement far dots, medium/near markers, size tiers.

Acceptance:
- seeded map looks alive
- no marker count number

## Phase 4 — GPS + unlock

Implement:
- user/demo state
- 370m recenter
- distance states
- record_unlock
- reopen unlocked public location

Acceptance:
- Get closer / Approaching / glow / unlock all work

## Phase 5 — card sheet

Implement:
- get_location_thoughts
- ThoughtSheet
- backgrounds/photo/music
- deck ordering
- swipe/arrows
- dwell
- report UI/backend

Acceptance:
- newest first
- no repeats before loop
- hidden Thought disappears after refresh

## Phase 6 — long-press + Composer

Long press ~650ms; cancel if pointer moves >~10px.
Convert screen position via map `unproject`.

Before composer:
- location exists
- inside Fitzroy
- <=50m

Build category/background/text/music/photo UI + visible rules.

Acceptance:
- invalid press gives contextual reason
- valid press opens mobile-usable composer

## Phase 7 — privacy + publish

Frontend order:

```text
raw drop
→ getSafeAnchor
→ photo upload if any
→ publish_thought RPC
→ refresh map
→ success toast
```

Never direct-insert Thought from client.

Acceptance:
- no Safe Anchor blocks
- raw point not persisted
- <=20m safe anchors reuse same node
- build passes

## Phase 8 — Mine

Mine ON:
- filter to `is_mine`
- own glow
- use `mine_only=true`
- no distance requirement
- only own cards returned

Acceptance: no remote leakage of others' cards.

## Phase 9 — guidance

Implement onboarding once + replay `?`, coach tips, card guide, Composer limit strip.
Do not create progress expansion.

Acceptance:
- clean browser sees onboarding once
- refresh does not reopen
- ? replays

## Phase 10 — friendly errors

Map:
- `Hourly drop limit reached`
  → `5-drop limit reached`
  → explain rolling hour
- location limit
  → `This spot is full for now`
  → explain 3/hour/location
- Safe Anchor failure
  → `Move toward a public path`
- word limit
  → `200-word maximum`

Do not show SQL jargon for expected rules.

## Phase 11 — demo polish

Only polish:
- spacing
- glow
- readable cards
- mobile response
- empty Mine state
- loading/disabled states

Do not add new major feature.

## Phase 12 — verify

Run:

```bash
npm run build
```

Then check:

- [ ] anonymous device ID
- [ ] onboarding once + replay
- [ ] Fitzroy active / other suburb grey
- [ ] simple progress bar only
- [ ] far dots
- [ ] category icons
- [ ] 24/32/40 size tiers
- [ ] location + demo mode
- [ ] ~370m recenter
- [ ] Get closer
- [ ] Approaching
- [ ] <=50m unlock
- [ ] unlocked reopen
- [ ] newest-first card
- [ ] swipe
- [ ] music link
- [ ] long-press
- [ ] Fitzroy-only Drop
- [ ] <=50m Drop
- [ ] <=200 words
- [ ] Building Check
- [ ] Safe Anchor
- [ ] raw coordinate not stored
- [ ] 20m merge
- [ ] photo
- [ ] 5/device/hour
- [ ] 3/location/hour
- [ ] Mine
- [ ] report once/device
- [ ] 2 reports hide
- [ ] dwell
- [ ] mobile layout
- [ ] build passes

Final Codex response must state:
1. implemented items
2. commands/tests run
3. manual setup still needed
4. any unchecked acceptance item

---

# 15. If time runs out

MUST preserve:
1. map
2. active/locked area
3. markers
4. GPS/demo GPS
5. 50m unlock
6. cards
7. long-press Drop
8. Building Check + Safe Anchor
9. 20m merge
10. Mine

Should keep:
- onboarding
- photo
- report
- rate limits

Cut first:
- dwell polish
- perfect random edge cases
- exact official suburb GeoJSON
- fancy animation
- elaborate music style
- production Edge Function migration

Never cut:
- raw coordinate non-storage
- 50m DB validation
- 20m node merge

---

# 16. Two-person split

If two people use separate Codex sessions:

## Track A — Map / UX

Own:
```text
App.jsx, styles.css, MapView.jsx, ProgressCard.jsx,
Toast.jsx, OnboardingTour.jsx, CoachTip.jsx,
suburbs.js, device.js, geo.js, guidance.js
```

Focus:
- Phase 1
- map side of Phase 3
- frontend Phase 4
- long-press Phase 6
- Mine visuals
- Phase 9/11

## Track B — Data / Thoughts / Privacy

Own:
```text
schema.sql, seed_demo.sql, supabase.js, api.js,
privacy.js, cardOrder.js, DropComposer.jsx, ThoughtSheet.jsx
```

Focus:
- Phase 2
- data side Phase 3
- backend Phase 4
- Phase 5
- Composer Phase 6
- Phase 7/10

Stable shared map object:

```js
{
  location_id, suburb, lat, lng, thought_count,
  dominant_category, latest_at, is_mine, is_unlocked
}
```

Stable MapView callbacks:

```js
onUserLocation([lng,lat])
onLocationClick(location)
onLongPress([lng,lat])
onLockedSuburbClick(name)
```

Merge frequently, not only at the end.

---

# 17. Demo story

Optimize the finished app so this works:

1. open PopBy; Fitzroy active, Carlton waiting
2. zoom out → dots
3. zoom in → category icons
4. tap far Thought → Get closer
5. demo/near GPS → glow
6. unlock → latest card
7. swipe → another Thought/music
8. long-press nearby → choose Nature/Moment → write → Drop
9. explain exact raw point is not stored; Safe Anchor + shared node
10. Mine → own marker glows
11. point to `Fitzroy XX% / Next Carlton`

The build should feel like one product story, not separate API demos.

---

# 18. Known MVP limitations

Document in README:
- localStorage ID is resettable/spoofable
- browser GPS can be spoofed
- suburb boundaries are approximate
- Mapbox cannot legally guarantee public property
- browser Safe Anchor can be tampered with; production moves server-side
- anonymous Storage upload needs production hardening
- HTML markers should migrate to Style Layers at large scale
- account linking is future work

---

# 19. Reference docs

- Mapbox GL JS: https://docs.mapbox.com/mapbox-gl-js/
- Mapbox Markers/Controls: https://docs.mapbox.com/mapbox-gl-js/api/markers/
- Mapbox Standard: https://docs.mapbox.com/map-styles/reference/standard/
- Tilequery: https://docs.mapbox.com/api/maps/tilequery/
- Streets v8: https://docs.mapbox.com/data/tilesets/reference/mapbox-streets-v8/
- Supabase PostGIS: https://supabase.com/docs/guides/database/extensions/postgis
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Storage: https://supabase.com/docs/guides/storage/uploads/standard-uploads

---

# 20. Codex rules

- Inspect before editing.
- Implement, do not only plan.
- Preserve working code.
- Keep code beginner-readable.
- Keep app runnable after each phase.
- Do not ask questions whose answers are in this file.
- Do not switch Mapbox/Supabase.
- Do not add signup.
- Do not add progress expansion.
- Do not use Map Matching for privacy.
- Do not substitute privacy with coordinate rounding alone.
- Never persist raw Drop coordinate or user GPS.
- Never expose secret/service key in browser.
- Run `npm run build` after code changes and fix errors.
- If credentials are missing, complete everything else and list manual setup.
- Prefer polished demo value over speculative scalability.
