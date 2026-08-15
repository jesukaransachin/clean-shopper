import { createClient } from '@supabase/supabase-js'

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    'Missing Supabase credentials.\n' +
      'Copy server/.env.example to server/.env and fill in your Supabase ' +
      "project's URL and service-role key (Project Settings → API)."
  )
  process.exit(1)
}

// Service-role key — bypasses RLS. This client only ever runs server-side;
// never send this key to the frontend.
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
