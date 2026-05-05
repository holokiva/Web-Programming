import { api } from './api'

/**
 * GET /api/rooms/availability
 * Параметры подстрой под контракт API: checkIn, checkOut, guestCount, city, minRating, hasParking, hasWellness
 */
export async function fetchRoomAvailability(params) {
  const { data } = await api.get('/api/rooms/availability', { params })
  return data
}

export function normalizeRoomsPayload(data) {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.items)) return data.items
  if (data && Array.isArray(data.rooms)) return data.rooms
  if (data && Array.isArray(data.data)) return data.data
  return []
}
