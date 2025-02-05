import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'https://my-real-estate-app-pyjg.vercel.app', 
        changeOrigin: true,
        secure: true,
      },
    },
  },
  plugins: [react()],
});
