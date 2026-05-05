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

export { getApiErrorMessage } from '../utils/apiError.js'
