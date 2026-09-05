const DEMO_DEVICE_IDS = [
  '00000000-0000-4000-8000-000000002001',
  '00000000-0000-4000-8000-000000002002',
  '00000000-0000-4000-8000-000000002003',
  '00000000-0000-4000-8000-000000002004',
  '00000000-0000-4000-8000-000000002005',
  '00000000-0000-4000-8000-000000002006',
  '00000000-0000-4000-8000-000000002007',
  '00000000-0000-4000-8000-000000002008',
]

export const DEMO_LOCATIONS = Object.freeze([
  { id: '00000000-0000-4000-8000-000000000101', lng: 144.97886, lat: -37.80046 },
  { id: '00000000-0000-4000-8000-000000000102', lng: 144.97945, lat: -37.8002 },
  { id: '00000000-0000-4000-8000-000000000103', lng: 144.97695, lat: -37.80135 },
  { id: '00000000-0000-4000-8000-000000000104', lng: 144.9819, lat: -37.80205 },
  { id: '00000000-0000-4000-8000-000000000105', lng: 144.97565, lat: -37.79865 },
  { id: '00000000-0000-4000-8000-000000000106', lng: 144.98265, lat: -37.79775 },
])

const RAW_DEMO_THOUGHTS = [
  ['001001', 0, 0, 'Nature', 'The plane trees are turning the footpath into moving shade.', 'lined', null],
  ['001002', 0, 1, 'Nature', 'Tiny green shoots found the crack beside the bluestone.', 'grid', null],
  ['001003', 0, 2, 'Moment', 'A cyclist rang once and the whole corner seemed to wake up.', 'solid', null],
  ['001004', 0, 3, 'Sound', 'Coffee cups, tram bells, and one very patient magpie.', 'lined', 'https://open.spotify.com/'],
  ['001005', 0, 4, 'Place', 'This corner feels like a pause between errands.', 'solid', null],
  ['001006', 1, 5, 'Art', 'A blue face appeared overnight between two old posters.', 'grid', null],
  ['001007', 1, 6, 'Art', 'The paint drips are better than the finished mural.', 'solid', null],
  ['001008', 1, 7, 'Place', 'Look up: the balcony brackets are little iron flowers.', 'lined', null],
  ['001009', 1, 0, 'Moment', 'Someone held the door for three strangers in a row.', 'solid', null],
  ['001010', 2, 1, 'Eat', 'Warm cardamom drifted all the way to the crossing.', 'lined', null],
  ['001011', 2, 2, 'Eat', 'The last table outside catches the soft afternoon sun.', 'solid', null],
  ['001012', 2, 3, 'Sound', 'A kitchen radio is playing just above the street noise.', 'grid', 'https://music.apple.com/'],
  ['001013', 3, 4, 'Animals', 'A terrier is inspecting every doorway like a tiny mayor.', 'solid', null],
  ['001014', 3, 5, 'Nature', 'Rain is holding in the leaves even though the sky cleared.', 'lined', null],
  ['001015', 4, 6, 'Place', 'The old brick changes colour whenever a cloud passes.', 'grid', null],
  ['001016', 5, 7, 'Sound', 'There is a quiet pocket here between two busy streets.', 'solid', null],
]

export const DEMO_THOUGHTS = Object.freeze(
  RAW_DEMO_THOUGHTS.map(([
    suffix,
    locationIndex,
    deviceIndex,
    category,
    body,
    backgroundType,
    musicUrl,
  ], index) => ({
    id: `00000000-0000-4000-8000-000000${suffix}`,
    location_id: DEMO_LOCATIONS[locationIndex].id,
    device_id: DEMO_DEVICE_IDS[deviceIndex],
    category,
    body,
    background_type: backgroundType,
    image_url: null,
    music_url: musicUrl,
    hidden: false,
    created_at: new Date(Date.UTC(2026, 8, 5, 8, 16 - index)).toISOString(),
  })),
)

export const DEMO_PROGRESS = Object.freeze({
  active_locations: 6,
  total_thoughts: 16,
  unique_contributors: 8,
  successful_unlocks: 10,
  progress: 0.2,
})

function dominantCategory(thoughts) {
  const categories = new Map()

  for (const thought of thoughts) {
    const current = categories.get(thought.category) || { count: 0, latestAt: '' }
    categories.set(thought.category, {
      count: current.count + 1,
      latestAt: current.latestAt > thought.created_at ? current.latestAt : thought.created_at,
    })
  }

  return [...categories.entries()]
    .sort((a, b) => b[1].count - a[1].count || b[1].latestAt.localeCompare(a[1].latestAt))[0]?.[0]
}

export function getDemoMapLocations(
  deviceId,
  {
    hiddenIds = new Set(),
    locations = DEMO_LOCATIONS,
    thoughts: allThoughts = DEMO_THOUGHTS,
  } = {},
) {
  return locations.map((location) => {
    const thoughts = allThoughts.filter((thought) =>
      thought.location_id === location.id &&
      !thought.hidden &&
      !hiddenIds.has(thought.id)
    )
    if (thoughts.length === 0) return null

    const latestAt = thoughts.reduce(
      (latest, thought) => latest > thought.created_at ? latest : thought.created_at,
      '',
    )

    return {
      location_id: location.id,
      suburb: 'Fitzroy',
      lat: location.lat,
      lng: location.lng,
      thought_count: thoughts.length,
      dominant_category: dominantCategory(thoughts),
      latest_at: latestAt,
      is_mine: thoughts.some((thought) => thought.device_id === deviceId),
      is_unlocked: false,
    }
  }).filter(Boolean)
}

export function getDemoProgress(suburb) {
  return suburb === 'Fitzroy' ? { ...DEMO_PROGRESS } : null
}
