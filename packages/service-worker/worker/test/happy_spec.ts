/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {processNavigationUrls} from '../../config/src/generator';
import {CacheDatabase} from '../src/db-cache';
import {Driver, DriverReadyState} from '../src/driver';
import {Manifest} from '../src/manifest';
import {sha1} from '../src/sha1';
import {clearAllCaches, MockCache} from '../testing/cache';
import {MockWindowClient} from '../testing/clients';
import {MockRequest, MockResponse} from '../testing/fetch';
import {
  MockFileSystem,
  MockFileSystemBuilder,
  MockServerState,
  MockServerStateBuilder,
  tmpHashTableForFs,
} from '../testing/mock';
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
    .addFile('/baz.txt', 'this is baz')
    .addFile('/qux.txt', 'this is qux')
    .addFile('/quux.txt', 'this is quux')
    .addFile('/quuux.txt', 'this is quuux')
    .addFile('/redirect-target.txt', 'this was a redirect')
    .addFile('/lazy/unchanged1.txt', 'this is unchanged (1)')
    .addFile('/lazy/unchanged2.txt', 'this is unchanged (2)')
    .addFile('/lazy/redirect-target.txt', 'this was a redirect too')
    .addUnhashedFile('/unhashed/a.txt', 'this is unhashed', {'Cache-Control': 'max-age=10'})
    .addUnhashedFile('/unhashed/b.txt', 'this is unhashed b', {'Cache-Control': 'no-cache'})
    .addUnhashedFile('/api/foo', 'this is api foo', {'Cache-Control': 'no-cache'})
    .addUnhashedFile('/api-static/bar', 'this is static api bar', {'Cache-Control': 'no-cache'})
    .build();

  const distUpdate = new MockFileSystemBuilder()
    .addFile('/foo.txt', 'this is foo v2')
    .addFile('/bar.txt', 'this is bar')
    .addFile('/baz.txt', 'this is baz v2')
    .addFile('/qux.txt', 'this is qux v2')
    .addFile('/quux.txt', 'this is quux v2')
    .addFile('/quuux.txt', 'this is quuux v2')
    .addFile('/redirect-target.txt', 'this was a redirect')
    .addFile('/lazy/unchanged1.txt', 'this is unchanged (1)')
    .addFile('/lazy/unchanged2.txt', 'this is unchanged (2)')
    .addUnhashedFile('/unhashed/a.txt', 'this is unhashed v2', {'Cache-Control': 'max-age=10'})
    .addUnhashedFile('/ignored/file1', 'this is not handled by the SW')
    .addUnhashedFile('/ignored/dir/file2', 'this is not handled by the SW either')
    .build();

  const brokenFs = new MockFileSystemBuilder()
    .addFile('/foo.txt', 'this is foo (broken)')
    .addFile('/bar.txt', 'this is bar (broken)')
    .build();

  const brokenManifest: Manifest = {
    configVersion: 1,
    timestamp: 1234567890123,
    index: '/foo.txt',
    assetGroups: [
      {
        name: 'assets',
        installMode: 'prefetch',
        updateMode: 'prefetch',
        urls: ['/foo.txt'],
        patterns: [],
        cacheQueryOptions: {ignoreVary: true},
      },
    ],
    dataGroups: [],
    navigationUrls: processNavigationUrls(''),
    navigationRequestStrategy: 'performance',
    hashTable: tmpHashTableForFs(brokenFs, {'/foo.txt': true}),
  };

  const brokenLazyManifest: Manifest = {
    configVersion: 1,
    timestamp: 1234567890123,
    index: '/foo.txt',
    assetGroups: [
      {
        name: 'assets',
        installMode: 'prefetch',
        updateMode: 'prefetch',
        urls: ['/foo.txt'],
        patterns: [],
        cacheQueryOptions: {ignoreVary: true},
      },
      {
        name: 'lazy-assets',
        installMode: 'lazy',
        updateMode: 'lazy',
        urls: ['/bar.txt'],
        patterns: [],
        cacheQueryOptions: {ignoreVary: true},
      },
    ],
    dataGroups: [],
    navigationUrls: processNavigationUrls(''),
    navigationRequestStrategy: 'performance',
    hashTable: tmpHashTableForFs(brokenFs, {'/bar.txt': true}),
  };

  const manifest: Manifest = {
    configVersion: 1,
    timestamp: 1234567890123,
    appData: {
      version: 'original',
    },
    index: '/foo.txt',
    assetGroups: [
      {
        name: 'assets',
        installMode: 'prefetch',
        updateMode: 'prefetch',
        urls: ['/foo.txt', '/bar.txt', '/redirected.txt'],
        patterns: ['/unhashed/.*'],
        cacheQueryOptions: {ignoreVary: true},
      },
      {
        name: 'other',
        installMode: 'lazy',
        updateMode: 'lazy',
        urls: ['/baz.txt', '/qux.txt', '/lazy/redirected.txt'],
        patterns: [],
        cacheQueryOptions: {ignoreVary: true},
      },
      {
        name: 'lazy_prefetch',
        installMode: 'lazy',
        updateMode: 'prefetch',
        urls: ['/quux.txt', '/quuux.txt', '/lazy/unchanged1.txt', '/lazy/unchanged2.txt'],
        patterns: [],
        cacheQueryOptions: {ignoreVary: true},
      },
    ],
    dataGroups: [
      {
        name: 'api',
        version: 42,
        maxAge: 3600000,
        maxSize: 100,
        strategy: 'freshness',
        patterns: ['/api/.*'],
        cacheQueryOptions: {ignoreVary: true},
      },
      {
        name: 'api-static',
        version: 43,
        maxAge: 3600000,
        maxSize: 100,
        strategy: 'performance',
        patterns: ['/api-static/.*'],
        cacheQueryOptions: {ignoreVary: true},
      },
    ],
    navigationUrls: processNavigationUrls(''),
    navigationRequestStrategy: 'performance',
    hashTable: tmpHashTableForFs(dist),
  };

  const manifestUpdate: Manifest = {
    configVersion: 1,
    timestamp: 1234567890123,
    appData: {
      version: 'update',
    },
    index: '/foo.txt',
    assetGroups: [
      {
        name: 'assets',
        installMode: 'prefetch',
        updateMode: 'prefetch',
        urls: ['/foo.txt', '/bar.txt', '/redirected.txt'],
        patterns: ['/unhashed/.*'],
        cacheQueryOptions: {ignoreVary: true},
      },
      {
        name: 'other',
        installMode: 'lazy',
        updateMode: 'lazy',
        urls: ['/baz.txt', '/qux.txt'],
        patterns: [],
        cacheQueryOptions: {ignoreVary: true},
      },
      {
        name: 'lazy_prefetch',
        installMode: 'lazy',
        updateMode: 'prefetch',
        urls: ['/quux.txt', '/quuux.txt', '/lazy/unchanged1.txt', '/lazy/unchanged2.txt'],
        patterns: [],
        cacheQueryOptions: {ignoreVary: true},
      },
    ],
    navigationUrls: processNavigationUrls('', [
      '/**/file1',
      '/**/file2',
      '!/ignored/file1',
      '!/ignored/dir/**',
    ]),
    navigationRequestStrategy: 'performance',
    hashTable: tmpHashTableForFs(distUpdate),
  };

  const serverBuilderBase = new MockServerStateBuilder()
    .withStaticFiles(dist)
    .withRedirect('/redirected.txt', '/redirect-target.txt')
    .withRedirect('/lazy/redirected.txt', '/lazy/redirect-target.txt')
    .withError('/error.txt');

  const server = serverBuilderBase.withManifest(manifest).build();

  const serverRollback = serverBuilderBase
    .withManifest({...manifest, timestamp: manifest.timestamp + 1})
    .build();

  const serverUpdate = new MockServerStateBuilder()
    .withStaticFiles(distUpdate)
    .withManifest(manifestUpdate)
    .withRedirect('/redirected.txt', '/redirect-target.txt')
    .build();

  const brokenServer = new MockServerStateBuilder()
    .withStaticFiles(brokenFs)
    .withManifest(brokenManifest)
    .build();

  const brokenLazyServer = new MockServerStateBuilder()
    .withStaticFiles(brokenFs)
    .withManifest(brokenLazyManifest)
    .build();

  const server404 = new MockServerStateBuilder().withStaticFiles(dist).build();

  const manifestHash = sha1(JSON.stringify(manifest));
  const manifestUpdateHash = sha1(JSON.stringify(manifestUpdate));

  describe('Driver', () => {
    let scope: SwTestHarness;
    let driver: Driver;

    beforeEach(() => {
      server.reset();
      serverUpdate.reset();
      server404.reset();
      brokenServer.reset();

      scope = new SwTestHarnessBuilder().withServerState(server).build();
      driver = new Driver(scope, scope, new CacheDatabase(scope));
    });

    it('activates without waiting', async () => {
      const skippedWaiting = await scope.startup(true);
      expect(skippedWaiting).toBe(true);
    });

    it('claims all clients, after activation', async () => {
      const claimSpy = spyOn(scope.clients, 'claim');

      await scope.startup(true);
      expect(claimSpy).toHaveBeenCalledTimes(1);
    });

    it('initializes prefetched content correctly, after activation', async () => {
      // Automatically advance time to trigger idle tasks as they are added.
      scope.autoAdvanceTime = true;
      await scope.startup(true);
      await scope.resolveSelfMessages();
      scope.autoAdvanceTime = false;

      server.assertSawRequestFor('/ngsw.json');
      server.assertSawRequestFor('/foo.txt');
      server.assertSawRequestFor('/bar.txt');
      server.assertSawRequestFor('/redirected.txt');
      server.assertSawRequestFor('/redirect-target.txt');
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      expect(await makeRequest(scope, '/bar.txt')).toEqual('this is bar');
      server.assertNoOtherRequests();
    });

    it('initializes prefetched content correctly, after a request kicks it off', async () => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;
      server.assertSawRequestFor('/ngsw.json');
      server.assertSawRequestFor('/foo.txt');
      server.assertSawRequestFor('/bar.txt');
      server.assertSawRequestFor('/redirected.txt');
      server.assertSawRequestFor('/redirect-target.txt');
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      expect(await makeRequest(scope, '/bar.txt')).toEqual('this is bar');
      server.assertNoOtherRequests();
    });

    it('initializes the service worker on fetch if it has not yet been initialized', async () => {
      // Driver is initially uninitialized.
      expect(driver.initialized).toBeNull();
      expect(driver['latestHash']).toBeNull();

      // Making a request initializes the driver (fetches assets).
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      expect(driver['latestHash']).toEqual(jasmine.any(String));
      server.assertSawRequestFor('/ngsw.json');
      server.assertSawRequestFor('/foo.txt');
      server.assertSawRequestFor('/bar.txt');
      server.assertSawRequestFor('/redirected.txt');
      server.assertSawRequestFor('/redirect-target.txt');

      // Once initialized, cached resources are served without network requests.
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      expect(await makeRequest(scope, '/bar.txt')).toEqual('this is bar');
      server.assertNoOtherRequests();
    });

    it('initializes the service worker on message if it has not yet been initialized', async () => {
      // Driver is initially uninitialized.
      expect(driver.initialized).toBeNull();
      expect(driver['latestHash']).toBeNull();

      // Pushing a message initializes the driver (fetches assets).
      scope.handleMessage({action: 'foo'}, 'someClient');
      await new Promise((resolve) => setTimeout(resolve)); // Wait for async operations to complete.
      expect(driver['latestHash']).toEqual(jasmine.any(String));
      server.assertSawRequestFor('/ngsw.json');
      server.assertSawRequestFor('/foo.txt');
      server.assertSawRequestFor('/bar.txt');
      server.assertSawRequestFor('/redirected.txt');
      server.assertSawRequestFor('/redirect-target.txt');

      // Once initialized, pushed messages are handled without re-initializing.
      await scope.handleMessage({action: 'bar'}, 'someClient');
      server.assertNoOtherRequests();

      // Once initialized, cached resources are served without network requests.
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      expect(await makeRequest(scope, '/bar.txt')).toEqual('this is bar');
      server.assertNoOtherRequests();
    });

    it('handles non-relative URLs', async () => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;
      server.clearRequests();
      expect(await makeRequest(scope, 'http://localhost/foo.txt')).toEqual('this is foo');
      server.assertNoOtherRequests();
    });

    it('handles actual errors from the browser', async () => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;
      server.clearRequests();

      const [resPromise, done] = scope.handleFetch(new MockRequest('/error.txt'), 'default');
      await done;
      const res = (await resPromise)!;
      expect(res.status).toEqual(504);
      expect(res.statusText).toEqual('Gateway Timeout');
    });

    it('handles redirected responses', async () => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;
      server.clearRequests();
      expect(await makeRequest(scope, '/redirected.txt')).toEqual('this was a redirect');
      server.assertNoOtherRequests();
    });

    it('caches lazy content on-request', async () => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;
      server.clearRequests();
      expect(await makeRequest(scope, '/baz.txt')).toEqual('this is baz');
      server.assertSawRequestFor('/baz.txt');
      server.assertNoOtherRequests();
      expect(await makeRequest(scope, '/baz.txt')).toEqual('this is baz');
      server.assertNoOtherRequests();
      expect(await makeRequest(scope, '/qux.txt')).toEqual('this is qux');
      server.assertSawRequestFor('/qux.txt');
      server.assertNoOtherRequests();
    });

    it('updates to new content when requested', async () => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;

      const client = scope.clients.getMock('default')!;
      expect(client.messages).toEqual([]);

      scope.updateServerState(serverUpdate);
      expect(await driver.checkForUpdate()).toEqual(true);
      serverUpdate.assertSawRequestFor('/ngsw.json');
      serverUpdate.assertSawRequestFor('/foo.txt');
      serverUpdate.assertSawRequestFor('/redirected.txt');
      serverUpdate.assertSawRequestFor('/redirect-target.txt');
      serverUpdate.assertNoOtherRequests();

      expect(client.messages).toEqual([
        {
          type: 'VERSION_DETECTED',
          version: {hash: manifestUpdateHash, appData: {version: 'update'}},
        },
        {
          type: 'VERSION_READY',
          currentVersion: {hash: manifestHash, appData: {version: 'original'}},
          latestVersion: {hash: manifestUpdateHash, appData: {version: 'update'}},
        },
      ]);

      // Default client is still on the old version of the app.
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');

      // Sending a new client id should result in the updated version being returned.
      expect(await makeRequest(scope, '/foo.txt', 'new')).toEqual('this is foo v2');

      // Of course, the old version should still work.
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');

      expect(await makeRequest(scope, '/bar.txt')).toEqual('this is bar');
      serverUpdate.assertNoOtherRequests();
    });

    it('detects new version even if only `manifest.timestamp` is different', async () => {
      expect(await makeRequest(scope, '/foo.txt', 'newClient')).toEqual('this is foo');
      await driver.initialized;

      scope.updateServerState(serverUpdate);
      expect(await driver.checkForUpdate()).toEqual(true);
      expect(await makeRequest(scope, '/foo.txt', 'newerClient')).toEqual('this is foo v2');

      scope.updateServerState(serverRollback);
      expect(await driver.checkForUpdate()).toEqual(true);
      expect(await makeRequest(scope, '/foo.txt', 'newestClient')).toEqual('this is foo');
    });

    it('updates a specific client to new content on request', async () => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;

      const client = scope.clients.getMock('default')!;
      expect(client.messages).toEqual([]);

      scope.updateServerState(serverUpdate);
      expect(await driver.checkForUpdate()).toEqual(true);
      serverUpdate.clearRequests();
      await driver.updateClient(client as any as Client);

      expect(client.messages).toEqual([
        {
          type: 'VERSION_DETECTED',
          version: {hash: manifestUpdateHash, appData: {version: 'update'}},
        },
        {
          type: 'VERSION_READY',
          currentVersion: {hash: manifestHash, appData: {version: 'original'}},
          latestVersion: {hash: manifestUpdateHash, appData: {version: 'update'}},
        },
      ]);

      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo v2');
    });

    it('returns old content for worker initialized from old version', async () => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      expect(await makeRequest(scope, '/baz.txt')).toEqual('this is baz');
      await driver.initialized;

      const client = scope.clients.getMock('default')!;
      expect(client.messages).toEqual([]);

      scope.updateServerState(serverUpdate);
      expect(await driver.checkForUpdate()).toEqual(true);

      // Worker request came from default client, old version should be served
      expect(await makeWorkerRequest(scope, '/foo.txt')).toEqual('this is foo');
      // Worker has been initialized from default client, further requests from worker should be served from old version
      expect(await makeRequest(scope, '/foo.txt', 'worker')).toEqual('this is foo');
      expect(await makeRequest(scope, '/baz.txt', 'worker')).toEqual('this is baz');
    });

    it('handles empty client ID', async () => {
      // Initialize the SW.
      expect(await makeNavigationRequest(scope, '/foo/file1', '')).toEqual('this is foo');
      await driver.initialized;

      // Update to a new version.
      scope.updateServerState(serverUpdate);
      expect(await driver.checkForUpdate()).toEqual(true);

      // Correctly handle navigation requests, even if `clientId` is null/empty.
      expect(await makeNavigationRequest(scope, '/foo/file1', '')).toEqual('this is foo v2');
    });

    it('checks for updates on restart', async () => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;

      scope = new SwTestHarnessBuilder()
        .withCacheState(scope.caches.original.dehydrate())
        .withServerState(serverUpdate)
        .build();
      driver = new Driver(scope, scope, new CacheDatabase(scope));
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;
      serverUpdate.assertNoOtherRequests();

      scope.advance(12000);
      await driver.idle.empty;

      serverUpdate.assertSawRequestFor('/ngsw.json');
      serverUpdate.assertSawRequestFor('/foo.txt');
      serverUpdate.assertSawRequestFor('/redirected.txt');
      serverUpdate.assertSawRequestFor('/redirect-target.txt');
      serverUpdate.assertNoOtherRequests();
    });

    it('checks for updates on navigation', async () => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;
      server.clearRequests();

      expect(await makeNavigationRequest(scope, '/foo.txt')).toEqual('this is foo');

      scope.advance(12000);
      await driver.idle.empty;

      server.assertSawRequestFor('/ngsw.json');
    });

    it('does not make concurrent checks for updates on navigation', async () => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;
      server.clearRequests();

      expect(await makeNavigationRequest(scope, '/foo.txt')).toEqual('this is foo');

      expect(await makeNavigationRequest(scope, '/foo.txt')).toEqual('this is foo');

      scope.advance(12000);
      await driver.idle.empty;

      server.assertSawRequestFor('/ngsw.json');
      server.assertNoOtherRequests();
    });

    it('preserves multiple client assignments across restarts', async () => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;

      scope.updateServerState(serverUpdate);
      expect(await driver.checkForUpdate()).toEqual(true);
      expect(await makeRequest(scope, '/foo.txt', 'new')).toEqual('this is foo v2');
      serverUpdate.clearRequests();

      scope = new SwTestHarnessBuilder()
        .withCacheState(scope.caches.original.dehydrate())
        .withServerState(serverUpdate)
        .build();
      driver = new Driver(scope, scope, new CacheDatabase(scope));

      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      expect(await makeRequest(scope, '/foo.txt', 'new')).toEqual('this is foo v2');
      serverUpdate.assertNoOtherRequests();
    });

    it('updates when refreshed', async () => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;

      const client = scope.clients.getMock('default')!;

      scope.updateServerState(serverUpdate);
      expect(await driver.checkForUpdate()).toEqual(true);
      serverUpdate.clearRequests();

      expect(await makeNavigationRequest(scope, '/file1')).toEqual('this is foo v2');

      expect(client.messages).toEqual([
        {
          type: 'VERSION_DETECTED',
          version: {hash: manifestUpdateHash, appData: {version: 'update'}},
        },
        {
          type: 'VERSION_READY',
          currentVersion: {hash: manifestHash, appData: {version: 'original'}},
          latestVersion: {hash: manifestUpdateHash, appData: {version: 'update'}},
        },
      ]);
      serverUpdate.assertNoOtherRequests();
    });

    it('sends a notification message after finding the same version on the server and installed', async () => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;

      const client = scope.clients.getMock('default')!;

      expect(await driver.checkForUpdate()).toEqual(false);
      serverUpdate.clearRequests();

      expect(client.messages).toEqual([
        {
          type: 'NO_NEW_VERSION_DETECTED',
          version: {hash: manifestHash, appData: {version: 'original'}},
        },
      ]);
      serverUpdate.assertNoOtherRequests();
    });

    it('cleans up properly when manually requested', async () => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;

      scope.updateServerState(serverUpdate);
      expect(await driver.checkForUpdate()).toEqual(true);
      serverUpdate.clearRequests();

      expect(await makeRequest(scope, '/foo.txt', 'new')).toEqual('this is foo v2');

      // Delete the default client.
      scope.clients.remove('default');

      // After this, the old version should no longer be cached.
      await driver.cleanupCaches();
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo v2');

      serverUpdate.assertNoOtherRequests();
    });

    it('cleans up properly on restart', async () => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;

      scope = new SwTestHarnessBuilder()
        .withCacheState(scope.caches.original.dehydrate())
        .withServerState(serverUpdate)
        .build();
      driver = new Driver(scope, scope, new CacheDatabase(scope));
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;
      serverUpdate.assertNoOtherRequests();

      let keys = await scope.caches.keys();
      let hasOriginalCaches = keys.some((name) => name.startsWith(`${manifestHash}:`));
      expect(hasOriginalCaches).toEqual(true);

      scope.clients.remove('default');

      scope.advance(12000);
      await driver.idle.empty;
      serverUpdate.clearRequests();

      driver = new Driver(scope, scope, new CacheDatabase(scope));
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo v2');

      keys = await scope.caches.keys();
      hasOriginalCaches = keys.some((name) => name.startsWith(`${manifestHash}:`));
      expect(hasOriginalCaches).toEqual(false);
    });

    it('cleans up properly when failing to load stored state', async () => {
      // Initialize the SW and cache the original app-version.
      expect(await makeRequest(scope, '/foo.txt')).toBe('this is foo');
      await driver.initialized;

      // Update and cache the updated app-version.
      scope.updateServerState(serverUpdate);
      expect(await driver.checkForUpdate()).toBeTrue();
      expect(await makeRequest(scope, '/foo.txt', 'newClient')).toBe('this is foo v2');

      // Verify both app-versions are stored in the cache.
      let cacheNames = await scope.caches.keys();
      let hasOriginalVersion = cacheNames.some((name) => name.startsWith(`${manifestHash}:`));
      let hasUpdatedVersion = cacheNames.some((name) => name.startsWith(`${manifestUpdateHash}:`));
      expect(hasOriginalVersion).withContext('Has caches for original version').toBeTrue();
      expect(hasUpdatedVersion).withContext('Has caches for updated version').toBeTrue();

      // Simulate failing to load the stored state (and thus starting from an empty state).
      scope.caches.delete('db:control');
      driver = new Driver(scope, scope, new CacheDatabase(scope));

      expect(await makeRequest(scope, '/foo.txt')).toBe('this is foo v2');
      await driver.initialized;

      // Verify that the caches for the obsolete original version are cleaned up.
      // await driver.cleanupCaches();
      scope.advance(6000);
      await driver.idle.empty;

      cacheNames = await scope.caches.keys();
      hasOriginalVersion = cacheNames.some((name) => name.startsWith(`${manifestHash}:`));
      hasUpdatedVersion = cacheNames.some((name) => name.startsWith(`${manifestUpdateHash}:`));
      expect(hasOriginalVersion).withContext('Has caches for original version').toBeFalse();
      expect(hasUpdatedVersion).withContext('Has caches for updated version').toBeTrue();
    });

    it('shows notifications for push notifications', async () => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;
      await scope.handlePush({
        notification: {
          title: 'This is a test',
          body: 'Test body',
        },
      });
      expect(scope.notifications).toEqual([
        {
          title: 'This is a test',
          options: {title: 'This is a test', body: 'Test body'},
        },
      ]);
      expect(scope.clients.getMock('default')!.messages).toEqual([
        {
          type: 'PUSH',
          data: {
            notification: {
              title: 'This is a test',
              body: 'Test body',
            },
          },
        },
      ]);
    });

    describe('notification click events', () => {
      it('broadcasts notification click events with action', async () => {
        expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
        await driver.initialized;
        await scope.handleClick(
          {title: 'This is a test with action', body: 'Test body with action'},
          'button',
        );
        const message = scope.clients.getMock('default')!.messages[0];

        expect(message.type).toEqual('NOTIFICATION_CLICK');
        expect(message.data.action).toEqual('button');
        expect(message.data.notification.title).toEqual('This is a test with action');
        expect(message.data.notification.body).toEqual('Test body with action');
      });

      it('broadcasts notification click events without action', async () => {
        expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
        await driver.initialized;
        await scope.handleClick({
          title: 'This is a test without action',
          body: 'Test body without action',
        });
        const message = scope.clients.getMock('default')!.messages[0];

        expect(message.type).toEqual('NOTIFICATION_CLICK');
        expect(message.data.action).toBe('');
        expect(message.data.notification.title).toEqual('This is a test without action');
        expect(message.data.notification.body).toEqual('Test body without action');
      });

      describe('Client interactions', () => {
        describe('`openWindow` operation', () => {
          it('opens a new client window at url', async () => {
            expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');

            spyOn(scope.clients, 'openWindow');
            const url = 'foo';

            await driver.initialized;
            await scope.handleClick(
              {
                title: 'This is a test with url',
                body: 'Test body with url',
                data: {
                  onActionClick: {
                    foo: {operation: 'openWindow', url},
                  },
                },
              },
              'foo',
            );
            expect(scope.clients.openWindow).toHaveBeenCalledWith(
              `${scope.registration.scope}${url}`,
            );
          });

          it('opens a new client window with `/` when no `url`', async () => {
            expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');

            spyOn(scope.clients, 'openWindow');

            await driver.initialized;
            await scope.handleClick(
              {
                title: 'This is a test without url',
                body: 'Test body without url',
                data: {
                  onActionClick: {
                    foo: {operation: 'openWindow'},
                  },
                },
              },
              'foo',
            );
            expect(scope.clients.openWindow).toHaveBeenCalledWith(`${scope.registration.scope}`);
          });
        });

        describe('`focusLastFocusedOrOpen` operation', () => {
          it('focuses last client keeping previous url', async () => {
            expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');

            scope.clients.add('fooBar', 'http://localhost/unique', 'window');
            const mockClient = scope.clients.getMock('fooBar') as MockWindowClient;
            const url = 'foo';

            expect(mockClient.url).toBe('http://localhost/unique');
            expect(mockClient.focused).toBeFalse();

            await driver.initialized;
            await scope.handleClick(
              {
                title: 'This is a test with operation focusLastFocusedOrOpen',
                body: 'Test body with operation focusLastFocusedOrOpen',
                data: {
                  onActionClick: {
                    foo: {operation: 'focusLastFocusedOrOpen', url},
                  },
                },
              },
              'foo',
            );
            expect(mockClient.url).toBe('http://localhost/unique');
            expect(mockClient.focused).toBeTrue();
          });

          it('falls back to openWindow at url when no last client to focus', async () => {
            expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
            spyOn(scope.clients, 'openWindow');
            spyOn(scope.clients, 'matchAll').and.returnValue(Promise.resolve([]));
            const url = 'foo';

            await driver.initialized;
            await scope.handleClick(
              {
                title: 'This is a test with operation focusLastFocusedOrOpen',
                body: 'Test body with operation focusLastFocusedOrOpen',
                data: {
                  onActionClick: {
                    foo: {operation: 'focusLastFocusedOrOpen', url},
                  },
                },
              },
              'foo',
            );
            expect(scope.clients.openWindow).toHaveBeenCalledWith(
              `${scope.registration.scope}${url}`,
            );
          });

          it('falls back to openWindow at `/` when no last client and no `url`', async () => {
            expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
            spyOn(scope.clients, 'openWindow');
            spyOn(scope.clients, 'matchAll').and.returnValue(Promise.resolve([]));

            await driver.initialized;
            await scope.handleClick(
              {
                title: 'This is a test with operation focusLastFocusedOrOpen',
                body: 'Test body with operation focusLastFocusedOrOpen',
                data: {
                  onActionClick: {
                    foo: {operation: 'focusLastFocusedOrOpen'},
                  },
                },
              },
              'foo',
            );
            expect(scope.clients.openWindow).toHaveBeenCalledWith(`${scope.registration.scope}`);
          });
        });

        describe('`navigateLastFocusedOrOpen` operation', () => {
          it('navigates last client to `url`', async () => {
            expect(await makeRequest(scope, '/foo.txt')).toBe('this is foo');

            scope.clients.add('fooBar', 'http://localhost/unique', 'window');
            const mockClient = scope.clients.getMock('fooBar') as MockWindowClient;
            const url = 'foo';

            expect(mockClient.url).toBe('http://localhost/unique');
            expect(mockClient.focused).toBeFalse();

            await driver.initialized;
            await scope.handleClick(
              {
                title: 'This is a test with operation navigateLastFocusedOrOpen',
                body: 'Test body with operation navigateLastFocusedOrOpen',
                data: {
                  onActionClick: {
                    foo: {operation: 'navigateLastFocusedOrOpen', url},
                  },
                },
              },
              'foo',
            );
            expect(mockClient.url).toBe(`${scope.registration.scope}${url}`);
            expect(mockClient.focused).toBeTrue();
          });

          it('navigates last client to `/` if no `url`', async () => {
            expect(await makeRequest(scope, '/foo.txt')).toBe('this is foo');

            scope.clients.add('fooBar', 'http://localhost/unique', 'window');
            const mockClient = scope.clients.getMock('fooBar') as MockWindowClient;

            expect(mockClient.url).toBe('http://localhost/unique');
            expect(mockClient.focused).toBeFalse();

            await driver.initialized;
            await scope.handleClick(
              {
                title: 'This is a test with operation navigateLastFocusedOrOpen',
                body: 'Test body with operation navigateLastFocusedOrOpen',
                data: {
                  onActionClick: {
                    foo: {operation: 'navigateLastFocusedOrOpen'},
                  },
                },
              },
              'foo',
            );
            expect(mockClient.url).toBe(scope.registration.scope);
            expect(mockClient.focused).toBeTrue();
          });

          it('falls back to openWindow at url when no last client to focus', async () => {
            expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
            spyOn(scope.clients, 'openWindow');
            spyOn(scope.clients, 'matchAll').and.returnValue(Promise.resolve([]));
            const url = 'foo';

            await driver.initialized;
            await scope.handleClick(
              {
                title: 'This is a test with operation navigateLastFocusedOrOpen',
                body: 'Test body with operation navigateLastFocusedOrOpen',
                data: {
                  onActionClick: {
                    foo: {operation: 'navigateLastFocusedOrOpen', url},
                  },
                },
              },
              'foo',
            );
            expect(scope.clients.openWindow).toHaveBeenCalledWith(
              `${scope.registration.scope}${url}`,
            );
          });

          it('falls back to openWindow at `/` when no last client and no `url`', async () => {
            expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
            spyOn(scope.clients, 'openWindow');
            spyOn(scope.clients, 'matchAll').and.returnValue(Promise.resolve([]));

            await driver.initialized;
            await scope.handleClick(
              {
                title: 'This is a test with operation navigateLastFocusedOrOpen',
                body: 'Test body with operation navigateLastFocusedOrOpen',
                data: {
                  onActionClick: {
                    foo: {operation: 'navigateLastFocusedOrOpen'},
                  },
                },
              },
              'foo',
            );
            expect(scope.clients.openWindow).toHaveBeenCalledWith(`${scope.registration.scope}`);
          });
        });

        describe('`sendRequest` operation', () => {
          it('sends a GET request to the specified URL', async () => {
            // Initialize the SW.
            expect(await makeRequest(scope, '/foo.txt')).toBe('this is foo');
            await driver.initialized;
            server.clearRequests();

            // Trigger a `notificationlick` event.
            const url = '/some/url';
            await scope.handleClick(
              {
                title: 'Test notification',
                body: 'This is a test notifiction.',
                data: {
                  onActionClick: {
                    foo: {operation: 'sendRequest', url},
                  },
                },
              },
              'foo',
            );

            // Expect request to the server.
            server.assertSawRequestFor('/some/url');
          });

          it('falls back to sending a request to `/` when no URL is specified', async () => {
            // Initialize the SW.
            expect(await makeRequest(scope, '/foo.txt')).toBe('this is foo');
            await driver.initialized;
            server.clearRequests();

            // Trigger a `notificationlick` event.
            await scope.handleClick(
              {
                title: 'Test notification',
                body: 'This is a test notifiction.',
                data: {
                  onActionClick: {
                    bar: {operation: 'sendRequest'},
                  },
                },
              },
              'bar',
            );

            // Expect request to the server.
            server.assertSawRequestFor('/');
          });
        });

        describe('No matching onActionClick field', () => {
          it('no client interaction', async () => {
            expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
            spyOn(scope.clients, 'openWindow');

            await driver.initialized;
            await scope.handleClick(
              {
                title: 'This is a test without onActionClick field',
                body: 'Test body without onActionClick field',
                data: {
                  onActionClick: {
                    fooz: {operation: 'focusLastFocusedOrOpen', url: 'fooz'},
                  },
                },
              },
              'foo',
            );
            expect(scope.clients.openWindow).not.toHaveBeenCalled();
          });
        });

        describe('no action', () => {
          it('uses onActionClick default when no specific action is clicked', async () => {
            expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
            spyOn(scope.clients, 'openWindow');
            const url = 'fooz';

            await driver.initialized;
            await scope.handleClick(
              {
                title: 'This is a test without action',
                body: 'Test body without action',
                data: {
                  onActionClick: {
                    default: {operation: 'openWindow', url},
                  },
                },
              },
              '',
            );
            expect(scope.clients.openWindow).toHaveBeenCalledWith(
              `${scope.registration.scope}${url}`,
            );
          });

          describe('no onActionClick default', () => {
            it('has no client interaction', async () => {
              expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
              spyOn(scope.clients, 'openWindow');

              await driver.initialized;
              await scope.handleClick({
                title: 'This is a test without action',
                body: 'Test body without action',
              });
              expect(scope.clients.openWindow).not.toHaveBeenCalled();
            });
          });
        });

        describe('no onActionClick field', () => {
          it('has no client interaction', async () => {
            expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
            spyOn(scope.clients, 'openWindow');

            await driver.initialized;
            await scope.handleClick({
              title: 'This is a test without action',
              body: 'Test body without action',
              data: {},
            });
            await scope.handleClick(
              {title: 'This is a test with an action', body: 'Test body with an action', data: {}},
              'someAction',
            );
            expect(scope.clients.openWindow).not.toHaveBeenCalled();
          });
        });

        describe('URL resolution', () => {
          it('should resolve relative to service worker scope', async () => {
            (scope.registration.scope as string) = 'http://localhost/foo/bar/';

            expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');

            spyOn(scope.clients, 'openWindow');

            await driver.initialized;
            await scope.handleClick(
              {
                title: 'This is a test with a relative url',
                body: 'Test body with a relative url',
                data: {
                  onActionClick: {
                    foo: {operation: 'openWindow', url: 'baz/qux'},
                  },
                },
              },
              'foo',
            );
            expect(scope.clients.openWindow).toHaveBeenCalledWith(
              'http://localhost/foo/bar/baz/qux',
            );
          });

          it('should resolve with an absolute path', async () => {
            (scope.registration.scope as string) = 'http://localhost/foo/bar/';

            expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');

            spyOn(scope.clients, 'openWindow');

            await driver.initialized;
            await scope.handleClick(
              {
                title: 'This is a test with an absolute path url',
                body: 'Test body with an absolute path url',
                data: {
                  onActionClick: {
                    foo: {operation: 'openWindow', url: '/baz/qux'},
                  },
                },
              },
              'foo',
            );
            expect(scope.clients.openWindow).toHaveBeenCalledWith('http://localhost/baz/qux');
          });

          it('should resolve other origins', async () => {
            (scope.registration.scope as string) = 'http://localhost/foo/bar/';

            expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');

            spyOn(scope.clients, 'openWindow');

            await driver.initialized;
            await scope.handleClick(
              {
                title: 'This is a test with external origin',
                body: 'Test body with external origin',
                data: {
                  onActionClick: {
                    foo: {operation: 'openWindow', url: 'http://other.host/baz/qux'},
                  },
                },
              },
              'foo',
            );
            expect(scope.clients.openWindow).toHaveBeenCalledWith('http://other.host/baz/qux');
          });
        });
      });
    });

    describe('notification close events', () => {
      it('broadcasts notification close events', async () => {
        expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
        const notification = {title: 'This is a test with action', body: 'Test body with action'};
        await driver.initialized;
        await scope.handleClick(
          {title: 'This is a test with action', body: 'Test body with action'},
          'button',
        );
        await scope.handleClose(notification, '');

        const {messages} = scope.clients.getMock('default')!;

        expect(messages).toEqual([
          {
            type: 'NOTIFICATION_CLICK',
            data: {
              action: 'button',
              notification: {
                title: notification.title,
                body: notification.body,
              },
            },
          },
          {
            type: 'NOTIFICATION_CLOSE',
            data: {
              action: '',
              notification: {
                title: notification.title,
                body: notification.body,
              },
            },
          },
        ]);
      });
    });

    it('prefetches updates to lazy cache when set', async () => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;

      // Fetch some files from the `lazy_prefetch` asset group.
      expect(await makeRequest(scope, '/quux.txt')).toEqual('this is quux');
      expect(await makeRequest(scope, '/lazy/unchanged1.txt')).toEqual('this is unchanged (1)');

      // Install update.
      scope.updateServerState(serverUpdate);
      expect(await driver.checkForUpdate()).toBe(true);

      // Previously requested and changed: Fetch from network.
      serverUpdate.assertSawRequestFor('/quux.txt');
      // Never requested and changed: Don't fetch.
      serverUpdate.assertNoRequestFor('/quuux.txt');
      // Previously requested and unchanged: Fetch from cache.
      serverUpdate.assertNoRequestFor('/lazy/unchanged1.txt');
      // Never requested and unchanged: Don't fetch.
      serverUpdate.assertNoRequestFor('/lazy/unchanged2.txt');

      serverUpdate.clearRequests();

      // Update client.
      await driver.updateClient(await scope.clients.get('default'));

      // Already cached.
      expect(await makeRequest(scope, '/quux.txt')).toBe('this is quux v2');
      serverUpdate.assertNoOtherRequests();

      // Not cached: Fetch from network.
      expect(await makeRequest(scope, '/quuux.txt')).toBe('this is quuux v2');
      serverUpdate.assertSawRequestFor('/quuux.txt');

      // Already cached (copied from old cache).
      expect(await makeRequest(scope, '/lazy/unchanged1.txt')).toBe('this is unchanged (1)');
      serverUpdate.assertNoOtherRequests();

      // Not cached: Fetch from network.
      expect(await makeRequest(scope, '/lazy/unchanged2.txt')).toBe('this is unchanged (2)');
      serverUpdate.assertSawRequestFor('/lazy/unchanged2.txt');

      serverUpdate.assertNoOtherRequests();
    });

    it('bypasses the ServiceWorker on `ngsw-bypass` parameter', async () => {
      // NOTE:
      // Requests that bypass the SW are not handled at all in the mock implementation of `scope`,
      // therefore no requests reach the server.

      await makeRequest(scope, '/some/url', undefined, {headers: {'ngsw-bypass': 'true'}});
      server.assertNoRequestFor('/some/url');

      await makeRequest(scope, '/some/url', undefined, {headers: {'ngsw-bypass': 'anything'}});
      server.assertNoRequestFor('/some/url');

      await makeRequest(scope, '/some/url', undefined, {headers: {'ngsw-bypass': null!}});
      server.assertNoRequestFor('/some/url');

      await makeRequest(scope, '/some/url', undefined, {headers: {'NGSW-bypass': 'upperCASE'}});
      server.assertNoRequestFor('/some/url');

      await makeRequest(scope, '/some/url', undefined, {headers: {'ngsw-bypasss': 'anything'}});
      server.assertSawRequestFor('/some/url');

      server.clearRequests();

      await makeRequest(scope, '/some/url?ngsw-bypass=true');
      server.assertNoRequestFor('/some/url');

      await makeRequest(scope, '/some/url?ngsw-bypasss=true');
      server.assertSawRequestFor('/some/url');

      server.clearRequests();

      await makeRequest(scope, '/some/url?ngsw-bypaSS=something');
      server.assertNoRequestFor('/some/url');

      await makeRequest(scope, '/some/url?testparam=test&ngsw-byPASS=anything');
      server.assertNoRequestFor('/some/url');

      await makeRequest(scope, '/some/url?testparam=test&angsw-byPASS=anything');
      server.assertSawRequestFor('/some/url');

      server.clearRequests();

      await makeRequest(
        scope,
        '/some/url&ngsw-bypass=true.txt?testparam=test&angsw-byPASS=anything',
      );
      server.assertSawRequestFor('/some/url&ngsw-bypass=true.txt');

      server.clearRequests();

      await makeRequest(scope, '/some/url&ngsw-bypass=true.txt');
      server.assertSawRequestFor('/some/url&ngsw-bypass=true.txt');

      server.clearRequests();

      await makeRequest(
        scope,
        '/some/url&ngsw-bypass=true.txt?testparam=test&ngSW-BYPASS=SOMETHING&testparam2=test',
      );
      server.assertNoRequestFor('/some/url&ngsw-bypass=true.txt');

      await makeRequest(scope, '/some/url?testparam=test&ngsw-bypass');
      server.assertNoRequestFor('/some/url');

      await makeRequest(scope, '/some/url?testparam=test&ngsw-bypass&testparam2');
      server.assertNoRequestFor('/some/url');

      await makeRequest(scope, '/some/url?ngsw-bypass&testparam2');
      server.assertNoRequestFor('/some/url');

      await makeRequest(scope, '/some/url?ngsw-bypass=&foo=ngsw-bypass');
      server.assertNoRequestFor('/some/url');

      await makeRequest(scope, '/some/url?ngsw-byapass&testparam2');
      server.assertSawRequestFor('/some/url');
    });

    it('unregisters when manifest 404s', async () => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;

      scope.updateServerState(server404);
      expect(await driver.checkForUpdate()).toEqual(false);
      expect(scope.unregistered).toEqual(true);
      expect(await scope.caches.keys()).toEqual([]);
    });

    it('does not unregister or change state when offline (i.e. manifest 504s)', async () => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;
      server.online = false;

      expect(await driver.checkForUpdate()).toEqual(false);
      expect(driver.state).toEqual(DriverReadyState.NORMAL);
      expect(scope.unregistered).toBeFalsy();
      expect(await scope.caches.keys()).not.toEqual([]);
    });

    it('does not unregister or change state when status code is 503 (service unavailable)', async () => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;
      spyOn(server, 'fetch').and.callFake(
        async (req: Request) =>
          new MockResponse(null, {
            status: 503,
            statusText: 'Service Unavailable',
          }),
      );

      expect(await driver.checkForUpdate()).toEqual(false);
      expect(driver.state).toEqual(DriverReadyState.NORMAL);
      expect(scope.unregistered).toBeFalsy();
      expect(await scope.caches.keys()).not.toEqual([]);
    });

    describe('serving ngsw/state', () => {
      it('should show debug info (when in NORMAL state)', async () => {
        expect(await makeRequest(scope, '/ngsw/state')).toMatch(
          /^NGSW Debug Info:\n\nDriver version: .+\nDriver state: NORMAL/,
        );
      });

      it('should show debug info (when in EXISTING_CLIENTS_ONLY state)', async () => {
        driver.state = DriverReadyState.EXISTING_CLIENTS_ONLY;
        expect(await makeRequest(scope, '/ngsw/state')).toMatch(
          /^NGSW Debug Info:\n\nDriver version: .+\nDriver state: EXISTING_CLIENTS_ONLY/,
        );
      });

      it('should show debug info (when in SAFE_MODE state)', async () => {
        driver.state = DriverReadyState.SAFE_MODE;
        expect(await makeRequest(scope, '/ngsw/state')).toMatch(
          /^NGSW Debug Info:\n\nDriver version: .+\nDriver state: SAFE_MODE/,
        );
      });

      it('should show debug info when the scope is not root', async () => {
        const newScope = new SwTestHarnessBuilder('http://localhost/foo/bar/')
          .withServerState(server)
          .build();
        new Driver(newScope, newScope, new CacheDatabase(newScope));

        expect(await makeRequest(newScope, '/foo/bar/ngsw/state')).toMatch(
          /^NGSW Debug Info:\n\nDriver version: .+\nDriver state: NORMAL/,
        );
      });
    });

    describe('cache naming', () => {
      let uid: number;

      // Helpers
      const cacheKeysFor = (baseHref: string, manifestHash: string) => [
        `ngsw:${baseHref}:db:control`,
        `ngsw:${baseHref}:${manifestHash}:assets:eager:cache`,
        `ngsw:${baseHref}:db:${manifestHash}:assets:eager:meta`,
        `ngsw:${baseHref}:${manifestHash}:assets:lazy:cache`,
        `ngsw:${baseHref}:db:${manifestHash}:assets:lazy:meta`,
        `ngsw:${baseHref}:42:data:api:cache`,
        `ngsw:${baseHref}:db:42:data:api:lru`,
        `ngsw:${baseHref}:db:42:data:api:age`,
      ];

      const createManifestWithBaseHref = (baseHref: string, distDir: MockFileSystem): Manifest => ({
        configVersion: 1,
        timestamp: 1234567890123,
        index: `${baseHref}foo.txt`,
        assetGroups: [
          {
            name: 'eager',
            installMode: 'prefetch',
            updateMode: 'prefetch',
            urls: [`${baseHref}foo.txt`, `${baseHref}bar.txt`],
            patterns: [],
            cacheQueryOptions: {ignoreVary: true},
          },
          {
            name: 'lazy',
            installMode: 'lazy',
            updateMode: 'lazy',
            urls: [`${baseHref}baz.txt`, `${baseHref}qux.txt`],
            patterns: [],
            cacheQueryOptions: {ignoreVary: true},
          },
        ],
        dataGroups: [
          {
            name: 'api',
            version: 42,
            maxAge: 3600000,
            maxSize: 100,
            strategy: 'freshness',
            patterns: ['/api/.*'],
            cacheQueryOptions: {ignoreVary: true},
          },
        ],
        navigationUrls: processNavigationUrls(baseHref),
        navigationRequestStrategy: 'performance',
        hashTable: tmpHashTableForFs(distDir, {}, baseHref),
      });

      const getClientAssignments = async (sw: SwTestHarness, baseHref: string) => {
        const cache = (await sw.caches.original.open(
          `ngsw:${baseHref}:db:control`,
        )) as unknown as MockCache;
        const dehydrated = cache.dehydrate();
        return JSON.parse(dehydrated['/assignments'].body!) as any;
      };

      const initializeSwFor = async (baseHref: string, initialCacheState = '{}') => {
        const newDistDir = dist.extend().addFile('/foo.txt', `this is foo v${++uid}`).build();
        const newManifest = createManifestWithBaseHref(baseHref, newDistDir);
        const newManifestHash = sha1(JSON.stringify(newManifest));

        const serverState = new MockServerStateBuilder()
          .withRootDirectory(baseHref)
          .withStaticFiles(newDistDir)
          .withManifest(newManifest)
          .build();

        const newScope = new SwTestHarnessBuilder(`http://localhost${baseHref}`)
          .withCacheState(initialCacheState)
          .withServerState(serverState)
          .build();
        const newDriver = new Driver(newScope, newScope, new CacheDatabase(newScope));

        await makeRequest(newScope, newManifest.index, baseHref.replace(/\//g, '_'));
        await newDriver.initialized;

        return [newScope, newManifestHash] as [SwTestHarness, string];
      };

      beforeEach(() => {
        uid = 0;
      });

      it('includes the SW scope in all cache names', async () => {
        // SW with scope `/`.
        const [rootScope, rootManifestHash] = await initializeSwFor('/');
        const cacheNames = await rootScope.caches.original.keys();

        expect(cacheNames).toEqual(cacheKeysFor('/', rootManifestHash));
        expect(cacheNames.every((name) => name.includes('/'))).toBe(true);

        // SW with scope `/foo/`.
        const [fooScope, fooManifestHash] = await initializeSwFor('/foo/');
        const fooCacheNames = await fooScope.caches.original.keys();

        expect(fooCacheNames).toEqual(cacheKeysFor('/foo/', fooManifestHash));
        expect(fooCacheNames.every((name) => name.includes('/foo/'))).toBe(true);
      });

      it('does not affect caches from other scopes', async () => {
        // Create SW with scope `/foo/`.
        const [fooScope, fooManifestHash] = await initializeSwFor('/foo/');
        const fooAssignments = await getClientAssignments(fooScope, '/foo/');

        expect(fooAssignments).toEqual({_foo_: fooManifestHash});

        // Add new SW with different scope.
        const [barScope, barManifestHash] = await initializeSwFor(
          '/bar/',
          await fooScope.caches.original.dehydrate(),
        );
        const barCacheNames = await barScope.caches.original.keys();
        const barAssignments = await getClientAssignments(barScope, '/bar/');

        expect(barAssignments).toEqual({_bar_: barManifestHash});
        expect(barCacheNames).toEqual([
          ...cacheKeysFor('/foo/', fooManifestHash),
          ...cacheKeysFor('/bar/', barManifestHash),
        ]);

        // The caches for `/foo/` should be intact.
        const fooAssignments2 = await getClientAssignments(barScope, '/foo/');
        expect(fooAssignments2).toEqual({_foo_: fooManifestHash});
      });

      it('updates existing caches for same scope', async () => {
        // Create SW with scope `/foo/`.
        const [fooScope, fooManifestHash] = await initializeSwFor('/foo/');
        await makeRequest(fooScope, '/foo/foo.txt', '_bar_');
        const fooAssignments = await getClientAssignments(fooScope, '/foo/');

        expect(fooAssignments).toEqual({
          _foo_: fooManifestHash,
          _bar_: fooManifestHash,
        });

        expect(await makeRequest(fooScope, '/foo/baz.txt', '_foo_')).toBe('this is baz');
        expect(await makeRequest(fooScope, '/foo/baz.txt', '_bar_')).toBe('this is baz');

        // Add new SW with same scope.
        const [fooScope2, fooManifestHash2] = await initializeSwFor(
          '/foo/',
          await fooScope.caches.original.dehydrate(),
        );

        // Update client `_foo_` but not client `_bar_`.
        await fooScope2.handleMessage({action: 'CHECK_FOR_UPDATES'}, '_foo_');
        await fooScope2.handleMessage({action: 'ACTIVATE_UPDATE'}, '_foo_');
        const fooAssignments2 = await getClientAssignments(fooScope2, '/foo/');

        expect(fooAssignments2).toEqual({
          _foo_: fooManifestHash2,
          _bar_: fooManifestHash,
        });

        // Everything should still work as expected.
        expect(await makeRequest(fooScope2, '/foo/foo.txt', '_foo_')).toBe('this is foo v2');
        expect(await makeRequest(fooScope2, '/foo/foo.txt', '_bar_')).toBe('this is foo v1');

        expect(await makeRequest(fooScope2, '/foo/baz.txt', '_foo_')).toBe('this is baz');
        expect(await makeRequest(fooScope2, '/foo/baz.txt', '_bar_')).toBe('this is baz');
      });
    });

    describe('request metadata', () => {
      it('passes headers through to the server', async () => {
        // Request a lazy-cached asset (so that it is fetched from the network) and provide headers.
        const reqInit = {
          headers: {SomeHeader: 'SomeValue'},
        };
        expect(await makeRequest(scope, '/baz.txt', undefined, reqInit)).toBe('this is baz');

        // Verify that the headers were passed through to the network.
        const [bazReq] = server.getRequestsFor('/baz.txt');
        expect(bazReq.headers.get('SomeHeader')).toBe('SomeValue');
      });

      it('does not pass non-allowed metadata through to the server', async () => {
        // Request a lazy-cached asset (so that it is fetched from the network) and provide some
        // metadata.
        const reqInit = {
          credentials: 'include',
          mode: 'same-origin',
          unknownOption: 'UNKNOWN',
        };
        expect(await makeRequest(scope, '/baz.txt', undefined, reqInit)).toBe('this is baz');

        // Verify that the metadata were not passed through to the network.
        const [bazReq] = server.getRequestsFor('/baz.txt');
        expect(bazReq.credentials).toBe('same-origin'); // The default value.
        expect(bazReq.mode).toBe('cors'); // The default value.
        expect((bazReq as any).unknownOption).toBeUndefined();
      });

      describe('for redirect requests', () => {
        it('passes headers through to the server', async () => {
          // Request a redirected, lazy-cached asset (so that it is fetched from the network) and
          // provide headers.
          const reqInit = {
            headers: {SomeHeader: 'SomeValue'},
          };
          expect(await makeRequest(scope, '/lazy/redirected.txt', undefined, reqInit)).toBe(
            'this was a redirect too',
          );

          // Verify that the headers were passed through to the network.
          const [redirectReq] = server.getRequestsFor('/lazy/redirect-target.txt');
          expect(redirectReq.headers.get('SomeHeader')).toBe('SomeValue');
        });

        it('does not pass non-allowed metadata through to the server', async () => {
          // Request a redirected, lazy-cached asset (so that it is fetched from the network) and
          // provide some metadata.
          const reqInit = {
            credentials: 'include',
            mode: 'same-origin',
            unknownOption: 'UNKNOWN',
          };
          expect(await makeRequest(scope, '/lazy/redirected.txt', undefined, reqInit)).toBe(
            'this was a redirect too',
          );

          // Verify that the metadata were not passed through to the network.
          const [redirectReq] = server.getRequestsFor('/lazy/redirect-target.txt');
          expect(redirectReq.credentials).toBe('same-origin'); // The default value.
          expect(redirectReq.mode).toBe('cors'); // The default value.
          expect((redirectReq as any).unknownOption).toBeUndefined();
        });
      });
    });

    describe('unhashed requests', () => {
      beforeEach(async () => {
        expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
        await driver.initialized;
        server.clearRequests();
      });

      it('are cached appropriately', async () => {
        expect(await makeRequest(scope, '/unhashed/a.txt')).toEqual('this is unhashed');
        server.assertSawRequestFor('/unhashed/a.txt');
        expect(await makeRequest(scope, '/unhashed/a.txt')).toEqual('this is unhashed');
        server.assertNoOtherRequests();
      });

      it(`don't error when 'Cache-Control' is 'no-cache'`, async () => {
        expect(await makeRequest(scope, '/unhashed/b.txt')).toEqual('this is unhashed b');
        server.assertSawRequestFor('/unhashed/b.txt');
        expect(await makeRequest(scope, '/unhashed/b.txt')).toEqual('this is unhashed b');
        server.assertNoOtherRequests();
      });

      it('avoid opaque responses', async () => {
        expect(
          await makeRequest(scope, '/unhashed/a.txt', 'default', {
            credentials: 'include',
          }),
        ).toEqual('this is unhashed');
        server.assertSawRequestFor('/unhashed/a.txt');
        expect(await makeRequest(scope, '/unhashed/a.txt')).toEqual('this is unhashed');
        server.assertNoOtherRequests();
      });

      it('expire according to Cache-Control headers', async () => {
        expect(await makeRequest(scope, '/unhashed/a.txt')).toEqual('this is unhashed');
        server.clearRequests();

        // Update the resource on the server.
        scope.updateServerState(serverUpdate);

        // Move ahead by 15 seconds.
        scope.advance(15000);

        expect(await makeRequest(scope, '/unhashed/a.txt')).toEqual('this is unhashed');
        serverUpdate.assertNoOtherRequests();

        // Another 6 seconds.
        scope.advance(6000);
        await driver.idle.empty;
        await new Promise((resolve) => setTimeout(resolve)); // Wait for async operations to complete.
        serverUpdate.assertSawRequestFor('/unhashed/a.txt');

        // Now the new version of the resource should be served.
        expect(await makeRequest(scope, '/unhashed/a.txt')).toEqual('this is unhashed v2');
        server.assertNoOtherRequests();
      });

      it('survive serialization', async () => {
        expect(await makeRequest(scope, '/unhashed/a.txt')).toEqual('this is unhashed');
        server.clearRequests();

        const state = scope.caches.original.dehydrate();
        scope = new SwTestHarnessBuilder().withCacheState(state).withServerState(server).build();
        driver = new Driver(scope, scope, new CacheDatabase(scope));
        expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
        await driver.initialized;
        server.assertNoRequestFor('/unhashed/a.txt');
        server.clearRequests();

        expect(await makeRequest(scope, '/unhashed/a.txt')).toEqual('this is unhashed');
        server.assertNoOtherRequests();

        // Advance the clock by 6 seconds, triggering the idle tasks. If an idle task
        // was scheduled from the request above, it means that the metadata was not
        // properly saved.
        scope.advance(6000);
        await driver.idle.empty;
        server.assertNoRequestFor('/unhashed/a.txt');
      });

      it('get carried over during updates', async () => {
        expect(await makeRequest(scope, '/unhashed/a.txt')).toEqual('this is unhashed');
        server.clearRequests();

        scope = new SwTestHarnessBuilder()
          .withCacheState(scope.caches.original.dehydrate())
          .withServerState(serverUpdate)
          .build();
        driver = new Driver(scope, scope, new CacheDatabase(scope));
        expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
        await driver.initialized;

        scope.advance(15000);
        await driver.idle.empty;
        serverUpdate.assertNoRequestFor('/unhashed/a.txt');
        serverUpdate.clearRequests();

        expect(await makeRequest(scope, '/unhashed/a.txt')).toEqual('this is unhashed');
        serverUpdate.assertNoOtherRequests();

        scope.advance(15000);
        await driver.idle.empty;
        serverUpdate.assertSawRequestFor('/unhashed/a.txt');

        expect(await makeRequest(scope, '/unhashed/a.txt')).toEqual('this is unhashed v2');
        serverUpdate.assertNoOtherRequests();
      });
    });

    describe('routing', () => {
      const navRequest = (url: string, init = {}) =>
        makeNavigationRequest(scope, url, undefined, init);

      beforeEach(async () => {
        expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
        await driver.initialized;
        server.clearRequests();
      });

      it('redirects to index on a route-like request', async () => {
        expect(await navRequest('/baz')).toEqual('this is foo');
        server.assertNoOtherRequests();
      });

      it('redirects to index on a request to the scope URL', async () => {
        expect(await navRequest('http://localhost/')).toEqual('this is foo');
        server.assertNoOtherRequests();
      });

      it('does not redirect to index on a non-GET request', async () => {
        expect(await navRequest('/baz', {method: 'POST'})).toBeNull();
        server.assertSawRequestFor('/baz');

        expect(await navRequest('/qux', {method: 'PUT'})).toBeNull();
        server.assertSawRequestFor('/qux');
      });

      it('does not redirect to index on a non-navigation request', async () => {
        expect(await navRequest('/baz', {mode: undefined})).toBeNull();
        server.assertSawRequestFor('/baz');
      });

      it('does not redirect to index on a request that does not accept HTML', async () => {
        expect(await navRequest('/baz', {headers: {}})).toBeNull();
        server.assertSawRequestFor('/baz');

        expect(await navRequest('/qux', {headers: {'Accept': 'text/plain'}})).toBeNull();
        server.assertSawRequestFor('/qux');
      });

      it('does not redirect to index on a request with an extension', async () => {
        expect(await navRequest('/baz.html')).toBeNull();
        server.assertSawRequestFor('/baz.html');

        // Only considers the last path segment when checking for a file extension.
        expect(await navRequest('/baz.html/qux')).toBe('this is foo');
        server.assertNoOtherRequests();
      });

      it('does not redirect to index if the URL contains `__`', async () => {
        expect(await navRequest('/baz/x__x')).toBeNull();
        server.assertSawRequestFor('/baz/x__x');

        expect(await navRequest('/baz/x__x/qux')).toBeNull();
        server.assertSawRequestFor('/baz/x__x/qux');

        expect(await navRequest('/baz/__')).toBeNull();
        server.assertSawRequestFor('/baz/__');

        expect(await navRequest('/baz/__/qux')).toBeNull();
        server.assertSawRequestFor('/baz/__/qux');
      });

      describe('(with custom `navigationUrls`)', () => {
        beforeEach(async () => {
          scope.updateServerState(serverUpdate);
          await driver.checkForUpdate();
          serverUpdate.clearRequests();
        });

        it('redirects to index on a request that matches any positive pattern', async () => {
          expect(await navRequest('/foo/file0')).toBeNull();
          serverUpdate.assertSawRequestFor('/foo/file0');

          expect(await navRequest('/foo/file1')).toBe('this is foo v2');
          serverUpdate.assertNoOtherRequests();

          expect(await navRequest('/bar/file2')).toBe('this is foo v2');
          serverUpdate.assertNoOtherRequests();
        });

        it('does not redirect to index on a request that matches any negative pattern', async () => {
          expect(await navRequest('/ignored/file1')).toBe('this is not handled by the SW');
          serverUpdate.assertSawRequestFor('/ignored/file1');

          expect(await navRequest('/ignored/dir/file2')).toBe(
            'this is not handled by the SW either',
          );
          serverUpdate.assertSawRequestFor('/ignored/dir/file2');

          expect(await navRequest('/ignored/directory/file2')).toBe('this is foo v2');
          serverUpdate.assertNoOtherRequests();
        });

        it('strips URL query before checking `navigationUrls`', async () => {
          expect(await navRequest('/foo/file1?query=/a/b')).toBe('this is foo v2');
          serverUpdate.assertNoOtherRequests();

          expect(await navRequest('/ignored/file1?query=/a/b')).toBe(
            'this is not handled by the SW',
          );
          serverUpdate.assertSawRequestFor('/ignored/file1');

          expect(await navRequest('/ignored/dir/file2?query=/a/b')).toBe(
            'this is not handled by the SW either',
          );
          serverUpdate.assertSawRequestFor('/ignored/dir/file2');
        });

        it('strips registration scope before checking `navigationUrls`', async () => {
          expect(await navRequest('http://localhost/ignored/file1')).toBe(
            'this is not handled by the SW',
          );
          serverUpdate.assertSawRequestFor('/ignored/file1');
        });
      });
    });

    describe('with relative base href', () => {
      const createManifestWithRelativeBaseHref = (distDir: MockFileSystem): Manifest => ({
        configVersion: 1,
        timestamp: 1234567890123,
        index: './index.html',
        assetGroups: [
          {
            name: 'eager',
            installMode: 'prefetch',
            updateMode: 'prefetch',
            urls: ['./index.html', './main.js', './styles.css'],
            patterns: ['/unhashed/.*'],
            cacheQueryOptions: {ignoreVary: true},
          },
          {
            name: 'lazy',
            installMode: 'lazy',
            updateMode: 'prefetch',
            urls: [
              './changed/chunk-1.js',
              './changed/chunk-2.js',
              './unchanged/chunk-3.js',
              './unchanged/chunk-4.js',
            ],
            patterns: ['/lazy/unhashed/.*'],
            cacheQueryOptions: {ignoreVary: true},
          },
        ],
        navigationUrls: processNavigationUrls('./'),
        navigationRequestStrategy: 'performance',
        hashTable: tmpHashTableForFs(distDir, {}, './'),
      });

      const createServerWithBaseHref = (distDir: MockFileSystem): MockServerState =>
        new MockServerStateBuilder()
          .withRootDirectory('/base/href')
          .withStaticFiles(distDir)
          .withManifest(createManifestWithRelativeBaseHref(distDir))
          .build();

      const initialDistDir = new MockFileSystemBuilder()
        .addFile('/index.html', 'This is index.html')
        .addFile('/main.js', 'This is main.js')
        .addFile('/styles.css', 'This is styles.css')
        .addFile('/changed/chunk-1.js', 'This is chunk-1.js')
        .addFile('/changed/chunk-2.js', 'This is chunk-2.js')
        .addFile('/unchanged/chunk-3.js', 'This is chunk-3.js')
        .addFile('/unchanged/chunk-4.js', 'This is chunk-4.js')
        .build();

      const serverWithBaseHref = createServerWithBaseHref(initialDistDir);

      beforeEach(() => {
        serverWithBaseHref.reset();

        scope = new SwTestHarnessBuilder('http://localhost/base/href/')
          .withServerState(serverWithBaseHref)
          .build();
        driver = new Driver(scope, scope, new CacheDatabase(scope));
      });

      it('initializes prefetched content correctly, after a request kicks it off', async () => {
        expect(await makeRequest(scope, '/base/href/index.html')).toBe('This is index.html');
        await driver.initialized;
        serverWithBaseHref.assertSawRequestFor('/base/href/ngsw.json');
        serverWithBaseHref.assertSawRequestFor('/base/href/index.html');
        serverWithBaseHref.assertSawRequestFor('/base/href/main.js');
        serverWithBaseHref.assertSawRequestFor('/base/href/styles.css');
        serverWithBaseHref.assertNoOtherRequests();

        expect(await makeRequest(scope, '/base/href/main.js')).toBe('This is main.js');
        expect(await makeRequest(scope, '/base/href/styles.css')).toBe('This is styles.css');
        serverWithBaseHref.assertNoOtherRequests();
      });

      it('prefetches updates to lazy cache when set', async () => {
        // Helper
        const request = (url: string) => makeRequest(scope, url);

        expect(await request('/base/href/index.html')).toBe('This is index.html');
        await driver.initialized;

        // Fetch some files from the `lazy` asset group.
        expect(await request('/base/href/changed/chunk-1.js')).toBe('This is chunk-1.js');
        expect(await request('/base/href/unchanged/chunk-3.js')).toBe('This is chunk-3.js');

        // Install update.
        const updatedDistDir = initialDistDir
          .extend()
          .addFile('/changed/chunk-1.js', 'This is chunk-1.js v2')
          .addFile('/changed/chunk-2.js', 'This is chunk-2.js v2')
          .build();
        const updatedServer = createServerWithBaseHref(updatedDistDir);

        scope.updateServerState(updatedServer);
        expect(await driver.checkForUpdate()).toBe(true);

        // Previously requested and changed: Fetch from network.
        updatedServer.assertSawRequestFor('/base/href/changed/chunk-1.js');
        // Never requested and changed: Don't fetch.
        updatedServer.assertNoRequestFor('/base/href/changed/chunk-2.js');
        // Previously requested and unchanged: Fetch from cache.
        updatedServer.assertNoRequestFor('/base/href/unchanged/chunk-3.js');
        // Never requested and unchanged: Don't fetch.
        updatedServer.assertNoRequestFor('/base/href/unchanged/chunk-4.js');

        updatedServer.clearRequests();

        // Update client.
        await driver.updateClient(await scope.clients.get('default'));

        // Already cached.
        expect(await request('/base/href/changed/chunk-1.js')).toBe('This is chunk-1.js v2');
        updatedServer.assertNoOtherRequests();

        // Not cached: Fetch from network.
        expect(await request('/base/href/changed/chunk-2.js')).toBe('This is chunk-2.js v2');
        updatedServer.assertSawRequestFor('/base/href/changed/chunk-2.js');

        // Already cached (copied from old cache).
        expect(await request('/base/href/unchanged/chunk-3.js')).toBe('This is chunk-3.js');
        updatedServer.assertNoOtherRequests();

        // Not cached: Fetch from network.
        expect(await request('/base/href/unchanged/chunk-4.js')).toBe('This is chunk-4.js');
        updatedServer.assertSawRequestFor('/base/href/unchanged/chunk-4.js');

        updatedServer.assertNoOtherRequests();
      });

      describe('routing', () => {
        beforeEach(async () => {
          expect(await makeRequest(scope, '/base/href/index.html')).toBe('This is index.html');
          await driver.initialized;
          serverWithBaseHref.clearRequests();
        });

        it('redirects to index on a route-like request', async () => {
          expect(await makeNavigationRequest(scope, '/base/href/baz')).toBe('This is index.html');
          serverWithBaseHref.assertNoOtherRequests();
        });

        it('redirects to index on a request to the scope URL', async () => {
          expect(await makeNavigationRequest(scope, 'http://localhost/base/href/')).toBe(
            'This is index.html',
          );
          serverWithBaseHref.assertNoOtherRequests();
        });
      });
    });

    describe('bugs', () => {
      it('does not crash with bad index hash', async () => {
        scope = new SwTestHarnessBuilder().withServerState(brokenServer).build();
        (scope.registration as any).scope = 'http://site.com';
        driver = new Driver(scope, scope, new CacheDatabase(scope));

        expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo (broken)');
      });

      it('enters degraded mode when update has a bad index', async () => {
        expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
        await driver.initialized;
        server.clearRequests();

        scope = new SwTestHarnessBuilder()
          .withCacheState(scope.caches.original.dehydrate())
          .withServerState(brokenServer)
          .build();
        driver = new Driver(scope, scope, new CacheDatabase(scope));
        await driver.checkForUpdate();

        scope.advance(12000);
        await driver.idle.empty;

        expect(driver.state).toEqual(DriverReadyState.EXISTING_CLIENTS_ONLY);
      });

      it('enters degraded mode when failing to write to cache', async () => {
        // Initialize the SW.
        await makeRequest(scope, '/foo.txt');
        await driver.initialized;
        expect(driver.state).toBe(DriverReadyState.NORMAL);

        server.clearRequests();

        // Operate normally.
        expect(await makeRequest(scope, '/foo.txt')).toBe('this is foo');
        server.assertNoOtherRequests();

        // Clear the caches and make them unwritable.
        await clearAllCaches(scope.caches);
        spyOn(MockCache.prototype, 'put').and.throwError("Can't touch this");

        // Enter degraded mode and serve from network.
        expect(await makeRequest(scope, '/foo.txt')).toBe('this is foo');
        expect(driver.state).toBe(DriverReadyState.EXISTING_CLIENTS_ONLY);
        server.assertSawRequestFor('/foo.txt');
      });

      it('keeps serving api requests with freshness strategy when failing to write to cache', async () => {
        // Initialize the SW.
        expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
        await driver.initialized;
        server.clearRequests();

        // Make the caches unwritable.
        spyOn(MockCache.prototype, 'put').and.throwError("Can't touch this");
        spyOn(driver.debugger, 'log');

        expect(await makeRequest(scope, '/api/foo')).toEqual('this is api foo');
        expect(driver.state).toBe(DriverReadyState.NORMAL);
        // Since we are swallowing an error here, make sure it is at least properly logged
        expect(driver.debugger.log).toHaveBeenCalledWith(
          new Error("Can't touch this"),
          'DataGroup(api@42).safeCacheResponse(/api/foo, status: 200)',
        );
        server.assertSawRequestFor('/api/foo');
      });

      it('keeps serving api requests with performance strategy when failing to write to cache', async () => {
        // Initialize the SW.
        expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
        await driver.initialized;
        server.clearRequests();

        // Make the caches unwritable.
        spyOn(MockCache.prototype, 'put').and.throwError("Can't touch this");
        spyOn(driver.debugger, 'log');

        expect(await makeRequest(scope, '/api-static/bar')).toEqual('this is static api bar');
        expect(driver.state).toBe(DriverReadyState.NORMAL);
        // Since we are swallowing an error here, make sure it is at least properly logged
        expect(driver.debugger.log).toHaveBeenCalledWith(
          new Error("Can't touch this"),
          'DataGroup(api-static@43).safeCacheResponse(/api-static/bar, status: 200)',
        );
        server.assertSawRequestFor('/api-static/bar');
      });

      it('keeps serving mutating api requests when failing to write to cache', async () => {
        // sw can invalidate LRU cache entry and try to write to cache storage on mutating request
        // Initialize the SW.
        expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
        await driver.initialized;
        server.clearRequests();

        // Make the caches unwritable.
        spyOn(MockCache.prototype, 'put').and.throwError("Can't touch this");
        spyOn(driver.debugger, 'log');
        expect(
          await makeRequest(scope, '/api/foo', 'default', {
            method: 'post',
          }),
        ).toEqual('this is api foo');
        expect(driver.state).toBe(DriverReadyState.NORMAL);
        // Since we are swallowing an error here, make sure it is at least properly logged
        expect(driver.debugger.log).toHaveBeenCalledWith(
          new Error("Can't touch this"),
          'DataGroup(api@42).syncLru()',
        );
        server.assertSawRequestFor('/api/foo');
      });

      it('enters degraded mode when something goes wrong with the latest version', async () => {
        await driver.initialized;

        // Two clients on initial version.
        expect(await makeRequest(scope, '/foo.txt', 'client1')).toBe('this is foo');
        expect(await makeRequest(scope, '/foo.txt', 'client2')).toBe('this is foo');

        // Install a broken version (`bar.txt` has invalid hash).
        scope.updateServerState(brokenLazyServer);
        await driver.checkForUpdate();

        // Update `client1` but not `client2`.
        await makeNavigationRequest(scope, '/', 'client1');
        server.clearRequests();
        brokenLazyServer.clearRequests();

        expect(await makeRequest(scope, '/foo.txt', 'client1')).toBe('this is foo (broken)');
        expect(await makeRequest(scope, '/foo.txt', 'client2')).toBe('this is foo');
        server.assertNoOtherRequests();
        brokenLazyServer.assertNoOtherRequests();

        // Trying to fetch `bar.txt` (which has an invalid hash) should invalidate the latest
        // version, enter degraded mode and "forget" clients that are on that version (i.e.
        // `client1`).
        expect(await makeRequest(scope, '/bar.txt', 'client1')).toBe('this is bar (broken)');
        expect(driver.state).toBe(DriverReadyState.EXISTING_CLIENTS_ONLY);
        brokenLazyServer.assertSawRequestFor('/bar.txt');
        brokenLazyServer.clearRequests();

        // `client1` should still be served from the latest (broken) version.
        expect(await makeRequest(scope, '/foo.txt', 'client1')).toBe('this is foo (broken)');
        brokenLazyServer.assertNoOtherRequests();

        // `client2` should still be served from the old version (since it never updated).
        expect(await makeRequest(scope, '/foo.txt', 'client2')).toBe('this is foo');
        server.assertNoOtherRequests();
        brokenLazyServer.assertNoOtherRequests();

        // New clients should be served from the network.
        expect(await makeRequest(scope, '/foo.txt', 'client3')).toBe('this is foo (broken)');
        brokenLazyServer.assertSawRequestFor('/foo.txt');
      });

      it('enters does not enter degraded mode when something goes wrong with an older version', async () => {
        await driver.initialized;

        // Three clients on initial version.
        expect(await makeRequest(scope, '/foo.txt', 'client1')).toBe('this is foo');
        expect(await makeRequest(scope, '/foo.txt', 'client2')).toBe('this is foo');
        expect(await makeRequest(scope, '/foo.txt', 'client3')).toBe('this is foo');

        // Install a broken version (`bar.txt` has invalid hash).
        scope.updateServerState(brokenLazyServer);
        await driver.checkForUpdate();

        // Update `client1` and `client2` but not `client3`.
        await makeNavigationRequest(scope, '/', 'client1');
        await makeNavigationRequest(scope, '/', 'client2');
        server.clearRequests();
        brokenLazyServer.clearRequests();

        expect(await makeRequest(scope, '/foo.txt', 'client1')).toBe('this is foo (broken)');
        expect(await makeRequest(scope, '/foo.txt', 'client2')).toBe('this is foo (broken)');
        expect(await makeRequest(scope, '/foo.txt', 'client3')).toBe('this is foo');
        server.assertNoOtherRequests();
        brokenLazyServer.assertNoOtherRequests();

        // Install a newer, non-broken version.
        scope.updateServerState(serverUpdate);
        await driver.checkForUpdate();

        // Update `client1` bot not `client2` or `client3`.
        await makeNavigationRequest(scope, '/', 'client1');
        expect(await makeRequest(scope, '/foo.txt', 'client1')).toBe('this is foo v2');

        // Trying to fetch `bar.txt` (which has an invalid hash on the broken version) from
        // `client2` should invalidate that particular version (which is not the latest one).
        // (NOTE: Since the file is not cached locally, it is fetched from the server.)
        expect(await makeRequest(scope, '/bar.txt', 'client2')).toBe('this is bar');
        expect(driver.state).toBe(DriverReadyState.NORMAL);
        serverUpdate.clearRequests();

        // Existing clients should still be served from their assigned versions.
        expect(await makeRequest(scope, '/foo.txt', 'client1')).toBe('this is foo v2');
        expect(await makeRequest(scope, '/foo.txt', 'client2')).toBe('this is foo (broken)');
        expect(await makeRequest(scope, '/foo.txt', 'client3')).toBe('this is foo');
        server.assertNoOtherRequests();
        brokenLazyServer.assertNoOtherRequests();
        serverUpdate.assertNoOtherRequests();

        // New clients should be served from the latest version.
        expect(await makeRequest(scope, '/foo.txt', 'client4')).toBe('this is foo v2');
        serverUpdate.assertNoOtherRequests();
      });

      it('recovers from degraded `EXISTING_CLIENTS_ONLY` mode as soon as there is a valid update', async () => {
        await driver.initialized;
        expect(driver.state).toBe(DriverReadyState.NORMAL);

        // Install a broken version.
        scope.updateServerState(brokenServer);
        await driver.checkForUpdate();
        expect(driver.state).toBe(DriverReadyState.EXISTING_CLIENTS_ONLY);

        // Install a good version.
        scope.updateServerState(serverUpdate);
        await driver.checkForUpdate();
        expect(driver.state).toBe(DriverReadyState.NORMAL);
      });

      it('should not enter degraded mode if manifest for latest hash is missing upon initialization', async () => {
        // Initialize the SW.
        scope.handleMessage({action: 'INITIALIZE'}, null);
        await driver.initialized;
        expect(driver.state).toBe(DriverReadyState.NORMAL);

        // Ensure the data has been stored in the DB.
        const db: MockCache = (await scope.caches.open('db:control')) as any;
        const getLatestHashFromDb = async () => (await (await db.match('/latest')).json()).latest;
        expect(await getLatestHashFromDb()).toBe(manifestHash);

        // Change the latest hash to not correspond to any manifest.
        await db.put('/latest', new MockResponse('{"latest": "wrong-hash"}'));
        expect(await getLatestHashFromDb()).toBe('wrong-hash');

        // Re-initialize the SW and ensure it does not enter a degraded mode.
        driver.initialized = null;
        scope.handleMessage({action: 'INITIALIZE'}, null);
        await driver.initialized;
        expect(driver.state).toBe(DriverReadyState.NORMAL);
        expect(await getLatestHashFromDb()).toBe(manifestHash);
      });

      it('ignores invalid `only-if-cached` requests ', async () => {
        const requestFoo = (cache: RequestCache | 'only-if-cached', mode: RequestMode) =>
          makeRequest(scope, '/foo.txt', undefined, {cache, mode});

        expect(await requestFoo('default', 'no-cors')).toBe('this is foo');
        expect(await requestFoo('only-if-cached', 'same-origin')).toBe('this is foo');
        expect(await requestFoo('only-if-cached', 'no-cors')).toBeNull();
      });

      it('ignores passive mixed content requests ', async () => {
        const scopeFetchSpy = spyOn(scope, 'fetch').and.callThrough();
        const getRequestUrls = () =>
          (scopeFetchSpy.calls.allArgs() as [Request][]).map((args) => args[0].url);

        const httpScopeUrl = 'http://mock.origin.dev';
        const httpsScopeUrl = 'https://mock.origin.dev';
        const httpRequestUrl = 'http://other.origin.sh/unknown.png';
        const httpsRequestUrl = 'https://other.origin.sh/unknown.pnp';

        // Registration scope: `http:`
        (scope.registration.scope as string) = httpScopeUrl;

        await makeRequest(scope, httpRequestUrl);
        await makeRequest(scope, httpsRequestUrl);
        const requestUrls1 = getRequestUrls();

        expect(requestUrls1).toContain(httpRequestUrl);
        expect(requestUrls1).toContain(httpsRequestUrl);

        scopeFetchSpy.calls.reset();

        // Registration scope: `https:`
        (scope.registration.scope as string) = httpsScopeUrl;

        await makeRequest(scope, httpRequestUrl);
        await makeRequest(scope, httpsRequestUrl);
        const requestUrls2 = getRequestUrls();

        expect(requestUrls2).not.toContain(httpRequestUrl);
        expect(requestUrls2).toContain(httpsRequestUrl);
      });

      it('does not enter degraded mode when offline while fetching an uncached asset', async () => {
        // Trigger SW initialization and wait for it to complete.
        expect(await makeRequest(scope, '/foo.txt')).toBe('this is foo');
        await driver.initialized;

        // Request an uncached asset while offline.
        // The SW will not be able to get the content, but it should not enter a degraded mode either.
        server.online = false;
        await expectAsync(makeRequest(scope, '/baz.txt')).toBeRejectedWithError(
          'Response not Ok (fetchAndCacheOnce): request for /baz.txt returned response 504 Gateway Timeout',
        );
        expect(driver.state).toBe(DriverReadyState.NORMAL);

        // Once we are back online, everything should work as expected.
        server.online = true;
        expect(await makeRequest(scope, '/baz.txt')).toBe('this is baz');
        expect(driver.state).toBe(DriverReadyState.NORMAL);
      });

      describe('unrecoverable state', () => {
        const generateMockServerState = (fileSystem: MockFileSystem) => {
          const manifest: Manifest = {
            configVersion: 1,
            timestamp: 1234567890123,
            index: '/index.html',
            assetGroups: [
              {
                name: 'assets',
                installMode: 'prefetch',
                updateMode: 'prefetch',
                urls: fileSystem.list(),
                patterns: [],
                cacheQueryOptions: {ignoreVary: true},
              },
            ],
            dataGroups: [],
            navigationUrls: processNavigationUrls(''),
            navigationRequestStrategy: 'performance',
            hashTable: tmpHashTableForFs(fileSystem),
          };

          return {
            serverState: new MockServerStateBuilder()
              .withManifest(manifest)
              .withStaticFiles(fileSystem)
              .build(),
            manifest,
          };
        };

        it('notifies affected clients', async () => {
          const {serverState: serverState1} = generateMockServerState(
            new MockFileSystemBuilder()
              .addFile('/index.html', '<script src="foo.hash.js"></script>')
              .addFile('/foo.hash.js', 'console.log("FOO");')
              .build(),
          );

          const {serverState: serverState2, manifest: manifest2} = generateMockServerState(
            new MockFileSystemBuilder()
              .addFile('/index.html', '<script src="bar.hash.js"></script>')
              .addFile('/bar.hash.js', 'console.log("BAR");')
              .build(),
          );

          const {serverState: serverState3} = generateMockServerState(
            new MockFileSystemBuilder()
              .addFile('/index.html', '<script src="baz.hash.js"></script>')
              .addFile('/baz.hash.js', 'console.log("BAZ");')
              .build(),
          );

          // Create initial server state and initialize the SW.
          scope = new SwTestHarnessBuilder().withServerState(serverState1).build();
          driver = new Driver(scope, scope, new CacheDatabase(scope));

          // Verify that all three clients are able to make the request.
          expect(await makeRequest(scope, '/foo.hash.js', 'client1')).toBe('console.log("FOO");');
          expect(await makeRequest(scope, '/foo.hash.js', 'client2')).toBe('console.log("FOO");');
          expect(await makeRequest(scope, '/foo.hash.js', 'client3')).toBe('console.log("FOO");');

          await driver.initialized;
          serverState1.clearRequests();

          // Verify that the `foo.hash.js` file is cached.
          expect(await makeRequest(scope, '/foo.hash.js')).toBe('console.log("FOO");');
          serverState1.assertNoRequestFor('/foo.hash.js');

          // Update the ServiceWorker to the second version.
          scope.updateServerState(serverState2);
          expect(await driver.checkForUpdate()).toEqual(true);

          // Update the first two clients to the latest version, keep `client3` as is.
          const [client1, client2] = await Promise.all([
            scope.clients.get('client1'),
            scope.clients.get('client2'),
          ]);

          await Promise.all([driver.updateClient(client1), driver.updateClient(client2)]);

          // Update the ServiceWorker to the latest version
          scope.updateServerState(serverState3);
          expect(await driver.checkForUpdate()).toEqual(true);

          // Remove `bar.hash.js` from the cache to emulate the browser evicting files from the cache.
          await removeAssetFromCache(scope, manifest2, '/bar.hash.js');

          // Get all clients and verify their messages
          const mockClient1 = scope.clients.getMock('client1')!;
          const mockClient2 = scope.clients.getMock('client2')!;
          const mockClient3 = scope.clients.getMock('client3')!;

          // Try to retrieve `bar.hash.js`, which is neither in the cache nor on the server.
          // This should put the SW in an unrecoverable state and notify clients.
          expect(await makeRequest(scope, '/bar.hash.js', 'client1')).toBeNull();
          serverState2.assertSawRequestFor('/bar.hash.js');
          const unrecoverableMessage = {
            type: 'UNRECOVERABLE_STATE',
            reason:
              'Failed to retrieve hashed resource from the server. (AssetGroup: assets | URL: /bar.hash.js)',
          };

          expect(mockClient1.messages).toContain(unrecoverableMessage);
          expect(mockClient2.messages).toContain(unrecoverableMessage);
          expect(mockClient3.messages).not.toContain(unrecoverableMessage);

          // Because `client1` failed, `client1` and `client2` have been moved to the latest version.
          // Verify that by retrieving `baz.hash.js`.
          expect(await makeRequest(scope, '/baz.hash.js', 'client1')).toBe('console.log("BAZ");');
          serverState2.assertNoRequestFor('/baz.hash.js');
          expect(await makeRequest(scope, '/baz.hash.js', 'client2')).toBe('console.log("BAZ");');
          serverState2.assertNoRequestFor('/baz.hash.js');

          // Ensure that `client3` remains on the first version and can request `foo.hash.js`.
          expect(await makeRequest(scope, '/foo.hash.js', 'client3')).toBe('console.log("FOO");');
          serverState2.assertNoRequestFor('/foo.hash.js');
        });

        it('enters degraded mode', async () => {
          const originalFiles = new MockFileSystemBuilder()
            .addFile('/index.html', '<script src="foo.hash.js"></script>')
            .addFile('/foo.hash.js', 'console.log("FOO");')
            .build();

          const updatedFiles = new MockFileSystemBuilder()
            .addFile('/index.html', '<script src="bar.hash.js"></script>')
            .addFile('/bar.hash.js', 'console.log("BAR");')
            .build();

          const {serverState: originalServer, manifest} = generateMockServerState(originalFiles);
          const {serverState: updatedServer} = generateMockServerState(updatedFiles);

          // Create initial server state and initialize the SW.
          scope = new SwTestHarnessBuilder().withServerState(originalServer).build();
          driver = new Driver(scope, scope, new CacheDatabase(scope));

          expect(await makeRequest(scope, '/foo.hash.js')).toBe('console.log("FOO");');
          await driver.initialized;
          originalServer.clearRequests();

          // Verify that the `foo.hash.js` file is cached.
          expect(await makeRequest(scope, '/foo.hash.js')).toBe('console.log("FOO");');
          originalServer.assertNoRequestFor('/foo.hash.js');

          // Update the server state to emulate deploying a new version (where `foo.hash.js` does not
          // exist any more). Keep the cache though.
          scope = new SwTestHarnessBuilder()
            .withCacheState(scope.caches.original.dehydrate())
            .withServerState(updatedServer)
            .build();
          driver = new Driver(scope, scope, new CacheDatabase(scope));

          // The SW is still able to serve `foo.hash.js` from the cache.
          expect(await makeRequest(scope, '/foo.hash.js')).toBe('console.log("FOO");');
          updatedServer.assertNoRequestFor('/foo.hash.js');

          // Remove `foo.hash.js` from the cache to emulate the browser evicting files from the cache.
          await removeAssetFromCache(scope, manifest, '/foo.hash.js');

          // Try to retrieve `foo.hash.js`, which is neither in the cache nor on the server.
          // This should put the SW in an unrecoverable state and notify clients.
          expect(await makeRequest(scope, '/foo.hash.js')).toBeNull();
          updatedServer.assertSawRequestFor('/foo.hash.js');

          // This should also enter the `SW` into degraded mode, because the broken version was the
          // latest one.
          expect(driver.state).toEqual(DriverReadyState.EXISTING_CLIENTS_ONLY);
        });

        it('is handled correctly even if some of the clients no longer exist', async () => {
          const originalFiles = new MockFileSystemBuilder()
            .addFile('/index.html', '<script src="foo.hash.js"></script>')
            .addFile('/foo.hash.js', 'console.log("FOO");')
            .build();

          const updatedFiles = new MockFileSystemBuilder()
            .addFile('/index.html', '<script src="bar.hash.js"></script>')
            .addFile('/bar.hash.js', 'console.log("BAR");')
            .build();

          const {serverState: originalServer, manifest} = generateMockServerState(originalFiles);
          const {serverState: updatedServer} = generateMockServerState(updatedFiles);

          // Create initial server state and initialize the SW.
          scope = new SwTestHarnessBuilder().withServerState(originalServer).build();
          driver = new Driver(scope, scope, new CacheDatabase(scope));

          expect(await makeRequest(scope, '/foo.hash.js', 'client-1')).toBe('console.log("FOO");');
          expect(await makeRequest(scope, '/foo.hash.js', 'client-2')).toBe('console.log("FOO");');
          await driver.initialized;

          // Update the server state to emulate deploying a new version (where `foo.hash.js` does not
          // exist any more). Keep the cache though.
          scope = new SwTestHarnessBuilder()
            .withCacheState(scope.caches.original.dehydrate())
            .withServerState(updatedServer)
            .build();
          driver = new Driver(scope, scope, new CacheDatabase(scope));

          // The SW is still able to serve `foo.hash.js` from the cache.
          expect(await makeRequest(scope, '/foo.hash.js', 'client-1')).toBe('console.log("FOO");');
          expect(await makeRequest(scope, '/foo.hash.js', 'client-2')).toBe('console.log("FOO");');

          // Remove `foo.hash.js` from the cache to emulate the browser evicting files from the cache.
          await removeAssetFromCache(scope, manifest, '/foo.hash.js');

          // Remove one of the clients to emulate closing a browser tab.
          scope.clients.remove('client-1');

          // Retrieve the remaining client to ensure it is notified.
          const mockClient2 = scope.clients.getMock('client-2')!;
          expect(mockClient2.messages).toEqual([]);

          // Try to retrieve `foo.hash.js`, which is neither in the cache nor on the server.
          // This should put the SW in an unrecoverable state and notify clients (even if some of the
          // previously known clients no longer exist).
          expect(await makeRequest(scope, '/foo.hash.js', 'client-2')).toBeNull();
          expect(mockClient2.messages).toEqual([
            jasmine.objectContaining({type: 'UNRECOVERABLE_STATE'}),
            jasmine.objectContaining({type: 'VERSION_FAILED'}),
          ]);

          // This should also enter the `SW` into degraded mode, because the broken version was the
          // latest one.
          expect(driver.state).toEqual(DriverReadyState.EXISTING_CLIENTS_ONLY);
        });
      });
    });

    describe('navigationRequestStrategy', () => {
      it("doesn't create navigate request in performance mode", async () => {
        await makeRequest(scope, '/foo.txt');
        await driver.initialized;
        await server.clearRequests();

        // Create multiple navigation requests to prove no navigation request was made.
        // By default the navigation request is not sent, it's replaced
        // with the index request - thus, the `this is foo` value.
        expect(await makeNavigationRequest(scope, '/', '')).toBe('this is foo');
        expect(await makeNavigationRequest(scope, '/foo', '')).toBe('this is foo');
        expect(await makeNavigationRequest(scope, '/foo/bar', '')).toBe('this is foo');

        server.assertNoOtherRequests();
      });

      it('sends the request to the server in freshness mode', async () => {
        const {server, scope, driver} = createSwForFreshnessStrategy();

        await makeRequest(scope, '/foo.txt');
        await driver.initialized;
        await server.clearRequests();

        // Create multiple navigation requests to prove the navigation request is constantly made.
        // When enabled, the navigation request is made each time and not replaced
        // with the index request - thus, the `null` value.
        expect(await makeNavigationRequest(scope, '/', '')).toBe(null);
        expect(await makeNavigationRequest(scope, '/foo', '')).toBe(null);
        expect(await makeNavigationRequest(scope, '/foo/bar', '')).toBe(null);

        server.assertSawRequestFor('/');
        server.assertSawRequestFor('/foo');
        server.assertSawRequestFor('/foo/bar');
        server.assertNoOtherRequests();
      });

      function createSwForFreshnessStrategy() {
        const freshnessManifest: Manifest = {...manifest, navigationRequestStrategy: 'freshness'};
        const server = serverBuilderBase.withManifest(freshnessManifest).build();
        const scope = new SwTestHarnessBuilder().withServerState(server).build();
        const driver = new Driver(scope, scope, new CacheDatabase(scope));

        return {server, scope, driver};
      }
    });

    describe('applicationMaxAge', () => {
      // When within the `applicationMaxAge`, the app should act like `performance` mode
      // When outside of it, it should act like `freshness` mode, except it also uncaches asset
      // requests
      it("doesn't create navigate requests within the maxAge", async () => {
        const {server, scope, driver} = createSwForMaxAge();

        await makeRequest(scope, '/foo.txt');
        await driver.initialized;
        await server.clearRequests();

        // Create multiple requests to prove no navigation OR asset requests were made.
        // By default the navigation request is not sent, it's replaced
        // with the index request - thus, the `this is foo` value.
        expect(await makeNavigationRequest(scope, '/', '')).toBe('this is foo');
        expect(await makeNavigationRequest(scope, '/foo', '')).toBe('this is foo');

        expect(await makeRequest(scope, '/foo.txt')).toBe('this is foo');
        expect(await makeRequest(scope, '/bar.txt')).toBe('this is bar');

        server.assertNoOtherRequests();
      });

      it('creates navigate requests outside the maxAge', async () => {
        const {server, scope, driver} = createSwForMaxAge();

        await makeRequest(scope, '/foo.txt');
        await driver.initialized;
        await server.clearRequests();

        await scope.advance(3000);

        // Create multiple requests to prove the navigation and asset requests are all made
        // When enabled, the navigation request is made each time and not replaced
        // with the index request - thus, the `null` value.
        expect(await makeNavigationRequest(scope, '/', '')).toBe(null);
        expect(await makeNavigationRequest(scope, '/foo', '')).toBe(null);

        expect(await makeRequest(scope, '/foo.txt')).toBe('this is foo');
        expect(await makeRequest(scope, '/bar.txt')).toBe('this is bar');

        server.assertSawRequestFor('/');
        server.assertSawRequestFor('/foo');
        server.assertSawRequestFor('/foo.txt');
        server.assertSawRequestFor('/bar.txt');
        server.assertNoOtherRequests();
      });

      function createSwForMaxAge() {
        const scope = new SwTestHarnessBuilder().build();
        // set the timestamp of the manifest using the server time so it's always "new" on test start
        const maxAgeManifest: Manifest = {
          ...manifest,
          timestamp: scope.time,
          applicationMaxAge: 2000,
        };
        const server = serverBuilderBase.withManifest(maxAgeManifest).build();
        const driver = new Driver(scope, scope, new CacheDatabase(scope));
        scope.updateServerState(server);

        return {server, scope, driver};
      }
    });
  });
})();

