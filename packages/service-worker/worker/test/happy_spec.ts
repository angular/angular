/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {processNavigationUrls} from '../../config/src/generator';
import {CacheDatabase} from '../src/db-cache';
import {Driver, DriverReadyState} from '../src/driver';
import {Manifest} from '../src/manifest';
import {sha1} from '../src/sha1';
import {MockCache, clearAllCaches} from '../testing/cache';
import {MockRequest} from '../testing/fetch';
import {MockFileSystemBuilder, MockServerStateBuilder, tmpHashTableForFs} from '../testing/mock';
import {SwTestHarness, SwTestHarnessBuilder} from '../testing/scope';

import {async_beforeEach, async_fit, async_it} from './async';

const dist =
    new MockFileSystemBuilder()
        .addFile('/foo.txt', 'this is foo')
        .addFile('/bar.txt', 'this is bar')
        .addFile('/baz.txt', 'this is baz')
        .addFile('/qux.txt', 'this is qux')
        .addFile('/quux.txt', 'this is quux')
        .addFile('/quuux.txt', 'this is quuux')
        .addFile('/lazy/unchanged1.txt', 'this is unchanged (1)')
        .addFile('/lazy/unchanged2.txt', 'this is unchanged (2)')
        .addUnhashedFile('/unhashed/a.txt', 'this is unhashed', {'Cache-Control': 'max-age=10'})
        .addUnhashedFile('/unhashed/b.txt', 'this is unhashed b', {'Cache-Control': 'no-cache'})
        .build();

const distUpdate =
    new MockFileSystemBuilder()
        .addFile('/foo.txt', 'this is foo v2')
        .addFile('/bar.txt', 'this is bar')
        .addFile('/baz.txt', 'this is baz v2')
        .addFile('/qux.txt', 'this is qux v2')
        .addFile('/quux.txt', 'this is quux v2')
        .addFile('/quuux.txt', 'this is quuux v2')
        .addFile('/lazy/unchanged1.txt', 'this is unchanged (1)')
        .addFile('/lazy/unchanged2.txt', 'this is unchanged (2)')
        .addUnhashedFile('/unhashed/a.txt', 'this is unhashed v2', {'Cache-Control': 'max-age=10'})
        .addUnhashedFile('/ignored/file1', 'this is not handled by the SW')
        .addUnhashedFile('/ignored/dir/file2', 'this is not handled by the SW either')
        .build();

const brokenFs = new MockFileSystemBuilder().addFile('/foo.txt', 'this is foo').build();

const brokenManifest: Manifest = {
  configVersion: 1,
  index: '/foo.txt',
  assetGroups: [{
    name: 'assets',
    installMode: 'prefetch',
    updateMode: 'prefetch',
    urls: [
      '/foo.txt',
    ],
    patterns: [],
  }],
  dataGroups: [],
  navigationUrls: processNavigationUrls(''),
  hashTable: tmpHashTableForFs(brokenFs, {'/foo.txt': true}),
};

const manifest: Manifest = {
  configVersion: 1,
  appData: {
    version: 'original',
  },
  index: '/foo.txt',
  assetGroups: [
    {
      name: 'assets',
      installMode: 'prefetch',
      updateMode: 'prefetch',
      urls: [
        '/foo.txt',
        '/bar.txt',
        '/redirected.txt',
      ],
      patterns: [
        '/unhashed/.*',
      ],
    },
    {
      name: 'other',
      installMode: 'lazy',
      updateMode: 'lazy',
      urls: [
        '/baz.txt',
        '/qux.txt',
      ],
      patterns: [],
    },
    {
      name: 'lazy_prefetch',
      installMode: 'lazy',
      updateMode: 'prefetch',
      urls: [
        '/quux.txt',
        '/quuux.txt',
        '/lazy/unchanged1.txt',
        '/lazy/unchanged2.txt',
      ],
      patterns: [],
    }
  ],
  navigationUrls: processNavigationUrls(''),
  hashTable: tmpHashTableForFs(dist),
};

