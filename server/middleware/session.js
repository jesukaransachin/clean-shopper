import { supabase } from '../supabaseClient.js'

// Resolves the X-Session-Token header (a client-generated UUID, see
// src/lib/session.js) to a `shoppers` row, creating one on first use.
// No accounts/auth in V1 — this is the anonymous identity mechanism
// described in docs/database-schema.md §1. Attaches req.shopperId for
// downstream route handlers.
export async function resolveShopper(req, res, next) {
  const sessionToken = req.header('X-Session-Token')
  if (!sessionToken) {
    return res.status(400).json({ error: 'Missing X-Session-Token header' })
  }

  const { data: existing, error: selectError } = await supabase
    .from('shoppers')
    .select('id')
    .eq('session_token', sessionToken)
    .maybeSingle()

  if (selectError) {
    console.error('Failed to resolve shopper:', selectError.message)
    return res.status(500).json({ error: 'Failed to resolve shopper' })
  }

  if (existing) {
    req.shopperId = existing.id
    // Fire-and-forget — don't hold up the request on this.
    supabase
      .from('shoppers')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', existing.id)
      .then(() => {})
    return next()
  }

  const { data: created, error: insertError } = await supabase
    .from('shoppers')
    .insert({ session_token: sessionToken })
    .select('id')
    .single()

  if (insertError) {
    console.error('Failed to create shopper:', insertError.message)
    return res.status(500).json({ error: 'Failed to create shopper' })
  }

  req.shopperId = created.id
  next()
}
