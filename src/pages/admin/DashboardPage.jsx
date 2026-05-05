import { useEffect, useState } from 'react'
import Loading from '../../components/Loading.jsx'
import { getApiErrorMessage } from '../../services/auth.js'
import { fetchAdminDashboard } from '../../services/admin.js'

function renderValue(v) {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setError('')
      setLoading(true)
      try {
        const res = await fetchAdminDashboard()
        if (!cancelled) setData(res)
      } catch (e) {
        if (!cancelled) setError(getApiErrorMessage(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="page-wide">
      <h1>Дашборд</h1>
      <p className="muted">Данные с GET /api/admin/dashboard</p>

      {error ? (
        <p className="alert alert-error" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <Loading label="Загрузка дашборда…" />
      ) : data != null && typeof data === 'object' && !Array.isArray(data) ? (
        Object.keys(data).length === 0 ? (
          <p className="muted">Пустой объект в ответе.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Показатель</th>
                  <th>Значение</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data).map(([key, val]) => (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>{renderValue(val)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <pre className="admin-raw">{JSON.stringify(data, null, 2)}</pre>
      )}
    </section>
  )
}
