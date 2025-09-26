import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
 
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',        // From main branch (mobile testing)
    port: 3000,             // From main branch (mobile testing)
    hmr: false,             // Disable HMR to stop WebSocket errors
    ws: false,              // Completely disable WebSocket
    watch: {
      usePolling: false,    // Disable file watching
      ignored: ['**/node_modules/**', '**/.git/**']
    },
    // Completely disable all dev server features that might cause WebSocket issues
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
