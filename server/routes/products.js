import { Router } from 'express'
import { supabase } from '../supabaseClient.js'

const router = Router()

function formatProduct(row) {
  return {
    id: row.id,
    brand: row.brands?.name ?? null,
    name: row.name,
    category: row.category,
    price: `$${(row.price_cents / 100).toFixed(2)}`,
    priceCents: row.price_cents, // raw integer cents, for cart/total math — avoid parsing the formatted string
    image: row.image_url,
    reason: row.reason,
    badges: (row.product_certifications ?? []).map((pc) => ({
      label: pc.certifications.label,
      variant: pc.certifications.variant,
    })),
  }
}

const SELECT = `
  id, name, category, price_cents, image_url, reason,
  brands ( name ),
  product_certifications (
    certifications ( label, variant )
  )
`

// GET /api/products?category=Personal+Care&search=lemon
router.get('/products', async (req, res) => {
  let query = supabase.from('products').select(SELECT).order('id')

  const { category, search } = req.query
  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  if (error) {
    console.error('GET /api/products failed:', error.message)
    return res.status(500).json({ error: 'Failed to load products' })
  }

  let products = data.map(formatProduct)

  // Simple keyword match against name/brand, done in JS rather than a
  // Postgrest OR-across-joined-tables filter — the catalog is ~27 rows,
  // not worth the query complexity at this scale. Revisit if the catalog
  // grows enough that this becomes a real cost.
  if (search) {
    const term = search.toLowerCase()
    products = products.filter(
      (p) => p.name.toLowerCase().includes(term) || p.brand?.toLowerCase().includes(term)
    )
  }

  res.json(products)
})

// GET /api/products/:id
router.get('/products/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .select(SELECT)
    .eq('id', req.params.id)
    .single()

  if (error) {
    return res.status(404).json({ error: 'Product not found' })
  }

  res.json(formatProduct(data))
})

export default router
