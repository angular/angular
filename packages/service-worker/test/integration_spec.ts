/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgswCommChannel} from '@angular/service-worker/src/low_level';
import {SwPush} from '@angular/service-worker/src/push';
import {SwUpdate} from '@angular/service-worker/src/update';
import {MockServiceWorkerContainer, MockServiceWorkerRegistration} from '@angular/service-worker/testing/mock';
import {CacheDatabase} from '@angular/service-worker/worker/src/db-cache';
import {Driver} from '@angular/service-worker/worker/src/driver';
import {Manifest} from '@angular/service-worker/worker/src/manifest';
import {MockRequest} from '@angular/service-worker/worker/testing/fetch';
import {MockFileSystemBuilder, MockServerStateBuilder, tmpHashTableForFs} from '@angular/service-worker/worker/testing/mock';
import {SwTestHarness, SwTestHarnessBuilder} from '@angular/service-worker/worker/testing/scope';
import {Observable} from 'rxjs';
import {take} from 'rxjs/operators';

(function() {
// Skip environments that don't support the minimum APIs needed to run the SW tests.
if (!SwTestHarness.envIsSupported()) {
  return;
}

const dist = new MockFileSystemBuilder().addFile('/only.txt', 'this is only').build();

const distUpdate = new MockFileSystemBuilder().addFile('/only.txt', 'this is only v2').build();

function obsToSinglePromise<T>(obs: Observable<T>): Promise<T> {
  return obs.pipe(take(1)).toPromise();
}

const manifest: Manifest = {
  configVersion: 1,
  timestamp: 1234567890123,
  appData: {version: '1'},
  index: '/only.txt',
  assetGroups: [{
    name: 'assets',
    installMode: 'prefetch',
    updateMode: 'prefetch',
    urls: ['/only.txt'],
    patterns: [],
    cacheQueryOptions: {ignoreVary: true},
  }],
  navigationUrls: [],
  navigationRequestStrategy: 'performance',
  hashTable: tmpHashTableForFs(dist),
};

const manifestUpdate: Manifest = {
  configVersion: 1,
  timestamp: 1234567890123,
  appData: {version: '2'},
  index: '/only.txt',
  assetGroups: [{
    name: 'assets',
    installMode: 'prefetch',
    updateMode: 'prefetch',
    urls: ['/only.txt'],
    patterns: [],
    cacheQueryOptions: {ignoreVary: true},
  }],
  navigationUrls: [],
  navigationRequestStrategy: 'performance',
  hashTable: tmpHashTableForFs(distUpdate),
};

const server = new MockServerStateBuilder().withStaticFiles(dist).withManifest(manifest).build();

const serverUpdate =
    new MockServerStateBuilder().withStaticFiles(distUpdate).withManifest(manifestUpdate).build();


describe('ngsw + companion lib', () => {
  let mock: MockServiceWorkerContainer;
  let comm: NgswCommChannel;
  let reg: MockServiceWorkerRegistration;
  let scope: SwTestHarness;
  let driver: Driver;

  beforeEach(async () => {
    // Fire up the client.
    mock = new MockServiceWorkerContainer();
    comm = new NgswCommChannel(mock as any);
    scope = new SwTestHarnessBuilder().withServerState(server).build();
    driver = new Driver(scope, scope, new CacheDatabase(scope, scope));

    scope.clients.add('default');
    scope.clients.getMock('default')!.queue.subscribe(msg => {
      mock.sendMessage(msg);
    });

    mock.messages.subscribe(msg => {
      scope.handleMessage(msg, 'default');
    });
    mock.notificationClicks.subscribe((msg: Object) => {
      scope.handleMessage(msg, 'default');
    });

    mock.setupSw();
    reg = mock.mockRegistration!;

    await Promise.all(scope.handleFetch(new MockRequest('/only.txt'), 'default'));
    await driver.initialized;
  });

  it('communicates back and forth via update check', async () => {
    const update = new SwUpdate(comm);
    await update.checkForUpdate();
  });

  it('detects an actual update', async () => {
    const update = new SwUpdate(comm);
    scope.updateServerState(serverUpdate);

    const gotUpdateNotice = (async () => {
      const notice = await obsToSinglePromise(update.available);
    })();

    await update.checkForUpdate();
    await gotUpdateNotice;
  });

  it('receives push message notifications', async () => {
    const push = new SwPush(comm);
    scope.updateServerState(serverUpdate);

    const gotPushNotice = (async () => {
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

  it('receives push message click events', async () => {
    const push = new SwPush(comm);
    scope.updateServerState(serverUpdate);

    const gotNotificationClick = (async () => {
      const event: any = await obsToSinglePromise(push.notificationClicks);
      expect(event.action).toEqual('clicked');
      expect(event.notification.title).toEqual('This is a test');
    })();

    await scope.handleClick({title: 'This is a test'}, 'clicked');
    await gotNotificationClick;
  });
});
})();
