import express from 'express'
import cors from 'cors'
import productsRouter from './routes/products.js'
import cartRouter from './routes/cart.js'
import savedProductsRouter from './routes/savedProducts.js'

// The configured Express app, with no .listen() call — imported by
// server/index.js (local dev, calls .listen()) and api/index.js (Vercel
// serverless function, exports this directly; Vercel's Node runtime
// invokes it per-request instead of running a persistent server).

// CORS_ORIGIN accepts a comma-separated list so the same deployed API can
// serve both local dev (http://localhost:5173) and the public GitHub
// Pages frontend.
const CORS_ORIGIN = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())

const app = express()

app.use(
  cors({
    origin: CORS_ORIGIN,
    // X-Session-Token carries the cart's anonymous shopper identity —
    // must be explicitly allowed or the browser strips it as a
    // non-simple header on cross-origin requests.
    allowedHeaders: ['Content-Type', 'X-Session-Token'],
  })
)
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api', productsRouter)
app.use('/api', cartRouter)
app.use('/api', savedProductsRouter)

export default app
