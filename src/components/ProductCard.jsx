import Badge from './Badge'
import Stepper from './Stepper'
import './ProductCard.css'

function ProductCard({
  image,
  brand,
  name,
  price,
  badges = [],
  reason,
  onAddToCart,
  quantity = 0,
  onIncrement,
  onDecrement,
  saved = false,
  onToggleSave,
}) {
  const imageAlt = [brand, name].filter(Boolean).join(' ')

  return (
    <article className="product-card">
      <div className="product-image">
        {image ? (
          <img src={image} alt={imageAlt} loading="lazy" />
        ) : (
          <span className="product-image-placeholder">No image available</span>
        )}
        {onToggleSave && (
          <button
            type="button"
            className={`product-save-button${saved ? ' saved' : ''}`}
            onClick={onToggleSave}
            aria-pressed={saved}
            aria-label={saved ? `Remove ${name} from your list` : `Save ${name} to your list`}
          >
            <span aria-hidden="true">{saved ? '♥' : '♡'}</span>
          </button>
        )}
      </div>

      <div className="product-body">
        {brand && <p className="product-brand">{brand}</p>}
        <h3 className="product-name">{name}</h3>

        {badges.length > 0 && (
          <ul className="product-badges" role="list">
            {badges.map((badge) => (
              <li key={badge.label}>
                <Badge variant={badge.variant}>{badge.label}</Badge>
              </li>
            ))}
          </ul>
        )}

        {reason && <p className="product-reason">{reason}</p>}

        <div className="product-footer">
          {price && <span className="product-price">{price}</span>}
          {quantity > 0 ? (
            <Stepper
              quantity={quantity}
              onIncrement={onIncrement}
              onDecrement={onDecrement}
              label={name}
            />
          ) : (
            <button
              type="button"
              className="product-add-button"
              onClick={onAddToCart}
              aria-label={`Add ${name} to cart`}
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export default ProductCard
