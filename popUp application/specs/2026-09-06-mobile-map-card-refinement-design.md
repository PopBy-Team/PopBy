# PopBy Mobile Map and Card Refinement Design

**Date:** 2026-09-06  
**Status:** Approved in chat; awaiting written-spec review  
**Scope:** Mobile-only map framing, fixed controls, Mine synchronization, Thought reader, location-aware Add flow, long-press publishing, composer validation, and supporting database migration.

## Goal

Make PopBy feel spatially precise and immediately responsive on a phone. Fitzroy should open as a calm, centered place rather than a dashboard; fixed controls must sit below the PopBy wordmark; map nodes must read as public-road anchors; and reading or adding a Thought should feel like one continuous interaction.

The existing Mapbox, Supabase, anonymous device identity, 50 metre rule, Building Check, Safe Anchor, and 20 metre node merge remain in place.

## Chosen approach

Keep the current React state and Mapbox instance, but give all visible-location changes one explicit synchronization path. Use small pure helpers for viewport framing, fan geometry, music-link normalization, and card formatting. Use CSS for the visual treatment and motion, with `prefers-reduced-motion` fallbacks. Extend the publish RPC only where an existing location is deliberately selected.

This is preferred over rebuilding all markers as Mapbox style layers because DOM markers provide better long-press, accessibility, and animation control at the MVP's current scale. A CSS-only patch is rejected because it would not fix Mine synchronization, explicit node attachment, link validation, or edge-aware category placement.

## Global mobile layout

- Define one CSS top-rail token based on the safe-area inset and the bottom of the centered PopBy wordmark.
- Progress, Mine, coach tips, first-drop guidance, reader hints, composer cards, and reader cards must begin at or below that rail.
- The PopBy wordmark remains centered and visually highest.
- Reader and composer layouts must fit at 320px width and short mobile landscape without hiding their primary action.
- Interactive targets remain at least 44px even when their visible background is smaller.

## Initial Fitzroy framing and zoom limits

On initial map load, fit the complete Fitzroy boundary into the middle half of the phone viewport. The fit uses the real Fitzroy polygon bounds, approximately 25% vertical padding above and below, modest horizontal padding, and the existing 3D pitch/bearing. It runs without a visible flight animation.

Set Mapbox `maxZoom` to `20`, approximately two double-click zoom levels below the current default maximum. Recenter-to-location continues to fit an approximately 370 metre radius but may not exceed the same maximum.

## Fixed controls and Mine

The Mine control becomes a compact rounded rectangle containing the visible word `Mine`. Its height remains a 44px touch target and its width hugs the word with horizontal padding. Inactive is translucent off-white; active keeps the existing dark selected state. The yellow outer glow is removed.

Mine data flow:

1. React derives `visibleLocations` from `mapLocations` and `mineMode`.
2. Every `visibleLocations` change updates the far-dot GeoJSON source and reconciles HTML markers directly.
3. If the Mapbox style is temporarily settling, the latest collection is retained and replayed on the next style-ready/idle event.
4. `map.triggerRepaint()` follows reconciliation so the visual update never waits for another page click, drag, or zoom.
5. Switching Mine off follows the same path and restores all public locations immediately.

Mine still means “locations containing at least one Thought from this browser device.” It does not reveal other users' cards remotely.

## Current-location point

Render one non-interactive blue current-location marker for demo and real GPS modes. It consists of a crisp blue center and a restrained breathing halo. Real geolocation events update the marker coordinate; demo mode uses the Fitzroy demo coordinate. Disable or avoid duplicating Mapbox's built-in visible user dot while retaining its high-accuracy tracking behavior.

The animation stops under `prefers-reduced-motion` while the point remains visible.

## Public-road Thought nodes

Production-published nodes already originate from the accepted Safe Anchor returned by Mapbox Streets Tilequery. This contract remains mandatory.

For visible sample content:

- Replace demo and seed coordinates with verified accepted road/path anchor coordinates.
- Update only known demo/seed UUIDs in the upgrade SQL; never bulk-move genuine user-created locations.
- The icon coordinate remains the stored public node coordinate at every zoom and pitch.

No coordinate rounding is introduced. Raw GPS and raw long-press coordinates remain validation-only and are never persisted.

## Category fan and selected coordinate

The accepted drop coordinate is first eased to a safe presentation position near the horizontal center and around 62% of the viewport height. This provides consistent room above it and is preferable to compressing the fan when the user starts near a screen corner.

If viewport or map constraints still leave insufficient room, the layout helper selects the side with more available space and flips the fan. The helper respects the top rail, bottom safe area, and horizontal edge gutters.

