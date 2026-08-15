import Stepper from '../../components/Stepper'
import EmptyState from '../../components/EmptyState'
import { useCart } from '../../lib/CartContext'
import { assetUrl } from '../../lib/assetUrl'

// Fixed placeholder rate, not tied to a real tax API/jurisdiction — out of
// scope for a course demo (see docs/project-context.md's V1 scope).
const TAX_RATE = 0.08

function formatCents(cents) {
  return `$${(cents / 100).toFixed(2)}`
}

function CartPage({ onNavigate }) {
  const { items, status, subtotalCents, incrementItem, decrementItem, removeItem } = useCart()

  const taxCents = Math.round(subtotalCents * TAX_RATE)
  const totalCents = subtotalCents + taxCents

  if (status === 'loading') {
    return (
      <main className="max-w-content mx-auto px-[32px] py-[48px]" id="main-content">
        <h1 className="text-heading mb-[24px]">Your Cart</h1>
        <p className="text-[14px] text-text-secondary text-center py-[64px]">Loading cart…</p>
      </main>
    )
  }

  if (status === 'error') {
    return (
      <main className="max-w-content mx-auto px-[32px] py-[48px]" id="main-content">
        <h1 className="text-heading mb-[24px]">Your Cart</h1>
        <EmptyState
          title="Couldn't load your cart."
          description="Check that the API server is running and try again."
        />
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="max-w-content mx-auto px-[32px] py-[48px]" id="main-content">
        <h1 className="text-heading mb-[24px]">Your Cart</h1>
        <EmptyState
          title="Your cart is empty."
          description="Products you add will show up here."
          actionLabel="Browse products"
          onAction={() => onNavigate('browse')}
        />
      </main>
    )
  }

  return (
    <main className="max-w-content mx-auto px-[32px] py-[48px]" id="main-content">
      <h1 className="text-heading mb-[24px]">Your Cart</h1>

      <ul className="flex flex-col gap-[16px] mb-[32px]" role="list">
        {items.map(({ product, quantity }) => (
          <li
            key={product.id}
            className="flex items-center gap-[16px] border border-border-default rounded-lg p-[16px]"
          >
            <div className="w-[64px] h-[64px] flex-shrink-0 rounded-md overflow-hidden bg-surface-subtle">
              {product.image ? (
                <img
                  src={assetUrl(product.image)}
                  alt={`${product.brand ?? ''} ${product.name}`.trim()}
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>

            <div className="flex-1 min-w-0">
              {product.brand && (
                <p className="text-[11px] font-semibold uppercase tracking-[0.04em] text-text-secondary m-0">
                  {product.brand}
                </p>
              )}
              <p className="text-[14px] font-semibold text-text-primary m-0 truncate">
                {product.name}
              </p>
              <p className="text-[12px] text-text-secondary m-0">{product.price} each</p>
            </div>

            <Stepper
              quantity={quantity}
              onIncrement={() => incrementItem(product.id)}
              onDecrement={() => decrementItem(product.id)}
              label={product.name}
            />

            <span className="text-numeral text-text-primary w-[64px] text-right">
              {formatCents(product.priceCents * quantity)}
            </span>

            <button
              type="button"
              onClick={() => removeItem(product.id)}
              aria-label={`Remove ${product.name} from cart`}
              className="text-[12px] font-semibold text-accent-alert bg-transparent hover:underline p-0"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="max-w-[320px] ml-auto flex flex-col gap-[8px]">
        <div className="flex justify-between text-[14px] text-text-secondary">
          <span>Subtotal</span>
          <span>{formatCents(subtotalCents)}</span>
        </div>
        <div className="flex justify-between text-[14px] text-text-secondary">
          <span>Tax ({Math.round(TAX_RATE * 100)}%)</span>
          <span>{formatCents(taxCents)}</span>
        </div>
        <div className="flex justify-between text-[16px] font-bold text-text-primary pt-[8px] border-t border-border-default">
          <span>Total</span>
          <span>{formatCents(totalCents)}</span>
        </div>

        {/* Checkout/payment is explicitly out of scope for V1 (see
            docs/project-context.md §4) — this button is presentational
            only, matching the pattern used elsewhere in the app for
            not-yet-built flows (e.g. SearchBar's onSubmit). */}
        <button type="button" onClick={() => {}} className="mt-[8px] w-full">
          Checkout
        </button>
      </div>
    </main>
  )
}

export default CartPage
