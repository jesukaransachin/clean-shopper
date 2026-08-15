// Stepper — quantity +/- control. Replaces ProductCard's "Add to Cart"
// button once quantity > 0, and used again in CartPage's line items.
// Not yet in docs/component-spec.md as a formally specced component —
// built directly alongside the cart feature; spec can be backfilled if
// this needs a second design pass.

function Stepper({ quantity, onIncrement, onDecrement, label }) {
  return (
    <div className="inline-flex items-center rounded-pill bg-brand-primary text-text-inverse">
      <button
        type="button"
        onClick={onDecrement}
        aria-label={`Decrease quantity of ${label}`}
        className="w-[28px] h-[28px] p-0 rounded-pill bg-transparent flex items-center justify-center text-[16px] font-semibold leading-none hover:bg-brand-primary-dark"
      >
        −
      </button>
      <span className="min-w-[20px] text-center text-[14px] font-semibold" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        aria-label={`Increase quantity of ${label}`}
        className="w-[28px] h-[28px] p-0 rounded-pill bg-transparent flex items-center justify-center text-[16px] font-semibold leading-none hover:bg-brand-primary-dark"
      >
        +
      </button>
    </div>
  )
}

export default Stepper
