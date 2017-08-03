/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Inject, Injector, Input, NgModule, NgZone, OnChanges, StaticProvider, destroyPlatform} from '@angular/core';
import {async, fakeAsync, tick} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {browserDetection} from '@angular/platform-browser/testing/src/browser_util';
import * as angular from '@angular/upgrade/src/common/angular1';
import {$ROOT_SCOPE, INJECTOR_KEY, LAZY_MODULE_REF} from '@angular/upgrade/src/common/constants';
import {LazyModuleRef} from '@angular/upgrade/src/common/util';
import {downgradeComponent, downgradeModule} from '@angular/upgrade/static';

import {html} from '../test_helpers';


export function main() {
  [true, false].forEach(propagateDigest => {
    describe(`lazy-load ng2 module (propagateDigest: ${propagateDigest})`, () => {

      beforeEach(() => destroyPlatform());

      it('should support downgrading a component and propagate inputs', async(() => {
           @Component(
               {selector: 'ng2A', template: 'a({{ value }}) | <ng2B [value]="value"></ng2B>'})
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

           const bootstrapFn = (extraProviders: StaticProvider[]) =>
               platformBrowserDynamic(extraProviders).bootstrapModule(Ng2Module);
           const lazyModuleName = downgradeModule<Ng2Module>(bootstrapFn);
           const ng1Module =
               angular.module('ng1', [lazyModuleName])
                   .directive(
                       'ng2', downgradeComponent({component: Ng2AComponent, propagateDigest}))
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

           const bootstrapFn = (extraProviders: StaticProvider[]) =>
               platformBrowserDynamic(extraProviders).bootstrapModule(Ng2Module);
           const lazyModuleName = downgradeModule<Ng2Module>(bootstrapFn);
           const ng1Module =
               angular.module('ng1', [lazyModuleName])
                   .directive('ng2', downgradeComponent({component: Ng2Component, propagateDigest}))
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

      it('should create components inside the Angular zone', async(() => {
           @Component({selector: 'ng2', template: 'In the zone: {{ inTheZone }}'})
           class Ng2Component {
             private inTheZone = false;
             constructor() { this.inTheZone = NgZone.isInAngularZone(); }
           }

           @NgModule({
             declarations: [Ng2Component],
             entryComponents: [Ng2Component],
             imports: [BrowserModule],
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           const bootstrapFn = (extraProviders: StaticProvider[]) =>
               platformBrowserDynamic(extraProviders).bootstrapModule(Ng2Module);
           const lazyModuleName = downgradeModule<Ng2Module>(bootstrapFn);
           const ng1Module =
               angular.module('ng1', [lazyModuleName])
                   .directive(
                       'ng2', downgradeComponent({component: Ng2Component, propagateDigest}));

           const element = html('<ng2></ng2>');
           angular.bootstrap(element, [ng1Module.name]);

           // Wait for the module to be bootstrapped.
           setTimeout(() => {
             // Wait for `$evalAsync()` to propagate inputs.
             setTimeout(() => expect(element.textContent).toBe('In the zone: true'));
           });
         }));

      it('should propagate input changes inside the Angular zone', async(() => {
           let ng2Component: Ng2Component;

           @Component({selector: 'ng2', template: ''})
           class Ng2Component implements OnChanges {
             @Input() attrInput = 'foo';
             @Input() propInput = 'foo';

             constructor() { ng2Component = this; }
             ngOnChanges() {}
           }

           @NgModule({
             declarations: [Ng2Component],
             entryComponents: [Ng2Component],
             imports: [BrowserModule],
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           const bootstrapFn = (extraProviders: StaticProvider[]) =>
               platformBrowserDynamic(extraProviders).bootstrapModule(Ng2Module);
           const lazyModuleName = downgradeModule<Ng2Module>(bootstrapFn);
           const ng1Module =
               angular.module('ng1', [lazyModuleName])
                   .directive('ng2', downgradeComponent({component: Ng2Component, propagateDigest}))
                   .run(($rootScope: angular.IRootScopeService) => {
                     $rootScope.attrVal = 'bar';
                     $rootScope.propVal = 'bar';
                   });

           const element = html('<ng2 attr-input="{{ attrVal }}" [prop-input]="propVal"></ng2>');
           const $injector = angular.bootstrap(element, [ng1Module.name]);
           const $rootScope = $injector.get($ROOT_SCOPE) as angular.IRootScopeService;

           setTimeout(() => {    // Wait for the module to be bootstrapped.
             setTimeout(() => {  // Wait for `$evalAsync()` to propagate inputs.
               const expectToBeInNgZone = () => expect(NgZone.isInAngularZone()).toBe(true);
               const changesSpy =
                   spyOn(ng2Component, 'ngOnChanges').and.callFake(expectToBeInNgZone);

               expect(ng2Component.attrInput).toBe('bar');
               expect(ng2Component.propInput).toBe('bar');

               $rootScope.$apply('attrVal = "baz"');
               expect(ng2Component.attrInput).toBe('baz');
               expect(ng2Component.propInput).toBe('bar');
               expect(changesSpy).toHaveBeenCalledTimes(1);

               $rootScope.$apply('propVal = "qux"');
               expect(ng2Component.attrInput).toBe('baz');
               expect(ng2Component.propInput).toBe('qux');
               expect(changesSpy).toHaveBeenCalledTimes(2);
             });
           });
         }));

      it('should wire up the component for change detection', async(() => {
           @Component(
               {selector: 'ng2', template: '{{ count }}<button (click)="increment()"></button>'})
           class Ng2Component {
             private count = 0;
             increment() { ++this.count; }
           }

           @NgModule({
             declarations: [Ng2Component],
             entryComponents: [Ng2Component],
             imports: [BrowserModule],
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           const bootstrapFn = (extraProviders: StaticProvider[]) =>
               platformBrowserDynamic(extraProviders).bootstrapModule(Ng2Module);
           const lazyModuleName = downgradeModule<Ng2Module>(bootstrapFn);
           const ng1Module =
               angular.module('ng1', [lazyModuleName])
                   .directive(
                       'ng2', downgradeComponent({component: Ng2Component, propagateDigest}));

           const element = html('<ng2></ng2>');
           angular.bootstrap(element, [ng1Module.name]);

           setTimeout(() => {    // Wait for the module to be bootstrapped.
             setTimeout(() => {  // Wait for `$evalAsync()` to propagate inputs.
               const button = element.querySelector('button') !;
               expect(element.textContent).toBe('0');

               button.click();
               expect(element.textContent).toBe('1');

               button.click();
               expect(element.textContent).toBe('2');
             });
           });
         }));

      it('should only retrieve the Angular zone once (and cache it for later use)',
         fakeAsync(() => {
           let count = 0;
           let getNgZoneCount = 0;

           @Component(
               {selector: 'ng2', template: 'Count: {{ count }} | In the zone: {{ inTheZone }}'})
           class Ng2Component {
             private count = ++count;
             private inTheZone = false;
             constructor() { this.inTheZone = NgZone.isInAngularZone(); }
           }

           @NgModule({
             declarations: [Ng2Component],
             entryComponents: [Ng2Component],
             imports: [BrowserModule],
           })
           class Ng2Module {
             constructor(injector: Injector) {
               const originalGet = injector.get;
               injector.get = function(token: any) {
                 if (token === NgZone) ++getNgZoneCount;
                 return originalGet.apply(injector, arguments);
               };
             }
             ngDoBootstrap() {}
           }

           const tickDelay = browserDetection.isIE ? 100 : 0;
           const bootstrapFn = (extraProviders: StaticProvider[]) =>
               platformBrowserDynamic(extraProviders).bootstrapModule(Ng2Module);
           const lazyModuleName = downgradeModule<Ng2Module>(bootstrapFn);
           const ng1Module =
               angular.module('ng1', [lazyModuleName])
                   .directive(
                       'ng2', downgradeComponent({component: Ng2Component, propagateDigest}));

           const element = html('<div><ng2 ng-if="showNg2"></ng2></div>');
           const $injector = angular.bootstrap(element, [ng1Module.name]);
           const $rootScope = $injector.get($ROOT_SCOPE) as angular.IRootScopeService;

           $rootScope.$apply('showNg2 = true');
           tick(tickDelay);  // Wait for the module to be bootstrapped and `$evalAsync()` to
                             // propagate inputs.

           const injector = ($injector.get(LAZY_MODULE_REF) as LazyModuleRef).injector !;
           const injectorGet = injector.get;
           spyOn(injector, 'get').and.callFake((...args: any[]) => {
             expect(args[0]).not.toBe(NgZone);
             return injectorGet.apply(injector, args);
           });

           expect(element.textContent).toBe('Count: 1 | In the zone: true');

           $rootScope.$apply('showNg2 = false');
           expect(element.textContent).toBe('');

           $rootScope.$apply('showNg2 = true');
           tick(tickDelay);  // Wait for `$evalAsync()` to propagate inputs.
           expect(element.textContent).toBe('Count: 2 | In the zone: true');

           $rootScope.$destroy();
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

           const bootstrapFn = (extraProviders: StaticProvider[]) =>
               platformBrowserDynamic(extraProviders).bootstrapModule(Ng2Module);
           const lazyModuleName = downgradeModule<Ng2Module>(bootstrapFn);
           const ng1Module =
               angular.module('ng1', [lazyModuleName])
                   .directive(
                       'ng2', downgradeComponent({component: Ng2Component, propagateDigest}));

           const element = html('<ng2></ng2>');
           const $injectorFromNg1 = angular.bootstrap(element, [ng1Module.name]);

           // Wait for the module to be bootstrapped.
           setTimeout(() => expect($injectorFromNg2).toBe($injectorFromNg1));
         }));
    });
  });
}
