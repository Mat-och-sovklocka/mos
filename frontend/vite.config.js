import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
 
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',        // From main branch (mobile testing)
    port: 3000,             // From main branch (mobile testing)
    // NUCLEAR OPTION: Disable EVERYTHING that could trigger WebSocket
    hmr: false,             // Completely disable HMR
    ws: false,              // Explicitly disable WebSocket server
    // Disable file watching completely
    watch: null,            // Completely disable file watching
    // Force disable all dev server features
    middlewareMode: false,
    fs: {
      strict: false,
      allow: ['..']         // Restrict file system access
    },
    // Disable all WebSocket-related features
    cors: true,
    // Override any WebSocket attempts
    configureServer(server) {
      server.ws = null;     // Kill WebSocket server
    },
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
