/* Norland Place Parents — offline shell.
   Bump CACHE_VERSION after editing any file so installed devices update. */
const CACHE_VERSION = "npp-v1";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon.svg", "./icons/apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE_VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) {
    /* Fonts: serve from cache first, fall back to the network, and never fail hard. */
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE_VERSION).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => new Response("", { status: 504 }))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    const copy = res.clone();
    caches.open(CACHE_VERSION).then(c => c.put(req, copy)).catch(() => {});
    return res;
  }).catch(() => caches.match("./index.html"))));
});
