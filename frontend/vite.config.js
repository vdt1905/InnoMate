import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/',
  plugins: [
    // Was declared as a dependency but never registered, so dev had no Fast Refresh.
    react(),
    tailwindcss(),
  ],
})
