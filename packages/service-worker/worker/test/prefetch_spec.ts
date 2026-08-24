/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {PrefetchAssetGroup} from '../src/assets';
import {CacheDatabase} from '../src/db-cache';
import {IdleScheduler} from '../src/idle';
import {MockCache} from '../testing/cache';
import {MockExtendableEvent} from '../testing/events';
import {MockRequest} from '../testing/fetch';
import {
  MockFileSystemBuilder,
  MockServerStateBuilder,
  tmpHashTable,
  tmpManifestSingleAssetGroup,
} from '../testing/mock';
import {SwTestHarness, SwTestHarnessBuilder} from '../testing/scope';
import {envIsSupported} from '../testing/utils';

(function () {
  // Skip environments that don't support the minimum APIs needed to run the SW tests.
  if (!envIsSupported()) {
    return;
  }

  const dist = new MockFileSystemBuilder()
    .addFile('/foo.txt', 'this is foo', {Vary: 'Accept'})
    .addFile('/bar.txt', 'this is bar')
    .build();

  const manifest = tmpManifestSingleAssetGroup(dist);

  const server = new MockServerStateBuilder().withStaticFiles(dist).withManifest(manifest).build();

  const scope = new SwTestHarnessBuilder().withServerState(server).build();

  const db = new CacheDatabase(scope);

  const testEvent = new MockExtendableEvent('test');

  describe('prefetch assets', () => {
    let group: PrefetchAssetGroup;
    let idle: IdleScheduler;
    beforeEach(() => {
      idle = new IdleScheduler(null!, 3000, 30000, {
        log: (v, ctx = '') => console.error(v, ctx),
      });
      group = new PrefetchAssetGroup(
        scope,
        scope,
        idle,
        manifest.assetGroups![0],
        tmpHashTable(manifest),
        db,
        'test',
      );
    });

    /**
     * Build a scope in which `/foo.txt` is served as a response that has already been redirected
     * to `/redirect-target.txt`, where `redirectedBody` is what the redirected response carries
     * and `targetBody` is what a direct request for the redirect target returns.
     */
    function scopeForRedirect(redirectedBody: string, targetBody: string) {
      const server = new MockServerStateBuilder()
        .withStaticFiles(dist.extend().addFile('/redirect-target.txt', targetBody).build())
        .withManifest(manifest)
        .withRedirect('/foo.txt', '/redirect-target.txt', redirectedBody)
        .build();
      return new SwTestHarnessBuilder().withServerState(server).build();
    }

    function groupForScope(harness: SwTestHarness): PrefetchAssetGroup {
      return new PrefetchAssetGroup(
        harness,
        harness,
        idle,
        manifest.assetGroups![0],
        tmpHashTable(manifest),
        new CacheDatabase(harness),
        'test',
      );
    }

    it('initializes without crashing', async () => {
      await group.initializeFully();
    });
    it('fully caches the two files', async () => {
      await group.initializeFully();
      scope.updateServerState();
      const res1 = await group.handleFetch(scope.newRequest('/foo.txt'), testEvent);
      const res2 = await group.handleFetch(scope.newRequest('/bar.txt'), testEvent);
      expect(await res1!.text()).toEqual('this is foo');
      expect(await res2!.text()).toEqual('this is bar');
    });
    it('persists the cache across restarts', async () => {
      await group.initializeFully();
      const freshScope = new SwTestHarnessBuilder()
        .withCacheState(scope.caches.original.dehydrate())
        .build();
      group = new PrefetchAssetGroup(
        freshScope,
        freshScope,
        idle,
        manifest.assetGroups![0],
        tmpHashTable(manifest),
        new CacheDatabase(freshScope),
        'test',
      );
      await group.initializeFully();
      const res1 = await group.handleFetch(scope.newRequest('/foo.txt'), testEvent);
      const res2 = await group.handleFetch(scope.newRequest('/bar.txt'), testEvent);
      expect(await res1!.text()).toEqual('this is foo');
      expect(await res2!.text()).toEqual('this is bar');
    });
    it('caches properly if resources are requested before initialization', async () => {
      const res1 = await group.handleFetch(scope.newRequest('/foo.txt'), testEvent);
      const res2 = await group.handleFetch(scope.newRequest('/bar.txt'), testEvent);
      expect(await res1!.text()).toEqual('this is foo');
      expect(await res2!.text()).toEqual('this is bar');
      scope.updateServerState();
      await group.initializeFully();
    });
    it('throws if the server-side content does not match the manifest hash', async () => {
      const badHashFs = dist.extend().addFile('/foo.txt', 'corrupted file').build();
      const badServer = new MockServerStateBuilder()
        .withManifest(manifest)
        .withStaticFiles(badHashFs)
        .build();
      const badScope = new SwTestHarnessBuilder().withServerState(badServer).build();
      group = new PrefetchAssetGroup(
        badScope,
        badScope,
        idle,
        manifest.assetGroups![0],
        tmpHashTable(manifest),
        new CacheDatabase(badScope),
        'test',
      );
      const err = await errorFrom(group.initializeFully());
      expect(err.message).toContain('Hash mismatch');
    });
    it('caches a redirected resource whose redirect target matches the manifest hash', async () => {
      // A hashed asset served through a redirect to another location, where that location serves
      // the contents the manifest expects. This is the ordinary "assets are served from a CDN"
      // deployment and must keep working.
      const redirectScope = scopeForRedirect('this is foo', 'this is foo');
      group = groupForScope(redirectScope);

      await group.initializeFully();

      const res = await group.handleFetch(redirectScope.newRequest('/foo.txt'), testEvent);
      expect(await res!.text()).toEqual('this is foo');
    });

    it('throws if the redirect target does not match the manifest hash of the original URL', async () => {
      // The browser follows the redirect before the service worker sees the response, so the
      // redirected response carries the target's contents and is validated against the hash the
      // manifest lists for `/foo.txt`. The redirect is then unwrapped with a second request, and
      // it is that second response which gets cached under `/foo.txt`. Serving the expected
      // contents first and different contents second must not result in the latter being cached
      // unvalidated.
      const redirectScope = scopeForRedirect('this is foo', 'malicious contents');
      group = groupForScope(redirectScope);

      const err = await errorFrom(group.initializeFully());
      expect(err?.message).toContain('Hash mismatch');

      expect(redirectScope.caches.original.dehydrate()).not.toContain('malicious contents');
    });

    it('CacheQueryOptions are passed through', async () => {
      await group.initializeFully();
      const matchSpy = spyOn(MockCache.prototype, 'match').and.callThrough();
      await group.handleFetch(scope.newRequest('/foo.txt'), testEvent);
      expect(matchSpy).toHaveBeenCalledWith(new MockRequest('/foo.txt'), {ignoreVary: true});
    });
  });
})();

function errorFrom(promise: Promise<any>): Promise<any> {
  return promise.catch((err) => err);
}
