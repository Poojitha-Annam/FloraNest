// ============================================================
// adminRoutes.js — All Admin API endpoints for FloraNest
// ============================================================

const express = require('express')
const bcrypt = require('bcryptjs')
const db = require('./db')

const router = express.Router()

// ─── Simple token check middleware ───────────────────────────
// The token is just the admin_id stored as a plain string in
// localStorage on the client. For a production app you would
// use JWT, but this keeps things simple.
function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-id']
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' })
  }
  next()
}

// ─── ADMIN LOGIN ─────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' })
    }

    const [rows] = await db.execute(
      'SELECT admin_id, name, email, password_hash FROM admins WHERE email = ?',
      [email.trim().toLowerCase()]
    )

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' })
    }

    const admin = rows[0]
    const match = await bcrypt.compare(password, admin.password_hash)

    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' })
    }

    return res.json({
      success: true,
      message: 'Login successful!',
      admin: { id: admin.admin_id, name: admin.name, email: admin.email },
    })
  } catch (err) {
    console.error('Admin login error:', err.message)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
})

// ─── DASHBOARD STATS ─────────────────────────────────────────
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    const [[{ totalOrders }]] = await db.execute('SELECT COUNT(*) AS totalOrders FROM orders')
    const [[{ totalRevenue }]] = await db.execute(
      "SELECT COALESCE(SUM(total_amount),0) AS totalRevenue FROM orders WHERE status != 'cancelled'"
    )
    const [[{ totalProducts }]] = await db.execute('SELECT COUNT(*) AS totalProducts FROM products')
    const [[{ totalCustomers }]] = await db.execute('SELECT COUNT(*) AS totalCustomers FROM customers')
    const [[{ lowStock }]] = await db.execute(
      'SELECT COUNT(*) AS lowStock FROM products WHERE stock_qty < 10'
    )
    const [[{ pendingOrders }]] = await db.execute(
      "SELECT COUNT(*) AS pendingOrders FROM orders WHERE status = 'pending'"
    )

    // Last 7 days sales
    const [recentSales] = await db.execute(`
      SELECT DATE(created_at) AS day, SUM(total_amount) AS revenue
      FROM orders
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        AND status != 'cancelled'
      GROUP BY DATE(created_at)
      ORDER BY day ASC
    `)

    return res.json({
      success: true,
      stats: { totalOrders, totalRevenue, totalProducts, totalCustomers, lowStock, pendingOrders },
      recentSales,
    })
  } catch (err) {
    console.error('Dashboard error:', err.message)
    return res.status(500).json({ success: false, message: 'Could not load dashboard.' })
  }
})

// ─── PRODUCTS ────────────────────────────────────────────────

// GET all products
router.get('/products', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT p.product_id, p.name, p.description, p.price, p.image,
             p.stock_qty, p.created_at, c.name AS category_name, c.category_id
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      ORDER BY p.product_id ASC
    `)
    return res.json({ success: true, products: rows })
  } catch (err) {
    console.error('Get products error:', err.message)
    return res.status(500).json({ success: false, message: 'Could not fetch products.' })
  }
})

// POST create product
router.post('/products', requireAdmin, async (req, res) => {
  try {
    const { name, description, price, image, category_id, stock_qty } = req.body
    if (!name || price == null) {
      return res.status(400).json({ success: false, message: 'Name and price are required.' })
    }
    const [result] = await db.execute(
      'INSERT INTO products (name, description, price, image, category_id, stock_qty) VALUES (?,?,?,?,?,?)',
      [name, description || '', price, image || '', category_id || null, stock_qty || 0]
    )
    return res.status(201).json({ success: true, productId: result.insertId })
  } catch (err) {
    console.error('Create product error:', err.message)
    return res.status(500).json({ success: false, message: 'Could not create product.' })
  }
})

// PUT update product
router.put('/products/:id', requireAdmin, async (req, res) => {
  try {
    const { name, description, price, image, category_id, stock_qty } = req.body
    await db.execute(
      'UPDATE products SET name=?, description=?, price=?, image=?, category_id=?, stock_qty=? WHERE product_id=?',
      [name, description, price, image, category_id || null, stock_qty, req.params.id]
    )
    return res.json({ success: true, message: 'Product updated.' })
  } catch (err) {
    console.error('Update product error:', err.message)
    return res.status(500).json({ success: false, message: 'Could not update product.' })
  }
})

// DELETE product
router.delete('/products/:id', requireAdmin, async (req, res) => {
  try {
    await db.execute('DELETE FROM products WHERE product_id = ?', [req.params.id])
    return res.json({ success: true, message: 'Product deleted.' })
  } catch (err) {
    console.error('Delete product error:', err.message)
    return res.status(500).json({ success: false, message: 'Could not delete product.' })
  }
})

// ─── CATEGORIES ──────────────────────────────────────────────

router.get('/categories', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT c.category_id, c.name, c.slug,
             COUNT(p.product_id) AS product_count
      FROM categories c
      LEFT JOIN products p ON c.category_id = p.category_id
      GROUP BY c.category_id
      ORDER BY c.category_id ASC
    `)
    return res.json({ success: true, categories: rows })
  } catch (err) {
    console.error('Get categories error:', err.message)
    return res.status(500).json({ success: false, message: 'Could not fetch categories.' })
  }
})

