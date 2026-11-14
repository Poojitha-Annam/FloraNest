
import Button from './Button'

function ProductCard({ product, onAddToCart }) {
  return (
    <article className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name} />
      </div>

      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <strong>₹{product.price}</strong>
      <br />

      <Button
        className="add-to-cart-btn"
        onClick={() => onAddToCart(product)}
      >
        Add to Cart
      </Button>
    </article>
  )
}

export default ProductCard
