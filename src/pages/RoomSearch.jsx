import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Loading from '../components/Loading.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { getApiErrorMessage } from '../services/auth.js'
import { createReservation } from '../services/reservations.js'
import { fetchRoomAvailability, normalizeRoomsPayload } from '../services/rooms.js'

function localISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDays(base, days) {
  const next = new Date(base)
  next.setDate(next.getDate() + days)
  return next
}

function roomLabel(room) {
  return room.name ?? room.title ?? room.roomNumber ?? `Room #${room.id ?? '—'}`
}

function pickCity(room) {
  return room.city ?? room.location?.city ?? room.address?.city ?? '—'
}

function pickRating(room) {
  const r = room.rating ?? room.averageRating ?? room.stars
  if (r == null || Number.isNaN(Number(r))) return '—'
  return Number(r).toFixed(1)
}

function pickParking(room) {
  const v = room.hasParking ?? room.parking ?? room.isParkingAvailable
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  return '—'
}

function pickWellness(room) {
  const v = room.hasWellness ?? room.wellness ?? room.isWellnessAvailable
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  return '—'
}

function pickPrice(room) {
  const p = room.pricePerNight ?? room.price ?? room.nightPrice
  if (p == null || Number.isNaN(Number(p))) return '—'
  return `$${new Intl.NumberFormat('en-US').format(Number(p))}`
}

export default function RoomSearch() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  const defaults = useMemo(() => {
    const today = new Date()
    return {
      checkIn: localISODate(addDays(today, 1)),
      checkOut: localISODate(addDays(today, 3)),
    }
  }, [])

  const [checkIn, setCheckIn] = useState(defaults.checkIn)
  const [checkOut, setCheckOut] = useState(defaults.checkOut)
  const [guestCount, setGuestCount] = useState(2)
  const [city, setCity] = useState('')
  const [minRating, setMinRating] = useState('')
  const [onlyParking, setOnlyParking] = useState(false)
  const [onlyWellness, setOnlyWellness] = useState(false)

  const [rooms, setRooms] = useState([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [bookingId, setBookingId] = useState(null)
  const [notice, setNotice] = useState('')

  const [fieldErrors, setFieldErrors] = useState({})

  const validateSearch = () => {
    const next = {}
    if (!checkIn) next.checkIn = 'Check-in date is required'
    if (!checkOut) next.checkOut = 'Check-out date is required'
    if (checkIn && checkOut && checkIn >= checkOut) {
      next.dates = 'Check-out must be after check-in'
    }
    const gc = Number(guestCount)
    if (!guestCount || Number.isNaN(gc) || gc < 1) next.guestCount = 'At least 1 guest'
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  const buildAvailabilityParams = () => {
    const params = {
      checkIn,
      checkOut,
      guests: Number(guestCount),
    }
    const trimmed = city.trim()
    if (trimmed) params.city = trimmed
    const mr = minRating === '' ? NaN : Number(minRating)
    if (!Number.isNaN(mr) && mr > 0) params.rating = mr
    if (onlyParking) params.freeParking = true
    if (onlyWellness) params.wellnessCenter = true
    return params
  }

  const onSearch = async (e) => {
    e.preventDefault()
    setNotice('')
    setError('')
    if (!validateSearch()) return

    setLoading(true)
    try {
      const raw = await fetchRoomAvailability(buildAvailabilityParams())
      setRooms(normalizeRoomsPayload(raw))
      setSearched(true)
    } catch (err) {
      setError(getApiErrorMessage(err))
      setRooms([])
    } finally {
      setLoading(false)
    }
  }

  const onBook = async (room) => {
    setNotice('')
    setError('')
    if (!validateSearch()) return
    if (!isAuthenticated) return

    const id = room.id ?? room.roomId
    if (id == null) {
      setError('Room id is missing (check API response)')
      return
    }

    setBookingId(id)
    try {
      await createReservation({
        roomId: id,
        checkIn,
        checkOut,
        guests: Number(guestCount),
      })
      setNotice('Reservation created. See “My reservations”.')
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setBookingId(null)
    }
  }

  return (
    <section className="page-wide">
      <h1>Room search</h1>

      <form className="search-form" onSubmit={onSearch}>
        {error ? (
          <p className="alert alert-error" role="alert">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className="alert alert-success" role="status">
            {notice}
          </p>
        ) : null}

        <div className="search-grid">
          <label className="field">
            <span>Check-in</span>
            <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} disabled={loading} />
            {fieldErrors.checkIn ? <small className="field-error">{fieldErrors.checkIn}</small> : null}
          </label>
          <label className="field">
            <span>Check-out</span>
            <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} disabled={loading} />
            {fieldErrors.checkOut ? <small className="field-error">{fieldErrors.checkOut}</small> : null}
          </label>
          <label className="field">
            <span>Guests</span>
            <input
              type="number"
              min={1}
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              disabled={loading}
            />
            {fieldErrors.guestCount ? <small className="field-error">{fieldErrors.guestCount}</small> : null}
          </label>
        </div>
        {fieldErrors.dates ? <p className="field-error">{fieldErrors.dates}</p> : null}

        <div className="search-grid filters">
          <label className="field">
            <span>City</span>
            <input
              type="text"
              placeholder="any"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={loading}
            />
          </label>
          <label className="field">
            <span>Min rating</span>
            <input
              type="number"
              min={1}
              max={5}
              step={0.1}
              placeholder="—"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              disabled={loading}
            />
          </label>
          <label className="field checkbox-field">
            <input
              type="checkbox"
              checked={onlyParking}
              onChange={(e) => setOnlyParking(e.target.checked)}
              disabled={loading}
            />
            <span>Parking only</span>
          </label>
          <label className="field checkbox-field">
            <input
              type="checkbox"
              checked={onlyWellness}
              onChange={(e) => setOnlyWellness(e.target.checked)}
              disabled={loading}
            />
            <span>Wellness only</span>
          </label>
        </div>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {loading ? <Loading label="Searching available rooms…" /> : null}

      {searched ? (
        <div className="results-block">
          <h2>Results</h2>
          {rooms.length === 0 ? (
            <p className="muted">No results. Try changing dates or filters.</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Room</th>
                    <th>City</th>
                    <th>Rating</th>
                    <th>Parking</th>
                    <th>Wellness</th>
                    <th>Price / night</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => {
                    const id = room.id ?? room.roomId
                    const key = id ?? JSON.stringify(room)
                    return (
                      <tr key={key}>
                        <td>{roomLabel(room)}</td>
                        <td>{pickCity(room)}</td>
                        <td>{pickRating(room)}</td>
                        <td>{pickParking(room)}</td>
                        <td>{pickWellness(room)}</td>
                        <td>{pickPrice(room)}</td>
                        <td>
                          {isAuthenticated ? (
                            <button
                              type="button"
                              className="btn btn-sm"
                              disabled={bookingId != null || loading}
                              onClick={() => onBook(room)}
                            >
                              {bookingId === id ? '…' : 'Reserve'}
                            </button>
                          ) : (
                            <Link className="inline-link" to="/login" state={{ from: location }}>
                              Sign in
                            </Link>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}
    </section>
  )
}
