import { defineConfig } from 'vite';
import { resolve } from 'path';
import createExternal from 'vite-plugin-external';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index'
    },
    sourcemap: true,
    rollupOptions: {
      external: [], // Add external dependencies here if any
      output: {
        format: 'es'
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
    },
    watch: {
      usePolling: true,
      ignored: ['!**/node_modules/**']
    },
    hmr: {
      overlay: true
    }
  },
  resolve: {
    alias: {
      '@kdex/ui': resolve(__dirname, 'src/index.ts')
    }
  },
  root: '.',
});