export default function ProgressCard({ stats }) {
  const progress = Math.round((stats?.progress ?? 0) * 100)

  return (
    <div className="progress-card" aria-label={`Fitzroy unlock progress ${progress}%`}>
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
