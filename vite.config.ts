import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shared': fileURLToPath(new URL('./shared', import.meta.url)),
    },
  },
  server: { watch: { ignored: ['**/output/**', '**/.playwright-cli/**'] } },
  build: {
    outDir: 'dist/client',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/')) {
            if (id.includes('/zod')) return 'validation';
            if (id.includes('/motion') || id.includes('/framer-motion')) return 'motion';
            if (id.includes('/@radix-ui/')) return 'ui';
          }
        },
      },
    },
  },
});
