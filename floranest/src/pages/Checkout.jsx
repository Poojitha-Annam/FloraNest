
import { useState } from 'react'
import Button from '../components/Button'
function Checkout({  cart,  total,  onPlaceOrder,  onBackToCart,  orderMessage,  isPlacingOrder,}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [pincode, setPincode] = useState('')
  const [message, setMessage] = useState('')

  function handleSubmit(event) {
  event.preventDefault()
  setMessage('')

  if (cart.length === 0) {
    setMessage('Your cart is empty. Add products before checkout.')
    return
  }

  if (!/^[0-9]{6}$/.test(pincode)) {
    setMessage('Please enter a valid 6-digit PIN code.')
    return
  }

  const order = {
    id: Date.now(),
    customer: { name, email, address, city, pincode },
    items: cart,
    total,
    date: new Date().toLocaleDateString(),
  }

  onPlaceOrder(order)
}

  return (
    <main className="login-page">
      <section className="login-card checkout-card">
        <h1>Checkout 🌷</h1>
        <p>Just a few details before your flowers arrive.</p>

        <h2>Order Summary</h2>

        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            {cart.map((item) => (
               <div className="checkout-product" key={item.id}>
                    <img src={item.image}alt={item.name}className="checkout-product-image"/>
                      <div className="checkout-product-info">
                      <span>{item.name}</span>
                      <small>Quantity: {item.quantity}</small>
                      </div>
                      <strong>₹{item.price * item.quantity}</strong>
                </div>
          ))}
          <h3>Total: ₹{total}</h3>
          </>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="customer-name">Full Name</label>
          <input
            id="customer-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your full name"
            required
          />

          <label htmlFor="customer-email">Email Address</label>
          <input
            id="customer-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            required
          />

          <label htmlFor="delivery-address">Delivery Address</label>
          <textarea
            id="delivery-address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="House number, street, area"
            rows={3}
            required
          />

          <label htmlFor="delivery-city">City</label>
          <input
            id="delivery-city"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Enter your city"
            required
          />

          <label htmlFor="delivery-pincode">PIN Code</label>
          <input
            id="delivery-pincode"
            value={pincode}
            onChange={(event) => setPincode(event.target.value)}
            placeholder="6-digit PIN code"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
          />

         {(message || orderMessage) && (
          <p className="login-message">{message || orderMessage}</p>
         )}

          <Button
          type="submit"
          className="cart-button"
          disabled={cart.length === 0 || isPlacingOrder}
          >
         {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
         </Button>

          <Button
            type="button"
            className="cart-button"
            onClick={onBackToCart}
          >
            Back to Cart
          </Button>
        </form>
      </section>
    </main>
  )
}

export default Checkout
