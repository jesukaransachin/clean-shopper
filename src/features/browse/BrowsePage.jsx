import { useState } from 'react'
import ProductCard from '../../components/ProductCard'
import CategoryTag from '../../components/CategoryTag'
import EmptyState from '../../components/EmptyState'
import SearchBar from '../../components/SearchBar'
import { useProducts } from '../../lib/useProducts'
import { useCart } from '../../lib/CartContext'
import { useSavedProducts } from '../../lib/SavedProductsContext'

const CATEGORIES = ['Personal Care', 'Home Cleaning', 'Baby Care']

function BrowsePage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [query, setQuery] = useState('')
  // Only updates on SearchBar's onSubmit (not every keystroke), so the API
  // call fires once per search rather than per character typed.
  const [submittedQuery, setSubmittedQuery] = useState('')
  // Refetches from /api/products?category=...&search=... every time
  // activeCategory or submittedQuery changes — a real server round-trip per
  // filter/search, not a client-side filter of an already-fetched list.
  const { products, status } = useProducts({ category: activeCategory, search: submittedQuery })
  const { getQuantity, addToCart, incrementItem, decrementItem } = useCart()
  // Persisted via Supabase, scoped to the anonymous session token — see
  // src/lib/SavedProductsContext.jsx. Survives reloads and navigation.
  const { isSaved, toggleSaved } = useSavedProducts()

  return (
    <main className="max-w-content mx-auto px-[32px] py-[48px]" id="main-content">
      <div className="mb-[32px]">
        <SearchBar value={query} onChange={setQuery} onSubmit={setSubmittedQuery} />
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

      {status === 'ready' && products.length === 0 && submittedQuery && (
        <EmptyState
          title="No matches found."
          description={`Nothing matched "${submittedQuery}". Try a different brand or product name.`}
        />
      )}

      {status === 'ready' && products.length === 0 && !submittedQuery && (
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
              saved={isSaved(product.id)}
              onToggleSave={() => toggleSaved(product)}
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
