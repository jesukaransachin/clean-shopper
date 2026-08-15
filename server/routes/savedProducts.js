import { Router } from 'express'
import { supabase } from '../supabaseClient.js'
import { resolveShopper } from '../middleware/session.js'

const router = Router()
router.use(resolveShopper)

const SELECT = `
  product_id,
  products (
    id, name, category, price_cents, image_url, reason,
    brands ( name ),
    product_certifications (
      certifications ( label, variant )
    )
  )
`

function formatSavedRow(row) {
  const p = row.products
  return {
    id: p.id,
    brand: p.brands?.name ?? null,
    name: p.name,
    category: p.category,
    price: `$${(p.price_cents / 100).toFixed(2)}`,
    priceCents: p.price_cents,
    image: p.image_url,
    reason: p.reason,
    badges: (p.product_certifications ?? []).map((pc) => ({
      label: pc.certifications.label,
      variant: pc.certifications.variant,
    })),
  }
}

// GET /api/saved-products
router.get('/saved-products', async (req, res) => {
  const { data, error } = await supabase
    .from('saved_products')
    .select(SELECT)
    .eq('shopper_id', req.shopperId)

  if (error) {
    console.error('GET /api/saved-products failed:', error.message)
    return res.status(500).json({ error: 'Failed to load saved products' })
  }

  res.json(data.map(formatSavedRow))
})

// POST /api/saved-products { productId }
router.post('/saved-products', async (req, res) => {
  const { productId } = req.body
  if (!productId) {
    return res.status(400).json({ error: 'productId is required' })
  }

  // Upsert rather than insert — re-saving an already-saved product should
  // be a no-op, not a unique-constraint error.
  const { error } = await supabase
    .from('saved_products')
    .upsert(
      { shopper_id: req.shopperId, product_id: productId },
      { onConflict: 'shopper_id,product_id' }
    )

  if (error) {
    console.error('POST /api/saved-products failed:', error.message)
    return res.status(500).json({ error: 'Failed to save product' })
  }

  res.status(204).end()
})

// DELETE /api/saved-products/:productId
router.delete('/saved-products/:productId', async (req, res) => {
  const { error } = await supabase
    .from('saved_products')
    .delete()
    .eq('shopper_id', req.shopperId)
    .eq('product_id', req.params.productId)

  if (error) {
    console.error('DELETE /api/saved-products failed:', error.message)
    return res.status(500).json({ error: 'Failed to remove saved product' })
  }

  res.status(204).end()
})

export default router
