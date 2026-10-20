/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  destroyPlatform,
  NgModule,
  Testability,
  NgZone,
  provideZoneChangeDetection,
} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {timeout} from '@angular/private/testing';
import {UpgradeModule} from '../../../static';

import * as angular from '../../../src/common/src/angular1';
import {html, withEachNg1Version} from '../../../src/common/test/helpers/common_test_helpers';

import {bootstrap} from './static_test_helpers';

withEachNg1Version(() => {
  describe('testability', () => {
    beforeEach(() => destroyPlatform());
    afterEach(() => destroyPlatform());

    @NgModule({imports: [BrowserModule, UpgradeModule], providers: [provideZoneChangeDetection()]})
    class Ng2Module {
      ngDoBootstrap() {}
    }

    it('should handle deferred bootstrap', async () => {
      let applicationRunning = false;
      let stayedInTheZone: boolean = undefined!;
      const ng1Module = angular.module_('ng1', []).run(() => {
        applicationRunning = true;
        stayedInTheZone = NgZone.isInAngularZone();
      });

      const element = html('<div></div>');
      window.name = 'NG_DEFER_BOOTSTRAP!' + window.name;

      await bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module);

      setTimeout(() => {
        (<any>window).angular.resumeBootstrap();
      }, 10);

      expect(applicationRunning).toEqual(false);
      await timeout(10);
      expect(applicationRunning).toEqual(true);
      expect(stayedInTheZone).toEqual(true);
    });

    it('should propagate return value of resumeBootstrap', async () => {
      const ng1Module = angular.module_('ng1', []);
      let a1Injector: angular.IInjectorService | undefined;
      ng1Module.run([
        '$injector',
        function ($injector: angular.IInjectorService) {
          a1Injector = $injector;
        },
      ]);
      const element = html('<div></div>');
      window.name = 'NG_DEFER_BOOTSTRAP!' + window.name;

      await bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module);

      const value = (<any>window).angular.resumeBootstrap();
      expect(value).toBe(a1Injector);

      await timeout();
    });

    it('should wait for ng2 testability', async () => {
      const ng1Module = angular.module_('ng1', []);
      const element = html('<div></div>');

      const upgrade = await bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module);
      const zone = upgrade.injector.get(NgZone);
      let ng2Stable = false;
      let ng1Stable = false;

      zone.run(() => {
        setTimeout(() => {
          ng2Stable = true;
        }, 10);
      });

      angular.getTestability(element).whenStable(() => {
        ng1Stable = true;
      });

      expect(ng1Stable).toEqual(false);
      expect(ng2Stable).toEqual(false);
      await timeout(10);
      expect(ng1Stable).toEqual(true);
      expect(ng2Stable).toEqual(true);
    });

    it('should not wait for $interval', async () => {
      const ng1Module = angular.module_('ng1', []);
      const element = html('<div></div>');

      const upgrade = await bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module);
      const ng2Testability: Testability = upgrade.injector.get(Testability);
      const $interval: angular.IIntervalService = upgrade.$injector.get('$interval');

      let ng2Stable = false;
      let intervalDone = false;

      const id = $interval(
        (arg: string) => {
          // should only be called once
          expect(intervalDone).toEqual(false);

          intervalDone = true;
          expect(NgZone.isInAngularZone()).toEqual(true);
          expect(arg).toEqual('passed argument');
        },
        20,
        0,
        true,
        'passed argument',
      );

      ng2Testability.whenStable(() => {
        ng2Stable = true;
      });

      await timeout(10);

      expect(intervalDone).toEqual(false);
      expect(ng2Stable).toEqual(true);

      await timeout(20);
      expect(intervalDone).toEqual(true);
      expect($interval.cancel(id)).toEqual(true);

      // Interval should not fire after cancel
      await timeout(20);
    });
  });
});
