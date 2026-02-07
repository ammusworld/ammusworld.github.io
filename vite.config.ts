import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/vsite/',  // GitHub repo name for Pages
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
