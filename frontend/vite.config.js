import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Yeh line zaroori hai

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Yeh function call zaroori hai
  ],
})