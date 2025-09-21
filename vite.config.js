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
      fileName(format, entryName) {
        return entryName + (format === 'es' ? '.mjs' : '.js');
      }
    },
    sourcemap: true,
    target: 'es2022',
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
        changeOrigin: false
      },
      '^/downloads.*': {
        target: 'http://localhost:5173',
        rewrite: () => '/test/downloads.html',
        changeOrigin: false
      },
      '^/~/navigation-in': {
        target: 'http://localhost:5173',
        rewrite: () => '/test/navigation-in.json',
        changeOrigin: false
      },
      '^/~/navigation-out': {
        target: 'http://localhost:5173',
        rewrite: () => '/test/navigation-out.json',
        changeOrigin: false
      },
      '^/~/oauth/login.*': {
        target: 'http://localhost:5173',
        rewrite: () => '/test/loggedin.html',
        changeOrigin: false
      },
      '^/~/oauth/logout.*': {
        target: 'http://localhost:5173',
        rewrite: () => '/test/loggedout.html',
        changeOrigin: false
      },
      '^/~/state/in': {
        target: 'http://localhost:5173',
        rewrite: () => '/test/loggedin.json',
        changeOrigin: false
      },
      '^/~/state/out': {
        target: 'http://localhost:5173',
        rewrite: () => '/test/loggedout.json',
        changeOrigin: false
      },
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