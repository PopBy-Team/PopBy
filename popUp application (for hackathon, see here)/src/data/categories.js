export const CATEGORIES = [
  { name: 'Animals', icon: '🐾', help: 'Animals, pets or urban wildlife.' },
  { name: 'Nature', icon: '🌳', help: 'Trees, flowers, weather or small natural details.' },
  { name: 'Eat', icon: '🍴', help: 'Food, drinks or something worth tasting.' },
  { name: 'Art', icon: '🎨', help: 'Street art, design, objects or creative details.' },
  { name: 'Place', icon: '📍', help: 'A corner, building, shopfront or space worth noticing.' },
  { name: 'Sound', icon: '🎵', help: 'Music, voices, ambience or something you heard here.' },
  { name: 'Moment', icon: '✨', help: 'A fleeting feeling or scene that fits nowhere else.' },
]

export const CATEGORY_ICONS = Object.fromEntries(
  CATEGORIES.map(({ name, icon }) => [name, icon]),
)
