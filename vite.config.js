import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      external: [], // Add external dependencies here if any
      output: {
        preserveModules: true
      }
    }
  },
  server: {
    open: 'app/_/foo',
    proxy: {
      // Handle all paths under /app/* and redirect to index.html
      '^/app/.*': {
        target: 'http://localhost:5173',
        rewrite: () => '/test/index.html',
        changeOrigin: true
      }
    }
  },
});