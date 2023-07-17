/**
 * A simple, no-op service worker that takes immediate control.
 * Use this file if the active service worker has a bug and we
 * want to deactivate the worker on client browsers while we
 * investigate the problem.
 *
 * To activate this service worker file, rename it to `worker-basic.min.js`
 * and deploy to the hosting. When the original worker files cache
 * expires, this one will take its place. (Browsers ensure that the expiry
 * time is never longer than 24 hours, but the default expiry time on Firebase
 * is 60 mins).
 */

// Skip over the "waiting" lifecycle state, to ensure that our
// new service worker is activated immediately, even if there's
// another tab open controlled by our older service worker code.
self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting());
});


// Get a list of all the current open windows/tabs under
// our service worker's control, and force them to reload.
// This can "unbreak" any open windows/tabs as soon as the new
// service worker activates, rather than users having to manually reload.
self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});
