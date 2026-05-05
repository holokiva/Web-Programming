import { useEffect, useState } from 'react'
import Loading from '../../components/Loading.jsx'
import { getApiErrorMessage } from '../../services/auth.js'
import { fetchAdminReservations, normalizeListPayload } from '../../services/admin.js'

function formatDate(v) {
  if (!v) return '—'
  const s = String(v)
  return s.length >= 10 ? s.slice(0, 10) : s
}

async function loadAdminReservationRows() {
  const raw = await fetchAdminReservations()
  return normalizeListPayload(raw)
}

export default function ReservationsListPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setError('')
      setLoading(true)
      try {
        const rows = await loadAdminReservationRows()
        if (!cancelled) setItems(rows)
      } catch (e) {
        if (!cancelled) {
          setError(getApiErrorMessage(e))
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

  return (
    <section className="page-wide">
      <h1>Reservations</h1>
      <p className="muted">GET /api/admin/reservations</p>

      {error ? (
        <p className="alert alert-error" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <Loading label="Loading list…" />
      ) : items.length === 0 ? (
        <p className="muted">No reservations.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Guests</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r, idx) => {
                const id = r.id ?? r.reservationId ?? idx
                const user =
                  r.userEmail ??
                  r.email ??
                  r.user?.email ??
                  r.userId ??
                  r.guestName ??
                  '—'
                const room = r.roomId ?? r.room?.id ?? r.roomNumber ?? '—'
                const checkIn = r.checkIn ?? r.checkInDate ?? r.from
                const checkOut = r.checkOut ?? r.checkOutDate ?? r.to
                const guests = r.guestCount ?? r.guests ?? '—'
                const status = r.status ?? r.state ?? '—'
                return (
                  <tr key={id}>
                    <td>{id}</td>
                    <td>{String(user)}</td>
                    <td>{String(room)}</td>
                    <td>{formatDate(checkIn)}</td>
                    <td>{formatDate(checkOut)}</td>
                    <td>{String(guests)}</td>
                    <td>{String(status)}</td>
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
