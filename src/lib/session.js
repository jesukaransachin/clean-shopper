const SESSION_TOKEN_KEY = 'cleanShopperSessionToken'

// Anonymous, device-scoped identity — no accounts/auth in V1 (see
// docs/database-schema.md §1). Generated once per browser and persisted
// in localStorage; sent as the X-Session-Token header on every cart
// request so the server can resolve/create the matching `shoppers` row.
export function getSessionToken() {
  let token = localStorage.getItem(SESSION_TOKEN_KEY)
  if (!token) {
    token = crypto.randomUUID()
    localStorage.setItem(SESSION_TOKEN_KEY, token)
  }
  return token
}
