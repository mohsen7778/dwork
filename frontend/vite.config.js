import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // relative paths so Vercel finds assets correctly

  // FIX: proxy /api calls to the local backend during development.
  // Without this, dev requests to /api/auto-scan hit Vercel's CDN (no backend).
  // In production (Vercel), VITE_API_BASE_URL points to the Render service,
  // so the frontend uses the full URL and this proxy is bypassed.
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
