import { useState } from 'react'
import ProductCard from '../../components/ProductCard'
import CategoryTag from '../../components/CategoryTag'
import EmptyState from '../../components/EmptyState'
import SearchBar from '../../components/SearchBar'
import { useProducts } from '../../lib/useProducts'
import { useCart } from '../../lib/CartContext'

const CATEGORIES = ['Personal Care', 'Home Cleaning', 'Baby Care']

function BrowsePage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [query, setQuery] = useState('')
  // Refetches from /api/products?category=... every time activeCategory
  // changes — a real server round-trip per filter click, not a
  // client-side filter of an already-fetched list.
  const { products, status } = useProducts({ category: activeCategory })
  const { getQuantity, addToCart, incrementItem, decrementItem } = useCart()
  // Saved state lives only in memory, per the request — not persisted
  // anywhere (no localStorage, no backend table yet). Resets on reload.
  const [savedIds, setSavedIds] = useState(() => new Set())

  const toggleSaved = (id) => {
    setSavedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <main className="max-w-[1000px] mx-auto px-[32px] py-[48px]" id="main-content">
      <div className="mb-[32px]">
        <SearchBar value={query} onChange={setQuery} onSubmit={() => {}} />
      </div>

      <div className="flex flex-wrap gap-[8px] mb-[32px]">
        <CategoryTag
          label="All"
          selected={activeCategory === 'All'}
          onToggle={() => setActiveCategory('All')}
        />
        {CATEGORIES.map((category) => (
          <CategoryTag
            key={category}
            label={category}
            selected={activeCategory === category}
            onToggle={() => setActiveCategory(category)}
          />
        ))}
      </div>

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
        <EmptyState title="No products in this category yet." />
      )}

      {status === 'ready' && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[24px]">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              image={product.image}
              brand={product.brand}
              name={product.name}
              price={product.price}
              badges={product.badges}
              reason={product.reason}
              saved={savedIds.has(product.id)}
              onToggleSave={() => toggleSaved(product.id)}
              quantity={getQuantity(product.id)}
              onAddToCart={() => addToCart(product)}
              onIncrement={() => incrementItem(product.id)}
              onDecrement={() => decrementItem(product.id)}
            />
          ))}
        </div>
      )}
    </main>
  )
}

export default BrowsePage
