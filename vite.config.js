// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  // When deploying to GitHub Pages as a project site, set base to
  // '/<repo-name>/' so built asset URLs include the repository path.
  // Update this if you change the repository name or deploy to a user site.
  base: '/lotus-bf-frontend-bloggerwang1217/',

  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    allowedHosts: ['mil.psy.ntu.edu.tw'],
    fs: {
      allow: ['src', 'public', '.']
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url))
      }
    }
  }
})

