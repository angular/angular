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
import {fakeAsync, flush, tick} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
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

    it('should handle deferred bootstrap', fakeAsync(() => {
      let applicationRunning = false;
      let stayedInTheZone: boolean = undefined!;
      const ng1Module = angular.module_('ng1', []).run(() => {
        applicationRunning = true;
        stayedInTheZone = NgZone.isInAngularZone();
      });

      const element = html('<div></div>');
      window.name = 'NG_DEFER_BOOTSTRAP!' + window.name;

      bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module);

      setTimeout(() => {
        (<any>window).angular.resumeBootstrap();
      }, 100);

      expect(applicationRunning).toEqual(false);
      tick(100);
      expect(applicationRunning).toEqual(true);
      expect(stayedInTheZone).toEqual(true);
    }));

    it('should propagate return value of resumeBootstrap', fakeAsync(() => {
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

      bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module);

      tick(100);

      const value = (<any>window).angular.resumeBootstrap();
      expect(value).toBe(a1Injector);

      flush();
    }));

    it('should wait for ng2 testability', fakeAsync(() => {
      const ng1Module = angular.module_('ng1', []);
      const element = html('<div></div>');

      bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then((upgrade) => {
        const zone = upgrade.injector.get(NgZone);
        let ng2Stable = false;
        let ng1Stable = false;

        zone.run(() => {
          setTimeout(() => {
            ng2Stable = true;
          }, 100);
        });

        angular.getTestability(element).whenStable(() => {
          ng1Stable = true;
        });

        expect(ng1Stable).toEqual(false);
        expect(ng2Stable).toEqual(false);
        tick(100);
        expect(ng1Stable).toEqual(true);
        expect(ng2Stable).toEqual(true);
      });
    }));

    it('should not wait for $interval', fakeAsync(() => {
      const ng1Module = angular.module_('ng1', []);
      const element = html('<div></div>');

      bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then((upgrade) => {
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
          200,
          0,
          true,
          'passed argument',
        );

        ng2Testability.whenStable(() => {
          ng2Stable = true;
        });

        tick(100);

        expect(intervalDone).toEqual(false);
        expect(ng2Stable).toEqual(true);

        tick(200);
        expect(intervalDone).toEqual(true);
        expect($interval.cancel(id)).toEqual(true);

        // Interval should not fire after cancel
        tick(200);
      });
    }));
  });
});
