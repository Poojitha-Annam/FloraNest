
import ProductCard from '../components/ProductCard'


function Home({ products, onAddToCart }) {
  const flowerProducts = products.filter(
    (product) => product.category === 'flowers'
  )

  const indoorPlants = products.filter(
    (product) => product.category === 'indoor'
  )

  const gardenPlants = products.filter(
    (product) => product.category === 'garden'
  )

  return (
    <main className="home-page">
      {/* Hero section */}
     {/* Hero section */}
<section className="hero-section" id="home">
  <div className="hero-content">
    <p className="tagline">BRING NATURE CLOSER</p>

    <h1>
      Let Nature
      <br />
      Bloom in Your Life
    </h1>

    <p>
      Discover beautiful bouquets, fresh flowers, and
      lovely green plants to brighten every corner of
      your life.
    </p>

    <a className="shop-button" href="#flowers">
      Explore Collection â†’
    </a>

    <div className="hero-note">
      ðŸŒ± A little nature, a little happiness.
    </div>
  </div>

  <div className="hero-decoration" aria-hidden="true">
    <img
      src="/images/icon.png"
      alt="FloraNest Logo"
      className="hero-logo"
    />
  </div>
</section>

{/* Categories */}
<section className="categories" id="flowers"></section>

      {/* Flowers and bouquets */}
      <section className="featured collection-section" id="bouquets">
        <p className="tagline">FLOWERS WITH LOVE</p>
        <h2>Flowers & Bouquets</h2>
        <p className="section-description">
          Beautiful blooms to make ordinary days feel special.
        </p>

        <div className="product-list">
          {flowerProducts.length > 0 ? (
            flowerProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))
          ) : (
            <p className="empty-collection">
              Beautiful bouquets are coming soon!
            </p>
          )}
        </div>
      </section>

      {/* Indoor plants */}
      <section className="featured collection-section indoor-section"
        id="indoor-plants">
        <p className="tagline">GREENERY FOR YOUR HOME</p>
        <h2>Indoor Plants</h2>
        <p className="section-description">
          Add a refreshing touch of green to your favourite spaces.
        </p>

        <div className="product-list">
          {indoorPlants.length > 0 ? (
            indoorPlants.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))
          ) : (
            <p className="empty-collection">
              Indoor plants are coming soon!
            </p>
          )}
        </div>
      </section>

      {/* Garden plants */}
      <section className="featured collection-section" id="garden-plants">
        <p className="tagline">GROW SOMETHING BEAUTIFUL</p>
        <h2>Garden Plants</h2>
        <p className="section-description">
          Find plants for your garden, balcony, and backyard.
        </p>

        <div className="product-list">
          {gardenPlants.length > 0 ? (
            gardenPlants.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))
          ) : (
            <p className="empty-collection">
              Garden plants are coming soon!
            </p>
          )}
        </div>
      </section>

      {/* About section */}
      <section className="about" id="about">
        <p className="tagline">OUR LITTLE PROMISE</p>
        <h2>Grow Happiness with FloraNest</h2>
        <p>
          Thoughtfully chosen flowers and plants to bring
          natural beauty, joy, and freshness into your everyday life.
        </p>
        <a className="shop-button about-button" href="#home">
          Back to Top â†‘
        </a>
      </section>
    </main>
  )
}

export default Home



