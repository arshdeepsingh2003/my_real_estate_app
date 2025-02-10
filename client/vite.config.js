import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true, // Ensures proper proxying
        secure: false, // If using HTTPS, set this to true
        ws: true, // Enables WebSocket proxying
      },
    },
    open: true, // Automatically opens the browser on start
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src', // Allows importing from the src folder using @
    },
  },
  build: {
    outDir: 'dist', // Output directory
    sourcemap: true, // Useful for debugging
  },
})