Fan geometry and behavior:

- Seven circular category bubbles follow the existing left-to-right arc.
- Use an elliptical arc sized to occupy roughly one third of a portrait phone screen.
- Neighboring bubble centers remain far enough apart that 44–54px bubbles never overlap at 320px or wider.
- Default bubble surfaces are approximately 50% translucent.
- Tapping a bubble makes that bubble fully opaque, subtly dims the rest, and waits for the short selection transition before opening the composer.
- Entrance motion is staggered with one shared spring-like easing and no expensive continuous JavaScript animation.

The coordinate pin is approximately twice the current visible size. It uses a grey outline and center, an 80% opaque white fill, and a combined fade/vertical spring animation that reads as growing upward from an implied ground line.

## Long-pressing an existing node

Every HTML Thought marker supports the same approximately 650ms hold gesture as the map. Movement beyond the existing cancellation threshold cancels the hold. A successful hold suppresses the following click, recenters the category fan on that node, and passes the node ID into the draft.

The same validations apply before composing:

- a current/demo location exists;
- the node is in active Fitzroy;
- the user is within 50 metres.

The composer still runs Building Check and Safe Anchor. Publishing passes an optional `p_target_location_id`. The database accepts that target only when it exists in Fitzroy and remains within 20 metres of the verified safe anchor; otherwise it raises a friendly retry error. This makes deliberate aggregation deterministic without weakening privacy or distance validation.

## Thought reader card

- Enlarge the top-left category icon while preserving a 44px control footprint.
- Use a 50% translucent white visible surface behind the icon.
- Change the top-right vertical-options surface from a circle to a narrow rounded strip aligned to the three-dot glyph, at approximately 50% opacity; its invisible touch target remains 44px.
- Timestamp includes year, abbreviated month, day, hour, and minute. It becomes slightly larger and sits above the swipe affordance.
- Non-photo timestamp remains dark with a light outline. Photo timestamp remains orange with a light outline.
- Replace the numeric `1 / n` badge with a three-dot gesture affordance inside the card bottom. The center dot is opaque and the two side dots are 50% translucent.
- A left or right swipe briefly shifts/scales the dot rail in the same direction before it returns to the centered state. Reduced-motion mode changes opacity without translation.

The actual deck order and swipe navigation do not change.

## Add from the reader

Place a small `Add` button outside and below the centered card, with a translucent off-white surface and normal safe-area spacing. It is visually secondary to the card.

The app retains the location currently being read. Tapping Add:

- within 50 metres: closes the reader and opens the composer directly for that existing location, using `Moment` as the initial category and allowing category changes;
- without location permission: shows the existing location-required coach tip;
- farther than 50 metres: shows a short inline/coach message and does not open the composer.

Mine remote reopening therefore does not grant remote publishing.

## Composer card

- Top-left category icon becomes a button. Tapping it opens an in-card seven-category selector and updates the category used by `publishThought`.
- Top-right `Drop` text becomes an accessible send icon. Busy state keeps the icon and exposes status text to assistive technology.
- Increase the vertical space between the header/send control and the writing field by approximately 2mm (about 7–8 CSS pixels at the target density).
- Change textarea placeholder to `You’re marking your spot…`.
- Preserve the existing background, live camera, font, and size tools.

Card text sizes become exactly three stored choices:

- `16pt` → approximately 21px visual text;
- `14pt` → approximately 19px visual text;
- `12pt` → 16px visual text and the default.

Existing stored `10` values migrate to `12`. Existing `12` and `14` values remain valid. New `16` values become valid.

## BGM field and link feedback

The music row contains a fixed music-note icon that is not part of the editable value. The input placeholder is `Pick BGM` and remains optional.

Set the stored/input limit to 300 characters. A pure normalizer:

- trims whitespace;
- accepts valid `http:` and `https:` URLs;
- adds `https://` to a domain-like value such as `open.spotify.com/...` before validation;
- rejects unsupported protocols, missing public hostnames, whitespace-only values, and values over 300 characters.

The browser validates URL structure and navigability, not remote server availability, because cross-origin requests cannot reliably prove that a music page exists. Valid links continue to render as `Open track` links.

Invalid input receives quiet inline feedback below the field, never a modal:

`Can’t use this link · write the song name in your Thought instead.`

The user can clear the BGM field and write the music name in the Thought body. Publishing with a non-empty invalid BGM value is blocked until it is corrected or cleared. Empty BGM never blocks publishing.

## Word limit

New Thoughts use a 150-word limit instead of 200. Update the live counter, composer error, guidance/instruction text, demo API validation, SQL RPC validation, tests, and documentation. Existing Thoughts longer than 150 words remain readable; the migration does not rewrite historical body text.

