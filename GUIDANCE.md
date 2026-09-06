# PopBy first-user guidance map

The UI uses three levels of guidance:

1. **One-time onboarding tour** — only the mental model.
2. **Contextual coach tips** — explain rules exactly when a user triggers them.
3. **Inline guidance** — stays inside Create/Card/Progress UI where limits matter.

## Full user journey

| Moment | User action | Guidance | Presentation |
|---|---|---|---|
| First open | Arrives on map | “No sign-up… anonymous device ID…” | 6-step onboarding card |
| First open | Learns area model | Explore the open area; grey areas await unlock | Onboarding step 2 |
| First open | Learns progress | 15 locations / 50 Thoughts / 30 contributors / 50 unlocks | Onboarding + simple progress bar |
| First open | Location | Tap ◎; location is needed for 50m rules | Bottom-right coach tip |
| Map | Pan / zoom | Dots far away; category icons closer in | Onboarding + one-time map coach |
| Locked suburb | Tap grey suburb | “Awaiting unlock” + exact four thresholds | Top-left coach tip |
| Thought | Tap while >120m | “Get closer — unlocks within 50m” | Center coach tip |
| Thought | Tap at 50–120m | “Approaching…” | Center coach tip |
| Thought | Tap ≤50m | Unlocks | Icon glow + card opens |
| Card | First card | Latest first; swipe; ••• reports | Inline guide inside sheet |
| Card | Swipe | Browse deck | “Swipe” control remains |
| Report | Tap ••• | 1 report/device; 2 unique reports hide | Inline confirmation |
| Create | Long-press without GPS | Location needed | Bottom-right coach |
| Create | Long-press outside the active area | Create only inside the open area | Center coach |
| Create | Long-press >50m | Shows approximate selected distance | Center coach |
| Composer | First publish attempt | Nearby — Within 50m, 5 per hour, 3 per location | One-time rule strip |
| Composer | Category | Explain first step | Inline step label |
| Composer | Background | Photo or note background | Inline step label |
| Composer | Photo | Current-scene photo; max 6MB | Inline helper |
| Composer | Text | Optional; max 150 words | Counter |
| Composer | Pick BGM | Optional individual Spotify, Apple Music or YouTube Music track link; max 300 characters | Source hint while empty; exact inline error only when invalid |
| Composer | Safe anchor moved | Moved to the nearest street · public paths work best. | Brief auto-dismiss bubble |
| Composer | Privacy | building check + safer path + ~20m merge; raw point not stored | Expandable disclosure |
| Publish | Device limit hit | Explain 5/hour rolling window | Inline error |
| Publish | Location limit hit | Explain 3/hour same location | Inline error |
| Publish | No safe anchor | Move closer to a public street/path | Inline error |
| After publish | Success | Use Mine to find own memory | Top-right coach |
| Mine | Toggle on | Only own locations; remote access to own cards | Top-right coach |
| Help | Tap ? | Replay onboarding | Onboarding tour |

## Copy principles

- Use “Thought”, “Explore” and “Create” in user-facing copy. Keep `Drop` only where it is an established internal name.
- Explain **why** before technical detail.
- Never expose raw implementation language such as `ST_DWithin`, UUID schemas or Tilequery to users.
- Use exact numbers where they affect user action: **50m, 150 words, 300 link characters, 5/hour, 3/hour, 2 reports**.
- Privacy copy should say “safer public path/street anchor” rather than claiming a perfect legal guarantee of public property.
