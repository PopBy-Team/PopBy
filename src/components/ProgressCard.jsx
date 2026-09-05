export default function ProgressCard({ stats, hidden = false }) {
  const progress = Math.round((stats?.progress ?? 0) * 100)

  return (
    <div
      className={hidden ? 'progress-card is-hidden' : 'progress-card'}
      aria-hidden={hidden}
      aria-label={hidden ? undefined : `Fitzroy unlock progress ${progress}%`}
    >
      <div className="progress-title">
        <strong>Fitzroy</strong>
        <span>{progress}%</span>
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="progress-next">
        <span>Next</span>
        <strong>Carlton</strong>
      </div>
    </div>
  )
}
