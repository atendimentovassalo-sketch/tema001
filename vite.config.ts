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
      output: {
        /* Separa o que quase nunca muda do que muda a cada deploy.
         *
         * React e o roteador são estáveis: num arquivo próprio, o navegador de
         * quem já visitou o site reaproveita do cache mesmo depois de a gente
         * publicar mudança — hoje qualquer alteração invalidava o bundle
         * inteiro, e a pessoa rebaixava tudo de novo.
         *
         * `zod` + `react-hook-form` viram outro grupo: são 275 KB de fonte que
         * só o formulário de homenagem e o editor precisam. */
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/[\/]node_modules[\/](react|react-dom|scheduler)[\/]/.test(id))
            return 'react'
          if (/[\/]node_modules[\/](react-router|react-router-dom|@remix-run)[\/]/.test(id))
            return 'router'
          if (/[\/]node_modules[\/](zod|react-hook-form|@hookform)[\/]/.test(id))
            return 'forms'
        },
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
