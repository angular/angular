/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule, OpaqueToken, destroyPlatform} from '@angular/core';
import {async} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import * as angular from '@angular/upgrade/src/angular_js';
import {UpgradeModule, downgradeInjectable} from '@angular/upgrade/static';

import {bootstrap, html} from '../test_helpers';

export function main() {
  describe('injection', () => {

    beforeEach(() => destroyPlatform());
    afterEach(() => destroyPlatform());

    it('should downgrade ng2 service to ng1', async(() => {
         // Tokens used in ng2 to identify services
         const Ng2Service = new OpaqueToken('ng2-service');

         // Sample ng1 NgModule for tests
         @NgModule({
           imports: [BrowserModule, UpgradeModule],
           providers: [
             {provide: Ng2Service, useValue: 'ng2 service value'},
           ]
         })
         class Ng2Module {
           ngDoBootstrap() {}
         }

         // create the ng1 module that will import an ng2 service
         const ng1Module =
             angular.module('ng1Module', []).factory('ng2Service', downgradeInjectable(Ng2Service));

         bootstrap(platformBrowserDynamic(), Ng2Module, html('<div>'), ng1Module)
             .then((upgrade) => {
               const ng1Injector = upgrade.$injector;
               expect(ng1Injector.get('ng2Service')).toBe('ng2 service value');
             });
       }));

    it('should upgrade ng1 service to ng2', async(() => {
         // Tokens used in ng2 to identify services
         const Ng1Service = new OpaqueToken('ng1-service');

         // Sample ng1 NgModule for tests
         @NgModule({
           imports: [BrowserModule, UpgradeModule],
           providers: [
             // the following line is the "upgrade" of an Angular 1 service
             {
               provide: Ng1Service,
               useFactory: (i: angular.IInjectorService) => i.get('ng1Service'),
               deps: ['$injector']
             }
           ]
         })
         class Ng2Module {
           ngDoBootstrap() {}
         }

         // create the ng1 module that will import an ng2 service
         const ng1Module = angular.module('ng1Module', []).value('ng1Service', 'ng1 service value');

         bootstrap(platformBrowserDynamic(), Ng2Module, html('<div>'), ng1Module)
             .then((upgrade) => {
               var ng2Injector = upgrade.injector;
               expect(ng2Injector.get(Ng1Service)).toBe('ng1 service value');
             });
       }));
  });
}
