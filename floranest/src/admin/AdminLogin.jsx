// src/admin/AdminLogin.jsx
import { useState } from 'react'
import './admin.css'

const API = 'http://localhost:5000/api/admin'

export default function AdminLogin({ onLogin }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res  = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      // Store admin id for subsequent requests
      localStorage.setItem('floranest_admin', JSON.stringify(data.admin))
      onLogin(data.admin)
    } catch (err) {
      setError(err.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="logo-row">
          <h1>Flora<span>Nest</span></h1>
          <p>🌿 Admin Dashboard</p>
        </div>

        {error && <div className="admin-alert error">{error}</div>}

        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Admin Email</label>
            <input
              type="email"
              placeholder="admin@floranest.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            style={{ marginTop: 8, padding: '13px' }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In to Dashboard'}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: 12, color: '#667366', textAlign: 'center' }}>
          Default: admin@floranest.com / admin@floranest123
        </p>
      </div>
    </div>
  )
}
