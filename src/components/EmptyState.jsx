// EmptyState — see docs/component-spec.md §8 for the full spec.
//
// Token gaps: the spec's title is 16px/700 and description is 13px.
// Neither combination has a matching Tailwind token — the `body` fontSize
// token is 16px but bundles font-weight: 400 (conflicts with the 700 this
// needs), and 13px isn't on the type scale at all (12/14/16/20/25/31/39).
// Both use arbitrary values below rather than rounding to a nearby token.

function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center text-center py-[64px] px-[16px]">
      <p className="text-[16px] font-bold text-text-primary m-0">{title}</p>
      {description && (
        <p className="text-[13px] text-text-secondary mt-[4px] mb-0">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-[16px] rounded-pill bg-brand-primary text-text-inverse font-semibold text-[14px] px-[24px] py-[10px] hover:bg-brand-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary-dark"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState
