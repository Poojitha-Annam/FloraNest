
import { useState } from 'react'
import './App.css'

import Navbar        from './components/Navbar'
import Footer        from './components/Footer'
import Home          from './pages/Home'
import Cart          from './pages/Cart'
import Login         from './pages/Login'
import Register      from './pages/Register'
import Checkout      from './pages/Checkout'
import OrderTracking from './pages/OrderTracking'


const products = [
  // Flowers and Bouquets
  {
    id: 1,
    name: 'Classic Rose Bouquet',
    description: 'Beautiful roses for special moments.',
    price: 499,
    image: '/images/rose-bouquet.png',
    category: 'flowers',
  },
  {
    id: 2,
    name: 'Sunshine Bouquet',
    description: 'Bright sunflowers to make someone smile.',
    price: 399,
    image: '/images/sunflower-bouquet.png',
    category: 'flowers',
  },
  {
    id: 3,
    name: 'Pink Rose Bouquet',
    description: 'A lovely gift filled with pink roses.',
    price: 599,
    image: '/images/pink-rose-bouquet.png',
    category: 'flowers',
  },
  {
    id: 4,
    name: 'Mixed Flower Bouquet',
    description: 'A colorful collection of fresh flowers.',
    price: 699,
    image: '/images/mixed-bouquet.png',
    category: 'flowers',
  },

  // Indoor and Decorative Plants
  {
    id: 5,
    name: 'Peace Lily Plant',
    description: 'A graceful touch of green for your home.',
    price: 349,
    image: '/images/peace-lily.png',
    category: 'indoor',
  },
  {
    id: 6,
    name: 'Money Plant',
    description: 'A refreshing green companion for your room.',
    price: 199,
    image: '/images/money-plant.png',
    category: 'indoor',
  },
  {
    id: 7,
    name: 'Snake Plant',
    description: 'An elegant plant for modern interiors.',
    price: 299,
    image: '/images/snake-plant.png',
    category: 'indoor',
  },
  {
    id: 8,
    name: 'Lucky Bamboo',
    description: 'A lovely green accent for your desk.',
    price: 249,
    image: '/images/lucky-bamboo.png',
    category: 'indoor',
  },

  // Garden Plants
  {
    id: 9,
    name: 'Rose Garden Plant',
    description: 'Grow beautiful roses in your garden.',
    price: 249,
    image: '/images/rose-plant.png',
    category: 'garden',
  },
  {
    id: 10,
    name: 'Mango Sapling',
    description: 'Start growing your own mango tree.',
    price: 199,
    image: '/images/mango-sapling.png',
    category: 'garden',
  },
  {
    id: 11,
    name: 'Tomato Plant',
    description: 'Grow fresh tomatoes at home.',
    price: 99,
    image: '/images/tomato-plant.png',
    category: 'garden',
  },
  {
    id: 12,
    name: 'Jasmine Plant',
    description: 'Enjoy fragrant jasmine flowers in your garden.',
    price: 179,
    image: '/images/jasmine-plant.png',
    category: 'garden',
  },
]


function App() {
  const [cart, setCart]                   = useState([])
  const [showCart, setShowCart]           = useState(false)
  const [orderMessage, setOrderMessage]   = useState('')
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [showLogin, setShowLogin]         = useState(false)
  const [showRegister, setShowRegister]   = useState(false)
  const [showCheckout, setShowCheckout]   = useState(false)
  const [showTracking, setShowTracking]   = useState(false)
  const [lastOrderId, setLastOrderId]     = useState(null)
  const [loggedInUser, setLoggedInUser]   = useState(null)

  function addToCart(product) {
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.id === product.id)
      if (existing) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...currentCart, { ...product, quantity: 1 }]
    })
  }

  function getTotal() {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  function updateQuantity(id, change) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + change } : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  function removeFromCart(id) {
    setCart((currentCart) => currentCart.filter((item) => item.id !== id))
  }

  function openHome() {
    setShowCart(false)
    setShowLogin(false)
    setShowRegister(false)
    setShowCheckout(false)
    setShowTracking(false)
  }

  async function placeOrder(order) {
    if (isPlacingOrder) return

    if (cart.length === 0) {
      setOrderMessage('Your cart is empty!')
      return
    }

    setIsPlacingOrder(true)
    setOrderMessage('')

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Could not place your order.')
      }

      setCart([])
      setShowCheckout(false)
      setShowCart(false)
      setOrderMessage('')
      setLastOrderId(result.orderId)
      setShowTracking(true)
      alert(`Order placed! Your Order ID is #${result.orderId}. Use it to track your order.`)
    } catch (error) {
      setOrderMessage(
        error.message || 'Unable to connect to the backend. Please try again.'
      )
    } finally {
      setIsPlacingOrder(false)
    }
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="app">
      <Navbar
        cartCount={cartCount}
        onCartClick={() => {
          setShowCart(true)
          setShowLogin(false)
          setShowRegister(false)
          setShowCheckout(false)
          setShowTracking(false)
        }}
        onLoginClick={() => {
          setShowLogin(true)
          setShowCart(false)
          setShowRegister(false)
          setShowCheckout(false)
          setShowTracking(false)
        }}
        onRegisterClick={() => {
          setShowRegister(true)
          setShowLogin(false)
          setShowCart(false)
          setShowCheckout(false)
          setShowTracking(false)
        }}
        onTrackClick={() => {
          setShowTracking(true)
          setShowCart(false)
          setShowLogin(false)
          setShowRegister(false)
          setShowCheckout(false)
        }}
      />

      {showRegister ? (
        <Register />
      ) : showLogin ? (
        <Login
          onLoginSuccess={(user) => {
            setLoggedInUser(user)
            setShowLogin(false)
            setShowRegister(false)
            setShowCart(false)
            setShowCheckout(false)
          }}
        />
      ) : showCheckout ? (
        <Checkout
          cart={cart}
          total={getTotal()}
          onPlaceOrder={placeOrder}
          onBackToCart={() => {
            setShowCheckout(false)
            setShowCart(true)
          }}
          orderMessage={orderMessage}
          isPlacingOrder={isPlacingOrder}
        />
      ) : showTracking ? (
        <OrderTracking initialOrderId={lastOrderId} />
      ) : showCart ? (
        <Cart
          cart={cart}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
          total={getTotal()}
          onClose={openHome}
          onCheckout={() => {
            setShowCart(false)
            setShowCheckout(true)
          }}
        />
      ) : (
        <Home
          products={products}
          onAddToCart={addToCart}
        />
      )}

      <Footer />
    </div>
  )
}

export default App
