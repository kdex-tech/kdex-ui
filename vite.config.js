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
    open: '/test/index.html' // Automatically open the test page when running npm run dev
  }
});