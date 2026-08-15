import { getSessionToken } from './session'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export async function fetchProducts({ category, search } = {}) {
  const url = new URL('/api/products', API_BASE_URL)
  if (category && category !== 'All') {
    url.searchParams.set('category', category)
  }
  if (search && search.trim()) {
    url.searchParams.set('search', search.trim())
  }

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load products (${response.status})`)
  }

  return response.json()
}

function sessionHeaders() {
  return { 'X-Session-Token': getSessionToken() }
}

export async function fetchCart() {
  const response = await fetch(new URL('/api/cart', API_BASE_URL), {
    headers: sessionHeaders(),
  })
  if (!response.ok) {
    throw new Error(`Failed to load cart (${response.status})`)
  }
  return response.json()
}

export async function addCartItem(productId) {
  const response = await fetch(new URL('/api/cart', API_BASE_URL), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...sessionHeaders() },
    body: JSON.stringify({ productId }),
  })
  if (!response.ok) {
    throw new Error(`Failed to add to cart (${response.status})`)
  }
}

export async function updateCartItem(productId, quantity) {
  const response = await fetch(new URL(`/api/cart/${productId}`, API_BASE_URL), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...sessionHeaders() },
    body: JSON.stringify({ quantity }),
  })
  if (!response.ok) {
    throw new Error(`Failed to update cart (${response.status})`)
  }
}

export async function removeCartItem(productId) {
  const response = await fetch(new URL(`/api/cart/${productId}`, API_BASE_URL), {
    method: 'DELETE',
    headers: sessionHeaders(),
  })
  if (!response.ok) {
    throw new Error(`Failed to remove cart item (${response.status})`)
  }
}

export async function fetchSavedProducts() {
  const response = await fetch(new URL('/api/saved-products', API_BASE_URL), {
    headers: sessionHeaders(),
  })
  if (!response.ok) {
    throw new Error(`Failed to load saved products (${response.status})`)
  }
  return response.json()
}

export async function saveProduct(productId) {
  const response = await fetch(new URL('/api/saved-products', API_BASE_URL), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...sessionHeaders() },
    body: JSON.stringify({ productId }),
  })
  if (!response.ok) {
    throw new Error(`Failed to save product (${response.status})`)
  }
}

export async function unsaveProduct(productId) {
  const response = await fetch(new URL(`/api/saved-products/${productId}`, API_BASE_URL), {
    method: 'DELETE',
    headers: sessionHeaders(),
  })
  if (!response.ok) {
    throw new Error(`Failed to remove saved product (${response.status})`)
  }
}
