import './loadEnv.js'
import express from 'express'
import cors from 'cors'
import productsRouter from './routes/products.js'
import cartRouter from './routes/cart.js'

const app = express()
// Deliberately named API_PORT, not PORT — some dev-server launchers inject
// a generic PORT env var for whatever they start, which would silently
// collide with Express here (dotenv doesn't override pre-existing env
// vars) and put both the frontend and API on the same port.
const PORT = process.env.API_PORT || 3001
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

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

app.listen(PORT, () => {
  console.log(`Clean Shopper API listening on http://localhost:${PORT}`)
})
