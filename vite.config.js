import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages serves this project at /clean-shopper/, not the domain
  // root — only apply that prefix for production builds so local dev
  // (npm run dev, localhost:5173/) is unaffected.
  base: command === 'build' ? '/clean-shopper/' : '/',
  plugins: [react()],
}))
