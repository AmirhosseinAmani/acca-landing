import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Split vendor libraries into separate cacheable chunks
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/framer-motion')) return 'vendor-framer';
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) return 'vendor-react';
          if (id.includes('node_modules/lucide-react')) return 'vendor-lucide';
        },
      },
    },
    // Raise warning limit – framer-motion is expected to be large
    chunkSizeWarningLimit: 700,
    // Target modern browsers (Safari 14+, Chrome 87+) for smaller output
    target: ['es2020', 'safari14'],
  },
})