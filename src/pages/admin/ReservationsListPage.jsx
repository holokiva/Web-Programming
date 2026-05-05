import { useCallback, useEffect, useState } from 'react'
import { getApiErrorMessage } from '../../services/auth.js'
import { fetchAdminReservations, normalizeListPayload } from '../../services/admin.js'

function formatDate(v) {
  if (!v) return '—'
  const s = String(v)
  return s.length >= 10 ? s.slice(0, 10) : s
}

export default function ReservationsListPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const raw = await fetchAdminReservations()
      setItems(normalizeListPayload(raw))
    } catch (e) {
      setError(getApiErrorMessage(e))
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <section className="page-wide">
      <h1>Бронирования</h1>
      <p className="muted">GET /api/admin/reservations</p>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="muted">Загрузка…</p>
      ) : items.length === 0 ? (
        <p className="muted">Список пуст.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Пользователь</th>
                <th>Номер</th>
                <th>Заезд</th>
                <th>Выезд</th>
                <th>Гостей</th>
                <th>Статус</th>
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
