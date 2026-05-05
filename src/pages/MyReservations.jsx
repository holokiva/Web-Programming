import { useEffect, useState } from 'react'
import Loading from '../components/Loading.jsx'
import { getApiErrorMessage } from '../services/auth.js'
import {
  deleteReservation,
  fetchMyReservations,
  normalizeReservationsPayload,
} from '../services/reservations.js'

function formatDate(v) {
  if (!v) return '—'
  const s = String(v)
  return s.length >= 10 ? s.slice(0, 10) : s
}

function reservationKey(r, idx) {
  return r.id ?? r.reservationId ?? idx
}

async function loadReservationRows() {
  const raw = await fetchMyReservations()
  return normalizeReservationsPayload(raw)
}

export default function MyReservations() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setError('')
      setLoading(true)
      try {
        const rows = await loadReservationRows()
        if (!cancelled) setItems(rows)
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err))
          setItems([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const onDelete = async (id) => {
    if (id == null) return
    if (!window.confirm('Cancel this reservation?')) return
    setDeletingId(id)
    setError('')
    try {
      await deleteReservation(id)
      setLoading(true)
      try {
        const rows = await loadReservationRows()
        setItems(rows)
      } catch (err) {
        setError(getApiErrorMessage(err))
      } finally {
        setLoading(false)
      }
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="page-wide">
      <h1>My reservations</h1>

      {error ? (
        <p className="alert alert-error" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <Loading label="Loading reservations…" />
      ) : items.length === 0 ? (
        <p className="muted">No reservations yet.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Guests</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((r, idx) => {
                const id = r.id ?? r.reservationId
                const roomRef = r.roomId ?? r.room?.id ?? r.roomNumber ?? '—'
                const checkIn = r.checkIn ?? r.checkInDate ?? r.from
                const checkOut = r.checkOut ?? r.checkOutDate ?? r.to
                const guests = r.guestCount ?? r.guests ?? r.numberOfGuests ?? '—'
                const status = r.status ?? r.state ?? '—'
                return (
                  <tr key={reservationKey(r, idx)}>
                    <td>{id ?? '—'}</td>
                    <td>{roomRef}</td>
                    <td>{formatDate(checkIn)}</td>
                    <td>{formatDate(checkOut)}</td>
                    <td>{guests}</td>
                    <td>{String(status)}</td>
                    <td>
                      {id != null ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          disabled={deletingId != null}
                          onClick={() => onDelete(id)}
                        >
                          {deletingId === id ? '…' : 'Cancel'}
                        </button>
                      ) : (
                        '—'
                      )}
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
