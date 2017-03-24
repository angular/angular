/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '@angular/core';
import {UiArguments} from '@angular/platform-webworker/src/web_workers/shared/client_message_broker';
import {MessageBus} from '@angular/platform-webworker/src/web_workers/shared/message_bus';
import {LocationType, SerializerTypes} from '@angular/platform-webworker/src/web_workers/shared/serializer';
import {WebWorkerPlatformLocation} from '@angular/platform-webworker/src/web_workers/worker/platform_location';

import {MockMessageBrokerFactory, createPairedMessageBuses, expectBrokerCall} from '../shared/web_worker_test_util';

import {SpyMessageBroker} from './spies';

export function main() {
  describe('WebWorkerPlatformLocation', () => {
    let uiBus: MessageBus = null !;
    let workerBus: MessageBus = null !;
    let broker: any = null;

    const TEST_LOCATION = new LocationType(
        'http://www.example.com', 'http', 'example.com', 'example.com', '80', '/', '', '',
        'http://www.example.com');


    function createWebWorkerPlatformLocation(loc: LocationType): WebWorkerPlatformLocation {
      broker.spy('runOnService')
          .and.callFake((args: UiArguments, returnType: Type<any>| SerializerTypes) => {
            if (args.method === 'getLocation') {
              return Promise.resolve(loc);
            }
          });
      const factory = new MockMessageBrokerFactory(broker);
      return new WebWorkerPlatformLocation(factory, workerBus, null !);
    }

    function testPushOrReplaceState(pushState: boolean) {
      const platformLocation = createWebWorkerPlatformLocation(null !);
      const TITLE = 'foo';
      const URL = 'http://www.example.com/foo';
      expectBrokerCall(broker, pushState ? 'pushState' : 'replaceState', [null, TITLE, URL]);
      if (pushState) {
        platformLocation.pushState(null, TITLE, URL);
      } else {
        platformLocation.replaceState(null, TITLE, URL);
      }
    }

    beforeEach(() => {
      const buses = createPairedMessageBuses();
      uiBus = buses.ui;
      workerBus = buses.worker;
      workerBus.initChannel('ng-Router');
      uiBus.initChannel('ng-Router');
      broker = new SpyMessageBroker();
    });

    it('should throw if getBaseHrefFromDOM is called', () => {
      const platformLocation = createWebWorkerPlatformLocation(null !);
      expect(() => platformLocation.getBaseHrefFromDOM()).toThrowError();
    });

    it('should get location on init', () => {
      const platformLocation = createWebWorkerPlatformLocation(null !);
      expectBrokerCall(broker, 'getLocation');
      platformLocation.init();
    });

    it('should throw if set pathname is called before init finishes', () => {
      const platformLocation = createWebWorkerPlatformLocation(null !);
      platformLocation.init();
      expect(() => platformLocation.pathname = 'TEST').toThrowError();
    });

    it('should send pathname to render thread', done => {
      const platformLocation = createWebWorkerPlatformLocation(TEST_LOCATION);
      platformLocation.init().then((_) => {
        const PATHNAME = '/test';
        expectBrokerCall(broker, 'setPathname', [PATHNAME]);
        platformLocation.pathname = PATHNAME;
        done();
      });
    });

    it('should send pushState to render thread', () => { testPushOrReplaceState(true); });

    it('should send replaceState to render thread', () => { testPushOrReplaceState(false); });
  });
}
