/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-957bde9c'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "pwa-maskable-512x512.png",
    "revision": "d8c344708a237395504514092247b64f"
  }, {
    "url": "pwa-512x512.png",
    "revision": "7cfee26a44544ae348e7262446d15789"
  }, {
    "url": "pwa-192x192.png",
    "revision": "49bfbb394f0fe8f80bebcc6a5ef38d8d"
  }, {
    "url": "index.html",
    "revision": "aed5ad7c73fe3597f2eece5f9a4a120b"
  }, {
    "url": "icon.svg",
    "revision": "6f5862cda0c04b3401bf6aae096cb7dd"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "f5cc9cb2ad304274fce00cb1d37e117f"
  }, {
    "url": "src/assets/images/hero_farmland_dawn_1795261297830.jpg",
    "revision": "b948d5bf6dd1bb958e5f0bf19cc9c332"
  }, {
    "url": "src/assets/images/crop_tomato_field_1795261298066.jpg",
    "revision": "f595ad8f3022933c0143a6659fead7f5"
  }, {
    "url": "src/assets/images/crop_rice_leaf_sample_1795261298022.jpg",
    "revision": "055e590cf70fdc829a0ac0578a2943ce"
  }, {
    "url": "src/assets/images/crop_potato_harvest_1795261297721.jpg",
    "revision": "eb2f1a929ff2d43eb288e6c96b01c89a"
  }, {
    "url": "assets/workbox-window.prod.es5-Bd17z0YL.js",
    "revision": null
  }, {
    "url": "assets/rolldown-runtime-WkwZ5CU-.js",
    "revision": null
  }, {
    "url": "assets/react-vendor-C28zv8iy.js",
    "revision": null
  }, {
    "url": "assets/qr-engine-CXHAcuVq.js",
    "revision": null
  }, {
    "url": "assets/lucide-icons-D78vOKzP.js",
    "revision": null
  }, {
    "url": "assets/index-CLW8QNgQ.css",
    "revision": null
  }, {
    "url": "assets/index-BoX79oTS.js",
    "revision": null
  }, {
    "url": "assets/hero_farmland_dawn_1795261297830-Bl3SH4kv.jpg",
    "revision": null
  }, {
    "url": "assets/crop_tomato_field_1795261298066-B62ZBEbM.jpg",
    "revision": null
  }, {
    "url": "assets/crop_rice_leaf_sample_1795261298022-zaEKdh4-.jpg",
    "revision": null
  }, {
    "url": "assets/crop_potato_harvest_1795261297721-BkBA18R6.jpg",
    "revision": null
  }, {
    "url": "assets/catalog-data-BBnO-LOF.js",
    "revision": null
  }, {
    "url": "assets/VisitorCounter-DCZQYuG6.js",
    "revision": null
  }, {
    "url": "assets/OfflineSyncDrawer-CLfkNH1w.js",
    "revision": null
  }, {
    "url": "assets/MarketPricesSection-w0-KWcP-.js",
    "revision": null
  }, {
    "url": "assets/KnowledgeBaseSection-CuLPTlka.js",
    "revision": null
  }, {
    "url": "assets/DiseaseScannerSection-DBbyfsF9.js",
    "revision": null
  }, {
    "url": "assets/CropTipsSection-BJYYXEJJ.js",
    "revision": null
  }, {
    "url": "assets/CropCalendarSection-BzvJRG5-.js",
    "revision": null
  }, {
    "url": "assets/AgroServiceHubSection-NIX786TG.js",
    "revision": null
  }, {
    "url": "data/krishi-knowledge-base.json",
    "revision": "f23e4a4784ca828b61d8f78cad1ec4c5"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "f5cc9cb2ad304274fce00cb1d37e117f"
  }, {
    "url": "icon.svg",
    "revision": "6f5862cda0c04b3401bf6aae096cb7dd"
  }, {
    "url": "pwa-192x192.png",
    "revision": "49bfbb394f0fe8f80bebcc6a5ef38d8d"
  }, {
    "url": "pwa-512x512.png",
    "revision": "7cfee26a44544ae348e7262446d15789"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "d8c344708a237395504514092247b64f"
  }, {
    "url": "manifest.webmanifest",
    "revision": "7044ea73998ab040a5a342ee88dee80c"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html"), {
    denylist: [/\/api\//, /^\/_vercel\//]
  }));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/api\.open-meteo\.com\/.*/i, new workbox.NetworkFirst({
    "cacheName": "weather-api-cache",
    "networkTimeoutSeconds": 4,
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 20,
      maxAgeSeconds: 43200
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/air-quality-api\.open-meteo\.com\/.*/i, new workbox.NetworkFirst({
    "cacheName": "aqi-api-cache",
    "networkTimeoutSeconds": 4,
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 20,
      maxAgeSeconds: 43200
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/\/api\/market-prices/i, new workbox.NetworkFirst({
    "cacheName": "market-prices-cache",
    "networkTimeoutSeconds": 4,
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 86400
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^\/_vercel\/.*/i, new workbox.NetworkOnly(), 'GET');

}));
