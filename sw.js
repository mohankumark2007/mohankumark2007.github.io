/**
 * ============================================================
 * SERVICE WORKER — godzemohan.in (PWA & Offline Cache)
 * ============================================================
 */

const CACHE_NAME = 'godzemohan-v2.5';
const ASSETS_TO_CACHE = [
	'/',
	'/index.html',
	'/style.css',
	'/app.js',
	'/chat.js',
	'/cli.js',
	'/manifest.json',
	'/favicon.ico',
	'/logo_transparent.png',
	'/apple-touch-icon.png',
	'/chapters.json'
];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(ASSETS_TO_CACHE);
		}).then(() => self.skipWaiting())
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((keys) => {
			return Promise.all(
				keys.map((key) => {
					if (key !== CACHE_NAME) {
						return caches.delete(key);
					}
				})
			);
		}).then(() => self.clients.claim())
	);
});

self.addEventListener('fetch', (event) => {
	// Skip non-GET requests and API calls (Gemini, FormSubmit, Cloudflare worker)
	if (event.request.method !== 'GET') return;
	const url = event.request.url;
	if (url.includes('formsubmit.co') || url.includes('workers.dev') || url.includes('googleapis.com') || url.includes('ipinfo.io')) {
		return;
	}

	event.respondWith(
		caches.match(event.request).then((cachedResponse) => {
			if (cachedResponse) {
				// Fetch update in background (Stale-While-Revalidate)
				fetch(event.request).then((networkResponse) => {
					if (networkResponse && networkResponse.status === 200) {
						caches.open(CACHE_NAME).then((cache) => {
							cache.put(event.request, networkResponse.clone());
						});
					}
				}).catch(() => {});
				return cachedResponse;
			}
			return fetch(event.request).then((networkResponse) => {
				if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
					return networkResponse;
				}
				const responseToCache = networkResponse.clone();
				caches.open(CACHE_NAME).then((cache) => {
					cache.put(event.request, responseToCache);
				});
				return networkResponse;
			}).catch(() => {
				// Fallback to offline index.html if html navigation
				if (event.request.mode === 'navigate') {
					return caches.match('/index.html');
				}
			});
		})
	);
});
