// src/admin/Reports.jsx
import { useEffect, useState } from 'react'

const API = 'http://localhost:5000/api/admin'

const STATUS_COLORS = {
  pending:    { bg: '#fff3e0', fg: '#e65100' },
  processing: { bg: '#e3f2fd', fg: '#1565c0' },
  shipped:    { bg: '#e8eaf6', fg: '#3949ab' },
  delivered:  { bg: '#e8f5e9', fg: '#2e7d32' },
  cancelled:  { bg: '#fdecea', fg: '#c62828' },
}

export default function Reports({ adminId }) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    fetch(`${API}/reports`, { headers: { 'x-admin-id': adminId } })
      .then(r => r.json())
      .then(d => { if (d.success) setData(d); else setError(d.message) })
      .catch(() => setError('Could not load reports.'))
      .finally(() => setLoading(false))
  }, [adminId])

  if (loading) return <div className="admin-loading">⏳ Generating reports…</div>
  if (error)   return <div className="admin-alert error">{error}</div>

  const { monthlySales, topProducts, statusBreakdown } = data

  const maxMonthlyRevenue = monthlySales.length
    ? Math.max(...monthlySales.map(m => Number(m.revenue)))
    : 1

  const maxQty = topProducts.length
    ? Math.max(...topProducts.map(p => Number(p.qty_sold)))
    : 1

  return (
    <>
      <div className="section-header">
        <h2>📈 Sales Reports</h2>
        <span style={{ fontSize: 13, color: '#667366' }}>Last 6 months</span>
      </div>

      {/* Monthly Sales Chart */}
      <div className="chart-card">
        <h3>📅 Monthly Revenue (Last 6 Months)</h3>
        {monthlySales.length === 0 ? (
          <p style={{ color: '#667366' }}>No sales data yet.</p>
        ) : (
          <>
            <div className="bar-chart" style={{ marginBottom: 8 }}>
              {monthlySales.map(row => {
                const pct = maxMonthlyRevenue > 0 ? (Number(row.revenue) / maxMonthlyRevenue) * 100 : 0
                return (
                  <div key={row.month} className="bar-col">
                    <span className="bar-val">₹{Number(row.revenue).toLocaleString('en-IN')}</span>
                    <div className="bar" style={{ height: `${Math.max(pct, 3)}%` }} />
                    <span className="bar-label">{row.month}</span>
                  </div>
                )
              })}
            </div>
            <table className="admin-table" style={{ marginTop: 16 }}>
              <thead>
                <tr><th>Month</th><th>Orders</th><th>Revenue</th></tr>
              </thead>
              <tbody>
                {monthlySales.map(row => (
                  <tr key={row.month}>
                    <td>{row.month}</td>
                    <td><span className="badge badge-ok">{row.order_count}</span></td>
                    <td><strong style={{ color: '#285c3b' }}>₹{Number(row.revenue).toLocaleString('en-IN')}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Top Products */}
      <div className="chart-card">
        <h3>🌿 Top 5 Best-Selling Products</h3>
        {topProducts.length === 0 ? (
          <p style={{ color: '#667366' }}>No product sales yet.</p>
        ) : (
          <>
            {topProducts.map((p, i) => {
              const pct = maxQty > 0 ? (Number(p.qty_sold) / maxQty) * 100 : 0
              return (
                <div key={p.product_name} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 5 }}>
                    <span><strong style={{ color: '#285c3b' }}>#{i+1}</strong> {p.product_name}</span>
                    <span style={{ color: '#667366' }}>{p.qty_sold} sold · ₹{Number(p.revenue).toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ background: '#e5efdf', borderRadius: 20, height: 10 }}>
                    <div style={{
                      width: `${pct}%`, height: '100%',
                      background: '#285c3b', borderRadius: 20,
                      transition: 'width 0.5s',
                    }} />
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>

      {/* Order Status Breakdown */}
      <div className="chart-card">
        <h3>🛒 Orders by Status</h3>
        {statusBreakdown.length === 0 ? (
          <p style={{ color: '#667366' }}>No orders yet.</p>
        ) : (
          <div className="status-breakdown">
            {statusBreakdown.map(s => {
              const col = STATUS_COLORS[s.status] || { bg: '#f5f5f5', fg: '#555' }
              return (
                <div key={s.status} className="status-chip"
                  style={{ background: col.bg, color: col.fg }}>
                  <span className="chip-num">{s.count}</span>
                  <span className="chip-label">{s.status.charAt(0).toUpperCase() + s.status.slice(1)}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
