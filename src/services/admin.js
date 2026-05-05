import { api } from './api'

export async function fetchAdminDashboard() {
  const { data } = await api.get('/api/admin/dashboard')
  return data
}

/** Список всех бронирований для админки */
export async function fetchAdminReservations() {
  const { data } = await api.get('/api/admin/reservations')
  return data
}

export function normalizeListPayload(data) {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.items)) return data.items
  if (data && Array.isArray(data.reservations)) return data.reservations
  if (data && Array.isArray(data.data)) return data.data
  return []
}
