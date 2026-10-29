const CACHE_NAME = "habit-v5";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./Icons/icon-192.png",
  "./Icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key.startsWith("habit-") && key !== CACHE_NAME)
        .map(key => caches.delete(key))
    )).then(() => clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const requestUrl = new URL(event.request.url);
  if (event.request.method !== "GET" || requestUrl.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (!response.ok) return response;
      return caches.open(CACHE_NAME)
        .then(cache => cache.put(event.request, response.clone()))
        .then(() => response);
    }).catch(() => {
      if (event.request.mode === "navigate") return caches.match("./index.html");
      throw new Error("Resource unavailable offline");
    }))
  );
});