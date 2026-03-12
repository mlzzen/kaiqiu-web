import { defineConfig } from 'vite';
import vize from '@vizejs/vite-plugin';

export default defineConfig({
  plugins: [vize()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/devApi': {
        target: 'https://kaiqiuwang.cc/xcx/public/index.php/api',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/devApi/, ''),
      },
    },
  },
});
