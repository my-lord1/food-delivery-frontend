import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  server: {
    port: 5173,
  },
  resolve: {
    dedupe: ['react', 'react-dom', 'react-redux']
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-redux']
  }
})