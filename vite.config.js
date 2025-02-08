import { defineConfig } from 'vite';
import createExternal from 'vite-plugin-external';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
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
  plugins: [
    createExternal({
      externals: {
        history: 'history'
      }
    })
  ],
  server: {
    open: 'app',
    proxy: {
      // Handle all paths under /app/* and redirect to index.html
      '^/app.*': {
        target: 'http://localhost:5173',
        rewrite: () => '/test/index.html',
        changeOrigin: true
      },
      '^/downloads.*': {
        target: 'http://localhost:5173',
        rewrite: () => '/test/downloads.html',
        changeOrigin: true
      }
    }
  },
});