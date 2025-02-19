/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Mock `ngsw-worker.js` used for testing the examples.
// This code ensures that the service worker can handle range requests,
//allowing video seeking to work correctly when videos are delivered by the service worker.-ZE
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.headers.get('range')) {
    event.respondWith(handleRangeRequest(event));
  } else {
    event.respondWith(fetch(request));
  }
});

async function handleRangeRequest(event) {
  try {
    const request = event.request;
    const rangeHeader = request.headers.get('range');
    const rangeMatch = /bytes\=(\d+)\-(\d+)?/.exec(rangeHeader);
    if (!rangeMatch) {
      throw new Error('Invalid range header');
    }
    const start = Number(rangeMatch[1]);
    const end = rangeMatch[2] ? Number(rangeMatch[2]) : undefined;

    const response = await caches.match(request);
    if (!response) {
      return fetch(request);
    }

    const blob = await response.blob();
    const slicedBlob = blob.slice(start, end);
    const slicedResponse = new Response(slicedBlob, {
      status: 206,
      statusText: 'Partial Content',
      headers: [
        ['Content-Range', `bytes ${start}-${end || blob.size - 1}/${blob.size}`],
        ['Content-Type', blob.type]
      ]
    });

    return slicedResponse;
  } catch (error) {
    console.error('Error handling range request:', error);
    return fetch(event.request);
  }
}
