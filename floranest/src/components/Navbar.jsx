import Button from './Button'

function Navbar({
  cartCount,
  onCartClick,
  onLoginClick,
  onRegisterClick,
  onTrackClick,
}) {
  return (
    <header className="navbar">
      <h2 className="logo">
        FloraNest<span>.</span>
      </h2>

      <nav>
        <a href="#home">Home</a>
        <a href="#flowers">Flowers</a>
        <a href="#plants">Plants</a>
        <a href="#about">About</a>
        <a
          href="#track"
          onClick={(e) => { e.preventDefault(); onTrackClick() }}
        >
          Track Order
        </a>
        <a
          href="#login"
          onClick={(e) => { e.preventDefault(); onLoginClick() }}
        >
          Login
        </a>
        <a
          href="#register"
          onClick={(e) => { e.preventDefault(); onRegisterClick() }}
        >
          Register
        </a>
      </nav>

      <Button className="cart-button" onClick={onCartClick}>
        Cart ({cartCount})
      </Button>
    </header>
  )
}

export default Navbar
