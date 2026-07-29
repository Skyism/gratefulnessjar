import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { entriesApiPlugin } from './server/entriesApiPlugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), entriesApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
