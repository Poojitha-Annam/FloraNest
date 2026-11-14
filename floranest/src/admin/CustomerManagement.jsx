// src/admin/CustomerManagement.jsx
import { useEffect, useState } from 'react'

const API = 'http://localhost:5000/api/admin'

export default function CustomerManagement({ adminId }) {
  const [customers, setCustomers] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')

  const headers = { 'x-admin-id': adminId }

  useEffect(() => {
    fetch(`${API}/customers`, { headers })
      .then(r => r.json())
      .then(data => { if (data.success) setCustomers(data.customers) })
      .finally(() => setLoading(false))
  }, [])

  const filtered = customers.filter(c =>
    !search ||
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.city || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div className="section-header">
        <h2>👥 Customer Management</h2>
        <input className="search-bar" placeholder="Search customers…" value={search}
          onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? <div className="admin-loading">⏳ Loading customers…</div> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>City</th>
                <th>Pincode</th>
                <th>Orders</th>
                <th>Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="admin-empty">No customers found.</td></tr>
              )}
              {filtered.map((c, i) => (
                <tr key={c.customer_id}>
                  <td style={{ color: '#667366' }}>{i + 1}</td>
                  <td><strong>{c.full_name}</strong></td>
                  <td style={{ fontSize: 13 }}>{c.email}</td>
                  <td>{c.city || '—'}</td>
                  <td style={{ color: '#667366' }}>{c.pincode || '—'}</td>
                  <td>
                    <span className="badge badge-ok">{c.total_orders}</span>
                  </td>
                  <td><strong style={{ color: '#285c3b' }}>₹{Number(c.total_spent).toLocaleString('en-IN')}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary bar */}
      {!loading && (
        <div className="chart-card" style={{ marginTop: 20 }}>
          <h3>📊 Summary</h3>
          <div className="stat-grid" style={{ marginBottom: 0 }}>
            <div className="stat-card">
              <div className="stat-icon blue">👥</div>
              <div className="stat-info">
                <h3>{customers.length}</h3>
                <p>Total Customers</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">💰</div>
              <div className="stat-info">
                <h3>₹{customers.reduce((s,c) => s + Number(c.total_spent), 0).toLocaleString('en-IN')}</h3>
                <p>Total Revenue</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange">🛒</div>
              <div className="stat-info">
                <h3>{customers.reduce((s,c) => s + Number(c.total_orders), 0)}</h3>
                <p>Total Orders</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
