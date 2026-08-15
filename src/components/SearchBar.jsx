// SearchBar — see docs/component-spec.md §3 for the full spec.
//
// Token gaps: the spec's gap between input/button (12px) does have a real
// token, but the left padding (20px) and font-size (14px) don't — the
// spacing scale is 4/8/12/16/24/32/48/64px and the type scale only has
// 12px (label) / 16px (body) roles, nothing at 14px or 20px. Those two use
// Tailwind arbitrary values rather than rounding to a nearby token.
//
// Not wired to a real search/research backend yet — there isn't one.
// onSubmit is called with the current value; the caller decides what (if
// anything) happens with it.

function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'e.g. a fragrance-free all-purpose cleaner',
  isLoading = false,
  ariaLabel = "Describe what you're looking for",
  submitLabel = 'Ask Clean Shopper',
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit(value)
      }}
      className="flex gap-[12px] bg-surface-subtle border border-border-default rounded-pill py-[6px] pr-[6px] pl-[20px]"
    >
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        disabled={isLoading}
        className="flex-1 border-none bg-transparent text-[14px] text-text-primary placeholder:text-text-secondary outline-none"
      />
      <button type="submit" disabled={isLoading} className="flex-shrink-0">
        {isLoading ? 'Searching…' : submitLabel}
      </button>
    </form>
  )
}

export default SearchBar
