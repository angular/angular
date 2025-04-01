/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CacheDatabase} from '../src/db-cache';
import {Driver} from '../src/driver';
import {Manifest} from '../src/manifest';
import {MockCache} from '../testing/cache';
import {MockRequest} from '../testing/fetch';
import {MockFileSystemBuilder, MockServerStateBuilder, tmpHashTableForFs} from '../testing/mock';
import {SwTestHarness, SwTestHarnessBuilder} from '../testing/scope';
import {envIsSupported} from '../testing/utils';

(function () {
  // Skip environments that don't support the minimum APIs needed to run the SW tests.
  if (!envIsSupported()) {
    return;
  }

  const dist = new MockFileSystemBuilder()
    .addFile('/foo.txt', 'this is foo')
    .addFile('/bar.txt', 'this is bar')
    .addFile('/api/test', 'version 1')
    .addFile('/api/a', 'version A')
    .addFile('/api/b', 'version B')
    .addFile('/api/c', 'version C')
    .addFile('/api/d', 'version D')
    .addFile('/api/e', 'version E')
    .addFile('/fresh/data', 'this is fresh data')
    .addFile('/refresh/data', 'this is some data')
    .addFile('/fresh-opaque/data', 'this is some fresh data')
    .addFile('/perf-opaque/data', 'this is some perf data')
    .build();

  const distUpdate = new MockFileSystemBuilder()
    .addFile('/foo.txt', 'this is foo v2')
    .addFile('/bar.txt', 'this is bar')
    .addFile('/api/test', 'version 2')
    .addFile('/fresh/data', 'this is fresher data')
    .addFile('/refresh/data', 'this is refreshed data')
    .build();

  const manifest: Manifest = {
    configVersion: 1,
    timestamp: 1234567890123,
    index: '/index.html',
    assetGroups: [
      {
        name: 'assets',
        installMode: 'prefetch',
        updateMode: 'prefetch',
        urls: ['/foo.txt', '/bar.txt'],
        patterns: [],
        cacheQueryOptions: {ignoreVary: true},
      },
    ],
    dataGroups: [
      {
        name: 'testPerf',
        maxSize: 3,
        strategy: 'performance',
        patterns: ['^/api/.*$'],
        timeoutMs: 1000,
        maxAge: 5000,
        version: 1,
        cacheQueryOptions: {ignoreVary: true, ignoreSearch: true},
      },
      {
        name: 'testRefresh',
        maxSize: 3,
        strategy: 'performance',
        patterns: ['^/refresh/.*$'],
        timeoutMs: 1000,
        refreshAheadMs: 1000,
        maxAge: 5000,
        version: 1,
        cacheQueryOptions: {ignoreVary: true},
      },
      {
        name: 'testFresh',
        maxSize: 3,
        strategy: 'freshness',
        patterns: ['^/fresh/.*$'],
        timeoutMs: 1000,
        maxAge: 5000,
        version: 1,
        cacheQueryOptions: {ignoreVary: true},
      },
      {
        name: 'testFreshOpaque',
        maxSize: 3,
        strategy: 'freshness',
        patterns: ['^/fresh-opaque/.*$'],
        timeoutMs: 1000,
        maxAge: 5000,
        version: 1,
        cacheOpaqueResponses: false,
        cacheQueryOptions: {ignoreVary: true},
      },
      {
        name: 'testPerfOpaque',
        maxSize: 3,
        strategy: 'performance',
        patterns: ['^/perf-opaque/.*$'],
        timeoutMs: 1000,
        maxAge: 5000,
        version: 1,
        cacheOpaqueResponses: true,
        cacheQueryOptions: {ignoreVary: true},
      },
    ],
    navigationUrls: [],
    navigationRequestStrategy: 'performance',
    hashTable: tmpHashTableForFs(dist),
  };

  const seqIncreasedManifest: Manifest = {
    ...manifest,
    dataGroups: [
      {
        ...manifest.dataGroups![0],
        version: 2,
      },
      manifest.dataGroups![1],
      manifest.dataGroups![2],
    ],
  };

  const server = new MockServerStateBuilder().withStaticFiles(dist).withManifest(manifest).build();

  const serverUpdate = new MockServerStateBuilder()
    .withStaticFiles(distUpdate)
    .withManifest(manifest)
    .build();

  const serverSeqUpdate = new MockServerStateBuilder()
    .withStaticFiles(distUpdate)
    .withManifest(seqIncreasedManifest)
    .build();

  describe('data cache', () => {
    let scope: SwTestHarness;
    let driver: Driver;
    beforeEach(async () => {
      scope = new SwTestHarnessBuilder().withServerState(server).build();
      driver = new Driver(scope, scope, new CacheDatabase(scope));

      // Initialize.
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;
      server.clearRequests();
      serverUpdate.clearRequests();
      serverSeqUpdate.clearRequests();
    });
    afterEach(() => {
      server.reset();
      serverUpdate.reset();
      serverSeqUpdate.reset();
    });

    describe('in performance mode', () => {
      it('names the caches correctly', async () => {
        expect(await makeRequest(scope, '/api/test')).toEqual('version 1');
        const keys = await scope.caches.original.keys();
        expect(keys.every((key) => key.startsWith('ngsw:/:'))).toEqual(true);
      });

      it('caches a basic request', async () => {
        expect(await makeRequest(scope, '/api/test')).toEqual('version 1');
        server.assertSawRequestFor('/api/test');
        scope.advance(1000);
        expect(await makeRequest(scope, '/api/test')).toEqual('version 1');
        server.assertNoOtherRequests();
      });

      it('does not cache opaque responses by default', async () => {
        expect(await makeNoCorsRequest(scope, '/api/test')).toBe('');
        server.assertSawRequestFor('/api/test');

        expect(await makeNoCorsRequest(scope, '/api/test')).toBe('');
        server.assertSawRequestFor('/api/test');
      });

      it('caches opaque responses when configured to do so', async () => {
        expect(await makeNoCorsRequest(scope, '/perf-opaque/data')).toBe('');
        server.assertSawRequestFor('/perf-opaque/data');

        expect(await makeNoCorsRequest(scope, '/perf-opaque/data')).toBe('');
        server.assertNoOtherRequests();
      });

      it('refreshes after awhile', async () => {
        expect(await makeRequest(scope, '/api/test')).toEqual('version 1');
        server.clearRequests();
        scope.advance(10000);
        scope.updateServerState(serverUpdate);
        expect(await makeRequest(scope, '/api/test')).toEqual('version 2');
      });

      it('expires the least recently used entry', async () => {
        expect(await makeRequest(scope, '/api/a')).toEqual('version A');
        expect(await makeRequest(scope, '/api/b')).toEqual('version B');
        expect(await makeRequest(scope, '/api/c')).toEqual('version C');
        expect(await makeRequest(scope, '/api/d')).toEqual('version D');
        expect(await makeRequest(scope, '/api/e')).toEqual('version E');
        server.clearRequests();
        expect(await makeRequest(scope, '/api/c')).toEqual('version C');
        expect(await makeRequest(scope, '/api/d')).toEqual('version D');
        expect(await makeRequest(scope, '/api/e')).toEqual('version E');
        server.assertNoOtherRequests();
        expect(await makeRequest(scope, '/api/a')).toEqual('version A');
        expect(await makeRequest(scope, '/api/b')).toEqual('version B');
        server.assertSawRequestFor('/api/a');
        server.assertSawRequestFor('/api/b');
        server.assertNoOtherRequests();
      });

      it('does not carry over cache with new version', async () => {
        expect(await makeRequest(scope, '/api/test')).toEqual('version 1');
        scope.updateServerState(serverSeqUpdate);
        expect(await driver.checkForUpdate()).toEqual(true);
        await driver.updateClient(await scope.clients.get('default'));
        expect(await makeRequest(scope, '/api/test')).toEqual('version 2');
      });

      it('CacheQueryOptions are passed through', async () => {
        await driver.initialized;
        const matchSpy = spyOn(MockCache.prototype, 'match').and.callThrough();
        // the first request fetches the resource from the server
        await makeRequest(scope, '/api/a');
        // the second one will be loaded from the cache
        await makeRequest(scope, '/api/a');
        expect(matchSpy).toHaveBeenCalledWith(new MockRequest('/api/a'), {
          ignoreVary: true,
          ignoreSearch: true,
        });
      });

      it('still matches if search differs but ignoreSearch is enabled', async () => {
        await driver.initialized;
        const matchSpy = spyOn(MockCache.prototype, 'match').and.callThrough();
        // the first request fetches the resource from the server
        await makeRequest(scope, '/api/a?v=1');
        // the second one will be loaded from the cache
        server.clearRequests();
        await makeRequest(scope, '/api/a?v=2');
        server.assertNoOtherRequests();
      });
    });

    describe('in freshness mode', () => {
      it('goes to the server first', async () => {
        expect(await makeRequest(scope, '/fresh/data')).toEqual('this is fresh data');
        server.assertSawRequestFor('/fresh/data');
        server.clearRequests();
        expect(await makeRequest(scope, '/fresh/data')).toEqual('this is fresh data');
        server.assertSawRequestFor('/fresh/data');
        server.assertNoOtherRequests();
        scope.updateServerState(serverUpdate);
        expect(await makeRequest(scope, '/fresh/data')).toEqual('this is fresher data');
        serverUpdate.assertSawRequestFor('/fresh/data');
        serverUpdate.assertNoOtherRequests();
      });

      it('caches opaque responses', async () => {
        expect(await makeNoCorsRequest(scope, '/fresh/data')).toBe('');
        server.assertSawRequestFor('/fresh/data');

        server.online = false;

        expect(await makeRequest(scope, '/fresh/data')).toBe('');
        server.assertNoOtherRequests();
      });

      it('falls back on the cache when server times out', async () => {
        expect(await makeRequest(scope, '/fresh/data')).toEqual('this is fresh data');
        server.assertSawRequestFor('/fresh/data');
        server.clearRequests();
        scope.updateServerState(serverUpdate);
        serverUpdate.pause();
        const [res, done] = makePendingRequest(scope, '/fresh/data');

        await serverUpdate.nextRequest;

        // Since the network request doesn't return within the timeout of 1,000ms,
        // this should return cached data.
        scope.advance(2000);

        expect(await res).toEqual('this is fresh data');

        // Unpausing allows the worker to continue with caching.
        serverUpdate.unpause();
        await done;

        serverUpdate.pause();
        const [res2, done2] = makePendingRequest(scope, '/fresh/data');
        await serverUpdate.nextRequest;
        scope.advance(2000);
        expect(await res2).toEqual('this is fresher data');
      });

      it('refreshes ahead', async () => {
        server.assertNoOtherRequests();
        serverUpdate.assertNoOtherRequests();
        expect(await makeRequest(scope, '/refresh/data')).toEqual('this is some data');
        server.assertSawRequestFor('/refresh/data');
        server.clearRequests();
        expect(await makeRequest(scope, '/refresh/data')).toEqual('this is some data');
        server.assertNoOtherRequests();
        scope.updateServerState(serverUpdate);
        scope.advance(1500);
        expect(await makeRequest(scope, '/refresh/data')).toEqual('this is some data');
        serverUpdate.assertSawRequestFor('/refresh/data');
        expect(await makeRequest(scope, '/refresh/data')).toEqual('this is refreshed data');
        serverUpdate.assertNoOtherRequests();
      });

      it('caches opaque responses on refresh by default', async () => {
        // Make the initial request and populate the cache.
        expect(await makeRequest(scope, '/fresh/data')).toBe('this is fresh data');
        server.assertSawRequestFor('/fresh/data');
        server.clearRequests();

        // Update the server state and pause the server, so the next request times out.
        scope.updateServerState(serverUpdate);
        serverUpdate.pause();
        const [res, done] = makePendingRequest(
          scope,
          new MockRequest('/fresh/data', {mode: 'no-cors'}),
        );

        // The network request times out after 1,000ms and the cached response is returned.
        await serverUpdate.nextRequest;
        scope.advance(2000);
        expect(await res).toBe('this is fresh data');

        // Unpause the server to allow the network request to complete and be cached.
        serverUpdate.unpause();
        await done;

        // Pause the server to force the cached (opaque) response to be returned.
        serverUpdate.pause();
        const [res2] = makePendingRequest(scope, '/fresh/data');
        await serverUpdate.nextRequest;
        scope.advance(2000);

        expect(await res2).toBe('');
      });

      it('does not cache opaque responses when configured not to do so', async () => {
        // Make an initial no-cors request.
        expect(await makeNoCorsRequest(scope, '/fresh-opaque/data')).toBe('');
        server.assertSawRequestFor('/fresh-opaque/data');

        // Pause the server, so the next request times out.
        server.pause();
        const [res] = makePendingRequest(scope, '/fresh-opaque/data');

        // The network request should time out after 1,000ms and thus return a cached response if
        // available. Since there is no cached response, however, the promise will not be resolved
        // until the server returns a response.
        let resolved = false;
        res.then(() => (resolved = true));

        await server.nextRequest;
        scope.advance(2000);
        await new Promise((resolve) => setTimeout(resolve)); // Drain the microtask queue.
        expect(resolved).toBe(false);

        // Unpause the server, to allow the network request to complete.
        server.unpause();
        await new Promise((resolve) => setTimeout(resolve)); // Drain the microtask queue.
        expect(resolved).toBe(true);
      });

      it('CacheQueryOptions are passed through when falling back to cache', async () => {
        const matchSpy = spyOn(MockCache.prototype, 'match').and.callThrough();
        await makeRequest(scope, '/fresh/data');
        server.clearRequests();
        scope.updateServerState(serverUpdate);
        serverUpdate.pause();
        const [res, done] = makePendingRequest(scope, '/fresh/data');

        await serverUpdate.nextRequest;

        // Since the network request doesn't return within the timeout of 1,000ms,
        // this should return cached data.
        scope.advance(2000);
        await res;
        expect(matchSpy).toHaveBeenCalledWith(new MockRequest('/fresh/data'), {ignoreVary: true});

        // Unpausing allows the worker to continue with caching.
        serverUpdate.unpause();
        await done;
      });
    });
  });
})();

function makeRequest(scope: SwTestHarness, url: string, clientId?: string): Promise<string | null> {
  const [resTextPromise, done] = makePendingRequest(scope, url, clientId);
  return done.then(() => resTextPromise);
}

function makeNoCorsRequest(
  scope: SwTestHarness,
  url: string,
  clientId?: string,
): Promise<string | null> {
  const req = new MockRequest(url, {mode: 'no-cors'});
  const [resTextPromise, done] = makePendingRequest(scope, req, clientId);
  return done.then(() => resTextPromise);
}

function makePendingRequest(
  scope: SwTestHarness,
  urlOrReq: string | MockRequest,
  clientId?: string,
): [Promise<string | null>, Promise<void>] {
  const req = typeof urlOrReq === 'string' ? new MockRequest(urlOrReq) : urlOrReq;
  const [resPromise, done] = scope.handleFetch(req, clientId || 'default');
  return [resPromise.then<string | null>((res) => (res ? res.text() : null)), done];
}
