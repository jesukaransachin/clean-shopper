import { useEffect, useState } from 'react'
import { fetchProducts } from './api'

// Shared data-fetching hook — used by both Home.jsx and BrowsePage.jsx so
// neither duplicates the same fetch/loading/error boilerplate.
//
// Refetches whenever `category` changes, calling the real
// /api/products?category=... endpoint server-side (rather than fetching
// everything once and filtering client-side) — each category change is a
// real network request, with its own loading state.
export function useProducts({ category } = {}) {
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState('loading') // 'loading' | 'error' | 'ready'

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    fetchProducts({ category })
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
  }, [category])

  return { products, status }
}
