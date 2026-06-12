import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// PWA instalable. El service worker cachea el shell de la app para uso offline.
// El diario y la memoria viven en IndexedDB (local, sin backend).
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Ruta Calma — apoyo para PPPD',
        short_name: 'Ruta Calma',
        description:
          'Apoyo y autocuidado para el mareo postural-perceptual persistente (PPPD). Complemento de la atención profesional, no tratamiento médico.',
        lang: 'es-MX',
        dir: 'ltr',
        theme_color: '#1E5050',
        background_color: '#F5EFE0',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,mp3,m4a}'],
        // Inyecta los manejadores de Web Push en el service worker generado.
        importScripts: ['push-sw.js'],
        // No cachear llamadas a la API de Anthropic.
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 20 } },
          },
        ],
      },
    }),
  ],
})