router.post('/categories', requireAdmin, async (req, res) => {
  try {
    const { name, slug } = req.body
    if (!name || !slug) return res.status(400).json({ success: false, message: 'Name and slug required.' })
    const [result] = await db.execute(
      'INSERT INTO categories (name, slug) VALUES (?,?)',
      [name, slug]
    )
    return res.status(201).json({ success: true, categoryId: result.insertId })
  } catch (err) {
    console.error('Create category error:', err.message)
    return res.status(500).json({ success: false, message: 'Could not create category.' })
  }
})

router.put('/categories/:id', requireAdmin, async (req, res) => {
  try {
    const { name, slug } = req.body
    await db.execute('UPDATE categories SET name=?, slug=? WHERE category_id=?', [name, slug, req.params.id])
    return res.json({ success: true, message: 'Category updated.' })
  } catch (err) {
    console.error('Update category error:', err.message)
    return res.status(500).json({ success: false, message: 'Could not update category.' })
  }
})

router.delete('/categories/:id', requireAdmin, async (req, res) => {
  try {
    await db.execute('DELETE FROM categories WHERE category_id=?', [req.params.id])
    return res.json({ success: true, message: 'Category deleted.' })
  } catch (err) {
    console.error('Delete category error:', err.message)
    return res.status(500).json({ success: false, message: 'Could not delete category.' })
  }
})

// ─── INVENTORY ───────────────────────────────────────────────

router.get('/inventory', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT p.product_id, p.name, p.stock_qty, p.price,
             c.name AS category_name,
             CASE
               WHEN p.stock_qty = 0 THEN 'out_of_stock'
               WHEN p.stock_qty < 10 THEN 'low'
               ELSE 'ok'
             END AS stock_status
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      ORDER BY p.stock_qty ASC
    `)
    return res.json({ success: true, inventory: rows })
  } catch (err) {
    console.error('Inventory error:', err.message)
    return res.status(500).json({ success: false, message: 'Could not fetch inventory.' })
  }
})

// PATCH — update stock only
router.patch('/inventory/:id', requireAdmin, async (req, res) => {
  try {
    const { stock_qty } = req.body
    if (stock_qty == null) return res.status(400).json({ success: false, message: 'stock_qty required.' })
    await db.execute('UPDATE products SET stock_qty=? WHERE product_id=?', [stock_qty, req.params.id])
    return res.json({ success: true, message: 'Stock updated.' })
  } catch (err) {
    console.error('Update stock error:', err.message)
    return res.status(500).json({ success: false, message: 'Could not update stock.' })
  }
})

// ─── ORDERS ──────────────────────────────────────────────────

router.get('/orders', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT o.order_id, o.total_amount, o.status, o.created_at,
             c.full_name AS customer_name, c.email AS customer_email, c.city
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.customer_id
      ORDER BY o.order_id DESC
    `)
    return res.json({ success: true, orders: rows })
  } catch (err) {
    console.error('Get orders error:', err.message)
    return res.status(500).json({ success: false, message: 'Could not fetch orders.' })
  }
})

// GET order items for a specific order
router.get('/orders/:id/items', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM order_items WHERE order_id = ?',
      [req.params.id]
    )
    return res.json({ success: true, items: rows })
  } catch (err) {
    console.error('Get order items error:', err.message)
    return res.status(500).json({ success: false, message: 'Could not fetch order items.' })
  }
})

// PATCH update order status
router.patch('/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' })
    }
    await db.execute('UPDATE orders SET status=? WHERE order_id=?', [status, req.params.id])
    return res.json({ success: true, message: 'Order status updated.' })
  } catch (err) {
    console.error('Update order status error:', err.message)
    return res.status(500).json({ success: false, message: 'Could not update status.' })
  }
})

// ─── CUSTOMERS ───────────────────────────────────────────────

router.get('/customers', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT c.customer_id, c.full_name, c.email, c.city, c.pincode,
             COUNT(o.order_id) AS total_orders,
             COALESCE(SUM(o.total_amount), 0) AS total_spent
      FROM customers c
      LEFT JOIN orders o ON c.customer_id = o.customer_id
      GROUP BY c.customer_id
      ORDER BY total_spent DESC
    `)
    return res.json({ success: true, customers: rows })
  } catch (err) {
    console.error('Get customers error:', err.message)
    return res.status(500).json({ success: false, message: 'Could not fetch customers.' })
  }
})

// ─── REPORTS ─────────────────────────────────────────────────

router.get('/reports', requireAdmin, async (req, res) => {
  try {
    // Monthly revenue (last 6 months)
    const [monthlySales] = await db.execute(`
      SELECT DATE_FORMAT(created_at, '%b %Y') AS month,
             SUM(total_amount) AS revenue,
             COUNT(*) AS order_count
      FROM orders
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        AND status != 'cancelled'
      GROUP BY YEAR(created_at), MONTH(created_at)
      ORDER BY YEAR(created_at), MONTH(created_at) ASC
    `)

    // Top 5 selling products
    const [topProducts] = await db.execute(`
      SELECT oi.product_name, SUM(oi.quantity) AS qty_sold,
             SUM(oi.quantity * oi.price) AS revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.order_id
      WHERE o.status != 'cancelled'
      GROUP BY oi.product_name
      ORDER BY qty_sold DESC
      LIMIT 5
    `)

    // Order status breakdown
    const [statusBreakdown] = await db.execute(`
      SELECT status, COUNT(*) AS count
      FROM orders
      GROUP BY status
    `)

    return res.json({ success: true, monthlySales, topProducts, statusBreakdown })
  } catch (err) {
    console.error('Reports error:', err.message)
    return res.status(500).json({ success: false, message: 'Could not generate reports.' })
  }
})

module.exports = router
