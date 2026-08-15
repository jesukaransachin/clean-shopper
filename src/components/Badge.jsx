import './Badge.css'

const VARIANTS = {
  verified: { icon: '✓', className: 'badge-verified' },
  alert: { icon: '⚠', className: 'badge-alert' },
  trusted: { icon: '', className: 'badge-trusted' },
}

function Badge({ variant = 'trusted', children }) {
  const { icon, className } = VARIANTS[variant]
  return (
    <span className={`badge ${className}`}>
      {icon && <span aria-hidden="true">{icon}</span>} {children}
    </span>
  )
}

export default Badge
