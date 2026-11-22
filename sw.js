const cachePrefix = "toeic-practice-shell:" + self.registration.scope + ":";
const cacheName = cachePrefix + "v1";
const appFiles = ["./index.html", "./style.css", "./app.js", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
const shellUrls = new Set(appFiles.map(path => new URL(path, self.registration.scope).href));

self.addEventListener("install", event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(appFiles)));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(names => Promise.all(
    names.filter(name => name.startsWith(cachePrefix) && name !== cacheName)
      .map(name => caches.delete(name))
  )).then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  url.search = "";
  const home = new URL("./index.html", self.registration.scope).href;
  const key = url.href === self.registration.scope ? home : url.href;
  if (!shellUrls.has(key)) return;

  event.respondWith(fetch(request).then(async response => {
    if (response.ok) {
      try {
        const cache = await caches.open(cacheName);
        await cache.put(key, response.clone());
      } catch {
        // The online response is still usable when browser storage is unavailable.
      }
    }
    return response;
  }).catch(async () => {
    const cache = await caches.open(cacheName);
    return await cache.match(key) ?? Response.error();
  }));
});
