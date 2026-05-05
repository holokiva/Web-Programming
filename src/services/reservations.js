import { api } from './api'

/**
 * POST /api/reservations — тело подстрой под DTO (roomId, checkIn, checkOut, guestCount …).
 */
export async function createReservation(body) {
  const { data } = await api.post('/api/reservations', body)
  return data
}

export async function fetchMyReservations() {
  const { data } = await api.get('/api/reservations/me')
  return data
}

export async function deleteReservation(id) {
  await api.delete(`/api/reservations/${id}`)
}

export function normalizeReservationsPayload(data) {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.items)) return data.items
  if (data && Array.isArray(data.reservations)) return data.reservations
  if (data && Array.isArray(data.data)) return data.data
  return []
}
