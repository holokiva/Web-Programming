export default function Loading({ label = 'Loading…' }) {
  return (
    <div className="loading-block" role="status" aria-live="polite">
      <span className="spinner" aria-hidden />
      <span className="loading-label">{label}</span>
    </div>
  )
}
