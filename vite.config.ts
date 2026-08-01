/* Vite config for building the frontend react app: https://vite.dev/config/ */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8080,
    // Em dev, o front (Vite/8080) fala com a API das Pages Functions servida
    // pelo `wrangler pages dev` (8788). Em produção /api é mesma origem.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8788',
        changeOrigin: true,
      },
    },
  },
  experimental: {
    enableNativePlugin: true
  },
  build: {
    minify: mode !== 'development',
    sourcemap: mode === 'development',
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return
        }
        warn(warning)
      },
    },
  },
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode ?? process.env.NODE_ENV ?? 'production'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // @hookform/resolvers/zod importa "zod/v4/core"; sob pnpm o rolldown não
      // resolve esse subpath a partir do store. Apontamos para o arquivo real.
      'zod/v4/core': path.resolve(__dirname, './node_modules/zod/v4/core/index.js'),
    },
  },
}))