const manifestUpdate: Manifest = {
  configVersion: 1,
  appData: {
    version: 'update',
  },
  index: '/foo.txt',
  assetGroups: [
    {
      name: 'assets',
      installMode: 'prefetch',
      updateMode: 'prefetch',
      urls: [
        '/foo.txt',
        '/bar.txt',
        '/redirected.txt',
      ],
      patterns: [
        '/unhashed/.*',
      ],
    },
    {
      name: 'other',
      installMode: 'lazy',
      updateMode: 'lazy',
      urls: [
        '/baz.txt',
        '/qux.txt',
      ],
      patterns: [],
    },
    {
      name: 'lazy_prefetch',
      installMode: 'lazy',
      updateMode: 'prefetch',
      urls: [
        '/quux.txt',
        '/quuux.txt',
        '/lazy/unchanged1.txt',
        '/lazy/unchanged2.txt',
      ],
      patterns: [],
    }
  ],
  navigationUrls: processNavigationUrls(
      '',
      [
        '/**/file1',
        '/**/file2',
        '!/ignored/file1',
        '!/ignored/dir/**',
      ]),
  hashTable: tmpHashTableForFs(distUpdate),
};

const server = new MockServerStateBuilder()
                   .withStaticFiles(dist)
                   .withManifest(manifest)
                   .withRedirect('/redirected.txt', '/redirect-target.txt', 'this was a redirect')
                   .withError('/error.txt')
                   .build();

const serverUpdate =
    new MockServerStateBuilder()
        .withStaticFiles(distUpdate)
        .withManifest(manifestUpdate)
        .withRedirect('/redirected.txt', '/redirect-target.txt', 'this was a redirect')
        .build();

const brokenServer =
    new MockServerStateBuilder().withStaticFiles(brokenFs).withManifest(brokenManifest).build();

const server404 = new MockServerStateBuilder().withStaticFiles(dist).build();

const scope = new SwTestHarnessBuilder().withServerState(server).build();

const manifestHash = sha1(JSON.stringify(manifest));
const manifestUpdateHash = sha1(JSON.stringify(manifestUpdate));

