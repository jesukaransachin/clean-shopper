import { createContext, useContext, useEffect, useState } from 'react'
import { fetchSavedProducts, saveProduct, unsaveProduct } from './api'

// Saved products are persisted to Supabase via the Express API (server/
// routes/savedProducts.js), scoped to the same anonymous session token
// used by the cart (src/lib/session.js). Survives reloads and
// navigation, tied to this browser/device — no user accounts in V1.
//
// Same optimistic-update pattern as CartContext: local state changes
// immediately, the API call fires in the background, failures only
// console.error (no rollback/retry) — a deliberate course-demo
// simplification, not a production reconciliation strategy.
const SavedProductsContext = createContext(null)

export function SavedProductsProvider({ children }) {
  // Keyed by product id: { [id]: product }
  const [saved, setSaved] = useState({})
  const [status, setStatus] = useState('loading') // 'loading' | 'error' | 'ready'

  useEffect(() => {
    fetchSavedProducts()
      .then((products) => {
        const map = {}
        products.forEach((product) => {
          map[product.id] = product
        })
        setSaved(map)
        setStatus('ready')
      })
      .catch((err) => {
        console.error('Failed to load saved products:', err)
        setStatus('error')
      })
  }, [])

  const isSaved = (productId) => Boolean(saved[productId])

  const toggleSaved = (product) => {
    const currentlySaved = Boolean(saved[product.id])

    setSaved((prev) => {
      if (currentlySaved) {
        const next = { ...prev }
        delete next[product.id]
        return next
      }
      return { ...prev, [product.id]: product }
    })

    if (currentlySaved) {
      unsaveProduct(product.id).catch((err) =>
        console.error('Failed to persist unsave:', err)
      )
    } else {
      saveProduct(product.id).catch((err) => console.error('Failed to persist save:', err))
    }
  }

  const value = {
    status,
    isSaved,
    toggleSaved,
  }

  return (
    <SavedProductsContext.Provider value={value}>{children}</SavedProductsContext.Provider>
  )
}

export function useSavedProducts() {
  const context = useContext(SavedProductsContext)
  if (!context) {
    throw new Error('useSavedProducts must be used within a SavedProductsProvider')
  }
  return context
}
