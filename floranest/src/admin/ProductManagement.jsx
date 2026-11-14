// src/admin/ProductManagement.jsx
import { useEffect, useState } from 'react'

const API = 'http://localhost:5000/api/admin'

const EMPTY = { name: '', description: '', price: '', image: '', category_id: '', stock_qty: '' }

export default function ProductManagement({ adminId }) {
  const [products,    setProducts]    = useState([])
  const [categories,  setCategories]  = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [modal,       setModal]       = useState(false)
  const [editing,     setEditing]     = useState(null)   // null = new, obj = editing
  const [form,        setForm]        = useState(EMPTY)
  const [saving,      setSaving]      = useState(false)
  const [msg,         setMsg]         = useState({ type: '', text: '' })

  const headers = { 'x-admin-id': adminId, 'Content-Type': 'application/json' }

  async function load() {
    setLoading(true)
    const [pr, cr] = await Promise.all([
      fetch(`${API}/products`,   { headers }).then(r => r.json()),
      fetch(`${API}/categories`, { headers }).then(r => r.json()),
    ])
    if (pr.success) setProducts(pr.products)
    if (cr.success) setCategories(cr.categories)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setEditing(null)
    setForm(EMPTY)
    setModal(true)
  }

  function openEdit(p) {
    setEditing(p)
    setForm({
      name:        p.name,
      description: p.description || '',
      price:       p.price,
      image:       p.image || '',
      category_id: p.category_id || '',
      stock_qty:   p.stock_qty,
    })
    setModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMsg({ type: '', text: '' })
    try {
      const url = editing
        ? `${API}/products/${editing.product_id}`
        : `${API}/products`
      const method = editing ? 'PUT' : 'POST'
      const res  = await fetch(url, { method, headers, body: JSON.stringify(form) })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      setMsg({ type: 'success', text: editing ? 'Product updated!' : 'Product added!' })
      setModal(false)
      load()
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this product?')) return
    const res  = await fetch(`${API}/products/${id}`, { method: 'DELETE', headers })
    const data = await res.json()
    if (data.success) { setMsg({ type: 'success', text: 'Product deleted.' }); load() }
    else setMsg({ type: 'error', text: data.message })
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category_name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div className="section-header">
        <h2>🌿 Product Management</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            className="search-bar"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="btn-primary" onClick={openNew}>+ Add Product</button>
        </div>
      </div>

      {msg.text && <div className={`admin-alert ${msg.type}`}>{msg.text}</div>}

      {loading ? <div className="admin-loading">⏳ Loading products…</div> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="admin-empty">No products found.</td></tr>
              )}
              {filtered.map(p => (
                <tr key={p.product_id}>
                  <td style={{ color: '#667366' }}>{p.product_id}</td>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.category_name || '—'}</td>
                  <td><strong style={{ color: '#285c3b' }}>₹{Number(p.price).toLocaleString('en-IN')}</strong></td>
                  <td>
                    <span className={`badge ${p.stock_qty === 0 ? 'badge-out' : p.stock_qty < 10 ? 'badge-low' : 'badge-ok'}`}>
                      {p.stock_qty === 0 ? 'Out of Stock' : p.stock_qty < 10 ? `Low (${p.stock_qty})` : p.stock_qty}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-edit btn-sm" onClick={() => openEdit(p)}>✏️ Edit</button>
                      <button className="btn-danger btn-sm" onClick={() => handleDelete(p.product_id)}>🗑️ Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModal(false) }}>
          <div className="modal-box">
            <h3>{editing ? 'Edit Product' : 'Add New Product'}</h3>
            <form className="admin-form" onSubmit={handleSave}>
              <div className="form-group">
                <label>Product Name *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input type="number" min="0" step="0.01" value={form.price}
                    onChange={e => setForm({...form, price: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Stock Qty *</label>
                  <input type="number" min="0" value={form.stock_qty}
                    onChange={e => setForm({...form, stock_qty: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}>
                  <option value="">— Select Category —</option>
                  {categories.map(c => (
                    <option key={c.category_id} value={c.category_id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Image Path (e.g. /images/rose.png)</label>
                <input value={form.image} onChange={e => setForm({...form, image: e.target.value})}
                  placeholder="/images/product.png" />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editing ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
