/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule, Testability, destroyPlatform} from '@angular/core';
import {NgZone} from '@angular/core/src/zone/ng_zone';
import {fakeAsync, tick} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import * as angular from '@angular/upgrade/src/common/angular1';
import {UpgradeModule} from '@angular/upgrade/static';

import {bootstrap, html} from '../test_helpers';

export function main() {
  describe('testability', () => {

    beforeEach(() => destroyPlatform());
    afterEach(() => destroyPlatform());

    @NgModule({imports: [BrowserModule, UpgradeModule]})
    class Ng2Module {
      ngDoBootstrap() {}
    }

    it('should handle deferred bootstrap', fakeAsync(() => {
         let applicationRunning = false;
         let stayedInTheZone: boolean = undefined !;
         const ng1Module = angular.module('ng1', []).run(() => {
           applicationRunning = true;
           stayedInTheZone = NgZone.isInAngularZone();
         });

         const element = html('<div></div>');
         window.name = 'NG_DEFER_BOOTSTRAP!' + window.name;

         bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module);

         setTimeout(() => { (<any>window).angular.resumeBootstrap(); }, 100);

         expect(applicationRunning).toEqual(false);
         tick(100);
         expect(applicationRunning).toEqual(true);
         expect(stayedInTheZone).toEqual(true);
       }));

    it('should wait for ng2 testability', fakeAsync(() => {
         const ng1Module = angular.module('ng1', []);
         const element = html('<div></div>');

         bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then((upgrade) => {

           const ng2Testability: Testability = upgrade.injector.get(Testability);
           ng2Testability.increasePendingRequestCount();
           let ng2Stable = false;
           let ng1Stable = false;

           angular.getTestability(element).whenStable(() => { ng1Stable = true; });

           setTimeout(() => {
             ng2Stable = true;
             ng2Testability.decreasePendingRequestCount();
           }, 100);

           expect(ng1Stable).toEqual(false);
           expect(ng2Stable).toEqual(false);
           tick(100);
           expect(ng1Stable).toEqual(true);
           expect(ng2Stable).toEqual(true);
         });
       }));
  });
}
