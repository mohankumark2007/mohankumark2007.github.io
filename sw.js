/**
 * ============================================================
 * SERVICE WORKER — godzemohan.in (PWA & Offline Cache)
 * ============================================================
 */

const CACHE_NAME = 'godzemohan-v4.4';
const ASSETS_TO_CACHE = [
	'/',
	'/index.html',
	'/style.css',
	'/app.js',
	'/chat.js',
	'/script.js',
	'/admin.js',
	'/manifest.json',
	'/favicon.ico',
	'/logo_transparent.png',
	'/apple-touch-icon.png',
	'/chapters.json',
	'/certificate-iim-bangalore.jpg',
	'/certificate-iim-bangalore.pdf'
];

self.addEventListener('install', (event) => {
	self.skipWaiting();
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(ASSETS_TO_CACHE);
		})
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
	// Skip all telemetry, APIs, and non-GET requests immediately
	const url = event.request.url;
	if (
		event.request.method !== 'GET' ||
		url.includes('script.google.com') ||
		url.includes('google.com') ||
		url.includes('ipinfo.io') ||
		url.includes('ipapi.co') ||
		url.includes('ipwho.is') ||
		url.includes('ipify.org') ||
		url.includes('formsubmit.co') ||
		url.includes('workers.dev') ||
		url.includes('googleapis.com')
	) {
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
				if (event.request.mode === 'navigate') {
					return caches.match('/index.html');
				}
			});
		})
	);
});