## Database and API migration

Update both the clean-install schema and an additive production upgrade script.

The upgrade will:

1. migrate `font_size = 10` to `12`;
2. replace the font-size constraint with `12, 14, 16` and set the default to `12`;
3. replace the existing `publish_thought` RPC signature with a version that accepts optional trailing `p_target_location_id uuid`;
4. validate the 150-word and 300-character BGM limits;
5. validate a selected target location against Fitzroy and the 20 metre safe-anchor rule;
6. update only known sample-node UUID coordinates if those nodes exist.

The client wrapper sends `p_target_location_id: null` for ordinary map drops and the selected UUID for Add/existing-node holds. RPC results continue to expose no other device IDs.

## Guidance and instructions

Update onboarding, contextual guidance, AGENTS product rules, and README where they describe dropping:

- long-press open ground or hold an existing Thought point;
- existing points aggregate the new Thought at that public node after validation;
- 150-word limit;
- optional validated BGM link;
- exact/raw coordinates are still not stored.

Messages remain short, inline, and non-modal except for the existing onboarding and card/composer surfaces.

## Accessibility and motion

- Visible compact controls retain 44px hit targets.
- Mine, send, category, Add, options, and fan controls have explicit accessible names and pressed/expanded states where relevant.
- Link errors use `aria-live`/`role=status` without stealing focus.
- Animations use transform and opacity and are disabled or reduced under `prefers-reduced-motion`.
- Card and fan layouts respect safe-area insets and do not render above the PopBy bottom rail.

## Expected code boundaries

- `src/App.jsx`: selected-location state, Add flow, Mine derivation, and shared draft shape.
- `src/components/MapView.jsx`: initial fit, maximum zoom, current-location marker, marker hold gesture, and reliable location synchronization.
- `src/components/DropCategoryFan.jsx`: safe presentation positioning, selection state, and fan motion.
- `src/components/ThoughtSheet.jsx`: card controls, full timestamp, swipe dots, and Add button.
- `src/components/DropComposer.jsx`: mutable category, send icon, new word limit, BGM row, and inline validation.
- `src/lib/geo.js`: initial Fitzroy fit and fan-safe viewport helpers.
- `src/lib/categoryFan.js`: non-overlapping elliptical positions and layout direction.
- `src/lib/musicLink.js`: pure 300-character URL normalization and validation.
- `src/lib/mapPresentation.js` / `src/lib/mapLifecycle.js`: queued marker/source reconciliation and DOM-marker hold lifecycle.
- `src/lib/cardAppearance.js`: `12/14/16` options and default.
- `src/data/demo.js` / `supabase/seed_demo.sql`: verified road/path sample anchors.
- `src/lib/guidance.js`, `AGENTS.md`, and `README.md`: updated user-facing and developer instructions.
- `supabase/schema.sql` and a new dated upgrade SQL file: RPC, constraints, and known sample-node updates.
- Existing and new `test/*.test.js` files: pure behavior regression coverage.

## Verification and acceptance

Automated tests must demonstrate:

- Fitzroy initial-fit options target the middle half of a phone viewport;
- zoom cannot exceed 20;
- Mine reconciliation runs immediately even while style readiness changes;
- current-location marker receives new coordinates;
- seven fan bubbles do not overlap at 320px width and the layout chooses a safe direction;
- marker hold selects an existing node and suppresses the following click;
- card timestamp includes a year and swipe direction drives the dot animation state;
- Add enforces location presence and 50 metres;
- default card text size is 12 and only `12/14/16` normalize as valid;
- BGM normalization accepts usable HTTP(S) links and rejects invalid, overlong, and unsafe values;
- frontend, demo backend, and SQL publish contract all enforce 150 words;
- a selected location can only be used when it passes the safe-anchor proximity validation.

Manual mobile-browser checks at 320×568, 390×844, and a short landscape viewport must verify:

- no fixed top element crosses the PopBy bottom rail;
- Fitzroy is centered at roughly half-screen scale on first entry;
- Mine filters and restores markers without another click or zoom;
- all sample icons sit on visible public roads/paths;
- the blue location point tracks demo/live coordinates;
- fan bubbles remain separate near every screen edge;
- reader card, timestamp, swipe dots, and Add button fit without clipping;
- composer category switching, send icon, BGM feedback, and 150-word counter work with touch input.

Run the full test suite and production Vite build after integration. The Mapbox bundle-size warning may remain if the build succeeds; no new provider, router, global state library, or authentication system is introduced.
