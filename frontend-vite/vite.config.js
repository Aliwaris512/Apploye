import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  return {
    plugins: [
      react({
        fastRefresh: true,
        jsxImportSource: '@emotion/react',
      }),
    ],
    server: {
      port: 3001,
      strictPort: true,
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:9000',
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
      fs: {
        strict: false,
        allow: ['..'],
      },
    },
    resolve: {
      alias: {
        '@': '/src',
        '@components': '/src/components',
        '@features': '/src/features',
        '@utils': '/src/utils',
        '@assets': '/src/assets',
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode === 'development', // Only generate sourcemaps in development
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode !== 'development',
          drop_debugger: mode !== 'development',
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            mui: [
              '@mui/material',
              '@mui/material/Typography',
              '@mui/material/styles',
              '@mui/icons-material',
              '@mui/material/useMediaQuery',
              '@emotion/react',
              '@emotion/styled',
            ],
            datepickers: [
              '@mui/x-date-pickers',
              '@mui/x-date-pickers/DatePicker',
              '@mui/x-date-pickers/AdapterDateFns',
              '@mui/x-date-pickers/locales',
              'date-fns',
              'date-fns/locale',
            ],
            redux: ['@reduxjs/toolkit', 'react-redux', 'redux-persist'],
          },
        },
        external: [],
        onwarn(warning, warn) {
          if (
            warning.code === 'MODULE_LEVEL_DIRECTIVE' ||
            warning.code === 'UNUSED_EXTERNAL_IMPORT' ||
            warning.message.includes('@mui/material')
          ) {
            return
          }
          warn(warning)
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@mui/material',
        '@emotion/react',
        '@emotion/styled',
        'date-fns',
        'date-fns/locale',
        'date-fns/format',
        'date-fns/parse',
      ],
      exclude: [
        'js-big-decimal',
        'msw',
        '@mswjs/interceptors',
        '@mswjs/interceptors-form-data',
        '@mswjs/interceptors-http',
        '@mswjs/interceptors-http-request',
        '@mswjs/interceptors-http-response',
        '@mswjs/interceptors-xml-http-request',
        '@mswjs/interceptors-fetch',
        'strict-event-emitter',
        'headers-polyfill',
        'undici',
        'node-fetch',
        'cross-fetch',
        'whatwg-fetch',
        'abort-controller-polyfill',
        'event-target-shim',
        'web-streams-polyfill',
        'formdata-polyfill',
        'blob-polyfill',
        'url-polyfill',
        'webcrypto',
        'node-libs-browser',
        'buffer',
        'stream',
        'path',
        'crypto',
        'util',
        'os',
        'zlib',
        'http',
        'https',
        'url',
        'querystring',
        'fs',
        'child_process',
        'net',
        'tls',
        'dns',
        'dgram',
        'module',
        'assert',
        'constants',
        'domain',
        'events',
        'punycode',
        'readline',
        'repl',
        'string_decoder',
        'sys',
        'timers',
        'tty',
        'vm',
        'worker_threads',
        'async_hooks',
        'cluster',
        'diagnostics_channel',
        'dns/promises',
        'fs/promises',
        'http2',
        'inspector',
        'perf_hooks',
        'process',
        'stream/consumers',
        'stream/promises',
        'stream/web',
        'timers/promises',
        'trace_events',
        'util/types',
        'v8',
        'wasi',
      ],
    },
    cacheDir: './.vite/cache',
    worker: {
      format: 'es',
    },
  }
})
