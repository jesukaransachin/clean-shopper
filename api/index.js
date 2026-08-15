// Vercel serverless function entry — wraps the same Express app used for
// local dev (server/app.js). Vercel invokes this per-request instead of
// running a persistent server, so there's no .listen() call here.
//
// No dotenv/loadEnv import: Vercel injects environment variables directly
// into process.env at runtime (set via the Vercel dashboard/CLI), there's
// no .env file to load in this environment.
import app from '../server/app.js'

export default app
