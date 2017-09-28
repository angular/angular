/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable} from 'rxjs/Observable';
import {take} from 'rxjs/operator/take';
import {toPromise} from 'rxjs/operator/toPromise';

import {NgswCommChannel, UpdateAvailableEvent} from '../src/low_level';
import {SwPush} from '../src/push';
import {SwUpdate} from '../src/update';
import {MockServiceWorkerContainer, MockServiceWorkerRegistration} from '../testing/mock';
import {CacheDatabase} from '../worker/src/db-cache';
import {Driver} from '../worker/src/driver';
import {Manifest} from '../worker/src/manifest';
import {MockRequest} from '../worker/testing/fetch';
import {MockFileSystemBuilder, MockServerStateBuilder, tmpHashTableForFs} from '../worker/testing/mock';
import {SwTestHarness, SwTestHarnessBuilder} from '../worker/testing/scope';

import {async_beforeEach, async_fit, async_it} from './async';

const dist = new MockFileSystemBuilder().addFile('/only.txt', 'this is only').build();

const distUpdate = new MockFileSystemBuilder().addFile('/only.txt', 'this is only v2').build();

function obsToSinglePromise<T>(obs: Observable<T>): Promise<T> {
  const takeOne = take.call(obs, 1);
  return toPromise.call(takeOne);
}

const manifest: Manifest = {
  configVersion: 1,
  appData: {version: '1'},
  index: '/only.txt',
  assetGroups: [{
    name: 'assets',
    installMode: 'prefetch',
    updateMode: 'prefetch',
    urls: ['/only.txt'],
    patterns: [],
  }],
  hashTable: tmpHashTableForFs(dist),
};

const manifestUpdate: Manifest = {
  configVersion: 1,
  appData: {version: '2'},
  index: '/only.txt',
  assetGroups: [{
    name: 'assets',
    installMode: 'prefetch',
    updateMode: 'prefetch',
    urls: ['/only.txt'],
    patterns: [],
  }],
  hashTable: tmpHashTableForFs(distUpdate),
};

const server = new MockServerStateBuilder().withStaticFiles(dist).withManifest(manifest).build();

const serverUpdate =
    new MockServerStateBuilder().withStaticFiles(distUpdate).withManifest(manifestUpdate).build();

export function main() {
  // Skip environments that don't support the minimum APIs needed to run the SW tests.
  if (!SwTestHarness.envIsSupported()) {
    return;
  }
  describe('ngsw + companion lib', () => {
    let mock: MockServiceWorkerContainer;
    let comm: NgswCommChannel;
    let reg: MockServiceWorkerRegistration;
    let scope: SwTestHarness;
    let driver: Driver;

    async_beforeEach(async() => {
      // Fire up the client.
      mock = new MockServiceWorkerContainer();
      comm = new NgswCommChannel(mock as any);
      scope = new SwTestHarnessBuilder().withServerState(server).build();
      driver = new Driver(scope, scope, new CacheDatabase(scope, scope));

      scope.clients.add('default');
      scope.clients.getMock('default') !.queue.subscribe(msg => { reg.sendMessage(msg); });

      mock.messages.subscribe(msg => { scope.handleMessage(msg, 'default'); });

      mock.setupSw();
      reg = await mock.mockRegistration;

      await Promise.all(scope.handleFetch(new MockRequest('/only.txt'), 'default'));
      await driver.initialized;
    });

    async_it('communicates back and forth via update check', async() => {
      const update = new SwUpdate(comm);
      await update.checkForUpdate();
    });

    async_it('detects an actual update', async() => {
      const update = new SwUpdate(comm);
      scope.updateServerState(serverUpdate);

      const gotUpdateNotice =
          (async() => { const notice = await obsToSinglePromise(update.available); })();

      await update.checkForUpdate();
      await gotUpdateNotice;
    });

    async_it('receives push message notifications', async() => {
      const push = new SwPush(comm);
      scope.updateServerState(serverUpdate);

      const gotPushNotice = (async() => {
        const message = await obsToSinglePromise(push.messages);
        expect(message).toEqual({
          test: 'success',
        });
      })();

      await scope.handlePush({
        test: 'success',
      });
      await gotPushNotice;
    });
  });
}
