# PopBy

Sometimes you want to feel connected to a place, or to other people, without
having to start a conversation. PopBy is a mobile-first map where people leave
small Thoughts tied to real places. Walk closer to discover what someone
noticed, or leave something for the next person.

There are no profiles, follower counts, likes, or pressure to reply.

**Introduction website:** [popbypop.vercel.app](popbypop.vercel.app)

**Live demo:** [pop-up-nu.vercel.app](https://pop-up-nu.vercel.app)

**3-min pitch video:** [https://youtu.be/lXrwd1sZumY](https://youtu.be/lXrwd1sZumY)

## Features

PopBy has one simple rhythm: open the map, wander closer, unlock a Thought,
then leave one of your own.

- Explore Fitzroy on a colourful 3D map. From far away, Thoughts look like warm
  fireflies. Move closer and they become category icons: 🐾 🌳 🍴 🎨 📍 🎵 ✨.
- Get within 50 metres of a Thought to open it. Once you have unlocked a place,
  you can revisit it later on the same browser.
- Tap through cards with text, paper or photo backgrounds, timestamps, and an
  optional Spotify, Apple Music, or YouTube Music link.
- Press and hold nearby ground, or an existing Thought point, whenever you want
  to leave something. Choose a category, style the card, take a live photo, and
  write up to 150 words.
- Turn on Mine to find the Thoughts you have left behind. PopBy remembers them
  with an anonymous ID stored in your browser.
- Use the short animated tutorial to learn directly on the map. The `?` button
  opens the guide again whenever you need it.

Before publishing, PopBy moves the public pin to a safer nearby path or road.
It never saves the exact place you pressed or your GPS location. Rate limits,
owner deletion, and community reports help keep the shared space safe.

### Learning PopBy

The first visit feels more like a small game tutorial than a slideshow. It
guides you through zooming, opening a Thought, adding to a place, pressing and
holding on the map, and using the card editor. The practice Thought stays
private and does not count toward any upload limits.

Small tips appear only when they are useful, such as when a place is too far
away or a suburb is not open yet. The full tutorial logic and wording are in
[`GUIDANCE.md`](./GUIDANCE.md).

## Tech stack

| Part | Tool | What it does |
| --- | --- | --- |
| Web app | React, Vite, JavaScript and CSS | Builds the mobile interface and interactions |
| Map | Mapbox GL JS with Mapbox Standard 3D | Displays the city, roads, buildings and Thought markers |
| Location logic | Turf.js and PostGIS | Measures distance and checks nearby locations |
| Data | Supabase Postgres, RPCs, RLS and Storage | Stores Thoughts, unlocks, reports and photos safely |
| Hosting | GitHub and Vercel | Keeps the code versioned and the live app online |

## Setup

Want to look around first? Open the [live demo](https://pop-up-nu.vercel.app).
To run your own copy, follow the steps below.

### 1. Get the three services you need

Before running PopBy, prepare:

1. A Mapbox account and public access token. The token must be able to load
   Mapbox Standard and call Streets v8 Tilequery.
2. A Supabase project, its project URL, and its **publishable** browser key.
   Never place a secret or service-role key in a Vite environment variable.
3. A Vercel account, but only if you want to put the app online.

### 2. Install PopBy

Open a terminal in this project folder, then run:

```bash
npm install
cp .env.example .env.local
```

Open the new `.env.local` file and replace the example values with your own:

```env
VITE_MAPBOX_TOKEN=pk.your_mapbox_public_token
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_DEMO_MODE=true
```

### 3. Prepare the database

For a brand-new Supabase project, open its SQL Editor and run these files in
this order:

1. `supabase/schema.sql`
2. `supabase/seed_demo.sql` if you want the Fitzroy demo data

The first file creates the database, security rules, app functions, and photo
bucket. The second adds the sample Thoughts used in the demo.

If PostGIS lives in a schema named `gis` instead of `extensions`, replace
`extensions.` with `gis.` in the SQL. If Supabase does not allow the Storage
section to run in the SQL Editor, create a public bucket named
`thought-images` and add `anon` INSERT and SELECT policies for that bucket.

Already have an older PopBy database? Keep your current data and run these
upgrade files in order:

1. `supabase/upgrade_mobile_thought_cards.sql`
2. `supabase/upgrade_mobile_map_card_refinement.sql`
3. `supabase/upgrade_bgm_allowlist.sql`
4. `supabase/upgrade_thought_creation_refinement.sql`
5. `supabase/seed_demo.sql` if you want to refresh the fixed demo records

These upgrades bring an older database up to date without replacing its
existing content. The demo seed is safe to run more than once.

### 4. Open PopBy on your computer

```bash
npm run dev
```

Keep the terminal open, then visit the local address it shows. It is usually:

```text
http://localhost:5173/?demo=1
```

Replay the animated tutorial without clearing other browser memories:

```text
http://localhost:5173/?demo=1&tutorial=1
```

Demo mode puts a simulated GPS point on a public path near Whitlam Place, so
you can try the 50-metre unlock and create flow without physically being there.

### 5. Put PopBy online

Push the project to GitHub and import that repository into Vercel. In Vercel,
add the same four values from `.env.local` under Environment Variables, then
deploy. Redeploy whenever you change one of those values.

Use `VITE_DEMO_MODE=true` for a presentation deployment. Switch it to `false`
when you want the site to use live Supabase data and browser GPS.

## AI usage

We built PopBy while learning some of the tools along the way. OpenAI Codex
guided us through that process by explaining how React, Mapbox, and Supabase
work together, helping us compare ways to build each feature, and walking us
through the code when we got stuck.

We stayed hands-on throughout. We configured the services, reviewed and
changed code, tested every iteration on desktop and mobile, and worked through
technical problems with Codex. Our team made the final technical and product
decisions, including the app structure, interactions, visual style, privacy
rules, content, and business direction.

The app itself does not use generative AI to write, rank, or reply to anyone's
Thoughts.

## MVP limitations

PopBy is ready for demos and early testing, but a public-scale launch will need
more work:

1. The visible Fitzroy boundary and drop-area check use the official Vicmap
   Admin locality polygon, simplified to six decimal places. Neighbouring locked
   suburb click targets remain approximate until those areas launch.
2. The browser device ID can be reset by clearing local storage, and browser GPS
   can be spoofed.
3. Safe Anchor currently runs in the browser. A production version should move
   it into a Supabase Edge Function.
4. Anonymous public image uploads suit the demo only. Production needs signed
   uploads and stronger abuse controls.
5. HTML markers work for the Fitzroy MVP but should move to Mapbox style layers
   when the dataset becomes large.
6. Mapbox road and building data supports safer anchor choices but cannot prove
   that a point is legally public property.
7. Account linking and recovery are future work. MVP identity stays in the
   current browser.

## Credits

PopBy was made possible by these tools, datasets, and contributors:

- [Mapbox](https://www.mapbox.com/) powers the map and Safe Anchor lookup, with
  data from [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).
- The Fitzroy boundary comes from the State Government of Victoria's Vicmap
  Admin dataset, licensed under
  [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- [Turf.js](https://turfjs.org/), [Supabase](https://supabase.com/), and
  [PostGIS](https://postgis.net/) handle location and backend work.
- The card fonts Caveat, Patrick Hand, Homemade Apple, and Island Moments come
  from [Google Fonts](https://fonts.google.com/).
- The Whitlam Place demo photo is
  [`Gough Whitlam - Its Time - Whitlam Park or Place.jpg`](https://commons.wikimedia.org/wiki/File:Gough_Whitlam_-_Its_Time_-_Whitlam_Park_or_Place.jpg)
  by Star A Star, licensed under
  [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- We used OpenAI Codex during development as described in the AI usage section.
