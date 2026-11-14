// src/admin/CategoryManagement.jsx
import { useEffect, useState } from 'react'

const API = 'http://localhost:5000/api/admin'
const EMPTY = { name: '', slug: '' }

export default function CategoryManagement({ adminId }) {
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [modal,      setModal]      = useState(false)
  const [editing,    setEditing]    = useState(null)
  const [form,       setForm]       = useState(EMPTY)
  const [saving,     setSaving]     = useState(false)
  const [msg,        setMsg]        = useState({ type: '', text: '' })

  const headers = { 'x-admin-id': adminId, 'Content-Type': 'application/json' }

  async function load() {
    setLoading(true)
    const res  = await fetch(`${API}/categories`, { headers })
    const data = await res.json()
    if (data.success) setCategories(data.categories)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function autoSlug(name) {
    return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  function openNew() {
    setEditing(null)
    setForm(EMPTY)
    setModal(true)
  }

  function openEdit(c) {
    setEditing(c)
    setForm({ name: c.name, slug: c.slug })
    setModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMsg({ type: '', text: '' })
    try {
      const url    = editing ? `${API}/categories/${editing.category_id}` : `${API}/categories`
      const method = editing ? 'PUT' : 'POST'
      const res    = await fetch(url, { method, headers, body: JSON.stringify(form) })
      const data   = await res.json()
      if (!data.success) throw new Error(data.message)
      setMsg({ type: 'success', text: editing ? 'Category updated!' : 'Category added!' })
      setModal(false)
      load()
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this category? Products using it will become uncategorised.')) return
    const res  = await fetch(`${API}/categories/${id}`, { method: 'DELETE', headers })
    const data = await res.json()
    if (data.success) { setMsg({ type: 'success', text: 'Category deleted.' }); load() }
    else setMsg({ type: 'error', text: data.message })
  }

  return (
    <>
      <div className="section-header">
        <h2>🏷️ Category Management</h2>
        <button className="btn-primary" onClick={openNew}>+ Add Category</button>
      </div>

      {msg.text && <div className={`admin-alert ${msg.type}`}>{msg.text}</div>}

      {loading ? <div className="admin-loading">⏳ Loading categories…</div> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>#</th><th>Name</th><th>Slug</th><th>Products</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {categories.length === 0 && (
                <tr><td colSpan={5} className="admin-empty">No categories yet.</td></tr>
              )}
              {categories.map(c => (
                <tr key={c.category_id}>
                  <td style={{ color: '#667366' }}>{c.category_id}</td>
                  <td><strong>{c.name}</strong></td>
                  <td><code style={{ background: '#f0f4eb', padding: '2px 7px', borderRadius: 4, fontSize: 13 }}>{c.slug}</code></td>
                  <td><span className="badge badge-ok">{c.product_count}</span></td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-edit btn-sm"   onClick={() => openEdit(c)}>✏️ Edit</button>
                      <button className="btn-danger btn-sm" onClick={() => handleDelete(c.category_id)}>🗑️ Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModal(false) }}>
          <div className="modal-box">
            <h3>{editing ? 'Edit Category' : 'Add New Category'}</h3>
            <form className="admin-form" onSubmit={handleSave}>
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ name: e.target.value, slug: autoSlug(e.target.value) })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Slug (auto-generated, editable)</label>
                <input
                  value={form.slug}
                  onChange={e => setForm({...form, slug: e.target.value})}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit"  className="btn-primary"   disabled={saving}>
                  {saving ? 'Saving…' : editing ? 'Update' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
