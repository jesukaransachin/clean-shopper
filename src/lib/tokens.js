/**
 * Design tokens from docs/design-system.md, mirrored here as a plain JS
 * object for use in places CSS custom properties/Tailwind classes can't
 * reach (e.g. inline chart values, canvas drawing, non-DOM logic).
 *
 * Structure mirrors tailwind.config.js's theme.extend shape. Keep all
 * three in sync by hand — none of these files are generated from the
 * others.
 */

export const colors = {
  brandPrimary: '#2F6B4F',
  brandPrimaryDark: '#1F4A36',
  brandGradientStart: '#2F6B4F',
  brandGradientEnd: '#E08A3C',
  accentVerified: '#1B7F5C',
  accentAlert: '#C0392B',
  surfaceBase: '#FFFFFF',
  surfaceSubtle: '#F7F5F0',
  surfaceSunken: '#EFEBE2',
  textPrimary: '#1A1A17',
  textSecondary: '#5C5A52',
  textInverse: '#FFFFFF',
  borderDefault: '#E4E0D6',
}

export const fonts = {
  sans: ['Inter', 'sans-serif'],
  // Named by role exactly as design-system.md §3 names them.
  display: { size: '39px', weight: 800, lineHeight: 1.1 },
  heading: { size: '25px', weight: 700 },
  body: { size: '16px', weight: 400 },
  label: { size: '12px', weight: 600, letterSpacing: '0.04em' },
  numeral: { size: '16px', weight: 700 }, // tabular nums per spec
}

export const spacing = {
  '4px': '4px',
  '8px': '8px',
  '12px': '12px',
  '16px': '16px',
  '24px': '24px',
  '32px': '32px',
  '48px': '48px',
  '64px': '64px',
}

// Intentionally empty: design-system.md defines no shadow tokens. This
// system is flat/border-based by design (§1 "confidence over clutter").
// Do not add values here without adding them to design-system.md first.
export const shadows = {}

export const tokens = { colors, fonts, spacing, shadows }

export default tokens
