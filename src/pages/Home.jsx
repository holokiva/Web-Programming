import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Loading from '../components/Loading.jsx'
import { getApiErrorMessage } from '../services/auth.js'
import { fetchPublicLocations, normalizeLocationsPayload } from '../services/locations.js'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'

function ratingText(value) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return Number(value).toFixed(1)
}

export default function Home() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setError('')
      setLoading(true)
      try {
        const raw = await fetchPublicLocations()
        if (!cancelled) setLocations(normalizeLocationsPayload(raw))
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err))
          setLocations([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="page-wide">
      <div className="hero-banner">
        <div>
          <h1>Paradise Hotel</h1>
          <p>Find locations and reserve the best room for your trip.</p>
          <div className="hero-actions">
            <Link className="btn" to="/search">
              Search rooms
            </Link>
            <Link className="btn btn-secondary" to="/about">
              Learn more
            </Link>
          </div>
        </div>
      </div>

      <div className="section-header">
        <h2>Top locations</h2>
        <Link className="inline-link" to="/search">
          Open full search
        </Link>
      </div>

      {error ? (
        <p className="alert alert-error" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <Loading label="Loading locations…" />
      ) : locations.length === 0 ? (
        <p className="muted">No locations yet.</p>
      ) : (
        <div className="location-grid">
          {locations.map((location) => (
            <article key={location.id ?? `${location.name}-${location.city}`} className="location-card">
              <img
                src={location.imageUrl || FALLBACK_IMAGE}
                alt={location.name || 'Location'}
                loading="lazy"
                className="location-card-image"
              />
              <div className="location-card-body">
                <div className="location-card-head">
                  <h3>{location.name || 'Location'}</h3>
                  <span className="badge">Rating {ratingText(location.rating)}</span>
                </div>
                <p className="muted">
                  {location.city || 'Unknown city'}
                  {location.address ? ` · ${location.address}` : ''}
                </p>
                <p>{location.description || 'No description provided.'}</p>
                <div className="tag-row">
                  {location.hasFreeParking ? <span className="tag">Free parking</span> : null}
                  {location.hasWellnessCenter ? <span className="tag">Wellness</span> : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
