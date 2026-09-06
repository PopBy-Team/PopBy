export default function CoachTip({ tip, onDismiss }) {
  if (!tip) return null

  return (
    <aside className={`coach-tip coach-${tip.position || 'center'}`}>
      <button
        className="coach-close"
        onClick={onDismiss}
        aria-label="Dismiss tip"
      >
        ×
      </button>
      {tip.eyebrow && <div className="coach-eyebrow">{tip.eyebrow}</div>}
      <strong>{tip.title}</strong>
      {tip.body && <p>{tip.body}</p>}
    </aside>
  )
}
