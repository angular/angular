/**
 * A simple, no-op service worker that takes immediate control.
 * Use this file if the active service worker has a bug and we want to deactivate the worker on
 * client browsers while we investigate the problem.
 *
 * To activate this service worker file, rename it to `ngsw-worker.js` and deploy to the hosting.
 * When the browser detects this new script, it will replace the old ServiceWorker.
 *
 * By default, browsers will bypass the cache when requesting ServiceWorker scripts. In case the use
 * the cache, browsers ensure that the expiry time is never longer than 24 hours, but the default
 * expiry time on Firebase is 60 mins).
 */

// Skip over the "waiting" lifecycle state, to ensure that our new ServiceWorker is activated
// immediately, even if there's another tab open controlled by our older ServiceWorker code.
self.addEventListener('install', () => self.skipWaiting());

// Get control of all current open windows/tabs under our ServiceWorker's "jurisdiction".
// This can "unbreak" any open windows/tabs as soon as the new ServiceWorker activates, rather than
// users having to manually reload.
// Also, delete all `ngsw` caches and unregister the SW (since it is no longer needed).
self.addEventListener('activate', event => {
  // Claim all clients.
  event.waitUntil(self.clients.claim());

  // Delete `ngsw` caches.
  event.waitUntil(self.caches.keys()
      .then(cacheNames => cacheNames.filter(name => name.startsWith('ngsw:')))
      .then(ourCacheNames => Promise.all(ourCacheNames.map(name => self.caches.delete(name)))));

  // Unregister the SW.
  self.registration.unregister()
      .then(() => console.log('No-op ServiceWorker: Unregistered old ServiceWorker.'));
});
