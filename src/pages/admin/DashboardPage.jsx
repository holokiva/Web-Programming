import { useEffect, useState } from 'react'
import Loading from '../../components/Loading.jsx'
import { getApiErrorMessage } from '../../services/auth.js'
import { fetchAdminDashboard, generateDemoUsersAndReservations } from '../../services/admin.js'

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [seedLoading, setSeedLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setError('')
      setNotice('')
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

  const refreshDashboard = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetchAdminDashboard()
      setData(res)
    } catch (e) {
      setError(getApiErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  const fillDemoData = async () => {
    setError('')
    setNotice('')
    setSeedLoading(true)
    try {
      const result = await generateDemoUsersAndReservations()
      const message = result?.message || 'Demo data generated.'
      setNotice(message)
      await refreshDashboard()
    } catch (e) {
      setError(getApiErrorMessage(e))
    } finally {
      setSeedLoading(false)
    }
  }

  const summary = data?.summary || {}
  const summaryCards = [
    ['Total reservations', summary.totalReservations ?? 0],
    ['Active', summary.activeReservations ?? 0],
    ['Cancelled', summary.cancelledReservations ?? 0],
    ['Users', summary.totalUsers ?? 0],
    ['Locations', summary.totalLocations ?? 0],
    ['Rooms', summary.totalRooms ?? 0],
  ]

  const reservationsByMonth = Array.isArray(data?.reservationsByMonth) ? data.reservationsByMonth : []
  const reservationsByLocation = Array.isArray(data?.reservationsByLocation) ? data.reservationsByLocation : []
  const reservationsByStatus = Array.isArray(data?.reservationsByStatus) ? data.reservationsByStatus : []

  return (
    <section className="page-wide">
      <h1>Dashboard</h1>
      <p className="muted">Data from GET /api/admin/dashboard</p>

      <div className="form-actions">
        <button className="btn" type="button" onClick={fillDemoData} disabled={loading || seedLoading}>
          {seedLoading ? 'Generating demo data…' : 'Generate demo reservations'}
        </button>
      </div>

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

      {loading ? (
        <Loading label="Loading dashboard…" />
      ) : (
        <>
          <div className="stats-grid">
            {summaryCards.map(([label, value]) => (
              <article className="stat-card" key={label}>
                <div className="stat-label">{label}</div>
                <div className="stat-value">{value}</div>
              </article>
            ))}
          </div>

          <div className="results-block">
            <h2>Reservations by month</h2>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {reservationsByMonth.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="muted">
                        No data yet.
                      </td>
                    </tr>
                  ) : (
                    reservationsByMonth.map((item) => (
                      <tr key={item.month}>
                        <td>{item.month}</td>
                        <td>{item.count}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="dashboard-two-columns">
            <div>
              <h2>Reservations by location</h2>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Location</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservationsByLocation.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="muted">
                          No reservations yet.
                        </td>
                      </tr>
                    ) : (
                      reservationsByLocation.map((item, idx) => (
                        <tr key={`${item.name}-${idx}`}>
                          <td>{item.name}</td>
                          <td>{item.count}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2>Reservations by status</h2>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservationsByStatus.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="muted">
                          No reservations yet.
                        </td>
                      </tr>
                    ) : (
                      reservationsByStatus.map((item, idx) => (
                        <tr key={`${item.status}-${idx}`}>
                          <td>{item.status}</td>
                          <td>{item.count}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
