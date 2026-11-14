
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const db = require('./db')
const bcrypt = require('bcryptjs')
const adminRoutes = require('./adminRoutes')
const orderTrackingRoutes = require('./orderTrackingRoutes')


const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Admin routes
app.use('/api/admin', adminRoutes)
// Order tracking routes (public)
app.use('/api/track', orderTrackingRoutes)


// Home route
app.get('/', (req, res) => {
  res.send('Welcome to the FloraNest API!')
})

// Check backend and MySQL connection
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1')

    res.json({
      success: true,
      message: 'FloraNest backend and MySQL are connected!',
    })
  } catch (error) {
    console.error('Health check failed:', error.message)

    res.status(500).json({
      success: false,
      message: 'Database connection failed',
    })
  }
})

// User registration API
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (
      typeof name !== 'string' ||
      !name.trim() ||
      typeof email !== 'string' ||
      !email.trim() ||
      typeof password !== 'string' ||
      password.length < 6
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid registration details.',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const [existingUsers] = await db.execute(
      'SELECT user_id FROM users WHERE email = ?',
      [normalizedEmail]
    )

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'This email is already registered.',
      })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const [result] = await db.execute(
      `INSERT INTO users (full_name, email, password_hash)
       VALUES (?, ?, ?)`,
      [name.trim(), normalizedEmail, passwordHash]
    )

    return res.status(201).json({
      success: true,
      message: 'Your FloraNest account has been created!',
      userId: result.insertId,
    })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'This email is already registered.',
      })
    }

    console.error('Registration failed:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
    })
  }
})

// Place an order API
app.post('/api/orders', async (req, res) => {
  const { customer, items } = req.body

  if (
    !customer ||
    typeof customer.name !== 'string' ||
    !customer.name.trim() ||
    typeof customer.email !== 'string' ||
    !customer.email.trim() ||
    typeof customer.address !== 'string' ||
    !customer.address.trim() ||
    typeof customer.city !== 'string' ||
    !customer.city.trim() ||
    !/^\d{6}$/.test(String(customer.pincode || '')) ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return res.status(400).json({
      success: false,
      message: 'Please provide valid customer and order details.',
    })
  }

  let connection

  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    const [customerResult] = await connection.execute(
      `INSERT INTO customers
       (full_name, email, address, city, pincode)
       VALUES (?, ?, ?, ?, ?)`,
      [
        customer.name.trim(),
        customer.email.trim(),
        customer.address.trim(),
        customer.city.trim(),
        String(customer.pincode),
      ]
    )

    let calculatedTotal = 0
    const validatedItems = []

    for (const item of items) {
      const quantity = Number(item.quantity)
      const price = Number(item.price)
      const name = String(item.name || '').trim()

      if (
        !name ||
        !Number.isSafeInteger(quantity) ||
        quantity < 1 ||
        !Number.isFinite(price) ||
        price < 0 ||
        item.id == null
      ) {
        throw new Error('Invalid product information in order.')
      }

      calculatedTotal += price * quantity

      validatedItems.push({
        id: String(item.id),
        name,
        quantity,
        price,
      })
    }

    const [orderResult] = await connection.execute(
      `INSERT INTO orders (customer_id, total_amount)
       VALUES (?, ?)`,
      [customerResult.insertId, calculatedTotal.toFixed(2)]
    )

    for (const item of validatedItems) {
      await connection.execute(
        `INSERT INTO order_items
         (order_id, product_id, product_name, quantity, price)
         VALUES (?, ?, ?, ?, ?)`,
        [
          orderResult.insertId,
          item.id,
          item.name,
          item.quantity,
          item.price.toFixed(2),
        ]
      )
    }

    await connection.commit()

    return res.status(201).json({
      success: true,
      message: 'Your FloraNest order has been placed!',
      orderId: orderResult.insertId,
      total: calculatedTotal,
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }

    console.error('Order creation failed:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Could not place the order. Please try again.',
    })
  } finally {
    if (connection) {
      connection.release()
    }
  }
})

 // User login API
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (
      typeof email !== 'string' ||
      !email.trim() ||
      typeof password !== 'string' ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your email and password.',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const [users] = await db.execute(
      `SELECT user_id, full_name, email, password_hash
       FROM users
       WHERE email = ?`,
      [normalizedEmail]
    )

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      })
    }

    const user = users[0]

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    )

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful! Welcome to FloraNest 🌱',
      user: {
        id: user.user_id,
        name: user.full_name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Login failed:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
    })
  }
})


// Start the server — keep this at the bottom
app.listen(PORT, () => {
  console.log(`FloraNest backend running on port ${PORT}`)
})
