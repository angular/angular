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
import {AssetGroupConfig, DataGroupConfig, Manifest} from '../src/manifest';
import {sha1} from '../src/sha1';
import {MockCache, clearAllCaches} from '../testing/cache';
import {MockRequest} from '../testing/fetch';
import {MockFileSystemBuilder, MockServerStateBuilder, tmpHashTableForFs} from '../testing/mock';
import {SwTestHarness, SwTestHarnessBuilder} from '../testing/scope';

(function() {
  // Skip environments that don't support the minimum APIs needed to run the SW tests.
  if (!SwTestHarness.envIsSupported()) {
    return;
  }

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
          .addUnhashedFile(
              '/unhashed/a.txt', 'this is unhashed v2', {'Cache-Control': 'max-age=10'})
          .addUnhashedFile('/ignored/file1', 'this is not handled by the SW')
          .addUnhashedFile('/ignored/dir/file2', 'this is not handled by the SW either')
          .build();

  const brokenFs = new MockFileSystemBuilder().addFile('/foo.txt', 'this is foo').build();

  const brokenManifest: Manifest = {
    configVersion: 1,
    timestamp: 1234567890123,
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

  // Manifest without navigation urls to test backward compatibility with
  // versions < 6.0.0.
  interface ManifestV5 {
    configVersion: number;
    appData?: {[key: string]: string};
    index: string;
    assetGroups?: AssetGroupConfig[];
    dataGroups?: DataGroupConfig[];
    hashTable: {[url: string]: string};
  }

  // To simulate versions < 6.0.0
  const manifestOld: ManifestV5 = {
    configVersion: 1,
    index: '/foo.txt',
    hashTable: tmpHashTableForFs(dist),
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
    dataGroups: [
      {
        name: 'api',
        version: 42,
        maxAge: 3600000,
        maxSize: 100,
        strategy: 'performance',
        patterns: [
          '/api/.*',
        ],
      },
    ],
    navigationUrls: processNavigationUrls(''),
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

  const serverBuilderBase =
      new MockServerStateBuilder()
          .withStaticFiles(dist)
          .withRedirect('/redirected.txt', '/redirect-target.txt', 'this was a redirect')
          .withError('/error.txt');

  const server = serverBuilderBase.withManifest(manifest).build();

  const serverRollback =
      serverBuilderBase.withManifest({...manifest, timestamp: manifest.timestamp + 1}).build();

  const serverUpdate =
      new MockServerStateBuilder()
          .withStaticFiles(distUpdate)
          .withManifest(manifestUpdate)
          .withRedirect('/redirected.txt', '/redirect-target.txt', 'this was a redirect')
          .build();

  const brokenServer =
      new MockServerStateBuilder().withStaticFiles(brokenFs).withManifest(brokenManifest).build();

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
      driver = new Driver(scope, scope, new CacheDatabase(scope, scope));
    });

    it('activates without waiting', async() => {
      const skippedWaiting = await scope.startup(true);
      expect(skippedWaiting).toBe(true);
    });

    it('claims all clients, after activation', async() => {
      const claimSpy = spyOn(scope.clients, 'claim');

      await scope.startup(true);
      expect(claimSpy).toHaveBeenCalledTimes(1);
    });

    it('cleans up old `@angular/service-worker` caches, after activation', async() => {
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

    it('does not blow up if cleaning up old `@angular/service-worker` caches fails', async() => {
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

    it('initializes prefetched content correctly, after activation', async() => {
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

    it('initializes prefetched content correctly, after a request kicks it off', async() => {
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

    it('handles non-relative URLs', async() => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;
      server.clearRequests();
      expect(await makeRequest(scope, 'http://localhost/foo.txt')).toEqual('this is foo');
      server.assertNoOtherRequests();
    });

    it('handles actual errors from the browser', async() => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;
      server.clearRequests();

      const [resPromise, done] = scope.handleFetch(new MockRequest('/error.txt'), 'default');
      await done;
      const res = (await resPromise) !;
      expect(res.status).toEqual(504);
      expect(res.statusText).toEqual('Gateway Timeout');
    });

    it('handles redirected responses', async() => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;
      server.clearRequests();
      expect(await makeRequest(scope, '/redirected.txt')).toEqual('this was a redirect');
      server.assertNoOtherRequests();
    });

    it('caches lazy content on-request', async() => {
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

    it('updates to new content when requested', async() => {
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

    it('detects new version even if only `manifest.timestamp` is different', async() => {
      expect(await makeRequest(scope, '/foo.txt', 'newClient')).toEqual('this is foo');
      await driver.initialized;

      scope.updateServerState(serverUpdate);
      expect(await driver.checkForUpdate()).toEqual(true);
      expect(await makeRequest(scope, '/foo.txt', 'newerClient')).toEqual('this is foo v2');

      scope.updateServerState(serverRollback);
      expect(await driver.checkForUpdate()).toEqual(true);
      expect(await makeRequest(scope, '/foo.txt', 'newestClient')).toEqual('this is foo');
    });

    it('updates a specific client to new content on request', async() => {
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

    it('handles empty client ID', async() => {
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

    it('checks for updates on restart', async() => {
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

    it('checks for updates on navigation', async() => {
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

    it('does not make concurrent checks for updates on navigation', async() => {
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

    it('preserves multiple client assignments across restarts', async() => {
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

    it('updates when refreshed', async() => {
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

    it('cleans up properly when manually requested', async() => {
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

    it('cleans up properly on restart', async() => {
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
      let hasOriginalCaches = keys.some(name => name.startsWith(`ngsw:/:${manifestHash}:`));
      expect(hasOriginalCaches).toEqual(true);

      scope.clients.remove('default');

      scope.advance(12000);
      await driver.idle.empty;
      serverUpdate.clearRequests();

      driver = new Driver(scope, scope, new CacheDatabase(scope, scope));
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo v2');

      keys = await scope.caches.keys();
      hasOriginalCaches = keys.some(name => name.startsWith(`ngsw:/:${manifestHash}:`));
      expect(hasOriginalCaches).toEqual(false);
    });

    it('shows notifications for push notifications', async() => {
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

    it('broadcasts notification click events with action', async() => {
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

    it('broadcasts notification click events without action', async() => {
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

    it('prefetches updates to lazy cache when set', async() => {
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

    it('should bypass serviceworker on ngsw-bypass parameter', async() => {
      await makeRequest(scope, '/foo.txt', undefined, {headers: {'ngsw-bypass': 'true'}});
      server.assertNoRequestFor('/foo.txt');

      await makeRequest(scope, '/foo.txt', undefined, {headers: {'ngsw-bypass': 'anything'}});
      server.assertNoRequestFor('/foo.txt');

      await makeRequest(scope, '/foo.txt', undefined, {headers: {'ngsw-bypass': null}});
      server.assertNoRequestFor('/foo.txt');

      await makeRequest(scope, '/foo.txt', undefined, {headers: {'NGSW-bypass': 'upperCASE'}});
      server.assertNoRequestFor('/foo.txt');

      await makeRequest(scope, '/foo.txt', undefined, {headers: {'ngsw-bypasss': 'anything'}});
      server.assertSawRequestFor('/foo.txt');

      server.clearRequests();

      await makeRequest(scope, '/bar.txt?ngsw-bypass=true');
      server.assertNoRequestFor('/bar.txt');

      await makeRequest(scope, '/bar.txt?ngsw-bypasss=true');
      server.assertSawRequestFor('/bar.txt');

      server.clearRequests();

      await makeRequest(scope, '/bar.txt?ngsw-bypaSS=something');
      server.assertNoRequestFor('/bar.txt');

      await makeRequest(scope, '/bar.txt?testparam=test&ngsw-byPASS=anything');
      server.assertNoRequestFor('/bar.txt');

      await makeRequest(scope, '/bar.txt?testparam=test&angsw-byPASS=anything');
      server.assertSawRequestFor('/bar.txt');

      server.clearRequests();

      await makeRequest(scope, '/bar&ngsw-bypass=true.txt?testparam=test&angsw-byPASS=anything');
      server.assertSawRequestFor('/bar&ngsw-bypass=true.txt');

      server.clearRequests();

      await makeRequest(scope, '/bar&ngsw-bypass=true.txt');
      server.assertSawRequestFor('/bar&ngsw-bypass=true.txt');

      server.clearRequests();

      await makeRequest(
          scope, '/bar&ngsw-bypass=true.txt?testparam=test&ngSW-BYPASS=SOMETHING&testparam2=test');
      server.assertNoRequestFor('/bar&ngsw-bypass=true.txt');

      await makeRequest(scope, '/bar?testparam=test&ngsw-bypass');
      server.assertNoRequestFor('/bar');

      await makeRequest(scope, '/bar?testparam=test&ngsw-bypass&testparam2');
      server.assertNoRequestFor('/bar');

      await makeRequest(scope, '/bar?ngsw-bypass&testparam2');
      server.assertNoRequestFor('/bar');

      await makeRequest(scope, '/bar?ngsw-bypass=&foo=ngsw-bypass');
      server.assertNoRequestFor('/bar');

      await makeRequest(scope, '/bar?ngsw-byapass&testparam2');
      server.assertSawRequestFor('/bar');

    });

    it('unregisters when manifest 404s', async() => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;

      scope.updateServerState(server404);
      expect(await driver.checkForUpdate()).toEqual(false);
      expect(scope.unregistered).toEqual(true);
      expect(await scope.caches.keys()).toEqual([]);
    });

    it('does not unregister or change state when offline (i.e. manifest 504s)', async() => {
      expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      await driver.initialized;
      server.online = false;

      expect(await driver.checkForUpdate()).toEqual(false);
      expect(driver.state).toEqual(DriverReadyState.NORMAL);
      expect(scope.unregistered).toBeFalsy();
      expect(await scope.caches.keys()).not.toEqual([]);
    });

    describe('cache naming', () => {
      // Helpers
      const cacheKeysFor = (baseHref: string) =>
          [`ngsw:${baseHref}:db:control`, `ngsw:${baseHref}:${manifestHash}:assets:assets:cache`,
           `ngsw:${baseHref}:db:ngsw:${baseHref}:${manifestHash}:assets:assets:meta`,
           `ngsw:${baseHref}:${manifestHash}:assets:other:cache`,
           `ngsw:${baseHref}:db:ngsw:${baseHref}:${manifestHash}:assets:other:meta`,
           `ngsw:${baseHref}:${manifestHash}:assets:lazy_prefetch:cache`,
           `ngsw:${baseHref}:db:ngsw:${baseHref}:${manifestHash}:assets:lazy_prefetch:meta`,
           `ngsw:${baseHref}:42:data:dynamic:api:cache`,
           `ngsw:${baseHref}:db:ngsw:${baseHref}:42:data:dynamic:api:lru`,
           `ngsw:${baseHref}:db:ngsw:${baseHref}:42:data:dynamic:api:age`,
      ];

      const getClientAssignments = async(sw: SwTestHarness, baseHref: string) => {
        const cache = await sw.caches.open(`ngsw:${baseHref}:db:control`) as unknown as MockCache;
        const dehydrated = cache.dehydrate();
        return JSON.parse(dehydrated['/assignments'].body !);
      };

      const initializeSwFor =
          async(baseHref: string, initialCacheState = '{}', serverState = server) => {
        const newScope = new SwTestHarnessBuilder(`http://localhost${baseHref}`)
                             .withCacheState(initialCacheState)
                             .withServerState(serverState)
                             .build();
        const newDriver = new Driver(newScope, newScope, new CacheDatabase(newScope, newScope));

        await makeRequest(newScope, '/foo.txt', baseHref.replace(/\//g, '_'));
        await newDriver.initialized;

        return newScope;
      };

      it('includes the SW scope in all cache names', async() => {
        // Default SW with scope `/`.
        await makeRequest(scope, '/foo.txt');
        await driver.initialized;
        const cacheNames = await scope.caches.keys();

        expect(cacheNames).toEqual(cacheKeysFor('/'));
        expect(cacheNames.every(name => name.includes('/'))).toBe(true);

        // SW with scope `/foo/`.
        const fooScope = await initializeSwFor('/foo/');
        const fooCacheNames = await fooScope.caches.keys();

        expect(fooCacheNames).toEqual(cacheKeysFor('/foo/'));
        expect(fooCacheNames.every(name => name.includes('/foo/'))).toBe(true);
      });

      it('does not affect caches from other scopes', async() => {
        // Create SW with scope `/foo/`.
        const fooScope = await initializeSwFor('/foo/');
        const fooAssignments = await getClientAssignments(fooScope, '/foo/');

        expect(fooAssignments).toEqual({_foo_: manifestHash});

        // Add new SW with different scope.
        const barScope = await initializeSwFor('/bar/', await fooScope.caches.dehydrate());
        const barCacheNames = await barScope.caches.keys();
        const barAssignments = await getClientAssignments(barScope, '/bar/');

        expect(barAssignments).toEqual({_bar_: manifestHash});
        expect(barCacheNames).toEqual([
          ...cacheKeysFor('/foo/'),
          ...cacheKeysFor('/bar/'),
        ]);

        // The caches for `/foo/` should be intact.
        const fooAssignments2 = await getClientAssignments(barScope, '/foo/');
        expect(fooAssignments2).toEqual({_foo_: manifestHash});
      });

      it('updates existing caches for same scope', async() => {
        // Create SW with scope `/foo/`.
        const fooScope = await initializeSwFor('/foo/');
        await makeRequest(fooScope, '/foo.txt', '_bar_');
        const fooAssignments = await getClientAssignments(fooScope, '/foo/');

        expect(fooAssignments).toEqual({
          _foo_: manifestHash,
          _bar_: manifestHash,
        });

        expect(await makeRequest(fooScope, '/baz.txt', '_foo_')).toBe('this is baz');
        expect(await makeRequest(fooScope, '/baz.txt', '_bar_')).toBe('this is baz');

        // Add new SW with same scope.
        const fooScope2 =
            await initializeSwFor('/foo/', await fooScope.caches.dehydrate(), serverUpdate);
        await fooScope2.handleMessage({action: 'CHECK_FOR_UPDATES'}, '_foo_');
        await fooScope2.handleMessage({action: 'ACTIVATE_UPDATE'}, '_foo_');
        const fooAssignments2 = await getClientAssignments(fooScope2, '/foo/');

        expect(fooAssignments2).toEqual({
          _foo_: manifestUpdateHash,
          _bar_: manifestHash,
        });

        // Everything should still work as expected.
        expect(await makeRequest(fooScope2, '/foo.txt', '_foo_')).toBe('this is foo v2');
        expect(await makeRequest(fooScope2, '/foo.txt', '_bar_')).toBe('this is foo');

        expect(await makeRequest(fooScope2, '/baz.txt', '_foo_')).toBe('this is baz v2');
        expect(await makeRequest(fooScope2, '/baz.txt', '_bar_')).toBe('this is baz');
      });
    });

    describe('unhashed requests', () => {
      beforeEach(async() => {
        expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
        await driver.initialized;
        server.clearRequests();
      });

      it('are cached appropriately', async() => {
        expect(await makeRequest(scope, '/unhashed/a.txt')).toEqual('this is unhashed');
        server.assertSawRequestFor('/unhashed/a.txt');
        expect(await makeRequest(scope, '/unhashed/a.txt')).toEqual('this is unhashed');
        server.assertNoOtherRequests();
      });

      it(`doesn't error when 'Cache-Control' is 'no-cache'`, async() => {
        expect(await makeRequest(scope, '/unhashed/b.txt')).toEqual('this is unhashed b');
        server.assertSawRequestFor('/unhashed/b.txt');
        expect(await makeRequest(scope, '/unhashed/b.txt')).toEqual('this is unhashed b');
        server.assertNoOtherRequests();
      });

      it('avoid opaque responses', async() => {
        expect(await makeRequest(scope, '/unhashed/a.txt', 'default', {
          credentials: 'include'
        })).toEqual('this is unhashed');
        server.assertSawRequestFor('/unhashed/a.txt');
        expect(await makeRequest(scope, '/unhashed/a.txt')).toEqual('this is unhashed');
        server.assertNoOtherRequests();
      });

      it('expire according to Cache-Control headers', async() => {
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

      it('survive serialization', async() => {
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

      it('get carried over during updates', async() => {
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

      beforeEach(async() => {
        expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
        await driver.initialized;
        server.clearRequests();
      });

      it('redirects to index on a route-like request', async() => {
        expect(await navRequest('/baz')).toEqual('this is foo');
        server.assertNoOtherRequests();
      });

      it('redirects to index on a request to the origin URL request', async() => {
        expect(await navRequest('http://localhost/')).toEqual('this is foo');
        server.assertNoOtherRequests();
      });

      it('does not redirect to index on a non-navigation request', async() => {
        expect(await navRequest('/baz', {mode: undefined})).toBeNull();
        server.assertSawRequestFor('/baz');
      });

      it('does not redirect to index on a request that does not accept HTML', async() => {
        expect(await navRequest('/baz', {headers: {}})).toBeNull();
        server.assertSawRequestFor('/baz');

        expect(await navRequest('/qux', {headers: {'Accept': 'text/plain'}})).toBeNull();
        server.assertSawRequestFor('/qux');
      });

      it('does not redirect to index on a request with an extension', async() => {
        expect(await navRequest('/baz.html')).toBeNull();
        server.assertSawRequestFor('/baz.html');

        // Only considers the last path segment when checking for a file extension.
        expect(await navRequest('/baz.html/qux')).toBe('this is foo');
        server.assertNoOtherRequests();
      });

      it('does not redirect to index if the URL contains `__`', async() => {
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
        beforeEach(async() => {
          scope.updateServerState(serverUpdate);
          await driver.checkForUpdate();
          serverUpdate.clearRequests();
        });

        it('redirects to index on a request that matches any positive pattern', async() => {
          expect(await navRequest('/foo/file0')).toBeNull();
          serverUpdate.assertSawRequestFor('/foo/file0');

          expect(await navRequest('/foo/file1')).toBe('this is foo v2');
          serverUpdate.assertNoOtherRequests();

          expect(await navRequest('/bar/file2')).toBe('this is foo v2');
          serverUpdate.assertNoOtherRequests();
        });

        it('does not redirect to index on a request that matches any negative pattern', async() => {
          expect(await navRequest('/ignored/file1')).toBe('this is not handled by the SW');
          serverUpdate.assertSawRequestFor('/ignored/file1');

          expect(await navRequest('/ignored/dir/file2'))
              .toBe('this is not handled by the SW either');
          serverUpdate.assertSawRequestFor('/ignored/dir/file2');

          expect(await navRequest('/ignored/directory/file2')).toBe('this is foo v2');
          serverUpdate.assertNoOtherRequests();
        });

        it('strips URL query before checking `navigationUrls`', async() => {
          expect(await navRequest('/foo/file1?query=/a/b')).toBe('this is foo v2');
          serverUpdate.assertNoOtherRequests();

          expect(await navRequest('/ignored/file1?query=/a/b'))
              .toBe('this is not handled by the SW');
          serverUpdate.assertSawRequestFor('/ignored/file1');

          expect(await navRequest('/ignored/dir/file2?query=/a/b'))
              .toBe('this is not handled by the SW either');
          serverUpdate.assertSawRequestFor('/ignored/dir/file2');
        });

        it('strips registration scope before checking `navigationUrls`', async() => {
          expect(await navRequest('http://localhost/ignored/file1'))
              .toBe('this is not handled by the SW');
          serverUpdate.assertSawRequestFor('/ignored/file1');
        });
      });
    });

    describe('cleanupOldSwCaches()', () => {
      it('should delete the correct caches', async() => {
        const oldSwCacheNames = [
          // Example cache names from the beta versions of `@angular/service-worker`.
          'ngsw:active',
          'ngsw:staged',
          'ngsw:manifest:a1b2c3:super:duper',
          // Example cache names from the beta versions of `@angular/service-worker`.
          'ngsw:a1b2c3:assets:foo',
          'ngsw:db:a1b2c3:assets:bar',
        ];
        const otherCacheNames = [
          'ngsuu:active',
          'not:ngsw:active',
          'NgSw:StAgEd',
          'ngsw:/:active',
          'ngsw:/foo/:staged',
        ];
        const allCacheNames = oldSwCacheNames.concat(otherCacheNames);

        await Promise.all(allCacheNames.map(name => scope.caches.open(name)));
        expect(await scope.caches.keys()).toEqual(allCacheNames);

        await driver.cleanupOldSwCaches();
        expect(await scope.caches.keys()).toEqual(otherCacheNames);
      });

      it('should delete other caches even if deleting one of them fails', async() => {
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
      it('does not crash with bad index hash', async() => {
        scope = new SwTestHarnessBuilder().withServerState(brokenServer).build();
        (scope.registration as any).scope = 'http://site.com';
        driver = new Driver(scope, scope, new CacheDatabase(scope, scope));

        expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
      });

      it('enters degraded mode when update has a bad index', async() => {
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

      it('enters degraded mode when failing to write to cache', async() => {
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

      it('ignores invalid `only-if-cached` requests ', async() => {
        const requestFoo = (cache: RequestCache | 'only-if-cached', mode: RequestMode) =>
            makeRequest(scope, '/foo.txt', undefined, {cache, mode});

        expect(await requestFoo('default', 'no-cors')).toBe('this is foo');
        expect(await requestFoo('only-if-cached', 'same-origin')).toBe('this is foo');
        expect(await requestFoo('only-if-cached', 'no-cors')).toBeNull();
      });

      it('ignores passive mixed content requests ', async() => {
        const scopeFetchSpy = spyOn(scope, 'fetch').and.callThrough();
        const getRequestUrls = () => scopeFetchSpy.calls.allArgs().map(args => args[0].url);

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

      describe('Backwards compatibility with v5', () => {
        beforeEach(() => {
          const serverV5 = new MockServerStateBuilder()
                               .withStaticFiles(dist)
                               .withManifest(<Manifest>manifestOld)
                               .build();

          scope = new SwTestHarnessBuilder().withServerState(serverV5).build();
          driver = new Driver(scope, scope, new CacheDatabase(scope, scope));
        });

        // Test this bug: https://github.com/angular/angular/issues/27209
        it('Fill previous versions of manifests with default navigation urls for backwards compatibility',
           async() => {
             expect(await makeRequest(scope, '/foo.txt')).toEqual('this is foo');
             await driver.initialized;
             scope.updateServerState(serverUpdate);
             expect(await driver.checkForUpdate()).toEqual(true);
           });
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
