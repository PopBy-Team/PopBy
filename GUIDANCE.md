# PopBy first-user guidance map

The UI uses three levels of guidance:

1. **One-time animated field guide** — teaches the core loop through real map and card interactions without publishing its practice draft.
2. **Contextual coach tips** — explain rules exactly when a user triggers them.
3. **Original reference guide + inline guidance** — the lower-left `?` keeps the six-page reference while limits stay near the actions they govern.

## Full user journey

| Moment | User action | Guidance | Presentation |
|---|---|---|---|
| First open | Zooms in and out | Fireflies become category icons as the map scale changes | Live map spotlight + animated pinch cue |
| First open | Taps the location control | Location is needed for nearby unlock and Create rules | Live control spotlight; retry and Skip remain available |
| First open | Explores practice Thought | Learns icons, distance states, card taps and Add | Temporary in-memory marker + real Thought card UI |
| First open | Creates practice draft | Long-presses inside a nearby glowing area, selects Nature and tours every card control | Real long-press, category fan and composer with spotlight targets |
| Tutorial exit | Taps blank paper | Practice is discarded; no upload, RPC, dwell or rate-limit usage | Small “You’re ready” message pointing to `?` |
| Map | Pan / zoom | Dots far away; category icons closer in | Map presentation |
| Locked suburb | Tap grey suburb | “This area isn’t open yet” | Top-left coach tip |
| Thought | Tap while >120m | “Get closer — unlocks within 50m” | Center coach tip |
| Thought | Tap at 50–120m | “Approaching…” | Center coach tip |
| Thought | Tap ≤50m | Unlocks | Icon glow + card opens |
| Card | First card | Latest first; tap either side; ••• reports | Inline guide inside sheet |
| Card | Light tap | Tap the left/right half to browse the deck | Three-dot affordance animates |
| Report | Tap ••• | 1 report/device; 2 unique reports hide | Inline confirmation |
| Create | Long-press without GPS | Location needed | Bottom-right coach |
| Create | Long-press outside the active area | Create only inside the open area | Center coach |
| Create | Long-press >50m | Shows approximate selected distance | Center coach |
| Composer | First publish attempt | Nearby — Within 50m, 5 per hour, 3 per location | One-time rule strip |
| Composer | Category | Explain first step | Inline step label |
| Composer | Background | Photo or note background | Inline step label |
| Composer | Photo | Current-scene photo; max 6MB | Inline helper |
| Composer | Text | At least one visible character; max 150 words | Counter + inline error |
| Composer | Pick BGM | Optional individual Spotify, Apple Music or YouTube Music track link; max 300 characters | Source hint while empty; exact inline error only when invalid |
| Composer | Safe anchor moved | Moved to the nearest street · public paths work best. | Brief auto-dismiss bubble |
| Composer | Privacy | building check + safer path; raw point not stored; reuse only when an existing marker was held | Brief moved-anchor bubble |
| Publish | Device limit hit | Explain 5/hour rolling window | Inline error |
| Publish | Location limit hit | Explain 3/hour same location | Inline error |
| Publish | No safe anchor | Move closer to a public street/path | Inline error |
| After publish | Success | Use Mine to find own memory | Top-right coach |
| Mine | Toggle on | Only own locations; remote access to own cards | Top-right coach |
| Help | Tap ? | Opens the original six-page reference; its replay link starts the animated field guide | Reference guide |

## Copy principles

- Use “Thought”, “Explore” and “Create” in user-facing copy. Keep `Drop` only where it is an established internal name.
- Explain **why** before technical detail.
- Never expose raw implementation language such as `ST_DWithin`, UUID schemas or Tilequery to users.
- Use exact numbers where they affect user action: **50m, 150 words, 300 link characters, 5/hour, 3/hour, 2 reports**.
- Privacy copy should say “safer public path/street anchor” rather than claiming a perfect legal guarantee of public property.
