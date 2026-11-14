// src/admin/OrderManagement.jsx
import { useEffect, useState } from 'react'

const API = 'http://localhost:5000/api/admin'
const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export default function OrderManagement({ adminId }) {
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('all')
  const [items,    setItems]    = useState({ orderId: null, data: [] })
  const [msg,      setMsg]      = useState({ type: '', text: '' })

  const headers = { 'x-admin-id': adminId, 'Content-Type': 'application/json' }

  async function load() {
    setLoading(true)
    const res  = await fetch(`${API}/orders`, { headers })
    const data = await res.json()
    if (data.success) setOrders(data.orders)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function updateStatus(orderId, status) {
    const res  = await fetch(`${API}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    })
    const data = await res.json()
    if (data.success) {
      setMsg({ type: 'success', text: `Order #${orderId} → ${status}` })
      load()
    } else {
      setMsg({ type: 'error', text: data.message })
    }
  }

  async function viewItems(orderId) {
    if (items.orderId === orderId) { setItems({ orderId: null, data: [] }); return }
    const res  = await fetch(`${API}/orders/${orderId}/items`, { headers })
    const data = await res.json()
    setItems({ orderId, data: data.items || [] })
  }

  const filtered = orders.filter(o => {
    const matchSearch = !search ||
      o.order_id.toString().includes(search) ||
      (o.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.customer_email || '').toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || o.status === filter
    return matchSearch && matchFilter
  })

  const badgeClass = s => `badge badge-${s}`

  return (
    <>
      <div className="section-header">
        <h2>🛒 Order Management</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="search-bar" placeholder="Search orders…" value={search}
            onChange={e => setSearch(e.target.value)} />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ padding: '10px 12px', border: '1px solid #cbd8c5', borderRadius: 8, fontSize: 14 }}
          >
            <option value="all">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {msg.text && <div className={`admin-alert ${msg.type}`} onClick={() => setMsg({type:'',text:''})}>{msg.text}</div>}

      {loading ? <div className="admin-loading">⏳ Loading orders…</div> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>City</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="admin-empty">No orders found.</td></tr>
              )}
              {filtered.map(o => (
                <>
                  <tr key={o.order_id}>
                    <td><strong>#{o.order_id}</strong></td>
                    <td>
                      <div><strong>{o.customer_name}</strong></div>
                      <div style={{ fontSize: 12, color: '#667366' }}>{o.customer_email}</div>
                    </td>
                    <td>{o.city || '—'}</td>
                    <td><strong style={{ color: '#285c3b' }}>₹{Number(o.total_amount).toLocaleString('en-IN')}</strong></td>
                    <td><span className={badgeClass(o.status)}>{o.status}</span></td>
                    <td style={{ fontSize: 13, color: '#667366' }}>
                      {o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td>
                      <div className="action-btns" style={{ flexWrap: 'wrap' }}>
                        <select
                          value={o.status}
                          onChange={e => updateStatus(o.order_id, e.target.value)}
                          style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid #cbd8c5', fontSize: 13 }}
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button className="btn-secondary btn-sm" onClick={() => viewItems(o.order_id)}>
                          {items.orderId === o.order_id ? '▲ Hide' : '▼ Items'}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Expandable items row */}
                  {items.orderId === o.order_id && (
                    <tr key={`${o.order_id}-items`}>
                      <td colSpan={7} style={{ background: '#f9faf8', padding: '0 16px 16px' }}>
                        <div style={{ marginTop: 12 }}>
                          <strong style={{ color: '#285c3b' }}>Order Items:</strong>
                          <table style={{ width: '100%', marginTop: 8, borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ background: '#e5efdf' }}>
                                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12 }}>Product</th>
                                <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: 12 }}>Qty</th>
                                <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12 }}>Unit Price</th>
                                <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12 }}>Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {items.data.map((it, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #e3e9df' }}>
                                  <td style={{ padding: '8px 12px' }}>{it.product_name}</td>
                                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>{it.quantity}</td>
                                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>₹{Number(it.price).toLocaleString('en-IN')}</td>
                                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>
                                    ₹{(it.quantity * it.price).toLocaleString('en-IN')}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
