import './loadEnv.js'
import app from './app.js'

// Deliberately named API_PORT, not PORT — some dev-server launchers inject
// a generic PORT env var for whatever they start, which would silently
// collide with Express here (dotenv doesn't override pre-existing env
// vars) and put both the frontend and API on the same port.
const PORT = process.env.API_PORT || 3001

app.listen(PORT, () => {
  console.log(`Clean Shopper API listening on http://localhost:${PORT}`)
})
