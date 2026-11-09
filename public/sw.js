/* Cineflex service worker.
 *
 * - Pages: network first; if offline, the last cached copy, else the /offline page.
 * - Build assets (/_next/static, hashed and immutable): cache first.
 * - Icons and the manifest: stale-while-revalidate.
 * - Everything else (API routes, TMDB images, the VidCore player) goes straight to the
 *   network and is never cached, so the catalog and playback stay fresh.
 *
 * Bump VERSION to drop old caches.
 */
const VERSION = "v1";
const SHELL = `cineflex-shell-${VERSION}`;
const PAGES = `cineflex-pages-${VERSION}`;
const ASSETS = `cineflex-assets-${VERSION}`;
const MAX_PAGES = 30;

const PRECACHE = ["/offline", "/icon.svg", "/icon-192.png", "/icon-512.png", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.endsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

async function networkFirstPage(request) {
  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") {
      const cache = await caches.open(PAGES);
      cache.put(request, response.clone()).then(() => trim(PAGES, MAX_PAGES));
    }
    return response;
  } catch {
    return (await caches.match(request)) || (await caches.match("/offline")) || Response.error();
  }
}

async function cacheFirst(request) {
  const hit = await caches.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok) (await caches.open(ASSETS)).put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(SHELL);
  const hit = await cache.match(request);
  const update = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => hit);
  return hit || update;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // TMDB images, VidCore, fonts: network only

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
  } else if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
  } else if (PRECACHE.includes(url.pathname) || /^\/(apple-icon|icon)/.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
  }
  // /api/* and RSC payloads fall through to the network.
});
