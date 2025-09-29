import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
 
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',        // From main branch (mobile testing)
    port: 3000,             // From main branch (mobile testing)
    // Aggressively disable ALL WebSocket/HMR features
    hmr: false,             // Completely disable HMR
    // Disable file watching to prevent any WebSocket triggers
    watch: {
      usePolling: false,
      ignored: ['**/node_modules/**', '**/.git/**', '**/*']
    },
    // Force disable all dev server features that might cause WebSocket issues
    middlewareMode: false,
    fs: {
      strict: false
    },
    // Force disable all WebSocket connections
    cors: true,
    proxy: {                // From elizaisgettinungry branch
      '/api': {
        target: 'http://backend:8080',
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
