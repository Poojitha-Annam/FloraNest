// orderTrackingRoutes.js
// Public-facing order tracking API (no admin auth needed)
// GET /api/track/:orderId  — returns order + items + status timeline

const express = require('express')
const db      = require('./db')
const router  = express.Router()

// Status timeline definition — the fixed progression
const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered']

// GET /api/track/:orderId
// Customer looks up their order by order ID + email (privacy guard)
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params
    const { email }   = req.query   // ?email=customer@email.com

    if (!orderId || isNaN(Number(orderId))) {
      return res.status(400).json({ success: false, message: 'Invalid order ID.' })
    }

    // Fetch order + joined customer
    const [orders] = await db.execute(
      `SELECT
         o.order_id,
         o.total_amount,
         o.status,
         o.created_at,
         c.full_name   AS customer_name,
         c.email       AS customer_email,
         c.city,
         c.address,
         c.pincode
       FROM orders o
       JOIN customers c ON o.customer_id = c.customer_id
       WHERE o.order_id = ?`,
      [orderId]
    )

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' })
    }

    const order = orders[0]

    // Privacy: if email provided, it must match (case-insensitive)
    if (email && order.customer_email.toLowerCase() !== email.trim().toLowerCase()) {
      return res.status(403).json({ success: false, message: 'Order details do not match.' })
    }

    // Fetch order items
    const [items] = await db.execute(
      `SELECT product_name, quantity, price
       FROM order_items
       WHERE order_id = ?`,
      [orderId]
    )

    // Build timeline: each step is marked as done/active/upcoming
    const currentIndex  = STATUS_STEPS.indexOf(order.status)
    const isCancelled   = order.status === 'cancelled'

    const timeline = STATUS_STEPS.map((step, idx) => ({
      step,
      label: step.charAt(0).toUpperCase() + step.slice(1),
      done:   !isCancelled && idx < currentIndex,
      active: !isCancelled && idx === currentIndex,
      upcoming: isCancelled || idx > currentIndex,
    }))

    return res.json({
      success: true,
      order: {
        orderId:       order.order_id,
        status:        order.status,
        totalAmount:   order.total_amount,
        createdAt:     order.created_at,
        customerName:  order.customer_name,
        customerEmail: order.customer_email,
        city:          order.city,
        isCancelled,
      },
      items,
      timeline,
    })
  } catch (err) {
    console.error('Order tracking error:', err.message)
    return res.status(500).json({ success: false, message: 'Could not fetch order details.' })
  }
})

module.exports = router
