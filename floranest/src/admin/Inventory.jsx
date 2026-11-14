// src/admin/Inventory.jsx
import { useEffect, useState } from 'react'

const API = 'http://localhost:5000/api/admin'

export default function Inventory({ adminId }) {
  const [inventory, setInventory] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [editing,   setEditing]   = useState(null)   // { id, qty }
  const [msg,       setMsg]       = useState({ type: '', text: '' })
  const [filter,    setFilter]    = useState('all')   // all | low | out

  const headers = { 'x-admin-id': adminId, 'Content-Type': 'application/json' }

  async function load() {
    setLoading(true)
    const res  = await fetch(`${API}/inventory`, { headers })
    const data = await res.json()
    if (data.success) setInventory(data.inventory)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function saveStock() {
    if (editing === null) return
    try {
      const res  = await fetch(`${API}/inventory/${editing.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ stock_qty: editing.qty }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      setMsg({ type: 'success', text: 'Stock updated!' })
      setEditing(null)
      load()
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    }
  }

  const filtered = inventory.filter(item => {
    if (filter === 'low') return item.stock_status === 'low'
    if (filter === 'out') return item.stock_status === 'out_of_stock'
    return true
  })

  const low    = inventory.filter(i => i.stock_status === 'low').length
  const out    = inventory.filter(i => i.stock_status === 'out_of_stock').length

  return (
    <>
      <div className="section-header">
        <h2>📦 Inventory Tracker</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'low', 'out'].map(f => (
            <button
              key={f}
              className={filter === f ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? `All (${inventory.length})` : f === 'low' ? `⚠️ Low (${low})` : `🚫 Out (${out})`}
            </button>
          ))}
        </div>
      </div>

      {msg.text && <div className={`admin-alert ${msg.type}`} onClick={() => setMsg({type:'',text:''})}>{msg.text}</div>}

      {loading ? <div className="admin-loading">⏳ Loading inventory…</div> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Update Stock</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="admin-empty">No items match this filter.</td></tr>
              )}
              {filtered.map(item => (
                <tr key={item.product_id}>
                  <td><strong>{item.name}</strong></td>
                  <td>{item.category_name || '—'}</td>
                  <td><strong style={{ color: '#285c3b' }}>₹{Number(item.price).toLocaleString('en-IN')}</strong></td>
                  <td>
                    {editing && editing.id === item.product_id ? (
                      <input
                        type="number"
                        min="0"
                        value={editing.qty}
                        onChange={e => setEditing({ ...editing, qty: Number(e.target.value) })}
                        style={{ width: 70, padding: '5px 8px', borderRadius: 6, border: '1px solid #cbd8c5' }}
                      />
                    ) : (
                      <strong>{item.stock_qty}</strong>
                    )}
                  </td>
                  <td>
                    <span className={
                      item.stock_status === 'out_of_stock' ? 'badge badge-out' :
                      item.stock_status === 'low'          ? 'badge badge-low' :
                                                             'badge badge-ok'
                    }>
                      {item.stock_status === 'out_of_stock' ? 'Out of Stock' :
                       item.stock_status === 'low'          ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      {editing && editing.id === item.product_id ? (
                        <>
                          <button className="btn-primary btn-sm" onClick={saveStock}>✅ Save</button>
                          <button className="btn-secondary btn-sm" onClick={() => setEditing(null)}>Cancel</button>
                        </>
                      ) : (
                        <button className="btn-edit btn-sm"
                          onClick={() => setEditing({ id: item.product_id, qty: item.stock_qty })}>
                          ✏️ Edit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
