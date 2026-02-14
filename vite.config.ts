import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: './index.vite.html'
      }
    }
  },
  server: {
    host: '0.0.0.0',  // 允许外部访问（支持域名和 IP）
    port: 8000,
    open: true,
    cors: true,
  },
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@utils': '/src/utils',
      '@styles': '/src/styles',
      '@config': '/src/config',
      '@types': '/src/types'
    }
  }
});
