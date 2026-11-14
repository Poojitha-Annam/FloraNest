// src/pages/OrderTracking.jsx
// Customer-facing order tracking page
// Shows: search form → order details → visual timeline → items table

import { useState } from 'react'

const API = 'http://localhost:5000/api/track'

// The 4 steps shown on the timeline (cancelled is handled separately)
const STEPS = [
  { key: 'pending',    icon: '🛒', label: 'Order Placed'  },
  { key: 'processing', icon: '⚙️', label: 'Confirmed'     },
  { key: 'shipped',    icon: '🚚', label: 'Shipped'       },
  { key: 'delivered',  icon: '✅', label: 'Delivered'     },
]

export default function OrderTracking({ initialOrderId = '' }) {
  const [orderId,  setOrderId]  = useState(initialOrderId ? String(initialOrderId) : '')
  const [email,    setEmail]    = useState('')
  const [result,   setResult]   = useState(null)   // { order, items, timeline }
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleSearch(e) {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)

    try {
      const url  = email
        ? `${API}/${orderId.trim()}?email=${encodeURIComponent(email.trim())}`
        : `${API}/${orderId.trim()}`

      const res  = await fetch(url)
      const data = await res.json()

      if (!data.success) throw new Error(data.message)
      setResult(data)
    } catch (err) {
      setError(err.message || 'Could not find that order. Please check your details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="tracking-page">
      {/* ── Header ── */}
      <section className="tracking-hero">
        <p className="tagline">YOUR ORDER JOURNEY</p>
        <h1>Track Your Order</h1>
        <p className="tracking-sub">
          Enter your Order ID to see real-time delivery status.
        </p>
      </section>

      {/* ── Search Form ── */}
      <section className="tracking-search-wrap">
        <form className="tracking-search-form" onSubmit={handleSearch}>
          <div className="tracking-field">
            <label htmlFor="track-order-id">Order ID *</label>
            <input
              id="track-order-id"
              type="number"
              min="1"
              placeholder="e.g. 42"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              required
            />
          </div>
          <div className="tracking-field">
            <label htmlFor="track-email">Email (optional — for privacy)</label>
            <input
              id="track-email"
              type="email"
              placeholder="Your order email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" className="shop-button tracking-btn" disabled={loading}>
            {loading ? '🔍 Searching…' : '🔍 Track Order'}
          </button>
        </form>

        {error && (
          <div className="tracking-error">
            ⚠️ {error}
          </div>
        )}
      </section>

      {/* ── Result ── */}
      {result && <TrackingResult data={result} />}
    </main>
  )
}

/* ─────────────────────────────────────────────
   TrackingResult — renders when order is found
   ───────────────────────────────────────────── */
function TrackingResult({ data }) {
  const { order, items, timeline } = data

  const placedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '—'

  return (
    <section className="tracking-result">

      {/* ── Order Summary Card ── */}
      <div className="tracking-card">
        <div className="tracking-card-header">
          <div>
            <h2>Order <span className="tracking-id">#{order.orderId}</span></h2>
            <p className="tracking-date">Placed on {placedDate}</p>
          </div>
          <span className={`tracking-status-badge status-${order.status}`}>
            {order.isCancelled ? '❌ Cancelled' : statusLabel(order.status)}
          </span>
        </div>

        <div className="tracking-meta">
          <div className="tracking-meta-item">
            <span className="meta-label">Customer</span>
            <span className="meta-value">{order.customerName}</span>
          </div>
          <div className="tracking-meta-item">
            <span className="meta-label">City</span>
            <span className="meta-value">{order.city || '—'}</span>
          </div>
          <div className="tracking-meta-item">
            <span className="meta-label">Total</span>
            <span className="meta-value tracking-total">
              ₹{Number(order.totalAmount).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* ── Visual Timeline ── */}
      <div className="tracking-card">
        <h3 className="tracking-section-title">📍 Delivery Timeline</h3>

        {order.isCancelled ? (
          <div className="tracking-cancelled-msg">
            ❌ This order has been cancelled.
          </div>
        ) : (
          <div className="tracking-timeline">
            {STEPS.map((step, idx) => {
              const info = timeline.find(t => t.step === step.key) || {}
              return (
                <div
                  key={step.key}
                  className={`timeline-step ${
                    info.done   ? 'done'   :
                    info.active ? 'active' : 'upcoming'
                  }`}
                >
                  {/* Connector line (not shown before first item) */}
                  {idx > 0 && (
                    <div className={`timeline-connector ${
                      info.done || info.active ? 'filled' : ''
                    }`} />
                  )}

                  {/* Circle */}
                  <div className="timeline-circle">
                    {info.done   ? '✓'      :
                     info.active ? step.icon :
                                   step.icon}
                  </div>

                  {/* Label */}
                  <div className="timeline-label">
                    <span className="timeline-step-name">{step.label}</span>
                    {info.active && (
                      <span className="timeline-active-tag">Current</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Latest status message */}
        {!order.isCancelled && (
          <div className="tracking-latest-status">
            <span className="latest-label">Latest Update:</span>
            <span className="latest-value">{latestMessage(order.status)}</span>
          </div>
        )}
      </div>

      {/* ── Items Table ── */}
      <div className="tracking-card">
        <h3 className="tracking-section-title">🌿 Order Items</h3>
        <div className="tracking-items-table-wrap">
          <table className="tracking-items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i}>
                  <td>{item.product_name}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-right">₹{Number(item.price).toLocaleString('en-IN')}</td>
                  <td className="text-right">
                    <strong>₹{(item.quantity * item.price).toLocaleString('en-IN')}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="text-right tracking-tfoot-label">Total</td>
                <td className="text-right tracking-tfoot-total">
                  ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </section>
  )
}

/* ── Helpers ── */
function statusLabel(status) {
  const labels = {
    pending:    '⏳ Order Placed',
    processing: '⚙️ Confirmed',
    shipped:    '🚚 Shipped',
    delivered:  '✅ Delivered',
  }
  return labels[status] || status
}

function latestMessage(status) {
  const msgs = {
    pending:    'Your order has been received and is awaiting confirmation.',
    processing: 'Your order is confirmed and is being prepared.',
    shipped:    'Your order is on its way! Expect delivery soon.',
    delivered:  'Your order has been delivered. Enjoy your plants! 🌱',
  }
  return msgs[status] || 'Status updated.'
}
