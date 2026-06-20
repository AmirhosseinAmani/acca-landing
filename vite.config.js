import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    modulePreload: {
      resolveDependencies(filename, deps, { hostType }) {
        if (hostType !== 'html') return deps;

        return deps.filter((dep) => !dep.includes('vendor-framer'));
      },
    },
    // Split vendor libraries into separate cacheable chunks
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/');
          if (
            normalizedId.includes('/node_modules/react/') ||
            normalizedId.includes('/node_modules/react-dom/') ||
            normalizedId.includes('/node_modules/scheduler/')
          ) return 'vendor-react';
          if (normalizedId.includes('/node_modules/lucide-react/')) return 'vendor-lucide';
        },
      },
    },
    // Raise warning limit – framer-motion is expected to be large
    chunkSizeWarningLimit: 700,
    // Target modern browsers (Safari 14+, Chrome 87+) for smaller output
    target: ['es2020', 'safari14'],
  },
})
