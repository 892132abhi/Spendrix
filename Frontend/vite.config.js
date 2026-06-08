import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    host: true,       // 🎯 Crucial: Tells Vite to listen on the Docker container network
    port: 5173,
    strictPort: true, 
    hmr: {
      clientPort: 80, // 🎯 Crucial: Forces the browser websocket to use Nginx's port 80!
    },
    watch: {
      usePolling: true, // Prevents file sync drops between Windows/Linux container mounts
    }
  }
})