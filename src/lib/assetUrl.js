// The API returns product image paths as root-absolute strings
// (e.g. "/products/aura-home-cleaner.jpg"), since it has no idea the
// frontend might be deployed under a subpath (GitHub Pages serves this
// app at /clean-shopper/, not the domain root). Vite's own asset
// pipeline handles this automatically for imported assets via its `base`
// config, but these are runtime strings from an API response, never
// touched by Vite — so they need the same prefix applied by hand.
//
// import.meta.env.BASE_URL is Vite's own resolved base path
// ("/clean-shopper/" in production, "/" in dev) — always in sync with
// vite.config.js, nothing to keep manually consistent.
export function assetUrl(path) {
  if (!path) return path
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}
