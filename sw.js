/* Xander's Maths Trainer — service worker
   Full offline support. Bump CACHE_VERSION whenever the app files change
   so devices pick up the new version. */
const CACHE_VERSION = 'xmt-v2';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

// Pre-cache the app shell on install.
self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function(cache){
      // addAll fails the whole install if any file 404s; add individually so a
      // missing optional icon can't break offline support for the app itself.
      return Promise.all(APP_SHELL.map(function(url){
        return cache.add(url).catch(function(){ /* ignore individual misses */ });
      }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

// Clean up old caches on activate.
self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE_VERSION; })
                             .map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

// Fetch strategy:
//  - Navigations: cache-first on index.html so it opens instantly and works offline.
//  - Google Fonts (CSS + font files): stale-while-revalidate, so they work offline
//    after the first online load without blocking the first paint.
//  - Everything else same-origin: cache-first, falling back to network then caching.
self.addEventListener('fetch', function(event){
  const req = event.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);

  if(req.mode === 'navigate'){
    event.respondWith(
      caches.match('./index.html').then(function(cached){
        return cached || fetch(req).catch(function(){ return caches.match('./index.html'); });
      })
    );
    return;
  }

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

  if(url.origin === location.origin){
    event.respondWith(
      caches.match(req).then(function(cached){
        return cached || fetch(req).then(function(res){
          if(res && res.ok){
            const copy = res.clone();
            caches.open(CACHE_VERSION).then(function(c){ c.put(req, copy); });
          }
          return res;
        });
      })
    );
  }
});
