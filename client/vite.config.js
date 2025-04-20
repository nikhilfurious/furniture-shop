import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    proxy: {
      // Proxy any /api/* request to your deployed backend
      '/api': {
        target: 'https://furniture-shop-dvh6.vercel.app',
        changeOrigin: true,
        secure: true,
        // rewrite path if your backend sits under /api already, you can omit:
        // rewrite: (path) => path.replace(/^\/api/, '')
      },
    },
  },
})