async function removeAssetFromCache(
  scope: SwTestHarness,
  appVersionManifest: Manifest,
  assetPath: string,
) {
  const assetGroupName = appVersionManifest.assetGroups?.find((group) =>
    group.urls.includes(assetPath),
  )?.name;
  const cacheName = `${sha1(JSON.stringify(appVersionManifest))}:assets:${assetGroupName}:cache`;
  const cache = await scope.caches.open(cacheName);
  return cache.delete(assetPath);
}

async function makeRequest(
  scope: SwTestHarness,
  url: string,
  clientId = 'default',
  init?: Object,
): Promise<string | null> {
  const [resPromise, done] = scope.handleFetch(new MockRequest(url, init), clientId);
  await done;
  const res = await resPromise;
  if (res !== undefined && res.ok) {
    return res.text();
  }
  return null;
}

async function makeWorkerRequest(
  scope: SwTestHarness,
  url: string,
  clientId = 'default',
  resultingClientId = 'worker',
  init?: Object,
): Promise<string | null> {
  const [resPromise, done] = scope.handleFetch(
    new MockRequest(url, {...init, destination: 'worker'}),
    clientId,
    resultingClientId,
  );
  await done;
  const res = await resPromise;
  if (res !== undefined && res.ok) {
    return res.text();
  }
  return null;
}

function makeNavigationRequest(
  scope: SwTestHarness,
  url: string,
  clientId?: string,
  init: Object = {},
): Promise<string | null> {
  return makeRequest(scope, url, clientId, {
    headers: {
      Accept: 'text/plain, text/html, text/css',
      ...(init as any).headers,
    },
    mode: 'navigate',
    ...init,
  });
}
