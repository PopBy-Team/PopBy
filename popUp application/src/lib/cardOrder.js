function shuffle(items) {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Newest first.
 * Middle thoughts are split into 2–8, 9–15, 16–(n-1).
 * Then we randomly cycle A -> B -> C until all middle cards are seen.
 * Oldest is shown last. The UI can loop to the beginning afterwards.
 */
export function buildThoughtDeck(thoughts) {
  const sorted = [...thoughts].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  )

  if (sorted.length <= 2) return sorted

  const latest = sorted[0]
  const oldest = sorted[sorted.length - 1]
  const middle = sorted.slice(1, -1)

  const layers = [
    shuffle(middle.slice(0, 7)),
    shuffle(middle.slice(7, 14)),
    shuffle(middle.slice(14)),
  ]

  const orderedMiddle = []
  while (layers.some((layer) => layer.length > 0)) {
    for (const layer of layers) {
      if (layer.length > 0) orderedMiddle.push(layer.pop())
    }
  }

  return [latest, ...orderedMiddle, oldest]
}
