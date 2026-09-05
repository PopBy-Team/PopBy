# Mobile Thought Cards Redesign

## Goal

Redesign PopBy's mobile map, publishing flow, and Thought reader so discovery feels like finding small glowing memories rather than completing a form. The change keeps the existing Mapbox, Supabase, device-ID, distance, privacy-anchor, rate-limit, reporting, and Mine behavior.

## Scope and interaction order

The work ships in three reviewable groups:

1. Map symbols, far-view labels, firefly dots, and progress-card visibility.
2. Long-press category fan, centered card composer, background/font/size tools, and live camera capture.
3. Centered swipe reader, per-card ownership menu, reporting, and owner deletion.

Each group is verified in a phone viewport and shown before work moves to the next group.

## Central category vocabulary

The category names stored in the database remain exactly `Animals`, `Nature`, `Eat`, `Art`, `Place`, `Sound`, and `Moment`. All surfaces use one centralized visual mapping:

| Category | Icon |
| --- | --- |
| Animals | 🐾 |
| Nature | 🌳 |
| Eat | 🍴 |
| Art | 🎨 |
| Place | 📍 |
| Sound | 🎵 |
| Moment | ✨ |

This mapping controls map markers, the category fan, card previews, and cards in the reader.

## Map presentation

### Visible-range behavior

- FAR mode continues to use a Mapbox circle layer for performance and an invisible 44px-equivalent hit layer for touch.
- The visible FAR dot is a small pale-yellow core with a soft yellow halo. It must read as a star or firefly and must never use a black fill.
- In FAR mode, custom POI labels and Mapbox Standard road, building, transit, and POI labels are hidden. Administrative locality/suburb labels remain visible.
- MEDIUM and NEAR modes restore the current relevant map labels and render the category icons using the new mapping.
- Label visibility is driven by the same viewport-width mode calculation as Thought markers, not by an unrelated hard-coded zoom check.

### Progress card

The Fitzroy progress card is visible when the page first opens. The first transition from FAR mode into MEDIUM or NEAR mode fades it out. It stays hidden for the rest of that page visit, even if the user zooms out again. Reloading or revisiting PopBy shows it again. This state is session UI state and is not written to localStorage.

### Map controls and marker anchoring

- The Mine text pill becomes a compact icon-only card-stack control. Its visible icon is approximately 17px while the button retains a 44px touch target and an accessible `Mine` label.
- A dedicated bottom-right recenter control always remains available. When a current position exists it returns the camera to the existing ~370m view. When no position exists it triggers high-accuracy geolocation. Demo mode recenters to the Fitzroy demo coordinate without requesting the device's real location.
- Every HTML Thought marker is created with an explicit center anchor, zero pixel offset, zero altitude, map-plane pitch alignment, and viewport rotation alignment. Its `setLngLat([lng, lat])` is refreshed from the latest location row during every marker synchronization. The visual bubble and its 44px hit target share the same center, so count/viewport size changes cannot move the geographic anchor.
- Location rows continue to use the database node coordinate produced by Safe Anchor and 20m merge. No screen coordinate or original raw long-press coordinate is used to position a persisted Thought marker.

### Onboarding icon explanation

The onboarding Explore screen includes the complete category legend: `🐾 Animals · 🌳 Nature · 🍴 Eat · 🎨 Art · 📍 Place · 🎵 Sound · ✨ Moment`. It also explains that pale-yellow fireflies are distant Thoughts and category symbols appear as the map gets closer.

## Long-press category selection

A valid long-press still requires a current/demo location, a coordinate inside Fitzroy, and a distance of at most 50 metres. Invalid presses continue to show the existing contextual rule messages.

For a valid press:

- The map does not open the editor immediately.
- A coordinate pin appears at the selected map coordinate.
- Seven 44px minimum category bubbles animate from left to right along a compact upper semicircle attached visually to the pin.
- Each bubble contains the category icon and a short category name.
- Selecting a bubble stores the category and transitions into the centered card editor.
- Tapping outside the fan, starting a map drag, or pressing Escape cancels selection.
- Reduced-motion users see the final fan immediately without staggered movement.

The fan is projected from the geographic coordinate so it stays attached correctly if the map renders another frame. The layout fits a 320px-wide viewport without horizontal scrolling.

## Centered card composer

The composer is a card floating in the center of a dimmed map, not a bottom-sheet form. Tapping the backdrop closes it. The card preview is the editing surface: the chosen category icon appears at top-left, the body is edited within the card, and the timestamp preview sits at bottom-right.

The existing optional music URL remains available as a quiet field above the style toolbar. The body remains optional and limited to 200 words.

### First-publish guidance

The `Drop nearby · within 50m · 5/hour per device · 3/hour at one location` strip appears only while the browser has never successfully published a Thought. The localStorage completion key is written after a successful publish, not merely after opening or closing the editor. Afterward, limits are explained only when the user attempts a disallowed action and receives the corresponding friendly error.

The `How PopBy protects this location` disclosure is removed from the composer. The underlying Building Check, Safe Anchor, 20m merge, and non-storage of raw coordinates remain unchanged.

