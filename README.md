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

## 4. Run

```bash
npm run dev
```

Open the Vite URL.

For presentation mode:

- set `VITE_DEMO_MODE=true`, or
- open `http://localhost:5173/?demo=1`

Demo mode simulates GPS in central Fitzroy, so the 50m unlock/drop loop is
presentable even when you are physically somewhere else.

## 5. Main interaction

- Zoom out: Thoughts become pale-yellow firefly dots and detail labels hide.
- Zoom in: the exact category markers appear: 🐾 🌳 🍴 🎨 📍 🎵 ✨.
- Long press within 50m of current/demo GPS: choose a category from the radial
  fan, then edit the centered Thought card.
- Click location > if within 50m: unlock.
- Previously unlocked locations can be reopened.
- Mine filters to your own thoughts and allows remote viewing.
- Drop publishing performs a Mapbox Streets privacy check:
  - detect mapped building
  - find nearby public-ish road/path
  - reject restricted/service/driveway
  - store only safe coordinate
  - merge with an existing location within 20m
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

- 6-step onboarding on first open
- contextual tips for location, unlock distance, locked suburbs, drop distance and Mine
- first-publish Drop rules (50m, 5/hour/device, 3/hour/location), followed by
  contextual rule messages only when an action exceeds a limit
- live-camera-only photo backgrounds plus paper, Morandi, font and size tools
- centered swipe card reader with owner Delete / public Report actions
- simple Fitzroy progress bar + Next: Carlton, hidden after category icons appear
- a complete seven-icon legend in the Explore instruction
- `?` button to replay the guide

See `GUIDANCE.md` for the complete trigger/copy/presentation matrix.
