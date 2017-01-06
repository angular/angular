/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, ElementRef, Injector, NgModule, destroyPlatform} from '@angular/core';
import {async} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import * as angular from '@angular/upgrade/src/angular_js';
import {UpgradeComponent, UpgradeModule, downgradeComponent} from '@angular/upgrade/static';

import {bootstrap, html} from '../test_helpers';

export function main() {
  describe('scope/component change-detection', () => {
    beforeEach(() => destroyPlatform());
    afterEach(() => destroyPlatform());

    it('should interleave scope and component expressions', async(() => {
         const log: any[] /** TODO #9100 */ = [];
         const l = (value: any /** TODO #9100 */) => {
           log.push(value);
           return value + ';';
         };

         @Directive({selector: 'ng1a'})
         class Ng1aComponent extends UpgradeComponent {
           constructor(elementRef: ElementRef, injector: Injector) {
             super('ng1a', elementRef, injector);
           }
         }

         @Directive({selector: 'ng1b'})
         class Ng1bComponent extends UpgradeComponent {
           constructor(elementRef: ElementRef, injector: Injector) {
             super('ng1b', elementRef, injector);
           }
         }

         @Component({
           selector: 'ng2',
           template: `{{l('2A')}}<ng1a></ng1a>{{l('2B')}}<ng1b></ng1b>{{l('2C')}}`
         })
         class Ng2Component {
           l: (value: any) => string;
           constructor() { this.l = l; }
         }

         @NgModule({
           declarations: [Ng1aComponent, Ng1bComponent, Ng2Component],
           entryComponents: [Ng2Component],
           imports: [BrowserModule, UpgradeModule]
         })
         class Ng2Module {
           ngDoBootstrap() {}
         }

         const ng1Module = angular.module('ng1', [])
                               .directive('ng1a', () => ({template: '{{ l(\'ng1a\') }}'}))
                               .directive('ng1b', () => ({template: '{{ l(\'ng1b\') }}'}))
                               .directive('ng2', downgradeComponent({component: Ng2Component}))
                               .run(($rootScope: any /** TODO #9100 */) => {
                                 $rootScope.l = l;
                                 $rootScope.reset = () => log.length = 0;
                               });

         const element =
             html('<div>{{reset(); l(\'1A\');}}<ng2>{{l(\'1B\')}}</ng2>{{l(\'1C\')}}</div>');
         bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then((upgrade) => {
           expect(document.body.textContent).toEqual('1A;2A;ng1a;2B;ng1b;2C;1C;');
           // https://github.com/angular/angular.js/issues/12983
           expect(log).toEqual(['1A', '1B', '1C', '2A', '2B', '2C', 'ng1a', 'ng1b']);
         });
       }));
  });
}
