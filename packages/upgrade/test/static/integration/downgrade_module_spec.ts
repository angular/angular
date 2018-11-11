/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, ApplicationRef, Component, DoCheck, Inject, Injector, Input, NgModule, NgZone, OnChanges, OnDestroy, OnInit, StaticProvider, Type, ViewRef, destroyPlatform, getPlatform} from '@angular/core';
import {async, fakeAsync, tick} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {browserDetection} from '@angular/platform-browser/testing/src/browser_util';
import {downgradeComponent, downgradeModule} from '@angular/upgrade/static';
import * as angular from '@angular/upgrade/static/src/common/angular1';
import {$EXCEPTION_HANDLER, $ROOT_SCOPE, INJECTOR_KEY, LAZY_MODULE_REF} from '@angular/upgrade/static/src/common/constants';
import {LazyModuleRef} from '@angular/upgrade/static/src/common/util';

import {html, multiTrim, withEachNg1Version} from '../test_helpers';


withEachNg1Version(() => {
  [true, false].forEach(propagateDigest => {
    describe(`lazy-load ng2 module (propagateDigest: ${propagateDigest})`, () => {

      beforeEach(() => destroyPlatform());

      it('should support multiple downgraded modules', async(() => {
           @Component({selector: 'ng2A', template: 'a'})
           class Ng2ComponentA {
           }

           @Component({selector: 'ng2B', template: 'b'})
           class Ng2ComponentB {
           }

           @NgModule({
             declarations: [Ng2ComponentA],
             entryComponents: [Ng2ComponentA],
             imports: [BrowserModule],
           })
           class Ng2ModuleA {
             ngDoBootstrap() {}
           }

           @NgModule({
             declarations: [Ng2ComponentB],
             entryComponents: [Ng2ComponentB],
             imports: [BrowserModule],
           })
           class Ng2ModuleB {
             ngDoBootstrap() {}
           }

           const doDowngradeModule = (module: Type<any>) => {
             const bootstrapFn = (extraProviders: StaticProvider[]) =>
                 (getPlatform() || platformBrowserDynamic(extraProviders)).bootstrapModule(module);
             return downgradeModule(bootstrapFn);
           };

           const downModA = doDowngradeModule(Ng2ModuleA);
           const downModB = doDowngradeModule(Ng2ModuleB);
           const ng1Module = angular.module('ng1', [downModA, downModB])
                                 .directive('ng2A', downgradeComponent({
                                              component: Ng2ComponentA,
                                              downgradedModule: downModA, propagateDigest,
                                            }))
                                 .directive('ng2B', downgradeComponent({
                                              component: Ng2ComponentB,
                                              downgradedModule: downModB, propagateDigest,
                                            }));

           const element = html('<ng2-a></ng2-a> | <ng2-b></ng2-b>');
           angular.bootstrap(element, [ng1Module.name]);

           // Wait for the module to be bootstrapped.
           setTimeout(() => expect(element.textContent).toBe('a | b'));
         }));

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

      it('should destroy components inside the Angular zone', async(() => {
           let destroyedInTheZone = false;

           @Component({selector: 'ng2', template: ''})
           class Ng2Component implements OnDestroy {
             ngOnDestroy() { destroyedInTheZone = NgZone.isInAngularZone(); }
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

           const element = html('<ng2 ng-if="!hideNg2"></ng2>');
           const $injector = angular.bootstrap(element, [ng1Module.name]);
           const $rootScope = $injector.get($ROOT_SCOPE) as angular.IRootScopeService;

           // Wait for the module to be bootstrapped.
           setTimeout(() => {
             $rootScope.$apply('hideNg2 = true');
             expect(destroyedInTheZone).toBe(true);
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

      it('should run the lifecycle hooks in the correct order', async(() => {
           const logs: string[] = [];
           let rootScope: angular.IRootScopeService;

           @Component({
             selector: 'ng2',
             template: `
               {{ value }}
               <button (click)="value = 'qux'"></button>
               <ng-content></ng-content>
             `
           })
           class Ng2Component implements AfterContentChecked,
               AfterContentInit, AfterViewChecked, AfterViewInit, DoCheck, OnChanges, OnDestroy,
               OnInit {
             @Input() value = 'foo';

             ngAfterContentChecked() { this.log('AfterContentChecked'); }
             ngAfterContentInit() { this.log('AfterContentInit'); }
             ngAfterViewChecked() { this.log('AfterViewChecked'); }
             ngAfterViewInit() { this.log('AfterViewInit'); }
             ngDoCheck() { this.log('DoCheck'); }
             ngOnChanges() { this.log('OnChanges'); }
             ngOnDestroy() { this.log('OnDestroy'); }
             ngOnInit() { this.log('OnInit'); }

             private log(hook: string) { logs.push(`${hook}(${this.value})`); }
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
                     rootScope = $rootScope;
                     rootScope.value = 'bar';
                   });

           const element =
               html('<div><ng2 value="{{ value }}" ng-if="!hideNg2">Content</ng2></div>');
           angular.bootstrap(element, [ng1Module.name]);

           setTimeout(() => {    // Wait for the module to be bootstrapped.
             setTimeout(() => {  // Wait for `$evalAsync()` to propagate inputs.
               const button = element.querySelector('button') !;

               // Once initialized.
               expect(multiTrim(element.textContent)).toBe('bar Content');
               expect(logs).toEqual([
                 // `ngOnChanges()` call triggered directly through the `inputChanges` $watcher.
                 'OnChanges(bar)',
                 // Initial CD triggered directly through the `detectChanges()` or `inputChanges`
                 // $watcher (for `propagateDigest` true/false respectively).
                 'OnInit(bar)',
                 'DoCheck(bar)',
                 'AfterContentInit(bar)',
                 'AfterContentChecked(bar)',
                 'AfterViewInit(bar)',
                 'AfterViewChecked(bar)',
                 ...(propagateDigest ?
                         [
                           // CD triggered directly through the `detectChanges()` $watcher (2nd
                           // $digest).
                           'DoCheck(bar)',
                           'AfterContentChecked(bar)',
                           'AfterViewChecked(bar)',
                         ] :
                         []),
                 // CD triggered due to entering/leaving the NgZone (in `downgradeFn()`).
                 'DoCheck(bar)',
                 'AfterContentChecked(bar)',
                 'AfterViewChecked(bar)',
               ]);
               logs.length = 0;

               // Change inputs and run `$digest`.
               rootScope.$apply('value = "baz"');
               expect(multiTrim(element.textContent)).toBe('baz Content');
               expect(logs).toEqual([
                 // `ngOnChanges()` call triggered directly through the `inputChanges` $watcher.
                 'OnChanges(baz)',
                 // `propagateDigest: true` (3 CD runs):
                 //   - CD triggered due to entering/leaving the NgZone (in `inputChanges`
                 //   $watcher).
                 //   - CD triggered directly through the `detectChanges()` $watcher.
                 //   - CD triggered due to entering/leaving the NgZone (in `detectChanges`
                 //   $watcher).
                 // `propagateDigest: false` (2 CD runs):
                 //   - CD triggered directly through the `inputChanges` $watcher.
                 //   - CD triggered due to entering/leaving the NgZone (in `inputChanges`
                 //   $watcher).
                 'DoCheck(baz)',
                 'AfterContentChecked(baz)',
                 'AfterViewChecked(baz)',
                 'DoCheck(baz)',
                 'AfterContentChecked(baz)',
                 'AfterViewChecked(baz)',
                 ...(propagateDigest ?
                         [
                           'DoCheck(baz)',
                           'AfterContentChecked(baz)',
                           'AfterViewChecked(baz)',
                         ] :
                         []),
               ]);
               logs.length = 0;

               // Run `$digest` (without changing inputs).
               rootScope.$digest();
               expect(multiTrim(element.textContent)).toBe('baz Content');
               expect(logs).toEqual(
                   propagateDigest ?
                       [
                         // CD triggered directly through the `detectChanges()` $watcher.
                         'DoCheck(baz)',
                         'AfterContentChecked(baz)',
                         'AfterViewChecked(baz)',
                         // CD triggered due to entering/leaving the NgZone (in the above $watcher).
                         'DoCheck(baz)',
                         'AfterContentChecked(baz)',
                         'AfterViewChecked(baz)',
                       ] :
                       []);
               logs.length = 0;

               // Trigger change detection (without changing inputs).
               button.click();
               expect(multiTrim(element.textContent)).toBe('qux Content');
               expect(logs).toEqual([
                 'DoCheck(qux)',
                 'AfterContentChecked(qux)',
                 'AfterViewChecked(qux)',
               ]);
               logs.length = 0;

               // Destroy the component.
               rootScope.$apply('hideNg2 = true');
               expect(logs).toEqual([
                 'OnDestroy(qux)',
               ]);
               logs.length = 0;
             });
           });
         }));

      it('should detach hostViews from the ApplicationRef once destroyed', async(() => {
           let ng2Component: Ng2Component;

           @Component({selector: 'ng2', template: ''})
           class Ng2Component {
             constructor(public appRef: ApplicationRef) {
               ng2Component = this;
               spyOn(appRef, 'attachView').and.callThrough();
               spyOn(appRef, 'detachView').and.callThrough();
             }
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

           const element = html('<ng2 ng-if="!hideNg2"></ng2>');
           const $injector = angular.bootstrap(element, [ng1Module.name]);
           const $rootScope = $injector.get($ROOT_SCOPE) as angular.IRootScopeService;

           setTimeout(() => {    // Wait for the module to be bootstrapped.
             setTimeout(() => {  // Wait for the hostView to be attached (during the `$digest`).
               const hostView: ViewRef =
                   (ng2Component.appRef.attachView as jasmine.Spy).calls.mostRecent().args[0];

               expect(hostView.destroyed).toBe(false);

               $rootScope.$apply('hideNg2 = true');

               expect(hostView.destroyed).toBe(true);
               expect(ng2Component.appRef.detachView).toHaveBeenCalledWith(hostView);
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

      describe('(common error)', () => {
        let Ng2CompA: Type<any>;
        let Ng2CompB: Type<any>;
        let downModA: string;
        let downModB: string;
        let errorSpy: jasmine.Spy;

        const doDowngradeModule = (module: Type<any>) => {
          const bootstrapFn = (extraProviders: StaticProvider[]) =>
              (getPlatform() || platformBrowserDynamic(extraProviders)).bootstrapModule(module);
          return downgradeModule(bootstrapFn);
        };

        beforeEach(() => {
          @Component({selector: 'ng2A', template: 'a'})
          class Ng2ComponentA {
          }

          @Component({selector: 'ng2B', template: 'b'})
          class Ng2ComponentB {
          }

          @NgModule({
            declarations: [Ng2ComponentA],
            entryComponents: [Ng2ComponentA],
            imports: [BrowserModule],
          })
          class Ng2ModuleA {
            ngDoBootstrap() {}
          }

          @NgModule({
            declarations: [Ng2ComponentB],
            entryComponents: [Ng2ComponentB],
            imports: [BrowserModule],
          })
          class Ng2ModuleB {
            ngDoBootstrap() {}
          }

          Ng2CompA = Ng2ComponentA;
          Ng2CompB = Ng2ComponentB;
          downModA = doDowngradeModule(Ng2ModuleA);
          downModB = doDowngradeModule(Ng2ModuleB);
          errorSpy = jasmine.createSpy($EXCEPTION_HANDLER);
        });

        it('should throw if no downgraded module is included', async(() => {
             const ng1Module = angular.module('ng1', [])
                                   .value($EXCEPTION_HANDLER, errorSpy)
                                   .directive('ng2A', downgradeComponent({
                                                component: Ng2CompA,
                                                downgradedModule: downModA, propagateDigest,
                                              }))
                                   .directive('ng2B', downgradeComponent({
                                                component: Ng2CompB,
                                                propagateDigest,
                                              }));

             const element = html('<ng2-a></ng2-a> | <ng2-b></ng2-b>');
             angular.bootstrap(element, [ng1Module.name]);

             expect(errorSpy).toHaveBeenCalledTimes(2);
             expect(errorSpy).toHaveBeenCalledWith(
                 new Error(
                     'Error while instantiating component \'Ng2ComponentA\': Not a valid ' +
                     '\'@angular/upgrade\' application.\n' +
                     'Did you forget to downgrade an Angular module or include it in the AngularJS ' +
                     'application?'),
                 '<ng2-a>');
             expect(errorSpy).toHaveBeenCalledWith(
                 new Error(
                     'Error while instantiating component \'Ng2ComponentB\': Not a valid ' +
                     '\'@angular/upgrade\' application.\n' +
                     'Did you forget to downgrade an Angular module or include it in the AngularJS ' +
                     'application?'),
                 '<ng2-b>');
           }));

        it('should throw if the corresponding downgraded module is not included', async(() => {
             const ng1Module = angular.module('ng1', [downModA])
                                   .value($EXCEPTION_HANDLER, errorSpy)
                                   .directive('ng2A', downgradeComponent({
                                                component: Ng2CompA,
                                                downgradedModule: downModA, propagateDigest,
                                              }))
                                   .directive('ng2B', downgradeComponent({
                                                component: Ng2CompB,
                                                downgradedModule: downModB, propagateDigest,
                                              }));

             const element = html('<ng2-a></ng2-a> | <ng2-b></ng2-b>');
             angular.bootstrap(element, [ng1Module.name]);

             expect(errorSpy).toHaveBeenCalledTimes(1);
             expect(errorSpy).toHaveBeenCalledWith(
                 new Error(
                     'Error while instantiating component \'Ng2ComponentB\': Unable to find the ' +
                     'specified downgraded module.\n' +
                     'Did you forget to downgrade an Angular module or include it in the AngularJS ' +
                     'application?'),
                 '<ng2-b>');
           }));

        it('should throw if `downgradedModule` is not specified and there are multiple downgraded modules',
           async(() => {
             const ng1Module = angular.module('ng1', [downModA, downModB])
                                   .value($EXCEPTION_HANDLER, errorSpy)
                                   .directive('ng2A', downgradeComponent({
                                                component: Ng2CompA,
                                                downgradedModule: downModA, propagateDigest,
                                              }))
                                   .directive('ng2B', downgradeComponent({
                                                component: Ng2CompB,
                                                propagateDigest,
                                              }));

             const element = html('<ng2-a></ng2-a> | <ng2-b></ng2-b>');
             angular.bootstrap(element, [ng1Module.name]);

             expect(errorSpy).toHaveBeenCalledTimes(1);
             expect(errorSpy).toHaveBeenCalledWith(
                 new Error(
                     'Error while instantiating component \'Ng2ComponentB\': \'downgradedModule\' not ' +
                     'specified.\n' +
                     'This application contains more than one downgraded Angular module, thus you need ' +
                     'to always specify \'downgradedModule\' when downgrading components and ' +
                     'injectables.'),
                 '<ng2-b>');
           }));
      });
    });
  });
});
