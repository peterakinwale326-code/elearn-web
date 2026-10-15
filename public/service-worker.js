const MEDIA_CACHE = "fieldnote-media-v2";

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(MEDIA_CACHE);
    const response = await fetch("/media/images-manifest.json");
    if (response.ok) {
      const images = await response.json();
      await cache.add("/media/images-manifest.json");
      for (let index = 0; index < images.length; index += 40) {
        await cache.addAll(images.slice(index, index + 40));
      }
    }
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key.startsWith("fieldnote-media-") && key !== MEDIA_CACHE)
        .map((key) => caches.delete(key)),
    );
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || !url.pathname.startsWith("/media/")) return;

  event.respondWith((async () => {
    const cache = await caches.open(MEDIA_CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  })());
});