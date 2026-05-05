import { api } from './api'

/** При необходимости замени префикс на `/api/admin/locations`, если так на бэкенде. */
const BASE = '/api/locations'

export async function fetchLocations() {
  const { data } = await api.get(BASE)
  return data
}

export async function createLocation(body) {
  const { data } = await api.post(BASE, body)
  return data
}

export async function updateLocation(id, body) {
  const { data } = await api.put(`${BASE}/${id}`, body)
  return data
}

export async function deleteLocation(id) {
  await api.delete(`${BASE}/${id}`)
}

export function normalizeLocationsPayload(data) {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.items)) return data.items
  if (data && Array.isArray(data.locations)) return data.locations
  if (data && Array.isArray(data.data)) return data.data
  return []
}
