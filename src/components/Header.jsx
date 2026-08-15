import logo from '/logo.svg'
import { useCart } from '../lib/CartContext'
import './Header.css'

// "Research" and "Cart" link to real pages. Preferences/Compare are still
// visually present per design-system.md's nav structure but not wired to
// anything yet — clicking them does nothing until those pages exist.
const NAV_ITEMS = [
  { label: 'Research', page: 'browse' },
  { label: 'Preferences', page: null },
  { label: 'Cart', page: 'cart' },
  { label: 'Compare', page: null },
]

function Header({ activePage, onNavigate }) {
  const { itemCount } = useCart()

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="app-header">
        <button
          type="button"
          className="app-logo-button"
          onClick={() => onNavigate('home')}
          aria-label="Clean Shopper home"
        >
          <img src={logo} className="app-logo" alt="" />
        </button>
        <nav className="app-nav" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const isCart = item.label === 'Cart'
            const label =
              isCart && itemCount > 0 ? `Cart, ${itemCount} item${itemCount === 1 ? '' : 's'}` : null

            return (
              <button
                type="button"
                key={item.label}
                onClick={item.page ? () => onNavigate(item.page) : undefined}
                aria-current={item.page && activePage === item.page ? 'page' : undefined}
                aria-disabled={item.page ? undefined : true}
                aria-label={label}
              >
                {item.label}
                {isCart && itemCount > 0 && (
                  <span className="app-nav-badge" aria-hidden="true">
                    {itemCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </header>
    </>
  )
}

export default Header
