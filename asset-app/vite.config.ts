import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 開発時のみ Yahoo Finance / 投信 / CoinGecko を `/proxy/...` で叩けるようにしておく。
// 本番（静的ホスティング）ではこのプロキシは使えないため、設定画面で公開CORSプロキシURLを指定する。
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/proxy/yahoo': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/proxy\/yahoo/, ''),
      },
      '/proxy/coingecko': {
        target: 'https://api.coingecko.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/proxy\/coingecko/, ''),
      },
    },
  },
});
