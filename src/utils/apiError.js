function messageFromResponseData(data) {
  if (typeof data === 'string' && data.trim()) return data.trim()
  if (data && typeof data === 'object') {
    if (typeof data.message === 'string' && data.message.trim()) return data.message.trim()
    if (typeof data.title === 'string' && data.title.trim()) return data.title.trim()
    if (typeof data.detail === 'string' && data.detail.trim()) return data.detail.trim()
    if (data.errors && typeof data.errors === 'object') {
      const parts = Object.values(data.errors).flat().filter(Boolean)
      if (parts.length) return parts.map(String).join(' ')
    }
  }
  return null
}

const STATUS_FALLBACK = {
  400: 'Bad request',
  401: 'Please sign in',
  403: 'Access forbidden',
  404: 'Not found',
  408: 'Request timeout',
  429: 'Too many requests',
  500: 'Server error',
  502: 'Server unavailable',
  503: 'Service unavailable',
}

/**
 * Сообщение для UI: тело ответа (валидация, ASP.NET problem details) + коды 400/401/403/404.
 */
export function getApiErrorMessage(error) {
  if (!error?.response) {
    if (error?.code === 'ECONNABORTED') return 'Request timeout'
    if (error?.message === 'Network Error') {
      return 'Cannot reach server. Check that backend is running and VITE_API_URL is correct.'
    }
    return error?.message || 'Cannot reach server'
  }

  const { status, data } = error.response
  const fromBody = messageFromResponseData(data)

  if (status === 400) return fromBody || STATUS_FALLBACK[400]
  if (status === 401) return fromBody || STATUS_FALLBACK[401]
  if (status === 403) return fromBody || STATUS_FALLBACK[403]
  if (status === 404) return fromBody || STATUS_FALLBACK[404]

  if (fromBody) return fromBody
  return STATUS_FALLBACK[status] || `Error ${status}`
}
