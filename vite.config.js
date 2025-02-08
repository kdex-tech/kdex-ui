import { defineConfig } from 'vite';
import { resolve } from 'path';
import vitePluginExternal from 'vite-plugin-external';
import dts from 'vite-plugin-dts';
import pkg from './package.json';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index'
    },
    sourcemap: true,
    rollupOptions: {
      output: {
        format: 'es'
      }
    }
  },
  plugins: [
    vitePluginExternal({
      externalizeDeps: Object.keys(pkg.dependencies)
    }),
    dts({
      insertTypesEntry: true,
      include: ['src/**/*.ts'],
    }),
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
      '@': resolve(__dirname, 'src')
    }
  },
  root: '.',
});