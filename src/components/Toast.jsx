export default function Toast({ message }) {
  if (!message) return null
  return <div className="map-toast" role="status" aria-live="polite">{message}</div>
}
