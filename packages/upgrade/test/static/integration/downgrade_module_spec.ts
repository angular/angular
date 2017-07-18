/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Inject, Injector, Input, NgModule, Provider, destroyPlatform} from '@angular/core';
import {async} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import * as angular from '@angular/upgrade/src/common/angular1';
import {$ROOT_SCOPE, INJECTOR_KEY} from '@angular/upgrade/src/common/constants';
import {downgradeComponent, downgradeModule} from '@angular/upgrade/static';

import {html} from '../test_helpers';

export function main() {
  describe('lazy-load ng2 module', () => {

    beforeEach(() => destroyPlatform());
    afterEach(() => destroyPlatform());

    it('should support downgrading a component and propagate inputs', async(() => {
         @Component({selector: 'ng2A', template: 'a({{ value }}) | <ng2B [value]="value"></ng2B>'})
         class Ng2AComponent {
           @Input() value = -1;
         }

         @Component({selector: 'ng2B', template: 'b({{ value }})'})
         class Ng2BComponent {
           @Input() value = -2;
         }

         @NgModule({
           declarations: [Ng2AComponent, Ng2BComponent],
           entryComponents: [Ng2AComponent],
           imports: [BrowserModule],
         })
         class Ng2Module {
           ngDoBootstrap() {}
         }

         const bootstrapFn = (extraProviders: Provider[]) =>
             platformBrowserDynamic(extraProviders).bootstrapModule(Ng2Module);
         const lazyModuleName = downgradeModule<Ng2Module>(bootstrapFn);
         const ng1Module =
             angular.module('ng1', [lazyModuleName])
                 .directive(
                     'ng2', downgradeComponent({component: Ng2AComponent, propagateDigest: false}))
                 .run(($rootScope: angular.IRootScopeService) => $rootScope.value = 0);

         const element = html('<div><ng2 [value]="value" ng-if="loadNg2"></ng2></div>');
         const $injector = angular.bootstrap(element, [ng1Module.name]);
         const $rootScope = $injector.get($ROOT_SCOPE) as angular.IRootScopeService;

         expect(element.textContent).toBe('');
         expect(() => $injector.get(INJECTOR_KEY)).toThrowError();

         $rootScope.$apply('value = 1');
         expect(element.textContent).toBe('');
         expect(() => $injector.get(INJECTOR_KEY)).toThrowError();

         $rootScope.$apply('loadNg2 = true');
         expect(element.textContent).toBe('');
         expect(() => $injector.get(INJECTOR_KEY)).toThrowError();

         // Wait for the module to be bootstrapped.
         setTimeout(() => {
           expect(() => $injector.get(INJECTOR_KEY)).not.toThrow();

           // Wait for `$evalAsync()` to propagate inputs.
           setTimeout(() => expect(element.textContent).toBe('a(1) | b(1)'));
         });
       }));

    it('should support using an upgraded service', async(() => {
         class Ng2Service {
           constructor(@Inject('ng1Value') private ng1Value: string) {}
           getValue = () => `${this.ng1Value}-bar`;
         }

         @Component({selector: 'ng2', template: '{{ value }}'})
         class Ng2Component {
           value: string;
           constructor(ng2Service: Ng2Service) { this.value = ng2Service.getValue(); }
         }

         @NgModule({
           declarations: [Ng2Component],
           entryComponents: [Ng2Component],
           imports: [BrowserModule],
           providers: [
             Ng2Service,
             {
               provide: 'ng1Value',
               useFactory: (i: angular.IInjectorService) => i.get('ng1Value'),
               deps: ['$injector'],
             },
           ],
         })
         class Ng2Module {
           ngDoBootstrap() {}
         }

         const bootstrapFn = (extraProviders: Provider[]) =>
             platformBrowserDynamic(extraProviders).bootstrapModule(Ng2Module);
         const lazyModuleName = downgradeModule<Ng2Module>(bootstrapFn);
         const ng1Module =
             angular.module('ng1', [lazyModuleName])
                 .directive(
                     'ng2', downgradeComponent({component: Ng2Component, propagateDigest: false}))
                 .value('ng1Value', 'foo');

         const element = html('<div><ng2 ng-if="loadNg2"></ng2></div>');
         const $injector = angular.bootstrap(element, [ng1Module.name]);
         const $rootScope = $injector.get($ROOT_SCOPE) as angular.IRootScopeService;

         expect(element.textContent).toBe('');
         expect(() => $injector.get(INJECTOR_KEY)).toThrowError();

         $rootScope.$apply('loadNg2 = true');
         expect(element.textContent).toBe('');
         expect(() => $injector.get(INJECTOR_KEY)).toThrowError();

         // Wait for the module to be bootstrapped.
         setTimeout(() => {
           expect(() => $injector.get(INJECTOR_KEY)).not.toThrow();

           // Wait for `$evalAsync()` to propagate inputs.
           setTimeout(() => expect(element.textContent).toBe('foo-bar'));
         });
       }));

    it('should give access to both injectors in the Angular module\'s constructor', async(() => {
         let $injectorFromNg2: angular.IInjectorService|null = null;

         @Component({selector: 'ng2', template: ''})
         class Ng2Component {
         }

         @NgModule({
           declarations: [Ng2Component],
           entryComponents: [Ng2Component],
           imports: [BrowserModule],
         })
         class Ng2Module {
           constructor(injector: Injector) {
             $injectorFromNg2 = injector.get<angular.IInjectorService>('$injector' as any);
           }

           ngDoBootstrap() {}
         }

         const bootstrapFn = (extraProviders: Provider[]) =>
             platformBrowserDynamic(extraProviders).bootstrapModule(Ng2Module);
         const lazyModuleName = downgradeModule<Ng2Module>(bootstrapFn);
         const ng1Module =
             angular.module('ng1', [lazyModuleName])
                 .directive(
                     'ng2', downgradeComponent({component: Ng2Component, propagateDigest: false}))
                 .value('ng1Value', 'foo');

         const element = html('<ng2></ng2>');
         const $injectorFromNg1 = angular.bootstrap(element, [ng1Module.name]);

         // Wait for the module to be bootstrapped.
         setTimeout(() => expect($injectorFromNg2).toBe($injectorFromNg1));
       }));
  });
}
