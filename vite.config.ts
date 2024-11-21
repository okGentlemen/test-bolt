import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  root: '.',
  base: '/',
  publicDir: 'public',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/web')
    }
  },
  server: {
    port: parseInt(process.env.VITE_PORT || '5000'),
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.PORT || '3000'}`,
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});