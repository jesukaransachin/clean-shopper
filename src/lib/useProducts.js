import { useEffect, useState } from 'react'
import { fetchProducts } from './api'

// Shared data-fetching hook — used by both Home.jsx and BrowsePage.jsx so
// neither duplicates the same fetch/loading/error boilerplate.
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
