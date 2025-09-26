import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
 
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',        // From main branch (mobile testing)
    port: 3000,             // From main branch (mobile testing)
    hmr: false,             // Disable HMR to stop WebSocket errors
    proxy: {                // From elizaisgettinungry branch
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Remove origin and referer headers
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
          });
        }
      }
    }
  },
  // Ensure proper handling of static files (from main branch)
  publicDir: 'public',
  build: {
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
})
