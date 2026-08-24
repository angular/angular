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
import {MockCache} from '../testing/cache';
import {MockRequest} from '../testing/fetch';
import {
  MockFileSystemBuilder,
  MockServerStateBuilder,
  tmpHashTableForFs,
} from '../testing/mock';
import {SwTestHarness, SwTestHarnessBuilder} from '../testing/scope';
import {envIsSupported} from '../testing/utils';

(function () {
  if (!envIsSupported()) {
    return;
  }

  const dist = new MockFileSystemBuilder().addFile('/foo.txt', 'this is foo').build();
  const manifest: Manifest = {
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
    hashTable: tmpHashTableForFs(dist),
  };

  const server = new MockServerStateBuilder()
    .withStaticFiles(dist)
    .withManifest(manifest)
    .build();

  describe('Driver quota handling', () => {
    let scope: SwTestHarness;
    let driver: Driver;

    beforeEach(() => {
      server.reset();
      scope = new SwTestHarnessBuilder().withServerState(server).build();
      driver = new Driver(scope, scope, new CacheDatabase(scope));
    });

    it('falls back to the network when persisting a new client assignment fails', async () => {
      expect(await makeRequest(scope, '/foo.txt')).toBe('this is foo');
      await driver.initialized;
      server.clearRequests();

      spyOn(MockCache.prototype, 'put').and.throwError('Quota exceeded');
      const debuggerLogSpy = spyOn(driver.debugger, 'log');

      expect(await makeRequest(scope, '/foo.txt', 'second-client')).toBe('this is foo');
      expect(driver.state).toBe(DriverReadyState.NORMAL);
      expect(debuggerLogSpy).toHaveBeenCalledWith(
        new Error('Quota exceeded'),
        'Failed to assign an app version: Driver.fetch(/foo.txt)',
      );
      server.assertSawRequestFor('/foo.txt');
    });
  });
})();

async function makeRequest(
  scope: SwTestHarness,
  url: string,
  clientId = 'default',
): Promise<string | null> {
  const [resPromise, done] = scope.handleFetch(new MockRequest(url), clientId);
  await done;
  const res = await resPromise;
  if (res !== undefined && res.ok) {
    return res.text();
  }
  return null;
}
