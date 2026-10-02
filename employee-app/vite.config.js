import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Built into ../app so it's served from the same origin as the agent portal (localhost:3000/app/)
// and shares localStorage 'neev_employee_db' with it.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: { outDir: '../app', emptyOutDir: true },
})
