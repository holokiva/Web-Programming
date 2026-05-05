import { useEffect, useState } from 'react'
import Loading from '../../components/Loading.jsx'
import { getApiErrorMessage } from '../../services/auth.js'
import {
  createLocation,
  deleteLocation,
  fetchLocations,
  normalizeLocationsPayload,
  updateLocation,
} from '../../services/locations.js'

function locationId(loc) {
  return loc.id ?? loc.locationId
}

async function loadLocationRows() {
  const raw = await fetchLocations()
  return normalizeLocationsPayload(raw)
}

export default function LocationsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [rating, setRating] = useState('4.5')
  const [hasFreeParking, setHasFreeParking] = useState(false)
  const [hasWellnessCenter, setHasWellnessCenter] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setError('')
      setLoading(true)
      try {
        const next = await loadLocationRows()
        if (!cancelled) setRows(next)
      } catch (e) {
        if (!cancelled) {
          setError(getApiErrorMessage(e))
          setRows([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const resetForm = () => {
    setName('')
    setCity('')
    setAddress('')
    setDescription('')
    setRating('4.5')
    setHasFreeParking(false)
    setHasWellnessCenter(false)
    setImageUrl('')
    setEditingId(null)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const trimmedName = name.trim()
    const trimmedCity = city.trim()
    const trimmedAddress = address.trim()
    const trimmedDescription = description.trim()
    const numericRating = Number(rating)
    if (!trimmedName || !trimmedCity || !trimmedAddress || !trimmedDescription || Number.isNaN(numericRating)) {
      setError('Name, city, address, description and rating are required')
      return
    }
    setError('')
    setSaving(true)
    try {
      const body = {
        name: trimmedName,
        city: trimmedCity,
        address: trimmedAddress,
        description: trimmedDescription,
        rating: numericRating,
        hasFreeParking,
        hasWellnessCenter,
        imageUrl: imageUrl.trim(),
      }
      if (editingId != null) {
        await updateLocation(editingId, body)
      } else {
        await createLocation(body)
      }
      resetForm()
      setLoading(true)
      try {
        setRows(await loadLocationRows())
      } catch (err) {
        setError(getApiErrorMessage(err))
      } finally {
        setLoading(false)
      }
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (loc) => {
    const id = locationId(loc)
    setEditingId(id)
    setName(String(loc.name ?? loc.title ?? ''))
    setCity(String(loc.city ?? ''))
    setAddress(String(loc.address ?? ''))
    setDescription(String(loc.description ?? ''))
    setRating(String(loc.rating ?? '4.5'))
    setHasFreeParking(Boolean(loc.hasFreeParking))
    setHasWellnessCenter(Boolean(loc.hasWellnessCenter))
    setImageUrl(String(loc.imageUrl ?? ''))
    setError('')
  }

  const onDelete = async (loc) => {
    const id = locationId(loc)
    if (id == null) return
    if (!window.confirm('Delete this location?')) return
    setError('')
    setSaving(true)
    try {
      await deleteLocation(id)
      if (editingId === id) resetForm()
      setLoading(true)
      try {
        setRows(await loadLocationRows())
      } catch (err) {
        setError(getApiErrorMessage(err))
      } finally {
        setLoading(false)
      }
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page-wide">
      <h1>Locations</h1>
      <p className="muted">CRUD: /api/locations (change BASE in src/services/locations.js if needed)</p>

      {error ? (
        <p className="alert alert-error" role="alert">
          {error}
        </p>
      ) : null}

      <form className="locations-form" onSubmit={onSubmit}>
        <h2 className="form-section-title">{editingId != null ? 'Edit' : 'New location'}</h2>
        <div className="search-grid">
          <label className="field">
            <span>Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} disabled={saving} required />
          </label>
          <label className="field">
            <span>City</span>
            <input value={city} onChange={(e) => setCity(e.target.value)} disabled={saving} />
          </label>
          <label className="field">
            <span>Address</span>
            <input value={address} onChange={(e) => setAddress(e.target.value)} disabled={saving} />
          </label>
          <label className="field">
            <span>Rating</span>
            <input
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              disabled={saving}
            />
          </label>
          <label className="field">
            <span>Image URL</span>
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} disabled={saving} />
          </label>
        </div>
        <label className="field">
          <span>Description</span>
          <input value={description} onChange={(e) => setDescription(e.target.value)} disabled={saving} />
        </label>
        <div className="search-grid">
          <label className="field checkbox-field">
            <input
              type="checkbox"
              checked={hasFreeParking}
              onChange={(e) => setHasFreeParking(e.target.checked)}
              disabled={saving}
            />
            <span>Has free parking</span>
          </label>
          <label className="field checkbox-field">
            <input
              type="checkbox"
              checked={hasWellnessCenter}
              onChange={(e) => setHasWellnessCenter(e.target.checked)}
              disabled={saving}
            />
            <span>Has wellness center</span>
          </label>
        </div>
        <div className="form-actions">
          <button className="btn" type="submit" disabled={saving}>
            {saving ? 'Saving…' : editingId != null ? 'Save' : 'Add'}
          </button>
          {editingId != null ? (
            <button type="button" className="btn btn-secondary" onClick={resetForm} disabled={saving}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      {loading ? (
        <Loading label="Loading locations…" />
      ) : rows.length === 0 ? (
        <p className="muted">No locations.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>City</th>
                <th>Rating</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((loc) => {
                const id = locationId(loc)
                return (
                  <tr key={id ?? JSON.stringify(loc)}>
                    <td>{id ?? '—'}</td>
                    <td>{loc.name ?? loc.title ?? '—'}</td>
                    <td>{loc.city ?? '—'}</td>
                    <td>{loc.rating ?? '—'}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => startEdit(loc)}
                        disabled={saving}
                      >
                        Edit
                      </button>{' '}
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => onDelete(loc)}
                        disabled={saving || id == null}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