(function() {
  // Skip environments that don't support the minimum APIs needed to run the SW tests.
  if (!SwTestHarness.envIsSupported()) {
    return;
  }
  describe('Driver', () => {
    let scope: SwTestHarness;
    let driver: Driver;

    beforeEach(() => {
      server.reset();
      serverUpdate.reset();
      server404.reset();
      brokenServer.reset();

      scope = new SwTestHarnessBuilder().withServerState(server).build();
      driver = new Driver(scope, scope, new CacheDatabase(scope, scope));
    });

    async_it('activates without waiting', async() => {
      const skippedWaiting = await scope.startup(true);
      expect(skippedWaiting).toBe(true);
    });

    async_it('claims all clients, after activation', async() => {
      const claimSpy = spyOn(scope.clients, 'claim');

      await scope.startup(true);
      expect(claimSpy).toHaveBeenCalledTimes(1);
    });

    async_it('cleans up old `@angular/service-worker` caches, after activation', async() => {
      const claimSpy = spyOn(scope.clients, 'claim');
      const cleanupOldSwCachesSpy = spyOn(driver, 'cleanupOldSwCaches');

      // Automatically advance time to trigger idle tasks as they are added.
      scope.autoAdvanceTime = true;
      await scope.startup(true);
      await scope.resolveSelfMessages();
      scope.autoAdvanceTime = false;

      expect(cleanupOldSwCachesSpy).toHaveBeenCalledTimes(1);
      expect(claimSpy).toHaveBeenCalledBefore(cleanupOldSwCachesSpy);
    });

    async_it(
        'does not blow up if cleaning up old `@angular/service-worker` caches fails', async() => {
          spyOn(driver, 'cleanupOldSwCaches').and.callFake(() => Promise.reject('Ooops'));

          // Automatically advance time to trigger idle tasks as they are added.
          scope.autoAdvanceTime = true;
          await scope.startup(true);
          await scope.resolveSelfMessages();
          scope.autoAdvanceTime = false;

          server.clearRequests();

          expect(driver.state).toBe(DriverReadyState.NORMAL);
          expect(await makeRequest(scope, '/foo.txt')).toBe('this is foo');
          server.assertNoOtherRequests();
        });

    async_it('initializes prefetched content correctly, after activation', async() => {
      // Automatically advance time to trigger idle tasks as they are added.
      scope.autoAdvanceTime = true;
      await scope.startup(true);
      await scope.resolveSelfMessages();
      scope.autoAdvanceTime = false;

      server.assertSawRequestFor('ngsw.json');
      server.assertSawRequestFor('/foo.txt');
      server.assertSawRequestFor('/bar.txt');
      server.assertSawRequestFor('/redirected.txt');
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      expect(await makeRequest(scope, '/bar.txt')).toEqual('this is bar');
      server.assertNoOtherRequests();
    });

    async_it('initializes prefetched content correctly, after a request kicks it off', async() => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;
      server.assertSawRequestFor('ngsw.json');
      server.assertSawRequestFor('/foo.txt');
      server.assertSawRequestFor('/bar.txt');
      server.assertSawRequestFor('/redirected.txt');
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      expect(await makeRequest(scope, '/bar.txt')).toEqual('this is bar');
      server.assertNoOtherRequests();
    });

    async_it('handles non-relative URLs', async() => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;
      server.clearRequests();
      expect(await makeRequest(scope, 'http://localhost/foo.txt')).toEqual('this is foo');
      server.assertNoOtherRequests();
    });

    async_it('handles actual errors from the browser', async() => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;
      server.clearRequests();

      const [resPromise, done] = scope.handleFetch(new MockRequest('/error.txt'), 'default');
      await done;
      const res = (await resPromise) !;
      expect(res.status).toEqual(504);
      expect(res.statusText).toEqual('Gateway Timeout');
    });

    async_it('handles redirected responses', async() => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;
      server.clearRequests();
      expect(await makeRequest(scope, '/redirected.txt')).toEqual('this was a redirect');
      server.assertNoOtherRequests();
    });

    async_it('caches lazy content on-request', async() => {
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

    async_it('updates to new content when requested', async() => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;

      const client = scope.clients.getMock('default') !;
      expect(client.messages).toEqual([]);

      scope.updateServerState(serverUpdate);
      expect(await driver.checkForUpdate()).toEqual(true);
      serverUpdate.assertSawRequestFor('ngsw.json');
      serverUpdate.assertSawRequestFor('/foo.txt');
      serverUpdate.assertSawRequestFor('/redirected.txt');
      serverUpdate.assertNoOtherRequests();

      expect(client.messages).toEqual([{
        type: 'UPDATE_AVAILABLE',
        current: {hash: manifestHash, appData: {version: 'original'}},
        available: {hash: manifestUpdateHash, appData: {version: 'update'}},
      }]);

      // Default client is still on the old version of the app.
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');

      // Sending a new client id should result in the updated version being returned.
      expect(await makeRequest(scope, '/foo.txt', 'new')).toEqual('this is foo v2');

      // Of course, the old version should still work.
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');

      expect(await makeRequest(scope, '/bar.txt')).toEqual('this is bar');
      serverUpdate.assertNoOtherRequests();
    });

    async_it('updates a specific client to new content on request', async() => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;

      const client = scope.clients.getMock('default') !;
      expect(client.messages).toEqual([]);

      scope.updateServerState(serverUpdate);
      expect(await driver.checkForUpdate()).toEqual(true);
      serverUpdate.clearRequests();
      await driver.updateClient(client as any as Client);

      expect(client.messages).toEqual([
        {
          type: 'UPDATE_AVAILABLE',
          current: {hash: manifestHash, appData: {version: 'original'}},
          available: {hash: manifestUpdateHash, appData: {version: 'update'}},
        },
        {
          type: 'UPDATE_ACTIVATED',
          previous: {hash: manifestHash, appData: {version: 'original'}},
          current: {hash: manifestUpdateHash, appData: {version: 'update'}},
        }
      ]);

      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo v2');
    });

    async_it('handles empty client ID', async() => {
      const navRequest = (url: string, clientId: string | null) =>
          makeRequest(scope, url, clientId, {
            headers: {Accept: 'text/plain, text/html, text/css'},
            mode: 'navigate',
          });

      // Initialize the SW.
      expect(await navRequest('/foo/file1', '')).toEqual('this is foo');
      expect(await navRequest('/bar/file2', null)).toEqual('this is foo');
      await driver.initialized;

      // Update to a new version.
      scope.updateServerState(serverUpdate);
      expect(await driver.checkForUpdate()).toEqual(true);

      // Correctly handle navigation requests, even if `clientId` is null/empty.
      expect(await navRequest('/foo/file1', '')).toEqual('this is foo v2');
      expect(await navRequest('/bar/file2', null)).toEqual('this is foo v2');
    });

    async_it('checks for updates on restart', async() => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;

      scope = new SwTestHarnessBuilder()
                  .withCacheState(scope.caches.dehydrate())
                  .withServerState(serverUpdate)
                  .build();
      driver = new Driver(scope, scope, new CacheDatabase(scope, scope));
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;
      serverUpdate.assertNoOtherRequests();

      scope.advance(12000);
      await driver.idle.empty;

      serverUpdate.assertSawRequestFor('ngsw.json');
      serverUpdate.assertSawRequestFor('/foo.txt');
      serverUpdate.assertSawRequestFor('/redirected.txt');
      serverUpdate.assertNoOtherRequests();
    });

    async_it('checks for updates on navigation', async() => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;
      server.clearRequests();

      expect(await makeRequest(scope, '/foo.txt', 'default', {
        mode: 'navigate',
      })).toEqual('this is foo');

      scope.advance(12000);
      await driver.idle.empty;

      server.assertSawRequestFor('ngsw.json');
    });

    async_it('does not make concurrent checks for updates on navigation', async() => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;
      server.clearRequests();

      expect(await makeRequest(scope, '/foo.txt', 'default', {
        mode: 'navigate',
      })).toEqual('this is foo');

      expect(await makeRequest(scope, '/foo.txt', 'default', {
        mode: 'navigate',
      })).toEqual('this is foo');

      scope.advance(12000);
      await driver.idle.empty;

      server.assertSawRequestFor('ngsw.json');
      server.assertNoOtherRequests();
    });

    async_it('preserves multiple client assignments across restarts', async() => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;

      scope.updateServerState(serverUpdate);
      expect(await driver.checkForUpdate()).toEqual(true);
      expect(await makeRequest(scope, '/foo.txt', 'new')).toEqual('this is foo v2');
      serverUpdate.clearRequests();

      scope = new SwTestHarnessBuilder()
                  .withCacheState(scope.caches.dehydrate())
                  .withServerState(serverUpdate)
                  .build();
      driver = new Driver(scope, scope, new CacheDatabase(scope, scope));

      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      expect(await makeRequest(scope, '/foo.txt', 'new')).toEqual('this is foo v2');
      serverUpdate.assertNoOtherRequests();
    });

    async_it('updates when refreshed', async() => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;

      const client = scope.clients.getMock('default') !;

      scope.updateServerState(serverUpdate);
      expect(await driver.checkForUpdate()).toEqual(true);
      serverUpdate.clearRequests();

      expect(await makeRequest(scope, '/file1', 'default', {
        headers: {
          'Accept': 'text/plain, text/html, text/css',
        },
        mode: 'navigate',
      })).toEqual('this is foo v2');

      expect(client.messages).toEqual([
        {
          type: 'UPDATE_AVAILABLE',
          current: {hash: manifestHash, appData: {version: 'original'}},
          available: {hash: manifestUpdateHash, appData: {version: 'update'}},
        },
        {
          type: 'UPDATE_ACTIVATED',
          previous: {hash: manifestHash, appData: {version: 'original'}},
          current: {hash: manifestUpdateHash, appData: {version: 'update'}},
        }
      ]);
      serverUpdate.assertNoOtherRequests();
    });

    async_it('cleans up properly when manually requested', async() => {
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

    async_it('cleans up properly on restart', async() => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;

      scope = new SwTestHarnessBuilder()
                  .withCacheState(scope.caches.dehydrate())
                  .withServerState(serverUpdate)
                  .build();
      driver = new Driver(scope, scope, new CacheDatabase(scope, scope));
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;
      serverUpdate.assertNoOtherRequests();

      let keys = await scope.caches.keys();
      let hasOriginalCaches = keys.some(name => name.startsWith(`ngsw:${manifestHash}:`));
      expect(hasOriginalCaches).toEqual(true);

      scope.clients.remove('default');

      scope.advance(12000);
      await driver.idle.empty;
      serverUpdate.clearRequests();

      driver = new Driver(scope, scope, new CacheDatabase(scope, scope));
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo v2');

      keys = await scope.caches.keys();
      hasOriginalCaches = keys.some(name => name.startsWith(`ngsw:${manifestHash}:`));
      expect(hasOriginalCaches).toEqual(false);
    });

    async_it('shows notifications for push notifications', async() => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;
      await scope.handlePush({
        notification: {
          title: 'This is a test',
          body: 'Test body',
        }
      });
      expect(scope.notifications).toEqual([{
        title: 'This is a test',
        options: {title: 'This is a test', body: 'Test body'},
      }]);
      expect(scope.clients.getMock('default') !.messages).toEqual([{
        type: 'PUSH',
        data: {
          notification: {
            title: 'This is a test',
            body: 'Test body',
          },
        },
      }]);
    });

    async_it('broadcasts notification click events with action', async() => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;
      await scope.handleClick(
          {title: 'This is a test with action', body: 'Test body with action'}, 'button');
      const message: any = scope.clients.getMock('default') !.messages[0];

      expect(message.type).toEqual('NOTIFICATION_CLICK');
      expect(message.data.action).toEqual('button');
      expect(message.data.notification.title).toEqual('This is a test with action');
      expect(message.data.notification.body).toEqual('Test body with action');
    });

    async_it('broadcasts notification click events without action', async() => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;
      await scope.handleClick(
          {title: 'This is a test without action', body: 'Test body without action'});
      const message: any = scope.clients.getMock('default') !.messages[0];

      expect(message.type).toEqual('NOTIFICATION_CLICK');
      expect(message.data.action).toBeUndefined();
      expect(message.data.notification.title).toEqual('This is a test without action');
      expect(message.data.notification.body).toEqual('Test body without action');
    });

    async_it('prefetches updates to lazy cache when set', async() => {
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

    async_it('unregisters when manifest 404s', async() => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;

      scope.updateServerState(server404);
      expect(await driver.checkForUpdate()).toEqual(false);
      expect(scope.unregistered).toEqual(true);
      expect(await scope.caches.keys()).toEqual([]);
    });

    async_it('does not unregister or change state when offline (i.e. manifest 504s)', async() => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;
      server.online = false;

      expect(await driver.checkForUpdate()).toEqual(false);
      expect(driver.state).toEqual(DriverReadyState.NORMAL);
      expect(scope.unregistered).toBeFalsy();
      expect(await scope.caches.keys()).not.toEqual([]);
    });

    describe('unhashed requests', () => {
      async_beforeEach(async() => {
        expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
        await driver.initialized;
        server.clearRequests();
      });

      async_it('are cached appropriately', async() => {
        expect(await makeRequest(scope, '/unhashed/a.txt')).toEqual('this is unhashed');
        server.assertSawRequestFor('/unhashed/a.txt');
        expect(await makeRequest(scope, '/unhashed/a.txt')).toEqual('this is unhashed');
        server.assertNoOtherRequests();
      });

      async_it(`doesn't error when 'Cache-Control' is 'no-cache'`, async() => {
        expect(await makeRequest(scope, '/unhashed/b.txt')).toEqual('this is unhashed b');
        server.assertSawRequestFor('/unhashed/b.txt');
        expect(await makeRequest(scope, '/unhashed/b.txt')).toEqual('this is unhashed b');
        server.assertNoOtherRequests();
      });

      async_it('avoid opaque responses', async() => {
        expect(await makeRequest(scope, '/unhashed/a.txt', 'default', {
          credentials: 'include'
        })).toEqual('this is unhashed');
        server.assertSawRequestFor('/unhashed/a.txt');
        expect(await makeRequest(scope, '/unhashed/a.txt')).toEqual('this is unhashed');
        server.assertNoOtherRequests();
      });

      async_it('expire according to Cache-Control headers', async() => {
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
        serverUpdate.assertSawRequestFor('/unhashed/a.txt');

        // Now the new version of the resource should be served.
        expect(await makeRequest(scope, '/unhashed/a.txt')).toEqual('this is unhashed v2');
        server.assertNoOtherRequests();
      });

      async_it('survive serialization', async() => {
        expect(await makeRequest(scope, '/unhashed/a.txt')).toEqual('this is unhashed');
        server.clearRequests();

        const state = scope.caches.dehydrate();
        scope = new SwTestHarnessBuilder().withCacheState(state).withServerState(server).build();
        driver = new Driver(scope, scope, new CacheDatabase(scope, scope));
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

      async_it('get carried over during updates', async() => {
        expect(await makeRequest(scope, '/unhashed/a.txt')).toEqual('this is unhashed');
        server.clearRequests();

        scope = new SwTestHarnessBuilder()
                    .withCacheState(scope.caches.dehydrate())
                    .withServerState(serverUpdate)
                    .build();
        driver = new Driver(scope, scope, new CacheDatabase(scope, scope));
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
      const navRequest = (url: string, init = {}) => makeRequest(scope, url, undefined, {
        headers: {Accept: 'text/plain, text/html, text/css'},
        mode: 'navigate', ...init,
      });

      async_beforeEach(async() => {
        expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
        await driver.initialized;
        server.clearRequests();
      });

      async_it('redirects to index on a route-like request', async() => {
        expect(await navRequest('/baz')).toEqual('this is foo');
        server.assertNoOtherRequests();
      });

      async_it('redirects to index on a request to the origin URL request', async() => {
        expect(await navRequest('http://localhost/')).toEqual('this is foo');
        server.assertNoOtherRequests();
      });

      async_it('does not redirect to index on a non-navigation request', async() => {
        expect(await navRequest('/baz', {mode: undefined})).toBeNull();
        server.assertSawRequestFor('/baz');
      });

      async_it('does not redirect to index on a request that does not accept HTML', async() => {
        expect(await navRequest('/baz', {headers: {}})).toBeNull();
        server.assertSawRequestFor('/baz');

        expect(await navRequest('/qux', {headers: {'Accept': 'text/plain'}})).toBeNull();
        server.assertSawRequestFor('/qux');
      });

      async_it('does not redirect to index on a request with an extension', async() => {
        expect(await navRequest('/baz.html')).toBeNull();
        server.assertSawRequestFor('/baz.html');

        // Only considers the last path segment when checking for a file extension.
        expect(await navRequest('/baz.html/qux')).toBe('this is foo');
        server.assertNoOtherRequests();
      });

      async_it('does not redirect to index if the URL contains `__`', async() => {
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
        async_beforeEach(async() => {
          scope.updateServerState(serverUpdate);
          await driver.checkForUpdate();
          serverUpdate.clearRequests();
        });

        async_it('redirects to index on a request that matches any positive pattern', async() => {
          expect(await navRequest('/foo/file0')).toBeNull();
          serverUpdate.assertSawRequestFor('/foo/file0');

          expect(await navRequest('/foo/file1')).toBe('this is foo v2');
          serverUpdate.assertNoOtherRequests();

          expect(await navRequest('/bar/file2')).toBe('this is foo v2');
          serverUpdate.assertNoOtherRequests();
        });

        async_it(
            'does not redirect to index on a request that matches any negative pattern',
            async() => {
              expect(await navRequest('/ignored/file1')).toBe('this is not handled by the SW');
              serverUpdate.assertSawRequestFor('/ignored/file1');

              expect(await navRequest('/ignored/dir/file2'))
                  .toBe('this is not handled by the SW either');
              serverUpdate.assertSawRequestFor('/ignored/dir/file2');

              expect(await navRequest('/ignored/directory/file2')).toBe('this is foo v2');
              serverUpdate.assertNoOtherRequests();
            });

        async_it('strips URL query before checking `navigationUrls`', async() => {
          expect(await navRequest('/foo/file1?query=/a/b')).toBe('this is foo v2');
          serverUpdate.assertNoOtherRequests();

          expect(await navRequest('/ignored/file1?query=/a/b'))
              .toBe('this is not handled by the SW');
          serverUpdate.assertSawRequestFor('/ignored/file1');

          expect(await navRequest('/ignored/dir/file2?query=/a/b'))
              .toBe('this is not handled by the SW either');
          serverUpdate.assertSawRequestFor('/ignored/dir/file2');
        });

        async_it('strips registration scope before checking `navigationUrls`', async() => {
          expect(await navRequest('http://localhost/ignored/file1'))
              .toBe('this is not handled by the SW');
          serverUpdate.assertSawRequestFor('/ignored/file1');
        });
      });
    });

    describe('cleanupOldSwCaches()', () => {
      async_it('should delete the correct caches', async() => {
        const oldSwCacheNames = ['ngsw:active', 'ngsw:staged', 'ngsw:manifest:a1b2c3:super:duper'];
        const otherCacheNames = [
          'ngsuu:active',
          'not:ngsw:active',
          'ngsw:staged:not',
          'NgSw:StAgEd',
          'ngsw:manifest',
        ];
        const allCacheNames = oldSwCacheNames.concat(otherCacheNames);

        await Promise.all(allCacheNames.map(name => scope.caches.open(name)));
        expect(await scope.caches.keys()).toEqual(allCacheNames);

        await driver.cleanupOldSwCaches();
        expect(await scope.caches.keys()).toEqual(otherCacheNames);
      });

      async_it('should delete other caches even if deleting one of them fails', async() => {
        const oldSwCacheNames = ['ngsw:active', 'ngsw:staged', 'ngsw:manifest:a1b2c3:super:duper'];
        const deleteSpy = spyOn(scope.caches, 'delete')
                              .and.callFake(
                                  (cacheName: string) =>
                                      Promise.reject(`Failed to delete cache '${cacheName}'.`));

        await Promise.all(oldSwCacheNames.map(name => scope.caches.open(name)));
        const error = await driver.cleanupOldSwCaches().catch(err => err);

        expect(error).toBe('Failed to delete cache \'ngsw:active\'.');
        expect(deleteSpy).toHaveBeenCalledTimes(3);
        oldSwCacheNames.forEach(name => expect(deleteSpy).toHaveBeenCalledWith(name));
      });
    });

    describe('bugs', () => {
      async_it('does not crash with bad index hash', async() => {
        scope = new SwTestHarnessBuilder().withServerState(brokenServer).build();
        (scope.registration as any).scope = 'http://site.com';
        driver = new Driver(scope, scope, new CacheDatabase(scope, scope));

        expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      });

      async_it('enters degraded mode when update has a bad index', async() => {
        expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
        await driver.initialized;
        server.clearRequests();

        scope = new SwTestHarnessBuilder()
                    .withCacheState(scope.caches.dehydrate())
                    .withServerState(brokenServer)
                    .build();
        driver = new Driver(scope, scope, new CacheDatabase(scope, scope));
        await driver.checkForUpdate();

        scope.advance(12000);
        await driver.idle.empty;

        expect(driver.state).toEqual(DriverReadyState.EXISTING_CLIENTS_ONLY);
      });

      async_it('enters degraded mode when failing to write to cache', async() => {
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
        spyOn(MockCache.prototype, 'put').and.throwError('Can\'t touch this');

        // Enter degraded mode and serve from network.
        expect(await makeRequest(scope, '/foo.txt')).toBe('this is foo');
        expect(driver.state).toBe(DriverReadyState.EXISTING_CLIENTS_ONLY);
        server.assertSawRequestFor('/foo.txt');
      });

      async_it('ignores invalid `only-if-cached` requests ', async() => {
        const requestFoo = (cache: RequestCache | 'only-if-cached', mode: RequestMode) =>
            makeRequest(scope, '/foo.txt', undefined, {cache, mode});

        expect(await requestFoo('default', 'no-cors')).toBe('this is foo');
        expect(await requestFoo('only-if-cached', 'same-origin')).toBe('this is foo');
        expect(await requestFoo('only-if-cached', 'no-cors')).toBeNull();
      });
    });
  });
})();

async function makeRequest(
    scope: SwTestHarness, url: string, clientId: string | null = 'default',
    init?: Object): Promise<string|null> {
  const [resPromise, done] = scope.handleFetch(new MockRequest(url, init), clientId);
  await done;
  const res = await resPromise;
  if (res !== undefined && res.ok) {
    return res.text();
  }
  return null;
}
