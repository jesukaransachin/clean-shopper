/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#2F6B4F',
        'brand-primary-dark': '#1F4A36',
        'brand-gradient-start': '#2F6B4F',
        'brand-gradient-end': '#E08A3C',
        'accent-verified': '#1B7F5C',
        'accent-alert': '#C0392B',
        'surface-base': '#FFFFFF',
        'surface-subtle': '#F7F5F0',
        'surface-sunken': '#EFEBE2',
        'text-primary': '#1A1A17',
        'text-secondary': '#5C5A52',
        'text-inverse': '#FFFFFF',
        'border-default': '#E4E0D6',
      },

      fontFamily: {
        // design-system.md §3: single typeface, Inter, differentiated by
        // weight rather than family. 'sans-serif' is a generic fallback,
        // not a spec value.
        sans: ['Inter', 'sans-serif'],
      },

      // design-system.md §3 typography table — named by role exactly as
      // the spec names them, not Tailwind's default text-sm/text-lg scale.
      fontSize: {
        display: ['39px', { fontWeight: '800', lineHeight: '1.1' }], // Display / Hero
        heading: ['25px', { fontWeight: '700' }], // Headings
        body: ['16px', { fontWeight: '400' }], // Body
        label: ['12px', { fontWeight: '600', letterSpacing: '0.04em' }], // Labels / Badges
        numeral: ['16px', { fontWeight: '700' }], // Numerals / Price (tabular nums applied via font-variant-numeric utility where used)
      },

      // design-system.md §5: base unit 8px, scale 4/8/12/16/24/32/48/64.
      // Keyed as "<px>px" (not bare numbers) so these don't collide with
      // Tailwind's own default spacing scale, which already uses bare
      // numeric keys (e.g. Tailwind's default `4` = 1rem/16px, not 4px).
      spacing: {
        '4px': '4px',
        '8px': '8px',
        '12px': '12px',
        '16px': '16px',
        '24px': '24px',
        '32px': '32px',
        '48px': '48px',
        '64px': '64px',
      },

      // design-system.md only states two concrete radius values anywhere
      // in the doc: "fully rounded (pill)" for buttons/badges (§4 Buttons,
      // Badges) and "rounded 16px corners" for the chat bubble (§4 Chat
      // Bubbles). There is no general small/medium radius value documented
      // — implementation CSS uses 8px/12px in places, but those aren't
      // written down in design-system.md, so they're deliberately not
      // included here. Add them to the spec first if they should become
      // real tokens.
      borderRadius: {
        pill: '999px', // Buttons, Badges
        bubble: '16px', // Chat Bubbles (also matches Product Card's corner radius in implementation, but the spec only names it for bubbles)
      },

      // boxShadow deliberately NOT overridden: design-system.md defines no
      // shadow tokens anywhere — not one box-shadow value or elevation
      // section in the entire document. This design system is flat/
      // border-based by design (§1 "confidence over clutter" — elevation
      // via `border-default`, not shadows). Adding shadow values here
      // would mean inventing numbers the spec doesn't have. If shadows are
      // actually needed now, they need to be designed and added to
      // design-system.md first — tell me the values and I'll wire them in.
    },
  },
  plugins: [],
}
