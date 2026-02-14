import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // 生产环境关闭 sourcemap 以减小体积
    rollupOptions: {
      input: {
        main: './index.vite.html'
      }
    }
  },
  // base: '/', // Vercel, Netlify, Cloudflare 使用根路径
  // base: '/pricing-dashboard/', // GitHub Pages 需要设置仓库名
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
