import { useCallback, useEffect, useState } from 'react'
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

export default function LocationsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const raw = await fetchLocations()
      setRows(normalizeLocationsPayload(raw))
    } catch (e) {
      setError(getApiErrorMessage(e))
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const resetForm = () => {
    setName('')
    setCity('')
    setEditingId(null)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const trimmedName = name.trim()
    const trimmedCity = city.trim()
    if (!trimmedName) {
      setError('Укажите название')
      return
    }
    setError('')
    setSaving(true)
    try {
      const body = { name: trimmedName, city: trimmedCity }
      if (editingId != null) {
        await updateLocation(editingId, body)
      } else {
        await createLocation(body)
      }
      resetForm()
      await load()
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
    setError('')
  }

  const onDelete = async (loc) => {
    const id = locationId(loc)
    if (id == null) return
    if (!window.confirm('Удалить эту локацию?')) return
    setError('')
    setSaving(true)
    try {
      await deleteLocation(id)
      if (editingId === id) resetForm()
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page-wide">
      <h1>Локации</h1>
      <p className="muted">CRUD: /api/locations (при необходимости поменяй путь в services/locations.js)</p>

      {error ? (
        <p className="alert alert-error" role="alert">
          {error}
        </p>
      ) : null}

      <form className="locations-form" onSubmit={onSubmit}>
        <h2 className="form-section-title">{editingId != null ? 'Редактирование' : 'Новая локация'}</h2>
        <div className="search-grid">
          <label className="field">
            <span>Название</span>
            <input value={name} onChange={(e) => setName(e.target.value)} disabled={saving} required />
          </label>
          <label className="field">
            <span>Город</span>
            <input value={city} onChange={(e) => setCity(e.target.value)} disabled={saving} />
          </label>
        </div>
        <div className="form-actions">
          <button className="btn" type="submit" disabled={saving}>
            {saving ? 'Сохранение…' : editingId != null ? 'Сохранить' : 'Добавить'}
          </button>
          {editingId != null ? (
            <button type="button" className="btn btn-secondary" onClick={resetForm} disabled={saving}>
              Отмена
            </button>
          ) : null}
        </div>
      </form>

      {loading ? (
        <Loading label="Загрузка локаций…" />
      ) : rows.length === 0 ? (
        <p className="muted">Нет локаций.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Название</th>
                <th>Город</th>
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
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => startEdit(loc)}
                        disabled={saving}
                      >
                        Изменить
                      </button>{' '}
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => onDelete(loc)}
                        disabled={saving || id == null}
                      >
                        Удалить
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
