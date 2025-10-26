import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Default base is root. Deployment workflows can override with --base.
const base = process.env.VITE_BASE_PATH || '/';

export default defineConfig({
  base,
  plugins: [
    react(),
  ],
});
