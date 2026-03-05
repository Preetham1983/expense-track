// Simple Service Worker for PWA installability
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Basic fetch handler (required for PWA)
    event.respondWith(fetch(event.request).catch(() => {
        return new Response('Network error occurred');
    }));
});
