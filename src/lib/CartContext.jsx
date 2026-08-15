import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { fetchCart, addCartItem, updateCartItem, removeCartItem } from './api'

// Cart is now persisted to Supabase via the Express API (server/routes/
// cart.js), scoped to an anonymous session token (src/lib/session.js) —
// not tied to a user account (none exist in V1). Survives reloads, tied
// to this browser/device.
//
// UI updates are optimistic: local state changes immediately on click,
// and the API call fires in the background. If it fails, we log to the
// console rather than rolling back the UI or surfacing an error toast —
// a deliberate simplification for a course-demo app, not a production
// retry/reconciliation strategy. Revisit if that gap matters later.
const CartContext = createContext(null)

export function CartProvider({ children }) {
  // Keyed by product id: { [id]: { product, quantity } }
  const [items, setItems] = useState({})
  const [status, setStatus] = useState('loading') // 'loading' | 'error' | 'ready'

  useEffect(() => {
    fetchCart()
      .then((rows) => {
        const map = {}
        rows.forEach((row) => {
          map[row.product.id] = { product: row.product, quantity: row.quantity }
        })
        setItems(map)
        setStatus('ready')
      })
      .catch((err) => {
        console.error('Failed to load cart:', err)
        setStatus('error')
      })
  }, [])

  const addToCart = (product) => {
    setItems((prev) => ({
      ...prev,
      [product.id]: { product, quantity: (prev[product.id]?.quantity ?? 0) + 1 },
    }))
    addCartItem(product.id).catch((err) => console.error('Failed to persist cart add:', err))
  }

  const changeQuantity = (productId, quantity) => {
    setItems((prev) => {
      if (quantity <= 0) {
        const next = { ...prev }
        delete next[productId]
        return next
      }
      const existing = prev[productId]
      if (!existing) return prev
      return { ...prev, [productId]: { ...existing, quantity } }
    })

    if (quantity <= 0) {
      removeCartItem(productId).catch((err) => console.error('Failed to persist cart removal:', err))
    } else {
      updateCartItem(productId, quantity).catch((err) =>
        console.error('Failed to persist cart update:', err)
      )
    }
  }

  const incrementItem = (productId) => {
    changeQuantity(productId, (items[productId]?.quantity ?? 0) + 1)
  }

  const decrementItem = (productId) => {
    changeQuantity(productId, (items[productId]?.quantity ?? 0) - 1)
  }

  const removeItem = (productId) => changeQuantity(productId, 0)

  const getQuantity = (productId) => items[productId]?.quantity ?? 0

  const itemList = useMemo(() => Object.values(items), [items])
  const itemCount = useMemo(
    () => itemList.reduce((sum, item) => sum + item.quantity, 0),
    [itemList]
  )
  const subtotalCents = useMemo(
    () => itemList.reduce((sum, item) => sum + item.product.priceCents * item.quantity, 0),
    [itemList]
  )

  const value = {
    items: itemList,
    status,
    itemCount,
    subtotalCents,
    getQuantity,
    addToCart,
    incrementItem,
    decrementItem,
    setQuantity: changeQuantity,
    removeItem,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
