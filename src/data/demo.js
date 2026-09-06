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
  { id: '00000000-0000-4000-8000-000000000101', lng: 144.97833614338754, lat: -37.80058074253888 },
  { id: '00000000-0000-4000-8000-000000000102', lng: 144.9787535528851, lat: -37.80084453896316 },
  { id: '00000000-0000-4000-8000-000000000103', lng: 144.97928785189276, lat: -37.80050393011469 },
  { id: '00000000-0000-4000-8000-000000000104', lng: 144.98189911980012, lat: -37.80205452344002 },
  { id: '00000000-0000-4000-8000-000000000105', lng: 144.97564295474245, lat: -37.79868505587912 },
  { id: '00000000-0000-4000-8000-000000000106', lng: 144.9826194883899, lat: -37.797924668467786 },
])

const RAW_DEMO_THOUGHTS = [
  ['001001', 0, 0, 'Nature', 'The plane trees are turning the footpath into moving shade.', 'lined', null, null],
  ['001002', 0, 1, 'Nature', 'Tiny green shoots found the crack beside the bluestone.', 'solid', 'https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp', null],
  ['001003', 1, 2, 'Art', 'A blue face appeared overnight between two old posters.', 'grid', null, null],
  ['001004', 1, 3, 'Art', 'The paint drips are better than the finished mural.', 'solid', 'https://music.apple.com/au/song/dreams/1440768234', null],
  ['001005', 1, 4, 'Art', 'Someone added one gold line and stopped at exactly the right moment.', 'dots', null, null],
  ['001006', 1, 5, 'Place', 'Look up: the balcony brackets are little iron flowers.', 'lined', null, null],
  ['001007', 1, 6, 'Moment', 'Late sun caught the windows and made the whole lane blink.', 'photo', null, 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80'],
  ['001008', 2, 7, 'Eat', 'Warm cardamom drifted all the way to the crossing.', 'solid', null, null],
  ['001009', 2, 0, 'Eat', 'The last table outside catches the soft afternoon sun.', 'lined', null, null],
  ['001010', 2, 1, 'Eat', 'A tiny window is handing out something crisp and excellent.', 'grid', null, null],
  ['001011', 2, 2, 'Eat', null, 'dots', 'https://music.youtube.com/watch?v=dQw4w9WgXcQ', null],
  ['001012', 2, 3, 'Nature', 'Rain is holding in the leaves even though the sky cleared.', 'solid', null, null],
  ['001013', 2, 4, 'Animals', 'A terrier is inspecting every doorway like a tiny mayor.', 'photo', null, 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80'],
  ['001014', 2, 5, 'Sound', 'Coffee cups, tram bells, and one very patient magpie.', 'lined', 'https://open.spotify.com/track/0ofHAoxe9vBkTCp2UQIavz', null],
  ['001015', 2, 6, 'Place', 'This corner feels like a pause between errands.', 'grid', null, null],
  ['001016', 2, 7, 'Moment', 'Someone held the door for three strangers in a row.', 'solid', 'https://music.apple.com/au/album/rumours/1440857781?i=1440857798', null],
  ['001017', 2, 0, 'Eat', 'Keep walking until the toasted sesame smell wins.', 'solid', null, null],
  ['001018', 3, 1, 'Animals', 'A magpie is supervising the bike rack.', 'solid', null, null],
  ['001019', 4, 2, 'Place', 'The old brick changes colour whenever a cloud passes.', 'grid', null, null],
  ['001020', 5, 3, 'Sound', 'There is a quiet pocket here between two busy streets.', 'lined', null, null],
]

const DEMO_SOLID_COLORS = ['sage', 'rose', 'clay', 'blue', 'lavender']
const DEMO_FONTS = ['caveat', 'patrick-hand', 'homemade-apple', 'island-moments']
const DEMO_FONT_SIZES = [16, 14, 12]

export const DEMO_THOUGHTS = Object.freeze(
  RAW_DEMO_THOUGHTS.map(([
    suffix,
    locationIndex,
    deviceIndex,
    category,
    body,
    backgroundType,
    musicUrl,
    imageUrl,
  ], index) => ({
    id: `00000000-0000-4000-8000-000000${suffix}`,
    location_id: DEMO_LOCATIONS[locationIndex].id,
    device_id: DEMO_DEVICE_IDS[deviceIndex],
    category,
    body,
    background_type: backgroundType,
    background_color: backgroundType === 'solid'
      ? DEMO_SOLID_COLORS[index % DEMO_SOLID_COLORS.length]
      : 'white',
    font_family: DEMO_FONTS[index % DEMO_FONTS.length],
    font_size: DEMO_FONT_SIZES[index % DEMO_FONT_SIZES.length],
    image_url: imageUrl,
    music_url: musicUrl,
    hidden: false,
    created_at: new Date(Date.UTC(2026, 8, 5, 8, 20 - index)).toISOString(),
  })),
)

export const DEMO_PROGRESS = Object.freeze({
  active_locations: 6,
  total_thoughts: 20,
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
