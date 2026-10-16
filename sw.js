/* Offline shell for the Wyatt & Emma Pixel WebAPK. */
const CACHE = 'wyatt-arcade-pixel-v4';

const SHELL = [
  '/',
  '/index.html',
  '/beanstalk.html',
  '/balloon-pop.html',
  '/rocket-count.html',
  '/finger-paint.html',
  '/manifest.json',
  '/engine/diorama-engine.css',
  '/engine/diorama-engine.js',
  '/books/beanstalk/story-data.js',
  '/images/beanstalk/paintings.json',
  '/images/beanstalk/p1-world.png',
  '/images/beanstalk/p2-world.png',
  '/images/beanstalk/p3-world.png',
  '/images/beanstalk/p4-world.png',
  '/images/beanstalk/p5-world.png',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
  '/audio/beanstalk-p1.mp3',
  '/audio/beanstalk-p2.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(SHELL.map(async (url) => {
      try {
        const response = await fetch(url);
        if (response && response.ok) await cache.put(url, response);
      } catch (err) {
        /* A missing optional file must not block installation. */
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

function isMedia(pathname) {
  return /\.(mp3|png|webp|svg)$/i.test(pathname);
}

async function rangeFromCache(response, rangeHeader) {
  const match = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader || '');
  if (!match) return response;
  const buffer = await response.clone().arrayBuffer();
  const size = buffer.byteLength;
  let start = match[1] ? parseInt(match[1], 10) : 0;
  let end = match[2] ? parseInt(match[2], 10) : size - 1;
  if (Number.isNaN(start) || start < 0) start = 0;
  if (Number.isNaN(end) || end >= size) end = size - 1;
  if (start >= size || start > end) {
    return new Response(null, {
      status: 416,
      headers: { 'Content-Range': 'bytes */' + size }
    });
  }
  const slice = buffer.slice(start, end + 1);
  const headers = new Headers(response.headers);
  headers.set('Content-Type', response.headers.get('Content-Type') || 'audio/mpeg');
  headers.set('Content-Length', String(slice.byteLength));
  headers.set('Content-Range', 'bytes ' + start + '-' + end + '/' + size);
  headers.set('Accept-Ranges', 'bytes');
  return new Response(slice, { status: 206, statusText: 'Partial Content', headers });
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request, { ignoreSearch: true });
  if (cached) {
    const range = request.headers.get('range');
    if (range) return rangeFromCache(cached, range);
    return cached;
  }
  const fresh = await fetch(request);
  if (fresh && fresh.ok && fresh.status === 200) {
    const url = new URL(request.url);
    await cache.put(url.pathname, fresh.clone());
  }
  return fresh;
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok && fresh.status === 200) {
      const url = new URL(request.url);
      await cache.put(url.pathname, fresh.clone());
    }
    return fresh;
  } catch (err) {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    if (request.mode === 'navigate') {
      const home = await cache.match('/index.html');
      if (home) return home;
    }
    return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isMedia(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  event.respondWith(networkFirst(request));
});
