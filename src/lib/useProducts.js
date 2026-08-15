import { useEffect, useState } from 'react'
import { fetchProducts } from './api'

// Data-fetching hook for BrowsePage — the app's landing page (Home.jsx
// was removed once Browse became the sole entry point).
//
// Refetches whenever `category` or `search` changes, calling the real
// /api/products?category=...&search=... endpoint server-side (rather than
// fetching everything once and filtering client-side) — each change is a
// real network request, with its own loading state.
export function useProducts({ category, search } = {}) {
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState('loading') // 'loading' | 'error' | 'ready'

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    fetchProducts({ category, search })
      .then((data) => {
        if (cancelled) return
        setProducts(data)
        setStatus('ready')
      })
      .catch(() => {
        if (cancelled) return
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [category, search])

  return { products, status }
}
