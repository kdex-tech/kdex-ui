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
    {
      name: 'local-dev-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const cookies = req.headers.cookie || '';
          const isLoggedIn = cookies.includes('auth=true');

          if (req.url === '/' || req.url.startsWith('/app')) {
            req.url = '/test/index.html';
          } else if (req.url.startsWith('/downloads')) {
            req.url = '/test/downloads.html';
          } else if (req.url.startsWith('/-/login')) {
            res.setHeader('Set-Cookie', 'auth=true; Path=/');
            res.writeHead(302, { Location: '/app' });
            res.end();
            return;
          } else if (req.url.startsWith('/-/logout')) {
            res.setHeader('Set-Cookie', 'auth=false; Path=/; Max-Age=0');
            res.writeHead(302, { Location: '/app' });
            res.end();
            return;
          } else if (req.url.startsWith('/-/state')) {
            if (isLoggedIn) {
              req.url = '/test/loggedin.json'
            } else {
              res.writeHead(401, {});
              res.end();
            }
          }
          next();
        });
      }
    },
    vitePluginExternal({
      externalizeDeps: Object.keys(pkg.dependencies || {})
    }),
    dts({
      insertTypesEntry: true,
      include: ['src/**/*.ts'],
    }),
  ],
  server: {
    open: 'app',
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
      '@': resolve(__dirname, 'src'),
      '@kdex-tech/ui': resolve(__dirname, 'src')
    }
  },
  root: '.',
});