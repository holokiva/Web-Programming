import { api } from './api'

/** Тело запроса должно совпадать с DTO бэкенда (при необходимости поменяй ключи). */
export async function postLogin(body) {
  const { data } = await api.post('/api/auth/login', body)
  return data
}

export async function postRegister(body) {
  const { data } = await api.post('/api/auth/register', body)
  return data
}

export function pickTokenFromAuthResponse(data) {
  if (!data || typeof data !== 'object') return ''
  return data.token ?? data.accessToken ?? data.jwt ?? ''
}

export function pickUserFromAuthResponse(data) {
  if (!data || typeof data !== 'object') return null
  if (data.user && typeof data.user === 'object') return data.user
  return null
}

export function getApiErrorMessage(error) {
  const res = error?.response
  if (!res) return error?.message || 'Нет соединения с сервером'

  const d = res.data
  if (typeof d === 'string' && d.trim()) return d
  if (d && typeof d === 'object') {
    if (typeof d.message === 'string' && d.message.trim()) return d.message
    if (typeof d.title === 'string' && d.title.trim()) return d.title
    if (d.errors && typeof d.errors === 'object') {
      const first = Object.values(d.errors).flat().find(Boolean)
      if (typeof first === 'string') return first
    }
  }

  return `Ошибка ${res.status}`
}
