import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Built into ../agent so it's served from the same origin as employee.html (localhost:3000/agent/)
// and can read the applications the employee app saves in localStorage.
export default defineConfig({
  base: '/agent/',
  plugins: [react(), tailwindcss()],
  build: { outDir: '../agent', emptyOutDir: true },
})
