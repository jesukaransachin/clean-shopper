// Seed script — run once manually: `node server/seed.js`
// Requires server/.env with real SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
//
// Inserts brands -> certifications -> products -> product_certifications.
// Idempotent-ish via upsert on unique columns (brands.name,
// certifications.label) but re-running will insert duplicate products,
// since `products` has no unique constraint on (brand_id, name). Fine for
// a one-time seed; truncate the tables first if re-seeding from scratch.

import './loadEnv.js'
import { supabase } from './supabaseClient.js'

const CERTIFICATIONS = [
  { label: 'EWG Verified', variant: 'verified' },
  { label: 'USDA Organic', variant: 'verified' },
  { label: 'B Corp', variant: 'verified' },
  { label: 'Trusted Brand', variant: 'trusted' },
  { label: 'Contains Sulfates', variant: 'alert' },
  { label: 'Contains Fragrance', variant: 'alert' },
]

// 27 products across the 3 approved categories (Personal Care, Home
// Cleaning, Baby Care — no Pantry). First 9 are the real products reused
// from Home.jsx/BrowsePage.jsx (deduped, pantry items dropped); the rest
// are new, following the existing fictional-brand convention and reusing
// the 11 images already in public/products/ (some products share an
// image — no new image files were invented).
const PRODUCTS = [
  // --- Home Cleaning (existing, reused) ---
  {
    brand: 'Aura Home',
    name: 'All-Purpose Cleaner, Lemon Verbena',
    category: 'Home Cleaning',
    price_cents: 1299,
    image_url: '/products/aura-home-cleaner.jpg',
    reason: 'Matches your preference for fragrance-free, plant-based formulas.',
    certifications: ['EWG Verified', 'B Corp'],
  },
  {
    brand: 'Prairie & Co.',
    name: 'Dish Soap Concentrate',
    category: 'Home Cleaning',
    price_cents: 849,
    image_url: '/products/prairie-dish-soap.jpg',
    reason: 'Flagged: contains an ingredient on your avoid list.',
    certifications: ['Contains Sulfates'],
  },
  {
    brand: 'Root & Bloom',
    name: 'Glass Cleaner Refill',
    category: 'Home Cleaning',
    price_cents: 999,
    image_url: '/products/root-bloom-glass-cleaner.jpg',
    reason: "From a brand you've saved as trusted.",
    certifications: ['Trusted Brand'],
  },
  {
    brand: 'Meadow & Co.',
    name: 'Laundry Liquid, Free & Clear',
    category: 'Home Cleaning',
    price_cents: 1499,
    image_url: '/products/meadow-laundry-detergent.jpg',
    reason: 'Matches your preference for fragrance-free, dye-free formulas.',
    certifications: ['EWG Verified'],
  },
  {
    brand: 'Clearwater Home',
    name: 'All-Purpose Cleaning Spray',
    category: 'Home Cleaning',
    price_cents: 949,
    image_url: '/products/clearwater-wipes.jpg',
    reason: 'Flagged: contains a synthetic fragrance on your avoid list.',
    certifications: ['Contains Fragrance'],
  },
  // --- Personal Care (existing, reused) ---
  {
    brand: 'Willow Bath Co.',
    name: 'Body Wash, Bergamot & Neroli',
    category: 'Personal Care',
    price_cents: 1600,
    image_url: '/products/willow-body-wash.jpg',
    reason: "From a brand you've saved as trusted.",
    certifications: ['B Corp'],
  },
  {
    brand: 'Native Grove',
    name: 'Hand Soap, Ceramic Refillable',
    category: 'Personal Care',
    price_cents: 1399,
    image_url: '/products/native-grove-hand-soap.jpg',
    reason: "From a brand you've saved as trusted.",
    certifications: ['Trusted Brand'],
  },
  // --- Baby Care (existing, reused) ---
  {
    brand: 'Little Sprout',
    name: 'Tear-Free Baby Wash & Shampoo',
    category: 'Baby Care',
    price_cents: 1099,
    image_url: '/products/little-sprout-baby-wash.jpg',
    reason: 'Matches your preference for fragrance-free, plant-based formulas.',
    certifications: ['EWG Verified'],
  },
  {
    brand: 'Little Sprout',
    name: 'Everyday Baby Lotion',
    category: 'Baby Care',
    price_cents: 949,
    image_url: '/products/little-sprout-baby-lotion.jpg',
    reason: 'Matches your preference for organic, minimally processed formulas.',
    certifications: ['USDA Organic'],
  },

  // --- Home Cleaning (new) ---
  {
    brand: 'Aura Home',
    name: 'Glass & Mirror Spray, Unscented',
    category: 'Home Cleaning',
    price_cents: 999,
    image_url: '/products/root-bloom-glass-cleaner.jpg',
    reason: 'Matches your preference for unscented, dye-free formulas.',
    certifications: ['EWG Verified'],
  },
  {
    brand: 'Fernbrook Home',
    name: 'Multi-Surface Cleaner, Eucalyptus',
    category: 'Home Cleaning',
    price_cents: 1049,
    image_url: '/products/clearwater-wipes.jpg',
    reason: 'Matches your preference for plant-based formulas.',
    certifications: ['EWG Verified', 'B Corp'],
  },
  {
    brand: 'Fernbrook Home',
    name: 'Dish Soap, Free & Clear',
    category: 'Home Cleaning',
    price_cents: 799,
    image_url: '/products/prairie-dish-soap.jpg',
    reason: 'Matches your preference for fragrance-free formulas.',
    certifications: ['EWG Verified'],
  },
  {
    brand: 'Basin & Sage',
    name: 'Laundry Detergent Sheets',
    category: 'Home Cleaning',
    price_cents: 1699,
    image_url: '/products/meadow-laundry-detergent.jpg',
    reason: "From a brand you've saved as trusted.",
    certifications: ['B Corp'],
  },

  // --- Personal Care (new) ---
  {
    brand: 'Willow Bath Co.',
    name: 'Shampoo Bar, Rosemary Mint',
    category: 'Personal Care',
    price_cents: 1400,
    image_url: '/products/willow-body-wash.jpg',
    reason: "From a brand you've saved as trusted.",
    certifications: ['Trusted Brand'],
  },
  {
    brand: 'Willow Bath Co.',
    name: 'Body Lotion, Bergamot & Neroli',
    category: 'Personal Care',
    price_cents: 1500,
    image_url: '/products/willow-body-wash.jpg',
    reason: "From a brand you've saved as trusted.",
    certifications: ['Trusted Brand'],
  },
  {
    brand: 'Native Grove',
    name: 'Body Wash, Oat Milk',
    category: 'Personal Care',
    price_cents: 1499,
    image_url: '/products/native-grove-hand-soap.jpg',
    reason: "From a brand you've saved as trusted.",
    certifications: ['Trusted Brand'],
  },
  {
    brand: 'Basin & Sage',
    name: 'Body Butter, Shea & Oat',
    category: 'Personal Care',
    price_cents: 1800,
    image_url: '/products/sundial-coconut-oil.jpg',
    reason: 'Matches your preference for minimally processed formulas.',
    certifications: ['EWG Verified'],
  },
  {
    brand: 'Fernbrook Home',
    name: 'Hand Cream, Lavender',
    category: 'Personal Care',
    price_cents: 900,
    image_url: '/products/little-sprout-baby-lotion.jpg',
    reason: "From a brand you've saved as trusted.",
    certifications: ['Trusted Brand'],
  },
  {
    brand: 'Native Grove',
    name: 'Conditioner Bar, Citrus',
    category: 'Personal Care',
    price_cents: 1300,
    image_url: '/products/willow-body-wash.jpg',
    reason: 'Matches your preference for plant-based formulas.',
    certifications: ['EWG Verified'],
  },
  {
    brand: 'Willow Bath Co.',
    name: 'Facial Cleanser, Aloe & Green Tea',
    category: 'Personal Care',
    price_cents: 1700,
    image_url: '/products/native-grove-hand-soap.jpg',
    reason: "From a brand you've saved as trusted.",
    certifications: ['B Corp'],
  },

  // --- Baby Care (new) ---
  {
    brand: 'Little Sprout',
    name: 'Diaper Rash Cream',
    category: 'Baby Care',
    price_cents: 899,
    image_url: '/products/little-sprout-baby-lotion.jpg',
    reason: 'Matches your preference for fragrance-free, plant-based formulas.',
    certifications: ['EWG Verified'],
  },
  {
    brand: 'Little Sprout',
    name: 'Baby Laundry Detergent',
    category: 'Baby Care',
    price_cents: 1299,
    image_url: '/products/meadow-laundry-detergent.jpg',
    reason: 'Matches your preference for fragrance-free, dye-free formulas.',
    certifications: ['EWG Verified'],
  },
  {
    brand: 'Little Acorn Baby',
    name: 'Gentle Baby Shampoo',
    category: 'Baby Care',
    price_cents: 1149,
    image_url: '/products/little-sprout-baby-wash.jpg',
    reason: 'Matches your preference for organic, minimally processed formulas.',
    certifications: ['USDA Organic'],
  },
  {
    brand: 'Little Acorn Baby',
    name: 'Baby Lotion, Chamomile',
    category: 'Baby Care',
    price_cents: 1099,
    image_url: '/products/little-sprout-baby-lotion.jpg',
    reason: 'Matches your preference for fragrance-free, plant-based formulas.',
    certifications: ['EWG Verified'],
  },
  {
    brand: 'Little Acorn Baby',
    name: 'Diaper Cream, Zinc Oxide',
    category: 'Baby Care',
    price_cents: 949,
    image_url: '/products/little-sprout-baby-lotion.jpg',
    reason: "From a brand you've saved as trusted.",
    certifications: ['Trusted Brand'],
  },
  {
    brand: 'Native Grove',
    name: 'Baby Wipes, Water-Based',
    category: 'Baby Care',
    price_cents: 699,
    image_url: '/products/little-sprout-baby-wash.jpg',
    reason: 'Matches your preference for fragrance-free formulas.',
    certifications: ['EWG Verified'],
  },
  {
    brand: 'Little Sprout',
    name: 'Baby Bubble Bath, Lavender',
    category: 'Baby Care',
    price_cents: 1049,
    image_url: '/products/little-sprout-baby-wash.jpg',
    reason: 'Matches your preference for organic, minimally processed formulas.',
    certifications: ['USDA Organic'],
  },
]

