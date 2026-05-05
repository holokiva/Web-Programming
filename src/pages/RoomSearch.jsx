import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Loading from '../components/Loading.jsx'
import { useAuth } from '../context/AuthContext.jsx'
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
  return room.name ?? room.title ?? room.roomNumber ?? `Номер #${room.id ?? '—'}`
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
  if (typeof v === 'boolean') return v ? 'Да' : 'Нет'
  return '—'
}

function pickWellness(room) {
  const v = room.hasWellness ?? room.wellness ?? room.isWellnessAvailable
  if (typeof v === 'boolean') return v ? 'Да' : 'Нет'
  return '—'
}

function pickPrice(room) {
  const p = room.pricePerNight ?? room.price ?? room.nightPrice
  if (p == null || Number.isNaN(Number(p))) return '—'
  return `${new Intl.NumberFormat('ru-RU').format(Number(p))} ₽`
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
    if (!checkIn) next.checkIn = 'Укажите дату заезда'
    if (!checkOut) next.checkOut = 'Укажите дату выезда'
    if (checkIn && checkOut && checkIn >= checkOut) {
      next.dates = 'Дата выезда должна быть позже заезда'
    }
    const gc = Number(guestCount)
    if (!guestCount || Number.isNaN(gc) || gc < 1) next.guestCount = 'Минимум 1 гость'
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  const buildAvailabilityParams = () => {
    const params = {
      checkIn,
      checkOut,
      guestCount: Number(guestCount),
    }
    const trimmed = city.trim()
    if (trimmed) params.city = trimmed
    const mr = minRating === '' ? NaN : Number(minRating)
    if (!Number.isNaN(mr) && mr > 0) params.minRating = mr
    if (onlyParking) params.hasParking = true
    if (onlyWellness) params.hasWellness = true
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
      setError('У номера нет id — проверьте ответ API')
      return
    }

    setBookingId(id)
    try {
      await createReservation({
        roomId: id,
        checkIn,
        checkOut,
        guestCount: Number(guestCount),
      })
      setNotice('Бронирование создано. Смотрите раздел «Мои брони».')
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setBookingId(null)
    }
  }

  return (
    <section className="page-wide">
      <h1>Поиск номеров</h1>

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
            <span>Заезд</span>
            <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} disabled={loading} />
            {fieldErrors.checkIn ? <small className="field-error">{fieldErrors.checkIn}</small> : null}
          </label>
          <label className="field">
            <span>Выезд</span>
            <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} disabled={loading} />
            {fieldErrors.checkOut ? <small className="field-error">{fieldErrors.checkOut}</small> : null}
          </label>
          <label className="field">
            <span>Гости</span>
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
            <span>Город</span>
            <input
              type="text"
              placeholder="любой"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={loading}
            />
          </label>
          <label className="field">
            <span>Мин. рейтинг</span>
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
            <span>Только с парковкой</span>
          </label>
          <label className="field checkbox-field">
            <input
              type="checkbox"
              checked={onlyWellness}
              onChange={(e) => setOnlyWellness(e.target.checked)}
              disabled={loading}
            />
            <span>Только с wellness</span>
          </label>
        </div>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Поиск…' : 'Найти'}
        </button>
      </form>

      {loading ? <Loading label="Ищем доступные номера…" /> : null}

      {searched ? (
        <div className="results-block">
          <h2>Результаты</h2>
          {rooms.length === 0 ? (
            <p className="muted">Ничего не найдено. Измените даты или фильтры.</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Номер</th>
                    <th>Город</th>
                    <th>Рейтинг</th>
                    <th>Парковка</th>
                    <th>Wellness</th>
                    <th>Цена / ночь</th>
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
                              {bookingId === id ? '…' : 'Забронировать'}
                            </button>
                          ) : (
                            <Link className="inline-link" to="/login" state={{ from: location }}>
                              Войти
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
