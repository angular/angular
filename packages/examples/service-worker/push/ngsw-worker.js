/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Mock `ngsw-worker.js` used for testing the examples.
// Immediately takes over and unregisters itself.
self.addEventListener('install', (evt) => evt.waitUntil(self.skipWaiting()));
self.addEventListener('activate', (evt) =>
  evt.waitUntil(self.clients.claim().then(() => self.registration.unregister())),
);
