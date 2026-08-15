import { Router } from 'express'
import { supabase } from '../supabaseClient.js'
import { resolveShopper } from '../middleware/session.js'

const router = Router()
router.use(resolveShopper)

const SELECT = `
  id, quantity, product_id,
  products (
    id, name, category, price_cents, image_url, reason,
    brands ( name ),
    product_certifications (
      certifications ( label, variant )
    )
  )
`

function formatCartRow(row) {
  const p = row.products
  return {
    quantity: row.quantity,
    product: {
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
    },
  }
}

// GET /api/cart
router.get('/cart', async (req, res) => {
  const { data, error } = await supabase
    .from('cart_items')
    .select(SELECT)
    .eq('shopper_id', req.shopperId)

  if (error) {
    console.error('GET /api/cart failed:', error.message)
    return res.status(500).json({ error: 'Failed to load cart' })
  }

  res.json(data.map(formatCartRow))
})

// POST /api/cart { productId } — adds 1, or increments if already present
router.post('/cart', async (req, res) => {
  const { productId } = req.body
  if (!productId) {
    return res.status(400).json({ error: 'productId is required' })
  }

  const { data: existing, error: selectError } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('shopper_id', req.shopperId)
    .eq('product_id', productId)
    .maybeSingle()

  if (selectError) {
    console.error('POST /api/cart failed:', selectError.message)
    return res.status(500).json({ error: 'Failed to add to cart' })
  }

  const { error: writeError } = existing
    ? await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + 1 })
        .eq('id', existing.id)
    : await supabase
        .from('cart_items')
        .insert({ shopper_id: req.shopperId, product_id: productId, quantity: 1 })

  if (writeError) {
    console.error('POST /api/cart failed:', writeError.message)
    return res.status(500).json({ error: 'Failed to add to cart' })
  }

  res.status(204).end()
})

// PATCH /api/cart/:productId { quantity } — quantity <= 0 removes the item
router.patch('/cart/:productId', async (req, res) => {
  const { quantity } = req.body
  if (typeof quantity !== 'number') {
    return res.status(400).json({ error: 'quantity (number) is required' })
  }

  const { error } =
    quantity <= 0
      ? await supabase
          .from('cart_items')
          .delete()
          .eq('shopper_id', req.shopperId)
          .eq('product_id', req.params.productId)
      : await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('shopper_id', req.shopperId)
          .eq('product_id', req.params.productId)

  if (error) {
    console.error('PATCH /api/cart failed:', error.message)
    return res.status(500).json({ error: 'Failed to update cart' })
  }

  res.status(204).end()
})

// DELETE /api/cart/:productId
router.delete('/cart/:productId', async (req, res) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('shopper_id', req.shopperId)
    .eq('product_id', req.params.productId)

  if (error) {
    console.error('DELETE /api/cart failed:', error.message)
    return res.status(500).json({ error: 'Failed to remove cart item' })
  }

  res.status(204).end()
})

export default router
