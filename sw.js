const cachePrefix = "toeic-practice-shell:" + self.registration.scope + ":";
const cacheName = cachePrefix + "v2";
const appFiles = ["./index.html", "./style.css", "./app.js", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./questions.js", "./greenhouse.jpg", "./part1.mp3", "./part2a.mp3", "./part2b.mp3", "./part3.mp3", "./part4.mp3"];
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

  if (request.headers.has("Range")) {
    event.respondWith(fetch(request).catch(() => cachedRange(request, key)));
    return;
  }

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

async function cachedRange(request, key) {
  const cache = await caches.open(cacheName);
  const full = await cache.match(key);
  if (!full) return Response.error();

  const bytes = await full.arrayBuffer();
  const match = /^bytes=(\d+)-(\d*)$/.exec(request.headers.get("Range"));
  const start = match ? Number(match[1]) : bytes.byteLength;
  const end = match?.[2] ? Math.min(Number(match[2]), bytes.byteLength - 1) : bytes.byteLength - 1;
  if (start > end) {
    return new Response(null, { status: 416, headers: { "Content-Range": "bytes */" + bytes.byteLength } });
  }

  return new Response(bytes.slice(start, end + 1), {
    status: 206,
    headers: {
      "Content-Type": full.headers.get("Content-Type") || "audio/mpeg",
      "Content-Range": "bytes " + start + "-" + end + "/" + bytes.byteLength,
      "Content-Length": String(end - start + 1)
    }
  });
}
