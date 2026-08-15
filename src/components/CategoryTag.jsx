// CategoryTag — see docs/component-spec.md §4 for the full spec.
//
// Token gap: the spec calls for 3px/9px padding and an 11px font size,
// matching SafetyBadge's actual scale exactly. Neither value exists in
// tailwind.config.js — the tokenized spacing scale starts at 4px, and the
// `label` fontSize token is 12px (design-system.md §3's general "Labels"
// role, not SafetyBadge's deliberately-shrunk 11px from §4). Using the
// nearest token (4px/12px) would be rounding, which the spec rules out, so
// those two values use Tailwind's arbitrary-value syntax instead. Every
// other value below is a real token.
//
// Bug fix: src/index.css has a global `button:hover { background-color:
// var(--brand-primary-dark) }` rule (meant for the default primary
// button). It matches every <button> in the app, including this one, and
// was silently giving unselected/hover tags a dark green background under
// near-black text — nearly unreadable. `hover:bg-transparent` below is a
// Tailwind class selector (specificity 0,2,0), which beats the plain
// `button:hover` element selector (0,1,1) regardless of CSS load order, so
// it reliably overrides the leak rather than depending on import order.

function CategoryTag({ label, selected = false, onToggle, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={selected}
      className={[
        'inline-flex items-center',
        'rounded-pill border',
        'px-[9px] py-[3px]', // spec: 3px 9px — no matching spacing token, see note above
        'text-[11px] font-semibold', // spec: 11px — no matching fontSize token, see note above
        'transition-colors',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary-dark',
        selected
          ? 'bg-brand-primary border-brand-primary text-text-inverse hover:bg-brand-primary'
          : 'bg-transparent border-border-default text-text-secondary hover:bg-transparent hover:border-brand-primary hover:text-text-primary',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-transparent disabled:border-border-default disabled:text-text-secondary disabled:hover:bg-transparent disabled:hover:border-border-default disabled:hover:text-text-secondary',
        disabled ? '' : 'cursor-pointer',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

export default CategoryTag
