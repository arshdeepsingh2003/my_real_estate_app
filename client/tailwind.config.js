import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
// https://vitejs.dev/config/
export default defineConfig({
  server:{
  port:3001,  
  proxy:{
    '/api':
    {target:'https://my-real-estate-app.onrender.com',
    secure:false,
    },
  },
},
  plugins: [react()],
})

