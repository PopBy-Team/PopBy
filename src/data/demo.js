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
  { id: '00000000-0000-4000-8000-000000000101', lng: 144.97985219726195, lat: -37.80160727412293 },
  { id: '00000000-0000-4000-8000-000000000102', lng: 144.98010583519937, lat: -37.8016060123155 },
  { id: '00000000-0000-4000-8000-000000000103', lng: 144.97986508448895, lat: -37.80179492422676 },
  { id: '00000000-0000-4000-8000-000000000104', lng: 144.98189911980012, lat: -37.80205452344002 },
  { id: '00000000-0000-4000-8000-000000000105', lng: 144.97564295474245, lat: -37.79868505587912 },
  { id: '00000000-0000-4000-8000-000000000106', lng: 144.9826194883899, lat: -37.797924668467786 },
])

const RAW_DEMO_THOUGHTS = [
  ['001001', 0, 0, 'Sound', 'A leaf skitters over the path, then the park goes quiet again.', 'lined', null, null],
  ['001002', 0, 1, 'Sound', 'Kids, a magpie, and a distant tram are somehow keeping the same rhythm.', 'solid', 'https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp', null],
  ['001003', 1, 2, 'Nature', "The grass is still holding last night's rain.", 'grid', null, null],
  ['001004', 1, 3, 'Nature', 'The trees keep the afternoon light a little longer here.', 'solid', 'https://music.apple.com/au/song/dreams/1440768234', null],
  ['001005', 1, 4, 'Nature', 'Someone tucked three daisies beside the bench.', 'dots', null, null],
  ['001006', 1, 5, 'Nature', 'A small green pause between the library and the town hall.', 'lined', null, null],
  ['001007', 1, 6, 'Nature', 'The branches have made a soft ceiling over this bench. Photo: Star A Star · CC BY-SA 4.0.', 'photo', null, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c6/Gough_Whitlam_-_Its_Time_-_Whitlam_Park_or_Place.jpg/1280px-Gough_Whitlam_-_Its_Time_-_Whitlam_Park_or_Place.jpg'],
  ['001008', 2, 7, 'Animals', 'A magpie is walking the path like it has somewhere important to be.', 'solid', null, null],
  ['001009', 2, 0, 'Animals', 'The smallest dog here has chosen the biggest stick.', 'lined', null, null],
  ['001010', 2, 1, 'Animals', 'Two pigeons are taking turns guarding this doorway.', 'grid', null, null],
  ['001011', 2, 2, 'Animals', 'A sleepy greyhound stopped in the one perfect patch of sun.', 'dots', 'https://music.youtube.com/watch?v=dQw4w9WgXcQ', null],
  ['001012', 2, 3, 'Nature', 'New leaves are making little green windows above the path.', 'solid', null, null],
  ['001013', 2, 4, 'Animals', 'A terrier is inspecting every bench like a tiny mayor.', 'solid', null, null],
  ['001014', 2, 5, 'Sound', 'Coffee cups, tram bells, and one very patient magpie.', 'lined', 'https://open.spotify.com/track/0ofHAoxe9vBkTCp2UQIavz', null],
  ['001015', 2, 6, 'Place', 'This little park feels like a comma between errands.', 'grid', null, null],
  ['001016', 2, 7, 'Moment', "I don't need today to become anything else.", 'solid', 'https://music.apple.com/au/album/rumours/1440857781?i=1440857798', null],
  ['001017', 2, 0, 'Eat', 'My takeaway tastes better on this bench.', 'solid', null, null],
  ['001018', 3, 1, 'Art', 'A hand-painted sign makes the bike rack look like part of the mural.', 'solid', null, null],
  ['001019', 4, 2, 'Eat', 'Toasted sesame drifts past the old brick whenever the door opens.', 'grid', null, null],
  ['001020', 5, 3, 'Sound', 'There is a quiet pocket here between two busy streets.', 'lined', null, null],
]

const DEMO_SOLID_COLORS = ['sage', 'rose', 'clay', 'blue', 'lavender']
const DEMO_FONTS = ['caveat', 'patrick-hand', 'homemade-apple', 'island-moments']
const DEMO_FONT_SIZES = [14, 16, 18]

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
