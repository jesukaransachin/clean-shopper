// Loads server/.env regardless of process.cwd() (npm scripts run with cwd
// set to the repo root, not server/, so dotenv's default `.env`-in-cwd
// lookup misses it). Must be imported FIRST, before supabaseClient.js or
// anything that reads process.env at module load time — ES module imports
// are hoisted, so putting a dotenv.config() call between other imports in
// the same file does NOT guarantee it runs before them; a separate module
// imported first does.
import { fileURLToPath } from 'url'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '.env') })
