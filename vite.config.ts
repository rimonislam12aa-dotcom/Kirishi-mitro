import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

function normalizeBase(rawBase?: string): string {
  const value = rawBase?.trim();
  if (!value || value === '/') {
    return '/';
  }
  if (value === './' || value === '.') {
    return './';
  }
  const trimmed = value.replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${trimmed}/` : '/';
}

export default defineConfig(() => {
  const base = normalizeBase(process.env.VITE_BASE_PATH);
  const outDir = process.env.VITE_OUT_DIR?.trim() || 'dist';
  const isSingleFile = process.env.VITE_SINGLE_FILE === 'true';
  const isRelativeBase = base === './';
  const assetPrefix = isRelativeBase ? '' : base;
  const escapedBase = base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  return {
    base,
    build: {
      outDir,
      emptyOutDir: true,
      ...(isSingleFile
        ? {
            cssCodeSplit: false,
            assetsInlineLimit: 100000000,
            rolldownOptions: {
              output: {
                codeSplitting: false,
              },
            },
          }
        : {
            rolldownOptions: {
              output: {
                manualChunks(id: string) {
                  if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
                    return 'react-vendor';
                  }
                  if (id.includes('node_modules/lucide-react')) {
                    return 'lucide-icons';
                  }
                  if (id.includes('node_modules/qrcode')) {
                    return 'qr-engine';
                  }
                  if (
                    id.includes('src/catalog/cropCalendarData') ||
                    id.includes('src/catalog/seedData') ||
                    id.includes('src/catalog/agroAdvisoryData') ||
                    id.includes('src/catalog/offlineDiseaseMatcher') ||
                    id.includes('src/catalog/i18n')
                  ) {
                    return 'catalog-data';
                  }
                },
              },
            },
          }),
    },
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        disable: isSingleFile,
        registerType: 'autoUpdate',
        includeAssets: [
          'icon.svg',
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-maskable-512x512.png',
        ],
        manifest: {
          id: isRelativeBase ? './' : base,
          name: 'কৃষি মিত্র — Krishi Mitra',
          short_name: 'KrishiMitra',
          description:
            'Offline-first smart agriculture app with GPS weather push alerts, camera disease scan, crop calendar, crop care tips, and audio guidance.',
          theme_color: '#14532D',
          background_color: '#F7F8F5',
          display: 'standalone',
          display_override: ['standalone', 'minimal-ui'],
          orientation: 'portrait-primary',
          start_url: isRelativeBase ? './' : base,
          scope: isRelativeBase ? './' : base,
          categories: ['agriculture', 'weather', 'utilities'],
          icons: [
            {
              src: `${assetPrefix}pwa-192x192.png`,
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: `${assetPrefix}pwa-512x512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: `${assetPrefix}pwa-maskable-512x512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
          shortcuts: [
            {
              name: 'রোগ স্ক্যান',
              short_name: 'স্ক্যান',
              url: `${isRelativeBase ? './' : base}#scanner`,
              icons: [{ src: `${assetPrefix}pwa-192x192.png`, sizes: '192x192', type: 'image/png' }],
            },
            {
              name: 'ফসল পঞ্জিকা',
              short_name: 'পঞ্জিকা',
              url: `${isRelativeBase ? './' : base}#calendar`,
              icons: [{ src: `${assetPrefix}pwa-192x192.png`, sizes: '192x192', type: 'image/png' }],
            },
            {
              name: 'আবহাওয়া',
              short_name: 'আবহাওয়া',
              url: `${isRelativeBase ? './' : base}#weather`,
              icons: [{ src: `${assetPrefix}pwa-192x192.png`, sizes: '192x192', type: 'image/png' }],
            },
            {
              name: 'চাষের টিপস',
              short_name: 'টিপস',
              url: `${isRelativeBase ? './' : base}#tips`,
              icons: [{ src: `${assetPrefix}pwa-192x192.png`, sizes: '192x192', type: 'image/png' }],
            },
          ],
        },
        workbox: {
          cleanupOutdatedCaches: true,
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          navigateFallback: isRelativeBase ? 'index.html' : `${base}index.html`,
          navigateFallbackDenylist: [
            isRelativeBase ? /\/api\// : new RegExp(`^${escapedBase}api/`),
            /^\/_vercel\//,
          ],
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/api\.open-meteo\.com\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'weather-api-cache',
                networkTimeoutSeconds: 4,
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 12,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/air-quality-api\.open-meteo\.com\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'aqi-api-cache',
                networkTimeoutSeconds: 4,
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 12,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^\/_vercel\/.*/i,
              handler: 'NetworkOnly',
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'classic',
          navigateFallback: 'index.html',
        },
      }),
      // Copies src/assets into outDir, ensures .nojekyll for docs, and optionally inlines single-file index.html
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const targetOutDir = path.resolve(currentDir, outDir);

          if (isSingleFile && fs.existsSync(targetOutDir)) {
            const htmlPath = path.resolve(targetOutDir, 'index.html');
            if (fs.existsSync(htmlPath)) {
              let html = fs.readFileSync(htmlPath, 'utf-8');
              const cssMatch = html.match(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+\.css)"[^>]*>/i);
              if (cssMatch) {
                const cssRel = cssMatch[1].replace(/^\.\//, '');
                const cssFile = path.resolve(targetOutDir, cssRel);
                if (fs.existsSync(cssFile)) {
                  const cssCode = fs.readFileSync(cssFile, 'utf-8').replace(/<\/style>/gi, '<\\/style>');
                  html = html.replace(cssMatch[0], () => `<style>${cssCode}</style>`);
                }
              }

              const jsMatch = html.match(/<script[^>]+type="module"[^>]+src="([^"]+\.js)"[^>]*><\/script>/i);
              if (jsMatch) {
                const jsRel = jsMatch[1].replace(/^\.\//, '');
                const jsFile = path.resolve(targetOutDir, jsRel);
                if (fs.existsSync(jsFile)) {
                  const jsCode = fs.readFileSync(jsFile, 'utf-8').replace(/<\/script>/gi, '<\\/script>');
                  html = html.replace(jsMatch[0], () => `<script type="module">${jsCode}</script>`);
                }
              }

              html = html.replace(/<link[^>]+rel="manifest"[^>]*>/gi, '');
              fs.writeFileSync(htmlPath, html, 'utf-8');

              for (const entry of fs.readdirSync(targetOutDir)) {
                if (entry !== 'index.html') {
                  fs.rmSync(path.resolve(targetOutDir, entry), { recursive: true, force: true });
                }
              }
              fs.writeFileSync(path.resolve(targetOutDir, '.nojekyll'), '');
            }
            return;
          }

          const srcAssets = path.resolve(currentDir, 'src/assets');
          const destAssets = path.resolve(targetOutDir, 'src/assets');
          if (fs.existsSync(targetOutDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, destAssets, {recursive: true, force: true});
          }
          if (outDir === 'docs' && fs.existsSync(targetOutDir)) {
            fs.writeFileSync(path.resolve(targetOutDir, '.nojekyll'), '');
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(currentDir, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
