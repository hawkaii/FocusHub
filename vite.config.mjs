import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@Components': resolve(__dirname, 'src/components'),
      '@Root': resolve(__dirname, 'src'),
      '@Store': resolve(__dirname, 'src/store'),
      '@App': resolve(__dirname, 'src'),
      '@Utils': resolve(__dirname, 'src/utils'),
    },
  },
})
