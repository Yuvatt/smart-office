import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Crucial for Docker: allows access from outside the container
    port: 5173,
    watch: {
      usePolling: true, // Recommended for Docker on macOS/Windows to detect file changes
    },
  },
})