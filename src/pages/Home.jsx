import { useState } from 'react'
import ProductCard from '../components/ProductCard'
import SearchBar from '../components/SearchBar'
import EmptyState from '../components/EmptyState'
import { useProducts } from '../lib/useProducts'
import { useCart } from '../lib/CartContext'
import './Home.css'

function Home() {
  const [query, setQuery] = useState('')
  // Only updates on SearchBar's onSubmit (not every keystroke), so the API
  // call fires once per search rather than per character typed.
  const [submittedQuery, setSubmittedQuery] = useState('')
  const { products, status } = useProducts({ search: submittedQuery })
  const { getQuantity, addToCart, incrementItem, decrementItem } = useCart()

  return (
    <main className="home" id="main-content">
      <section className="hero">
        <h1>Shop clean, without the guesswork</h1>
        <p className="hero-tagline">
          Clean Shopper researches home and pantry products against clean
          standards, remembers what matters to you, and tells you exactly why
          something's a good match — so you don't have to decode ingredient
          lists yourself.
        </p>

        <SearchBar value={query} onChange={setQuery} onSubmit={setSubmittedQuery} />
      </section>

      <section className="sample">
        <h2>See it in action</h2>

        {status === 'loading' && (
          <p className="text-[14px] text-text-secondary text-center py-[64px]">
            Loading products…
          </p>
        )}

        {status === 'error' && (
          <EmptyState
            title="Couldn't load products."
            description="Check that the API server is running and try again."
          />
        )}

        {status === 'ready' && products.length === 0 && (
          <EmptyState
            title="No matches found."
            description={`Nothing matched "${submittedQuery}". Try a different brand or product name.`}
          />
        )}

        {status === 'ready' && products.length > 0 && (
          <div className="card-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                image={product.image}
                brand={product.brand}
                name={product.name}
                price={product.price}
                badges={product.badges}
                reason={product.reason}
                quantity={getQuantity(product.id)}
                onAddToCart={() => addToCart(product)}
                onIncrement={() => incrementItem(product.id)}
                onDecrement={() => decrementItem(product.id)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default Home
