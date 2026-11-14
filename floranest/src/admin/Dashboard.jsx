// src/admin/Dashboard.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API = 'http://localhost:5000/api/admin'

export default function Dashboard({ adminId }) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${API}/dashboard`, {
      headers: { 'x-admin-id': adminId },
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) setData(d)
        else setError(d.message || 'Failed to load.')
      })
      .catch(() => setError('Could not reach the server. Make sure the backend is running on port 5000.'))
      .finally(() => setLoading(false))
  }, [adminId])

  if (loading) {
    return (
      <div className="admin-loading">
        <span>⏳</span>
        <span>Loading dashboard…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-alert error" style={{ maxWidth: 520 }}>
        ⚠️ {error}
      </div>
    )
  }

  const { stats, recentSales } = data

  // FIX: bar heights are computed as pixel values, not percentages,
  // because the bar-chart container has a fixed px height (150px).
  // Using % inside a fixed-height flex container is unreliable.
  const CHART_HEIGHT = 110 // px — the usable bar area
  const maxRevenue   = recentSales.length
    ? Math.max(...recentSales.map(s => Number(s.revenue)))
    : 1

  return (
    <>
      {/* ── Stat Cards ── */}
      <div className="stat-grid">
        <StatCard icon="💰" color="green"  label="Total Revenue"  value={`₹${Number(stats.totalRevenue).toLocaleString('en-IN')}`} />
        <StatCard icon="🛒" color="orange" label="Total Orders"   value={stats.totalOrders} />
        <StatCard icon="🌿" color="green"  label="Products"       value={stats.totalProducts} />
        <StatCard icon="👥" color="blue"   label="Customers"      value={stats.totalCustomers} />
        <StatCard icon="⚠️" color="red"    label="Low Stock"      value={stats.lowStock} />
        <StatCard icon="⏳" color="orange" label="Pending Orders" value={stats.pendingOrders} />
      </div>

      {/* ── Recent Sales Chart ── */}
      <div className="chart-card">
        <h3>📅 Sales — Last 7 Days</h3>

        {recentSales.length === 0 ? (
          <p style={{ color: '#667366', fontSize: 14 }}>
            No sales recorded in the last 7 days. Place a test order to see data here.
          </p>
        ) : (
          /* FIX: bar heights use px so they always render correctly */
          <div className="bar-chart" style={{ alignItems: 'flex-end', height: `${CHART_HEIGHT + 44}px` }}>
            {recentSales.map(row => {
              const revenue = Number(row.revenue)
              const barH    = maxRevenue > 0
                ? Math.max(Math.round((revenue / maxRevenue) * CHART_HEIGHT), 6)
                : 6

              return (
                <div key={row.day} className="bar-col" style={{ justifyContent: 'flex-end' }}>
                  <span className="bar-val">
                    ₹{revenue >= 1000
                      ? `${(revenue / 1000).toFixed(1)}k`
                      : revenue.toLocaleString('en-IN')}
                  </span>
                  <div
                    className="bar"
                    style={{ height: barH, width: '100%' }}
                    title={`₹${revenue.toLocaleString('en-IN')}`}
                  />
                  <span className="bar-label">
                    {new Date(row.day).toLocaleDateString('en-IN', {
                      month: 'short',
                      day:   'numeric',
                    })}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Quick Actions ── */}
      <div className="chart-card">
        <h3>🚀 Quick Actions</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
          <QuickBtn onClick={() => navigate('/admin/products')}  label="➕ Add Product" />
          <QuickBtn onClick={() => navigate('/admin/orders')}    label="📋 View Orders" />
          <QuickBtn onClick={() => navigate('/admin/inventory')} label="📦 Check Stock" />
          <QuickBtn onClick={() => navigate('/admin/reports')}   label="📈 Reports" />
        </div>
      </div>
    </>
  )
}

/* ── Sub-components ── */

function StatCard({ icon, color, label, value }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div className="stat-info">
        <h3>{value ?? '—'}</h3>
        <p>{label}</p>
      </div>
    </div>
  )
}

function QuickBtn({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding:        '10px 18px',
        background:     '#e5efdf',
        border:         'none',
        borderRadius:   8,
        color:          '#285c3b',
        fontWeight:     700,
        fontSize:       13.5,
        cursor:         'pointer',
        transition:     'background 0.18s ease',
        whiteSpace:     'nowrap',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#cde0c5')}
      onMouseLeave={e => (e.currentTarget.style.background = '#e5efdf')}
    >
      {label}
    </button>
  )
}
