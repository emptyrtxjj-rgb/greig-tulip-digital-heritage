import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { assistantPlugin } from './server/assistantPlugin.js'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const assistantConfig = () => ({
    apiKey: env.OPENAI_API_KEY || process.env.OPENAI_API_KEY || '',
    model: env.OPENAI_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini',
  })

  const apiProxy = {
    '/api': {
      target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:8000',
      changeOrigin: true,
      bypass(req) {
        if (req.url?.startsWith('/api/assistant')) return req.url
      },
    },
  }

  return {
    plugins: [react(), tailwindcss(), assistantPlugin(assistantConfig)],
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: apiProxy,
    },
    preview: {
      proxy: apiProxy,
    },
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('/node_modules/react-leaflet/') || id.includes('/node_modules/leaflet/')) return 'map-vendor'
            if (id.includes('/node_modules/gsap/')) return 'scroll-animations'
          },
        },
      },
    },
  }
})
