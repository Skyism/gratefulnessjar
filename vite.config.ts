import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { entriesApiPlugin } from './server/entriesApiPlugin'
import { momentsApiPlugin } from './server/momentsApiPlugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), entriesApiPlugin(), momentsApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