async function seed() {
  console.log(`Seeding ${PRODUCTS.length} products...`)

  // 1. Brands
  const brandNames = [...new Set(PRODUCTS.map((p) => p.brand))]
  const { data: brandRows, error: brandError } = await supabase
    .from('brands')
    .upsert(
      brandNames.map((name) => ({ name })),
      { onConflict: 'name' }
    )
    .select()
  if (brandError) throw brandError
  const brandIdByName = Object.fromEntries(brandRows.map((b) => [b.name, b.id]))
  console.log(`  brands: ${brandRows.length}`)

  // 2. Certifications
  const { data: certRows, error: certError } = await supabase
    .from('certifications')
    .upsert(CERTIFICATIONS, { onConflict: 'label' })
    .select()
  if (certError) throw certError
  const certIdByLabel = Object.fromEntries(certRows.map((c) => [c.label, c.id]))
  console.log(`  certifications: ${certRows.length}`)

  // 3. Products
  const { data: productRows, error: productError } = await supabase
    .from('products')
    .insert(
      PRODUCTS.map((p) => ({
        brand_id: brandIdByName[p.brand],
        name: p.name,
        category: p.category,
        price_cents: p.price_cents,
        image_url: p.image_url,
        reason: p.reason,
      }))
    )
    .select()
  if (productError) throw productError
  console.log(`  products: ${productRows.length}`)

  // Match back by name rather than assuming bulk-insert return order lines
  // up with the input array — that's not a guarantee, just a common
  // implementation detail. All 27 product names in PRODUCTS are unique, so
  // this is a safe key.
  const productIdByName = Object.fromEntries(productRows.map((p) => [p.name, p.id]))

  // 4. product_certifications join rows
  const joinRows = PRODUCTS.flatMap((p) =>
    p.certifications.map((label) => ({
      product_id: productIdByName[p.name],
      certification_id: certIdByLabel[label],
    }))
  )
  const { error: joinError } = await supabase.from('product_certifications').insert(joinRows)
  if (joinError) throw joinError
  console.log(`  product_certifications: ${joinRows.length}`)

  console.log('Done.')
}

seed().catch((err) => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