### Background tool

The inactive background button shows a thumbnail of the current background. Activating it opens an anchored, touch-friendly palette containing:

- paper lined, using a warm draft-paper base;
- paper grid, using the same base;
- paper dots, using the same base;
- solid white by default;
- five Morandi solid colors: sage, dusty rose, clay, muted blue, and lavender;
- live photo.

Selecting a choice updates the card immediately and closes the palette.

### Live photo only

Photo capture uses `navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } })` in an in-app camera view. The user explicitly taps a shutter button; PopBy captures the current video frame to a Blob and uses that Blob for upload. There is no file input and therefore no album picker. Camera tracks are stopped on capture, cancel, composer close, and component unmount.

Camera access requires HTTPS or localhost. If unavailable or denied, the composer shows a friendly camera-specific error and offers retry/cancel, not an album fallback.

### Font and size tools

The font tool offers exactly:

- Caveat (default)
- Patrick Hand
- Homemade Apple
- Island Moments

The fonts load with `font-display: swap` and readable cursive fallbacks. The size tool presents `14 pt`, `12 pt`, and `10 pt`. For phone legibility these map to approximately 19px, 16px, and 13px respectively, with line heights tuned for handwriting. The selected font and size affect only the Thought body, not controls or metadata.

The bottom toolbar contains exactly three primary style controls: background, font, and size. Each popover is mutually exclusive and can be dismissed by tapping outside it.

## Centered Thought reader

The reader is a centered card over a dimmed map. It has no sheet handle, top-right close button, or left/right arrow buttons. Tapping outside the card closes it.

- The category icon appears at top-left without the category name.
- The timestamp appears at bottom-right.
- Photo timestamps use orange text with a white outline/shadow.
- System-background timestamps use black text with a white outline/shadow.
- Horizontal swipe changes cards. Vertical movement scrolls a long card body and does not accidentally change cards.
- A short first-use swipe hint may appear outside the card and is dismissible.
- The vertical options button is `⋮`, with a 44px touch target, positioned without covering card content.

The existing newest-first deck ordering, dwell recording, external music link, Mine restrictions, and report thresholds remain intact.

## Ownership, report, and deletion

`get_location_thoughts` returns an `is_own` boolean computed by comparing the row's device ID with the RPC's `p_device_id`. It never returns any device ID.

The `⋮` menu is contextual:

- An owned Thought offers `Delete Thought`.
- A non-owned public Thought offers `Report Thought`.
- Mine mode contains only owned Thoughts and therefore offers deletion.

Deletion is permanent for the Thought record. A new security-definer `delete_thought(p_device_id uuid, p_thought_id uuid)` RPC deletes dependent report and dwell rows, then deletes the Thought only when its stored device ID matches `p_device_id`. A mismatch or missing Thought raises `Thought not found`. The RPC never accepts an ownership flag from the client. Empty location nodes may remain; map queries already omit nodes with no visible Thoughts.

After report or delete, the app refetches map locations and the currently open location deck. If the deck becomes empty, the reader closes. Demo mode implements the same ownership and deletion behavior in memory/local browser state.

## Stored card appearance

The `thoughts` table gains:

- `background_type` supporting `solid`, `lined`, `grid`, `dots`, and `photo`;
- `background_color` supporting `white`, `sage`, `rose`, `clay`, `blue`, and `lavender` for solid cards;
- `font_family` supporting `caveat`, `patrick-hand`, `homemade-apple`, and `island-moments`;
- `font_size` as a small integer restricted to `10`, `12`, or `14`.

Existing rows receive `background_color='white'`, `font_family='caveat'`, and `font_size=14`. Pattern cards ignore `background_color`; photo cards use `image_url` as before.

The repository's full `schema.sql` is updated for new projects. A separate idempotent upgrade SQL file alters an already-created Supabase project, replaces affected RPC return/signature contracts, and grants `delete_thought` execution to `anon` and `authenticated`.

## Error handling and accessibility

- Expected rate-limit, distance, camera, URL, word-limit, and delete errors use user-facing copy without SQL terminology.
- Fan buttons, toolbar controls, menus, and the shutter have visible focus states and at least 44px touch targets.
- Dialogs have labels and modal semantics.
- Camera video has an accessible label; captured photos have descriptive preview text.
- Motion obeys `prefers-reduced-motion`.

## Verification

Automated tests cover:

- the exact category-to-icon mapping;
- FAR firefly layer colors/halo and label-mode policy;
- one-way progress visibility behavior;
- first-success publish guidance persistence;
- background/font/size option contracts;
- camera Blob capture helpers and stream cleanup where separable from browser APIs;
- `is_own`, owner-only demo deletion, and API RPC arguments;
- the SQL ownership check and RPC grants.

Manual browser verification uses at least 390x844, 375x667, 320x568, and 844x390 viewports. It checks fan fit, camera error/capture states, composer popovers, swipe-only reading, backdrop dismissal, owner/report menus, safe areas, and horizontal overflow. The final gate runs the complete Node test suite and Vite production build.
