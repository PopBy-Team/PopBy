# PopBy MVP starter

This repo is intentionally optimized for a 10-hour hackathon build.

## Stack

- React + Vite
- Mapbox GL JS
- Supabase Postgres + PostGIS + Storage
- Turf.js
- Vercel for deployment

## 1. Accounts

Create:

1. A Mapbox account and public access token. The browser token must be able to
   load Mapbox Standard and call Streets v8 Tilequery.
2. A Supabase project. Copy its project URL and **publishable** browser key;
   never put the secret/service-role key in a Vite environment variable.
3. A Vercel account when you are ready to deploy.

## 2. Install

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`.

```env
VITE_MAPBOX_TOKEN=pk.your_mapbox_public_token
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_DEMO_MODE=true
```

## 3. Database

Open Supabase > SQL Editor and run:

`supabase/schema.sql`

The script enables PostGIS, creates the five app tables and indexes, enables
RLS, installs the required security-definer RPCs, and creates the public
`thought-images` bucket with the hackathon upload policy.

If PostGIS was created under a schema named `gis` instead of `extensions`,
replace `extensions.` with `gis.` in the SQL.

If your project does not allow the Storage section to run from SQL Editor,
create a public bucket named `thought-images` in Storage and add `anon` INSERT
and SELECT policies limited to that bucket.

For the six-location Fitzroy demo dataset, then run:

`supabase/seed_demo.sql`

The seed is safe to run more than once. With `VITE_DEMO_MODE=true`, the same
fictional dataset is also available immediately in the browser, so the map can
be demonstrated before the optional database seed is applied.

If the original PopBy schema is already installed, do not rerun the whole
schema. Run `supabase/upgrade_mobile_thought_cards.sql` once instead. It adds
the mobile card appearance fields and the owner-checked delete RPC without
removing existing Thoughts.

After that, run `supabase/upgrade_mobile_map_card_refinement.sql` once. It moves
legacy 10pt cards to 12pt, installs the 150-word/300-character BGM publishing
contract, enables validated publishing to an explicitly selected shared node,
and moves the six known demo nodes to verified Mapbox sidewalk anchors.

Finally, run `supabase/upgrade_bgm_allowlist.sql` once. It keeps existing data,
but narrows new BGM links to individual tracks from Spotify, Apple Music or
YouTube Music. Projects created from the current `schema.sql` already include
this rule; running the upgrade again is safe.

Then run `supabase/upgrade_thought_creation_refinement.sql` once. It updates
the current 14/16/18pt choices, requires text on newly published Thoughts, and
stops automatically merging a new long-press into a nearby node. Existing
Thoughts and explicit long-press additions to an existing marker are preserved.

Run `supabase/seed_demo.sql` again if you want the refreshed demo story. It
replaces only the fixed demo records and gives the nearby 50m cluster 2, 5 and
10 Thoughts, so all three marker sizes are visible together.

## 4. Run

```bash
npm run dev
```

Open the Vite URL.

For presentation mode:

- set `VITE_DEMO_MODE=true`, or
- open `http://localhost:5173/?demo=1`

Add `tutorial=1` to replay the animated first-user guide without clearing other
browser memories: `http://localhost:5173/?demo=1&tutorial=1`.

Demo mode simulates GPS in central Fitzroy, so the 50m unlock/drop loop is
presentable even when you are physically somewhere else.

## 5. Main interaction

- Zoom out: Thoughts become warm amber firefly dots and detail labels hide.
- Zoom in: the exact category markers appear: 🐾 🌳 🍴 🎨 📍 🎵 ✨.
- Long press open ground or an existing Thought point within 50m of current/demo
  GPS: choose a category from the adaptive radial fan, then edit the centered
  Thought card. Holding an existing point adds to that exact location only after
  the backend verifies its safe anchor is within 20m; open-ground drops create
  their own safe location node.
- Click location > if within 50m: unlock.
- Previously unlocked locations can be reopened.
- Mine filters to your own thoughts and allows remote viewing.
- The initial map frames Fitzroy in the middle half of the phone, stops at zoom
  20, and shows the current/demo position as a blue live light. One location
  control first frames a 150m radius, then becomes a compass for a closer 75m
  view. The nearby code comment marks the single constant to restore to 400m
  when another active suburb opens.
- The transparent lower label follows the map centre, showing
  `MELBOURNE · <SUBURB>` in known areas and `MELBOURNE` elsewhere.
- Thought cards use 14/16/18pt choices, a full timestamp, tap-navigation dots and an Add
  action for adding another Thought at the currently explored point.
- Composer text is limited to 150 words. Pick BGM accepts an individual Spotify,
  Apple Music or YouTube Music track link up to 300 characters. Audio stays on
  the provider: PopBy stores only the normalized URL and opens it after a user
  taps `Open BGM`; it does not download, host, autoplay or embed the track.
- Drop publishing performs a Mapbox Streets privacy check:
  - detect mapped building
  - find nearby public-ish road/path
  - reject restricted/service/driveway
  - store only safe coordinate
  - reuse an existing location only when its marker was explicitly held
- 2 unique reports hide a Thought.
- Rate limit: 5 drops/device/hour and 3 drops/location/hour.

## 6. Important MVP compromises

1. The visible Fitzroy boundary and Drop-area check use the official Vicmap
   Admin locality polygon, simplified to six decimal places. Neighboring
   locked-suburb click targets remain approximate until those areas launch.
   Source: State Government of Victoria, Vicmap Admin (CC BY 4.0).
2. Public browser UUID is intentionally lightweight and can be reset by clearing
   local storage.
3. A browser GPS coordinate can be spoofed by a determined user.
4. Privacy Safe Anchor currently runs in the browser. Move it into a server-side
   Edge Function before a production launch.
5. Anonymous public image uploads are acceptable for the demo only. Production
   should use signed uploads / stronger abuse controls.
6. HTML markers are intentional because Fitzroy MVP has few location nodes.
   Move to Mapbox style layers when the dataset becomes large.
7. Mapbox road/building data can support a safer anchor choice but cannot
   guarantee that a point is legally public property.
8. Account linking and recovery are future work; MVP identity stays on the
   current browser only.

## 7. Vercel

Push the folder to GitHub, import the repo into Vercel, and add the same
environment variables from `.env.local`.

Set `VITE_DEMO_MODE=true` for the presentation deployment. For a public MVP,
switch it to `false`.

## 8. First-user guidance

The updated starter includes a complete first-run guidance system:

- first-open animated field guide built on the real map, Thought reader,
  category fan and composer; its practice draft never publishes or consumes limits
- contextual tips for location, unlock distance, locked suburbs, drop distance and Mine
- first-publish Nearby rules (50m, 5/hour/device, 3/hour/location), followed by
  contextual rule messages only when an action exceeds a limit
- live-camera-only photo backgrounds plus paper, Morandi, font and size tools
- centered tap-to-change card reader with owner Delete / public Report actions
- simple Fitzroy progress bar + Next: Carlton, hidden after category icons appear
- a complete seven-icon legend in the Explore instruction
- Create guidance explains that users can create a Thought right where they are,
  whenever they feel like it; existing Thought points can also be held to add to
  that shared place
- the guide names the three supported BGM sources before the composer is opened
- `?` button keeps the original 6-step reference guide and offers an animated replay

See `GUIDANCE.md` for the complete trigger/copy/presentation matrix.
