import Button from '../components/Button'
function Cart({  cart,  onUpdateQuantity,  onRemove, total,  onClose,  onCheckout,}) {
  return (
    <section className="shopping-cart">
      <h2>Your Shopping Cart 🛒</h2>

      {cart.length === 0 ? (
  <>
    <p>Your cart is empty. Explore our collection!</p>
    <Button className="cart-button" onClick={onClose}>
      Continue Shopping
    </Button>
  </>
) : (
        <>
          {cart.map((item) => (
            <div className="cart-item" key={item.id}>
              <div className="cart-product-info">
               <div className="cart-product-details">
                 <img src={item.image} alt={item.name}className="cart-product-image"/>
                   <span>{item.name}</span>
                    </div>
                <div className="quantity-controls">
                  <Button
                    className="quantity-button"
                    onClick={() =>
                      onUpdateQuantity(item.id, -1)
                    }
                  >
                    −
                  </Button>

                  <span>{item.quantity}</span>

                  <Button
                    className="quantity-button"
                    onClick={() =>
                      onUpdateQuantity(item.id, 1)
                    }
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="cart-product-actions">
                <strong>
                  ₹{item.price * item.quantity}
                </strong>

                <Button
                  className="remove-button"
                  onClick={() => onRemove(item.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}

          <h3>Total: ₹{total}</h3>

        
<div className="cart-button-group">
  <Button
    className="cart-button"
    onClick={onCheckout}
    disabled={cart.length === 0}
  >
    Proceed to Checkout
  </Button>

  <Button className="cart-button" onClick={onClose}>
    Continue Shopping
  </Button>
</div>

        </>
      )}

     
    </section>
  )
}

export default Cart
