/* Wizard Chess — service worker (scoped to /chess/).
   Full offline support. Bump CACHE_VERSION whenever files change so installed
   devices pick up the new version on next launch. */
const CACHE_VERSION = 'wizchess-v5';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function(cache){
      // Add individually so a missing optional icon can't break the whole install.
      return Promise.all(APP_SHELL.map(function(url){
        return cache.add(url).catch(function(){ /* ignore individual misses */ });
      }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE_VERSION; })
                             .map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event){
  const req = event.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);

  // Navigations: serve the app shell (cache-first) so it opens instantly offline.
  if(req.mode === 'navigate'){
    event.respondWith(
      caches.match('./index.html').then(function(cached){
        return cached || fetch(req).catch(function(){ return caches.match('./index.html'); });
      })
    );
    return;
  }

  // Google Fonts: stale-while-revalidate so they work offline after first load.
  const isFont = url.origin === 'https://fonts.googleapis.com' ||
                 url.origin === 'https://fonts.gstatic.com';
  if(isFont){
    event.respondWith(
      caches.open(CACHE_VERSION).then(function(cache){
        return cache.match(req).then(function(cached){
          const network = fetch(req).then(function(res){
            if(res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
            return res;
          }).catch(function(){ return cached; });
          return cached || network;
        });
      })
    );
    return;
  }

  // Same-origin assets: cache-first, then network (and cache it).
  if(url.origin === location.origin){
    event.respondWith(
      caches.match(req).then(function(cached){
        return cached || fetch(req).then(function(res){
          if(res && res.ok){ const copy = res.clone(); caches.open(CACHE_VERSION).then(function(c){ c.put(req, copy); }); }
          return res;
        });
      })
    );
  }
});
