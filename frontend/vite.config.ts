import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'node:path'
import { stripeCheckoutPlugin } from './vite/stripeCheckoutPlugin.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const frontendEnv = loadEnv(mode, process.cwd(), '')
  const mailEnv = loadEnv(mode, resolve(process.cwd(), '../backend/server'), '')
  const env = { ...mailEnv, ...frontendEnv }

  return {
    plugins: [react(), tailwindcss(), stripeCheckoutPlugin(env)],
    server: {
      // Listen on all local interfaces so both localhost and 127.0.0.1 work
      // (Cursor/embedded browsers often hit localhost → different loopback path).
      host: true,
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: env.MAIL_API_URL?.replace(/\/$/, '') || 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 700,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              if (id.includes('react-router') || id.includes('/react/') || id.includes('/react-dom/')) {
                return 'vendor-react'
              }
              if (id.includes('framer-motion')) return 'vendor-motion'
              if (id.includes('@supabase') || id.includes('@tanstack')) return 'vendor-data'
            }
            return undefined
          },
        },
      },
    },
  }
})
