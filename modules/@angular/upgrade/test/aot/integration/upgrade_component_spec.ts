/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, ElementRef, EventEmitter, Injector, Input, NO_ERRORS_SCHEMA, NgModule, Output, destroyPlatform} from '@angular/core';
import {async, fakeAsync, tick} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import * as angular from '@angular/upgrade/src/angular_js';
import {UpgradeComponent, UpgradeModule, downgradeComponent} from '@angular/upgrade/static';

import {bootstrap, html, multiTrim} from '../test_helpers';

export function main() {
  describe('upgrade ng1 component', () => {

    beforeEach(() => destroyPlatform());
    afterEach(() => destroyPlatform());

    describe('template/templateUrl', () => {
      it('should support `template` (string)', async(() => {
           // Define `ng1Component`
           const ng1Component: angular.IComponent = {template: 'Hello, Angular!'};

           // Define `Ng1ComponentFacade`
           @Directive({selector: 'ng1'})
           class Ng1ComponentFacade extends UpgradeComponent {
             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1', elementRef, injector);
             }
           }

           // Define `Ng2Component`
           @Component({selector: 'ng2', template: '<ng1></ng1>'})
           class Ng2Component {
           }

           // Define `ng1Module`
           const ng1Module = angular.module('ng1Module', [])
                                 .component('ng1', ng1Component)
                                 .directive('ng2', downgradeComponent({component: Ng2Component}));

           // Define `Ng2Module`
           @NgModule({
             declarations: [Ng1ComponentFacade, Ng2Component],
             entryComponents: [Ng2Component],
             imports: [BrowserModule, UpgradeModule]
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then((upgrade) => {
             expect(multiTrim(element.textContent)).toBe('Hello, Angular!');
           });
         }));

      it('should support `template` (function)', async(() => {
           // Define `ng1Component`
           const ng1Component: angular.IComponent = {template: () => 'Hello, Angular!'};

           // Define `Ng1ComponentFacade`
           @Directive({selector: 'ng1'})
           class Ng1ComponentFacade extends UpgradeComponent {
             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1', elementRef, injector);
             }
           }

           // Define `Ng2Component`
           @Component({selector: 'ng2', template: '<ng1></ng1>'})
           class Ng2Component {
           }

           // Define `ng1Module`
           const ng1Module = angular.module('ng1Module', [])
                                 .component('ng1', ng1Component)
                                 .directive('ng2', downgradeComponent({component: Ng2Component}));

           // Define `Ng2Module`
           @NgModule({
             declarations: [Ng1ComponentFacade, Ng2Component],
             entryComponents: [Ng2Component],
             imports: [BrowserModule, UpgradeModule]
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           platformBrowserDynamic().bootstrapModule(Ng2Module).then(ref => {
             var adapter = ref.injector.get(UpgradeModule) as UpgradeModule;
             adapter.bootstrap(element, [ng1Module.name]);

             expect(multiTrim(element.textContent)).toBe('Hello, Angular!');
           });
         }));

      it('should support not pass any arguments to `template` function', async(() => {
           // Define `ng1Component`
           const ng1Component: angular.IComponent = {
             template: ($attrs: angular.IAttributes, $element: angular.IAugmentedJQuery) => {
               expect($attrs).toBeUndefined();
               expect($element).toBeUndefined();

               return 'Hello, Angular!';
             }
           };

           // Define `Ng1ComponentFacade`
           @Directive({selector: 'ng1'})
           class Ng1ComponentFacade extends UpgradeComponent {
             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1', elementRef, injector);
             }
           }

           // Define `Ng2Component`
           @Component({selector: 'ng2', template: '<ng1></ng1>'})
           class Ng2Component {
           }

           // Define `ng1Module`
           const ng1Module = angular.module('ng1Module', [])
                                 .component('ng1', ng1Component)
                                 .directive('ng2', downgradeComponent({component: Ng2Component}));

           // Define `Ng2Module`
           @NgModule({
             declarations: [Ng1ComponentFacade, Ng2Component],
             entryComponents: [Ng2Component],
             imports: [BrowserModule, UpgradeModule]
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           platformBrowserDynamic().bootstrapModule(Ng2Module).then(ref => {
             var adapter = ref.injector.get(UpgradeModule) as UpgradeModule;
             adapter.bootstrap(element, [ng1Module.name]);

             expect(multiTrim(element.textContent)).toBe('Hello, Angular!');
           });
         }));

      it('should support `templateUrl` (string) fetched from `$templateCache`', async(() => {
           // Define `ng1Component`
           const ng1Component: angular.IComponent = {templateUrl: 'ng1.component.html'};

           // Define `Ng1ComponentFacade`
           @Directive({selector: 'ng1'})
           class Ng1ComponentFacade extends UpgradeComponent {
             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1', elementRef, injector);
             }
           }

           // Define `Ng2Component`
           @Component({selector: 'ng2', template: '<ng1></ng1>'})
           class Ng2Component {
           }

           // Define `ng1Module`
           const ng1Module =
               angular.module('ng1Module', [])
                   .component('ng1', ng1Component)
                   .directive('ng2', downgradeComponent({component: Ng2Component}))
                   .run(
                       ($templateCache: angular.ITemplateCacheService) =>
                           $templateCache.put('ng1.component.html', 'Hello, Angular!'));

           // Define `Ng2Module`
           @NgModule({
             declarations: [Ng1ComponentFacade, Ng2Component],
             entryComponents: [Ng2Component],
             imports: [BrowserModule, UpgradeModule]
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           platformBrowserDynamic().bootstrapModule(Ng2Module).then(ref => {
             var adapter = ref.injector.get(UpgradeModule) as UpgradeModule;
             adapter.bootstrap(element, [ng1Module.name]);

             expect(multiTrim(element.textContent)).toBe('Hello, Angular!');
           });
         }));

      it('should support `templateUrl` (function) fetched from `$templateCache`', async(() => {
           // Define `ng1Component`
           const ng1Component: angular.IComponent = {templateUrl: () => 'ng1.component.html'};

           // Define `Ng1ComponentFacade`
           @Directive({selector: 'ng1'})
           class Ng1ComponentFacade extends UpgradeComponent {
             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1', elementRef, injector);
             }
           }

           // Define `Ng2Component`
           @Component({selector: 'ng2', template: '<ng1></ng1>'})
           class Ng2Component {
           }

           // Define `ng1Module`
           const ng1Module =
               angular.module('ng1Module', [])
                   .component('ng1', ng1Component)
                   .directive('ng2', downgradeComponent({component: Ng2Component}))
                   .run(
                       ($templateCache: angular.ITemplateCacheService) =>
                           $templateCache.put('ng1.component.html', 'Hello, Angular!'));

           // Define `Ng2Module`
           @NgModule({
             declarations: [Ng1ComponentFacade, Ng2Component],
             entryComponents: [Ng2Component],
             imports: [BrowserModule, UpgradeModule]
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           platformBrowserDynamic().bootstrapModule(Ng2Module).then(ref => {
             var adapter = ref.injector.get(UpgradeModule) as UpgradeModule;
             adapter.bootstrap(element, [ng1Module.name]);

             expect(multiTrim(element.textContent)).toBe('Hello, Angular!');
           });
         }));

      it('should support not pass any arguments to `templateUrl` function', async(() => {
           // Define `ng1Component`
           const ng1Component: angular.IComponent = {
             templateUrl: ($attrs: angular.IAttributes, $element: angular.IAugmentedJQuery) => {
               expect($attrs).toBeUndefined();
               expect($element).toBeUndefined();

               return 'ng1.component.html';
             }
           };

           // Define `Ng1ComponentFacade`
           @Directive({selector: 'ng1'})
           class Ng1ComponentFacade extends UpgradeComponent {
             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1', elementRef, injector);
             }
           }

           // Define `Ng2Component`
           @Component({selector: 'ng2', template: '<ng1></ng1>'})
           class Ng2Component {
           }

           // Define `ng1Module`
           const ng1Module =
               angular.module('ng1Module', [])
                   .component('ng1', ng1Component)
                   .directive('ng2', downgradeComponent({component: Ng2Component}))
                   .run(
                       ($templateCache: angular.ITemplateCacheService) =>
                           $templateCache.put('ng1.component.html', 'Hello, Angular!'));

           // Define `Ng2Module`
           @NgModule({
             declarations: [Ng1ComponentFacade, Ng2Component],
             entryComponents: [Ng2Component],
             imports: [BrowserModule, UpgradeModule]
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           platformBrowserDynamic().bootstrapModule(Ng2Module).then(ref => {
             var adapter = ref.injector.get(UpgradeModule) as UpgradeModule;
             adapter.bootstrap(element, [ng1Module.name]);

             expect(multiTrim(element.textContent)).toBe('Hello, Angular!');
           });
         }));

      // NOT SUPPORTED YET
      xit('should support `templateUrl` (string) fetched from the server', fakeAsync(() => {
            // Define `ng1Component`
            const ng1Component: angular.IComponent = {templateUrl: 'ng1.component.html'};

            // Define `Ng1ComponentFacade`
            @Directive({selector: 'ng1'})
            class Ng1ComponentFacade extends UpgradeComponent {
              constructor(elementRef: ElementRef, injector: Injector) {
                super('ng1', elementRef, injector);
              }
            }

            // Define `Ng2Component`
            @Component({selector: 'ng2', template: '<ng1></ng1>'})
            class Ng2Component {
            }

            // Define `ng1Module`
            const ng1Module =
                angular.module('ng1Module', [])
                    .component('ng1', ng1Component)
                    .directive('ng2', downgradeComponent({component: Ng2Component}))
                    .value(
                        '$httpBackend',
                        (method: string, url: string, post?: any, callback?: Function) =>
                            setTimeout(
                                () => callback(200, `${method}:${url}`.toLowerCase()), 1000));

            // Define `Ng2Module`
            @NgModule({
              declarations: [Ng1ComponentFacade, Ng2Component],
              entryComponents: [Ng2Component],
              imports: [BrowserModule, UpgradeModule]
            })
            class Ng2Module {
              ngDoBootstrap() {}
            }

            // Bootstrap
            const element = html(`<ng2></ng2>`);

            platformBrowserDynamic().bootstrapModule(Ng2Module).then(ref => {
              var adapter = ref.injector.get(UpgradeModule) as UpgradeModule;
              adapter.bootstrap(element, [ng1Module.name]);

              tick(500);
              expect(multiTrim(element.textContent)).toBe('');

              tick(500);
              expect(multiTrim(element.textContent)).toBe('get:ng1.component.html');
            });
          }));

      // NOT SUPPORTED YET
      xit('should support `templateUrl` (function) fetched from the server', fakeAsync(() => {
            // Define `ng1Component`
            const ng1Component: angular.IComponent = {templateUrl: () => 'ng1.component.html'};

            // Define `Ng1ComponentFacade`
            @Directive({selector: 'ng1'})
            class Ng1ComponentFacade extends UpgradeComponent {
              constructor(elementRef: ElementRef, injector: Injector) {
                super('ng1', elementRef, injector);
              }
            }

            // Define `Ng2Component`
            @Component({selector: 'ng2', template: '<ng1></ng1>'})
            class Ng2Component {
            }

            // Define `ng1Module`
            const ng1Module =
                angular.module('ng1Module', [])
                    .component('ng1', ng1Component)
                    .directive('ng2', downgradeComponent({component: Ng2Component}))
                    .value(
                        '$httpBackend',
                        (method: string, url: string, post?: any, callback?: Function) =>
                            setTimeout(
                                () => callback(200, `${method}:${url}`.toLowerCase()), 1000));

            // Define `Ng2Module`
            @NgModule({
              declarations: [Ng1ComponentFacade, Ng2Component],
              entryComponents: [Ng2Component],
              imports: [BrowserModule, UpgradeModule]
            })
            class Ng2Module {
              ngDoBootstrap() {}
            }

            // Bootstrap
            const element = html(`<ng2></ng2>`);

            platformBrowserDynamic().bootstrapModule(Ng2Module).then(ref => {
              var adapter = ref.injector.get(UpgradeModule) as UpgradeModule;
              adapter.bootstrap(element, [ng1Module.name]);

              tick(500);
              expect(multiTrim(element.textContent)).toBe('');

              tick(500);
              expect(multiTrim(element.textContent)).toBe('get:ng1.component.html');
            });
          }));

      it('should support empty templates', async(() => {
           // Define `ng1Component`s
           const ng1ComponentA: angular.IComponent = {template: ''};
           const ng1ComponentB: angular.IComponent = {template: () => ''};
           const ng1ComponentC: angular.IComponent = {templateUrl: 'ng1.component.html'};
           const ng1ComponentD: angular.IComponent = {templateUrl: () => 'ng1.component.html'};

           // Define `Ng1ComponentFacade`s
           @Directive({selector: 'ng1A'})
           class Ng1ComponentAFacade extends UpgradeComponent {
             constructor(e: ElementRef, i: Injector) { super('ng1A', e, i); }
           }
           @Directive({selector: 'ng1B'})
           class Ng1ComponentBFacade extends UpgradeComponent {
             constructor(e: ElementRef, i: Injector) { super('ng1B', e, i); }
           }
           @Directive({selector: 'ng1C'})
           class Ng1ComponentCFacade extends UpgradeComponent {
             constructor(e: ElementRef, i: Injector) { super('ng1C', e, i); }
           }
           @Directive({selector: 'ng1D'})
           class Ng1ComponentDFacade extends UpgradeComponent {
             constructor(e: ElementRef, i: Injector) { super('ng1D', e, i); }
           }

           // Define `Ng2Component`
           @Component({
             selector: 'ng2',
             template: `
               <ng1A>Ignore this</ng1A>
               <ng1B>Ignore this</ng1B>
               <ng1C>Ignore this</ng1C>
               <ng1D>Ignore this</ng1D>
             `
           })
           class Ng2Component {
           }

           // Define `ng1Module`
           const ng1Module = angular.module('ng1Module', [])
                                 .component('ng1A', ng1ComponentA)
                                 .component('ng1B', ng1ComponentB)
                                 .component('ng1C', ng1ComponentC)
                                 .component('ng1D', ng1ComponentD)
                                 .directive('ng2', downgradeComponent({component: Ng2Component}))
                                 .run(
                                     ($templateCache: angular.ITemplateCacheService) =>
                                         $templateCache.put('ng1.component.html', ''));

           // Define `Ng2Module`
           @NgModule({
             declarations: [
               Ng1ComponentAFacade, Ng1ComponentBFacade, Ng1ComponentCFacade, Ng1ComponentDFacade,
               Ng2Component
             ],
             entryComponents: [Ng2Component],
             imports: [BrowserModule, UpgradeModule],
             schemas: [NO_ERRORS_SCHEMA]
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           platformBrowserDynamic().bootstrapModule(Ng2Module).then(ref => {
             var adapter = ref.injector.get(UpgradeModule) as UpgradeModule;
             adapter.bootstrap(element, [ng1Module.name]);

             expect(multiTrim(element.textContent)).toBe('');
           });
         }));
    });

    describe('bindings', () => {
      it('should support `@` bindings', fakeAsync(() => {
           // Define `ng1Component`
           const ng1Component: angular.IComponent = {
             template: 'Inside: {{ $ctrl.inputA }}, {{ $ctrl.inputB }}',
             bindings: {inputA: '@inputAttrA', inputB: '@'}
           };

           // Define `Ng1ComponentFacade`
           @Directive({selector: 'ng1'})
           class Ng1ComponentFacade extends UpgradeComponent {
             @Input('inputAttrA') inputA: string;
             @Input() inputB: string;

             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1', elementRef, injector);
             }
           }

           // Define `Ng2Component`
           @Component({
             selector: 'ng2',
             template: `
               <ng1 inputAttrA="{{ dataA }}" inputB="{{ dataB }}"></ng1>
               | Outside: {{ dataA }}, {{ dataB }}
             `
           })
           class Ng2Component {
             dataA = 'foo';
             dataB = 'bar';
           }

           // Define `ng1Module`
           const ng1Module = angular.module('ng1Module', [])
                                 .component('ng1', ng1Component)
                                 .directive('ng2', downgradeComponent({component: Ng2Component}));

           // Define `Ng2Module`
           @NgModule({
             declarations: [Ng1ComponentFacade, Ng2Component],
             entryComponents: [Ng2Component],
             imports: [BrowserModule, UpgradeModule]
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           platformBrowserDynamic().bootstrapModule(Ng2Module).then(ref => {
             var adapter = ref.injector.get(UpgradeModule) as UpgradeModule;
             adapter.bootstrap(element, [ng1Module.name]);

             var ng1 = element.querySelector('ng1');
             var ng1Controller = angular.element(ng1).controller('ng1');

             expect(multiTrim(element.textContent)).toBe('Inside: foo, bar | Outside: foo, bar');

             ng1Controller.inputA = 'baz';
             ng1Controller.inputB = 'qux';
             tick();

             expect(multiTrim(element.textContent)).toBe('Inside: baz, qux | Outside: foo, bar');

             // TODO: Verify that changes in `<ng2>` propagate to `<ng1>`.
           });
         }));

      it('should support `<` bindings', fakeAsync(() => {
           // Define `ng1Component`
           const ng1Component: angular.IComponent = {
             template: 'Inside: {{ $ctrl.inputA.value }}, {{ $ctrl.inputB.value }}',
             bindings: {inputA: '<inputAttrA', inputB: '<'}
           };

           // Define `Ng1ComponentFacade`
           @Directive({selector: 'ng1'})
           class Ng1ComponentFacade extends UpgradeComponent {
             @Input('inputAttrA') inputA: string;
             @Input() inputB: string;

             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1', elementRef, injector);
             }
           }

           // Define `Ng2Component`
           @Component({
             selector: 'ng2',
             template: `
               <ng1 [inputAttrA]="dataA" [inputB]="dataB"></ng1>
               | Outside: {{ dataA.value }}, {{ dataB.value }}
             `
           })
           class Ng2Component {
             dataA = {value: 'foo'};
             dataB = {value: 'bar'};
           }

           // Define `ng1Module`
           const ng1Module = angular.module('ng1Module', [])
                                 .component('ng1', ng1Component)
                                 .directive('ng2', downgradeComponent({component: Ng2Component}));

           // Define `Ng2Module`
           @NgModule({
             declarations: [Ng1ComponentFacade, Ng2Component],
             entryComponents: [Ng2Component],
             imports: [BrowserModule, UpgradeModule]
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           platformBrowserDynamic().bootstrapModule(Ng2Module).then(ref => {
             var adapter = ref.injector.get(UpgradeModule) as UpgradeModule;
             adapter.bootstrap(element, [ng1Module.name]);

             var ng1 = element.querySelector('ng1');
             var ng1Controller = angular.element(ng1).controller('ng1');

             expect(multiTrim(element.textContent)).toBe('Inside: foo, bar | Outside: foo, bar');

             ng1Controller.inputA = {value: 'baz'};
             ng1Controller.inputB = {value: 'qux'};
             tick();

             expect(multiTrim(element.textContent)).toBe('Inside: baz, qux | Outside: foo, bar');

             // TODO: Verify that changes in `<ng2>` propagate to `<ng1>`.
           });
         }));

      it('should support `=` bindings', fakeAsync(() => {
           // Define `ng1Component`
           const ng1Component: angular.IComponent = {
             template: 'Inside: {{ $ctrl.inputA.value }}, {{ $ctrl.inputB.value }}',
             bindings: {inputA: '=inputAttrA', inputB: '='}
           };

           // Define `Ng1ComponentFacade`
           @Directive({selector: 'ng1'})
           class Ng1ComponentFacade extends UpgradeComponent {
             @Input('inputAttrA') inputA: string;
             @Output('inputAttrAChange') inputAChange: EventEmitter<any>;
             @Input() inputB: string;
             @Output() inputBChange: EventEmitter<any>;

             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1', elementRef, injector);
             }
           }

           // Define `Ng2Component`
           @Component({
             selector: 'ng2',
             template: `
               <ng1 [(inputAttrA)]="dataA" [(inputB)]="dataB"></ng1>
               | Outside: {{ dataA.value }}, {{ dataB.value }}
             `
           })
           class Ng2Component {
             dataA = {value: 'foo'};
             dataB = {value: 'bar'};
           }

           // Define `ng1Module`
           const ng1Module = angular.module('ng1Module', [])
                                 .component('ng1', ng1Component)
                                 .directive('ng2', downgradeComponent({component: Ng2Component}));

           // Define `Ng2Module`
           @NgModule({
             declarations: [Ng1ComponentFacade, Ng2Component],
             entryComponents: [Ng2Component],
             imports: [BrowserModule, UpgradeModule]
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           platformBrowserDynamic().bootstrapModule(Ng2Module).then(ref => {
             var adapter = ref.injector.get(UpgradeModule) as UpgradeModule;
             adapter.bootstrap(element, [ng1Module.name]);

             var ng1 = element.querySelector('ng1');
             var ng1Controller = angular.element(ng1).controller('ng1');

             expect(multiTrim(element.textContent)).toBe('Inside: foo, bar | Outside: foo, bar');

             ng1Controller.inputA = {value: 'baz'};
             ng1Controller.inputB = {value: 'qux'};
             tick();

             expect(multiTrim(element.textContent)).toBe('Inside: baz, qux | Outside: baz, qux');

             // TODO: Verify that changes in `<ng2>` propagate to `<ng1>`.
           });
         }));

      it('should support `&` bindings', fakeAsync(() => {
           // Define `ng1Component`
           const ng1Component: angular.IComponent = {
             template: 'Inside: -',
             bindings: {outputA: '&outputAttrA', outputB: '&'}
           };

           // Define `Ng1ComponentFacade`
           @Directive({selector: 'ng1'})
           class Ng1ComponentFacade extends UpgradeComponent {
             @Output('outputAttrA') outputA: EventEmitter<any>;
             @Output() outputB: EventEmitter<any>;

             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1', elementRef, injector);
             }
           }

           // Define `Ng2Component`
           @Component({
             selector: 'ng2',
             template: `
               <ng1 (outputAttrA)="dataA = $event" (outputB)="dataB = $event"></ng1>
               | Outside: {{ dataA }}, {{ dataB }}
             `
           })
           class Ng2Component {
             dataA = 'foo';
             dataB = 'bar';
           }

           // Define `ng1Module`
           const ng1Module = angular.module('ng1Module', [])
                                 .component('ng1', ng1Component)
                                 .directive('ng2', downgradeComponent({component: Ng2Component}));

           // Define `Ng2Module`
           @NgModule({
             declarations: [Ng1ComponentFacade, Ng2Component],
             entryComponents: [Ng2Component],
             imports: [BrowserModule, UpgradeModule]
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           platformBrowserDynamic().bootstrapModule(Ng2Module).then(ref => {
             var adapter = ref.injector.get(UpgradeModule) as UpgradeModule;
             adapter.bootstrap(element, [ng1Module.name]);

             var ng1 = element.querySelector('ng1');
             var ng1Controller = angular.element(ng1).controller('ng1');

             expect(multiTrim(element.textContent)).toBe('Inside: - | Outside: foo, bar');

             ng1Controller.outputA('baz');
             ng1Controller.outputB('qux');
             tick();

             expect(multiTrim(element.textContent)).toBe('Inside: - | Outside: baz, qux');
           });
         }));

      it('should bind properties, events', fakeAsync(() => {
           // Define `ng1Component`
           const ng1Component: angular.IComponent = {
             template: `
               Hello {{ $ctrl.fullName }};
               A: {{ $ctrl.modelA }};
               B: {{ $ctrl.modelB }};
               C: {{ $ctrl.modelC }}
             `,
             bindings: {fullName: '@', modelA: '<dataA', modelB: '=dataB', modelC: '=', event: '&'},
             controller: function($scope: angular.IScope) {
               $scope.$watch('$ctrl.modelB', (v: string) => {
                 if (v === 'Savkin') {
                   this.modelB = 'SAVKIN';
                   this.event('WORKS');

                   // Should not update because `modelA: '<dataA'` is uni-directional.
                   this.modelA = 'VICTOR';

                   // Should not update because `[modelC]` is uni-directional.
                   this.modelC = 'sf';
                 }
               });
             }
           };

           // Define `Ng1ComponentFacade`
           @Directive({selector: 'ng1'})
           class Ng1ComponentFacade extends UpgradeComponent {
             @Input() fullName: string;
             @Input('dataA') modelA: any;
             @Input('dataB') modelB: any;
             @Output('dataBChange') modelBChange: EventEmitter<any>;
             @Input() modelC: any;
             @Output() modelCChange: EventEmitter<any>;
             @Output() event: EventEmitter<any>;

             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1', elementRef, injector);
             }
           }

           // Define `Ng2Component`
           @Component({
             selector: 'ng2',
             template: `
               <ng1 fullName="{{ last }}, {{ first }}, {{ city }}"
                   [(dataA)]="first" [(dataB)]="last" [modelC]="city"
                   (event)="event = $event">
               </ng1> |
               <ng1 fullName="{{ 'TEST' }}" dataA="First" dataB="Last" modelC="City"></ng1> |
               {{ event }} - {{ last }}, {{ first }}, {{ city }}
             `
           })
           class Ng2Component {
             first = 'Victor';
             last = 'Savkin';
             city = 'SF';
             event = '?';
           }

           // Define `ng1Module`
           const ng1Module = angular.module('ng1Module', [])
                                 .component('ng1', ng1Component)
                                 .directive('ng2', downgradeComponent({component: Ng2Component}));

           // Define `Ng2Module`
           @NgModule({
             declarations: [Ng1ComponentFacade, Ng2Component],
             entryComponents: [Ng2Component],
             imports: [BrowserModule, UpgradeModule]
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           platformBrowserDynamic().bootstrapModule(Ng2Module).then(ref => {
             var adapter = ref.injector.get(UpgradeModule) as UpgradeModule;
             adapter.bootstrap(element, [ng1Module.name]);

             expect(multiTrim(element.textContent))
                 .toBe(
                     'Hello Savkin, Victor, SF; A: VICTOR; B: SAVKIN; C: sf | ' +
                     'Hello TEST; A: First; B: Last; C: City | ' +
                     'WORKS - SAVKIN, Victor, SF');

             // Detect changes
             tick();

             expect(multiTrim(element.textContent))
                 .toBe(
                     'Hello SAVKIN, Victor, SF; A: VICTOR; B: SAVKIN; C: sf | ' +
                     'Hello TEST; A: First; B: Last; C: City | ' +
                     'WORKS - SAVKIN, Victor, SF');
           });
         }));

      it('should bind optional properties', fakeAsync(() => {
           // Define `ng1Component`
           const ng1Component: angular.IComponent = {
             template: 'Inside: {{ $ctrl.inputA.value }}, {{ $ctrl.inputB }}',
             bindings:
                 {inputA: '=?inputAttrA', inputB: '=?', outputA: '&?outputAttrA', outputB: '&?'}
           };

           // Define `Ng1ComponentFacade`
           @Directive({selector: 'ng1'})
           class Ng1ComponentFacade extends UpgradeComponent {
             @Input('inputAttrA') inputA: string;
             @Output('inputAttrAChange') inputAChange: EventEmitter<any>;
             @Input() inputB: string;
             @Output() inputBChange: EventEmitter<any>;
             @Output('outputAttrA') outputA: EventEmitter<any>;
             @Output() outputB: EventEmitter<any>;

             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1', elementRef, injector);
             }
           }

           // Define `Ng2Component`
           @Component({
             selector: 'ng2',
             template: `
               <ng1 [(inputAttrA)]="dataA" [(inputB)]="dataB.value"></ng1> |
               <ng1 inputB="Bar" (outputAttrA)="dataA = $event"></ng1> |
               <ng1 (outputB)="updateDataB($event)"></ng1> |
               <ng1></ng1> |
               Outside: {{ dataA.value }}, {{ dataB.value }}
             `
           })
           class Ng2Component {
             dataA = {value: 'foo'};
             dataB = {value: 'bar'};

             updateDataB(value: any) { this.dataB.value = value; }
           }

           // Define `ng1Module`
           const ng1Module = angular.module('ng1Module', [])
                                 .component('ng1', ng1Component)
                                 .directive('ng2', downgradeComponent({component: Ng2Component}));

           // Define `Ng2Module`
           @NgModule({
             declarations: [Ng1ComponentFacade, Ng2Component],
             entryComponents: [Ng2Component],
             imports: [BrowserModule, UpgradeModule]
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           platformBrowserDynamic().bootstrapModule(Ng2Module).then(ref => {
             var adapter = ref.injector.get(UpgradeModule) as UpgradeModule;
             adapter.bootstrap(element, [ng1Module.name]);

             const $rootScope = adapter.$injector.get('$rootScope') as angular.IRootScopeService;

             var ng1s = element.querySelectorAll('ng1');
             var ng1Controller0 = angular.element(ng1s[0]).controller('ng1');
             var ng1Controller1 = angular.element(ng1s[1]).controller('ng1');
             var ng1Controller2 = angular.element(ng1s[2]).controller('ng1');

             expect(multiTrim(element.textContent))
                 .toBe(
                     'Inside: foo, bar | Inside: , Bar | Inside: , | Inside: , | Outside: foo, bar');

             ng1Controller0.inputA.value = 'baz';
             ng1Controller0.inputB = 'qux';
             tick();

             expect(multiTrim(element.textContent))
                 .toBe(
                     'Inside: baz, qux | Inside: , Bar | Inside: , | Inside: , | Outside: baz, qux');

             ng1Controller1.outputA({value: 'foo again'});
             ng1Controller2.outputB('bar again');
             $rootScope.$apply();
             tick();

             expect(ng1Controller0.inputA).toEqual({value: 'foo again'});
             expect(ng1Controller0.inputB).toEqual('bar again');
             expect(multiTrim(element.textContent))
                 .toBe(
                     'Inside: foo again, bar again | Inside: , Bar | Inside: , | Inside: , | ' +
                     'Outside: foo again, bar again');
           });
         }));

      it('should bind properties, events to scope when bindToController is not used',
         fakeAsync(() => {
           // Define `ng1Directive`
           const ng1Directive: angular.IDirective = {
             template: '{{ someText }} - Data: {{ inputA }} - Length: {{ inputA.length }}',
             scope: {inputA: '=', outputA: '&'},
             controller: function($scope: angular.IScope) {
               $scope['someText'] = 'ng1';
               this.$scope = $scope;
             }
           };

           // Define `Ng1ComponentFacade`
           @Directive({selector: '[ng1]'})
           class Ng1ComponentFacade extends UpgradeComponent {
             @Input() inputA: string;
             @Output() inputAChange: EventEmitter<any>;
             @Output() outputA: EventEmitter<any>;

             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1', elementRef, injector);
             }
           }

           // Define `Ng2Component`
           @Component({
             selector: 'ng2',
             template: `
                <div ng1 [(inputA)]="dataA" (outputA)="dataA.push($event)"></div> |
                {{ someText }} - Data: {{ dataA }} - Length: {{ dataA.length }}
              `
           })
           class Ng2Component {
             someText = 'ng2';
             dataA = [1, 2, 3];
           }

           // Define `ng1Module`
           const ng1Module = angular.module('ng1Module', [])
                                 .directive('ng1', () => ng1Directive)
                                 .directive('ng2', downgradeComponent({component: Ng2Component}));

           // Define `Ng2Module`
           @NgModule({
             declarations: [Ng1ComponentFacade, Ng2Component],
             entryComponents: [Ng2Component],
             imports: [BrowserModule, UpgradeModule]
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           platformBrowserDynamic().bootstrapModule(Ng2Module).then(ref => {
             var adapter = ref.injector.get(UpgradeModule) as UpgradeModule;
             adapter.bootstrap(element, [ng1Module.name]);
             const $rootScope = adapter.$injector.get('$rootScope') as angular.IRootScopeService;

             var ng1 = element.querySelector('[ng1]');
             var ng1Controller = angular.element(ng1).controller('ng1');

             expect(multiTrim(element.textContent))
                 .toBe('ng1 - Data: [1,2,3] - Length: 3 | ng2 - Data: 1,2,3 - Length: 3');

             ng1Controller.$scope.inputA = [4, 5];
             tick();

             expect(multiTrim(element.textContent))
                 .toBe('ng1 - Data: [4,5] - Length: 2 | ng2 - Data: 4,5 - Length: 2');

             ng1Controller.$scope.outputA(6);
             tick();
             $rootScope.$apply();

             expect(ng1Controller.$scope.inputA).toEqual([4, 5, 6]);
             expect(multiTrim(element.textContent))
                 .toBe('ng1 - Data: [4,5,6] - Length: 3 | ng2 - Data: 4,5,6 - Length: 3');
           });
         }));
    });

    describe('controller', () => {
      it('should support `controllerAs`', async(() => {
           // Define `ng1Directive`
           const ng1Directive: angular.IDirective = {
             template:
                 '{{ vm.scope }}; {{ vm.isClass }}; {{ vm.hasElement }}; {{ vm.isPublished() }}',
             scope: true,
             controllerAs: 'vm',
             controller: class {
               hasElement: string; isClass: string; scope: string;

               constructor(public $element: angular.IAugmentedJQuery, $scope: angular.IScope) {
                 this.hasElement = $element[0].nodeName;
                 this.scope = $scope.$parent.$parent === $scope.$root ? 'scope' : 'wrong-scope';

                 this.verifyIAmAClass();
               }

               isPublished() {
                 return this.$element.controller('ng1') === this ? 'published' : 'not-published';
               }

               verifyIAmAClass() { this.isClass = 'isClass'; }
             }
           };

           // Define `Ng1ComponentFacade`
           @Directive({selector: 'ng1'})
           class Ng1ComponentFacade extends UpgradeComponent {
             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1', elementRef, injector);
             }
           }

           // Define `Ng2Component`
           @Component({selector: 'ng2', template: '<ng1></ng1>'})
           class Ng2Component {
           }

           // Define `ng1Module`
           const ng1Module = angular.module('ng1Module', [])
                                 .directive('ng1', () => ng1Directive)
                                 .directive('ng2', downgradeComponent({component: Ng2Component}));

           // Define `Ng2Module`
           @NgModule({
             declarations: [Ng1ComponentFacade, Ng2Component],
             entryComponents: [Ng2Component],
             imports: [BrowserModule, UpgradeModule]
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           platformBrowserDynamic().bootstrapModule(Ng2Module).then(ref => {
             var adapter = ref.injector.get(UpgradeModule) as UpgradeModule;
             adapter.bootstrap(element, [ng1Module.name]);

             expect(multiTrim(document.body.textContent)).toBe('scope; isClass; NG1; published');
           });
         }));

      it('should support `bindToController` (boolean)', async(() => {
           // Define `ng1Directive`
           const ng1DirectiveA: angular.IDirective = {
             template: 'Scope: {{ title }}; Controller: {{ $ctrl.title }}',
             scope: {title: '@'},
             bindToController: false,
             controllerAs: '$ctrl',
             controller: class {}
           };

           const ng1DirectiveB: angular.IDirective = {
             template: 'Scope: {{ title }}; Controller: {{ $ctrl.title }}',
             scope: {title: '@'},
             bindToController: true,
             controllerAs: '$ctrl',
             controller: class {}
           };

           // Define `Ng1ComponentFacade`
           @Directive({selector: 'ng1A'})
           class Ng1ComponentAFacade extends UpgradeComponent {
             @Input() title: string;

             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1A', elementRef, injector);
             }
           }

           @Directive({selector: 'ng1B'})
           class Ng1ComponentBFacade extends UpgradeComponent {
             @Input() title: string;

             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1B', elementRef, injector);
             }
           }

           // Define `Ng2Component`
           @Component({
             selector: 'ng2',
             template: `
            <ng1A title="WORKS"></ng1A> |
            <ng1B title="WORKS"></ng1B>
          `
           })
           class Ng2Component {
           }

           // Define `ng1Module`
           const ng1Module = angular.module('ng1Module', [])
                                 .directive('ng1A', () => ng1DirectiveA)
                                 .directive('ng1B', () => ng1DirectiveB)
                                 .directive('ng2', downgradeComponent({component: Ng2Component}));

           // Define `Ng2Module`
           @NgModule({
             declarations: [Ng1ComponentAFacade, Ng1ComponentBFacade, Ng2Component],
             entryComponents: [Ng2Component],
             imports: [BrowserModule, UpgradeModule],
             schemas: [NO_ERRORS_SCHEMA]
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           platformBrowserDynamic().bootstrapModule(Ng2Module).then(ref => {
             var adapter = ref.injector.get(UpgradeModule) as UpgradeModule;
             adapter.bootstrap(element, [ng1Module.name]);

             expect(multiTrim(document.body.textContent))
                 .toBe('Scope: WORKS; Controller: | Scope: ; Controller: WORKS');
           });
         }));

      it('should support `bindToController` (object)', async(() => {
           // Define `ng1Directive`
           const ng1Directive: angular.IDirective = {
             template: '{{ $ctrl.title }}',
             scope: {},
             bindToController: {title: '@'},
             controllerAs: '$ctrl',
             controller: class {}
           };

           // Define `Ng1ComponentFacade`
           @Directive({selector: 'ng1'})
           class Ng1ComponentFacade extends UpgradeComponent {
             @Input() title: string;

             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1', elementRef, injector);
             }
           }

           // Define `Ng2Component`
           @Component({selector: 'ng2', template: '<ng1 title="WORKS"></ng1>'})
           class Ng2Component {
             dataA = 'foo';
             dataB = 'bar';
           }

           // Define `ng1Module`
           const ng1Module = angular.module('ng1Module', [])
                                 .directive('ng1', () => ng1Directive)
                                 .directive('ng2', downgradeComponent({component: Ng2Component}));

           // Define `Ng2Module`
           @NgModule({
             declarations: [Ng1ComponentFacade, Ng2Component],
             entryComponents: [Ng2Component],
             imports: [BrowserModule, UpgradeModule]
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           platformBrowserDynamic().bootstrapModule(Ng2Module).then(ref => {
             var adapter = ref.injector.get(UpgradeModule) as UpgradeModule;
             adapter.bootstrap(element, [ng1Module.name]);

             expect(multiTrim(document.body.textContent)).toBe('WORKS');
           });
         }));

      it('should support `controller` as string', async(() => {
           // Define `ng1Directive`
           const ng1Directive: angular.IDirective = {
             template: '{{ $ctrl.title }} {{ $ctrl.text }}',
             scope: {title: '@'},
             bindToController: true,
             controller: 'Ng1Controller as $ctrl'
           };

           // Define `Ng1ComponentFacade`
           @Directive({selector: 'ng1'})
           class Ng1ComponentFacade extends UpgradeComponent {
             @Input() title: string;

             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1', elementRef, injector);
             }
           }

           // Define `Ng2Component`
           @Component({selector: 'ng2', template: '<ng1 title="WORKS"></ng1>'})
           class Ng2Component {
           }

           // Define `ng1Module`
           const ng1Module = angular.module('ng1Module', [])
                                 .controller('Ng1Controller', class { text = 'GREAT'; })
                                 .directive('ng1', () => ng1Directive)
                                 .directive('ng2', downgradeComponent({component: Ng2Component}));

           // Define `Ng2Module`
           @NgModule({
             declarations: [Ng1ComponentFacade, Ng2Component],
             entryComponents: [Ng2Component],
             imports: [BrowserModule, UpgradeModule]
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           platformBrowserDynamic().bootstrapModule(Ng2Module).then(ref => {
             var adapter = ref.injector.get(UpgradeModule) as UpgradeModule;
             adapter.bootstrap(element, [ng1Module.name]);

             expect(multiTrim(document.body.textContent)).toBe('WORKS GREAT');
           });
         }));
    });

    // NOT YET SUPPORTED
    xdescribe(
        'require',
        () => {
            // it('should support single require in linking fn', async(() => {
            //   const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
            //   const ng1Module = angular.module('ng1', []);

            //   const ng1 = ($rootScope: any /** TODO #9100 */) => {
            //     return {
            //       scope: {title: '@'},
            //       bindToController: true,
            //       template: '{{ctl.status}}',
            //       require: 'ng1',
            //       controllerAs: 'ctrl',
            //       controller: Class({constructor: function() { this.status = 'WORKS'; }}),
            //       link: function(
            //           scope: any /** TODO #9100 */, element: any /** TODO #9100 */,
            //           attrs: any /** TODO #9100 */, linkController: any /** TODO #9100 */) {
            //         expect(scope.$root).toEqual($rootScope);
            //         expect(element[0].nodeName).toEqual('NG1');
            //         expect(linkController.status).toEqual('WORKS');
            //         scope.ctl = linkController;
            //       }
            //     };
            //   };
            //   ng1Module.directive('ng1', ng1);

            //   const Ng2 = Component({selector: 'ng2', template: '<ng1></ng1>'}).Class({
            //     constructor: function() {}
            //   });

            //   const Ng2Module = NgModule({
            //                       declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
            //                       imports: [BrowserModule],
            //                       schemas: [NO_ERRORS_SCHEMA],
            //                     }).Class({constructor: function() {}});

            //   ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
            //   const element = html(`<div><ng2></ng2></div>`);
            //   adapter.bootstrap(element, ['ng1']).ready((ref) => {
            //     expect(multiTrim(document.body.textContent)).toEqual('WORKS');
            //     ref.dispose();
            //   });
            // }));

            // it('should support array require in linking fn', async(() => {
            //   const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
            //   const ng1Module = angular.module('ng1', []);

            //   const parent = () => {
            //     return {controller: Class({constructor: function() { this.parent = 'PARENT';
            //     }})};
            //   };
            //   const ng1 = () => {
            //     return {
            //       scope: {title: '@'},
            //       bindToController: true,
            //       template: '{{parent.parent}}:{{ng1.status}}',
            //       require: ['ng1', '^parent', '?^^notFound'],
            //       controllerAs: 'ctrl',
            //       controller: Class({constructor: function() { this.status = 'WORKS'; }}),
            //       link: function(
            //           scope: any /** TODO #9100 */, element: any /** TODO #9100 */,
            //           attrs: any /** TODO #9100 */, linkControllers: any /** TODO #9100 */) {
            //         expect(linkControllers[0].status).toEqual('WORKS');
            //         expect(linkControllers[1].parent).toEqual('PARENT');
            //         expect(linkControllers[2]).toBe(undefined);
            //         scope.ng1 = linkControllers[0];
            //         scope.parent = linkControllers[1];
            //       }
            //     };
            //   };
            //   ng1Module.directive('parent', parent);
            //   ng1Module.directive('ng1', ng1);

            //   const Ng2 = Component({selector: 'ng2', template: '<ng1></ng1>'}).Class({
            //     constructor: function() {}
            //   });

            //   const Ng2Module = NgModule({
            //                       declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
            //                       imports: [BrowserModule],
            //                       schemas: [NO_ERRORS_SCHEMA],
            //                     }).Class({constructor: function() {}});

            //   ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
            //   const element = html(`<div><parent><ng2></ng2></parent></div>`);
            //   adapter.bootstrap(element, ['ng1']).ready((ref) => {
            //     expect(multiTrim(document.body.textContent)).toEqual('PARENT:WORKS');
            //     ref.dispose();
            //   });
            // }));
        });

    describe('lifecycle hooks', () => {
      xit('should call `$onChanges()` on controller', () => {});
      xit('should call `$onChanges()` on scope', () => {});

      it('should call `$onInit()` on controller', async(() => {
           // Define `ng1Directive`
           const ng1DirectiveA: angular.IDirective = {
             template: 'Called: {{ called }}',
             bindToController: false,
             controller: class {
               constructor(private $scope: angular.IScope) { $scope['called'] = 'no'; }

               $onInit() { this.$scope['called'] = 'yes'; }
             }
           };

           const ng1DirectiveB: angular.IDirective = {
             template: 'Called: {{ called }}',
             bindToController: true,
             controller: class {
               constructor(private $scope: angular.IScope) { $scope['called'] = 'no'; }

               $onInit() { this.$scope['called'] = 'yes'; }
             }
           };

           // Define `Ng1ComponentFacade`
           @Directive({selector: 'ng1A'})
           class Ng1ComponentAFacade extends UpgradeComponent {
             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1A', elementRef, injector);
             }
           }

           @Directive({selector: 'ng1B'})
           class Ng1ComponentBFacade extends UpgradeComponent {
             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1B', elementRef, injector);
             }
           }

           // Define `Ng2Component`
           @Component({selector: 'ng2', template: '<ng1A></ng1A> | <ng1B></ng1B>'})
           class Ng2Component {
           }

           // Define `ng1Module`
           const ng1Module = angular.module('ng1Module', [])
                                 .directive('ng1A', () => ng1DirectiveA)
                                 .directive('ng1B', () => ng1DirectiveB)
                                 .directive('ng2', downgradeComponent({component: Ng2Component}));

           // Define `Ng2Module`
           @NgModule({
             declarations: [Ng1ComponentAFacade, Ng1ComponentBFacade, Ng2Component],
             entryComponents: [Ng2Component],
             imports: [BrowserModule, UpgradeModule]
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           platformBrowserDynamic().bootstrapModule(Ng2Module).then(ref => {
             var adapter = ref.injector.get(UpgradeModule) as UpgradeModule;
             adapter.bootstrap(element, [ng1Module.name]);

             expect(multiTrim(document.body.textContent)).toBe('Called: yes | Called: yes');
           });
         }));

      it('should not call `$onInit()` on scope', async(() => {
           // Define `ng1Directive`
           const ng1DirectiveA: angular.IDirective = {
             template: 'Called: {{ called }}',
             bindToController: false,
             controller: class {
               constructor($scope: angular.IScope) {
                 $scope['called'] = 'no';
                 $scope['$onInit'] = () => $scope['called'] = 'yes';
               }
             }
           };

           const ng1DirectiveB: angular.IDirective = {
             template: 'Called: {{ called }}',
             bindToController: true,
             controller: class {
               constructor($scope: angular.IScope) {
                 $scope['called'] = 'no';
                 $scope['$onInit'] = () => $scope['called'] = 'yes';
               }
             }
           };

           // Define `Ng1ComponentFacade`
           @Directive({selector: 'ng1A'})
           class Ng1ComponentAFacade extends UpgradeComponent {
             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1A', elementRef, injector);
             }
           }

           @Directive({selector: 'ng1B'})
           class Ng1ComponentBFacade extends UpgradeComponent {
             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1B', elementRef, injector);
             }
           }

           // Define `Ng2Component`
           @Component({selector: 'ng2', template: '<ng1A></ng1A> | <ng1B></ng1B>'})
           class Ng2Component {
           }

           // Define `ng1Module`
           const ng1Module = angular.module('ng1Module', [])
                                 .directive('ng1A', () => ng1DirectiveA)
                                 .directive('ng1B', () => ng1DirectiveB)
                                 .directive('ng2', downgradeComponent({component: Ng2Component}));

           // Define `Ng2Module`
           @NgModule({
             declarations: [Ng1ComponentAFacade, Ng1ComponentBFacade, Ng2Component],
             entryComponents: [Ng2Component],
             imports: [BrowserModule, UpgradeModule]
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           platformBrowserDynamic().bootstrapModule(Ng2Module).then(ref => {
             var adapter = ref.injector.get(UpgradeModule) as UpgradeModule;
             adapter.bootstrap(element, [ng1Module.name]);

             expect(multiTrim(document.body.textContent)).toBe('Called: no | Called: no');
           });
         }));

      xit('should call `$onPostDigest()` on controller', () => {});
      xit('should not call `$onPostDigest()` on scope', () => {});

      xit('should call `$onDestroy()` on controller', () => {});
      xit('should not call `$onDestroy()` on scope', () => {});
    });

    // it('should support ng2 > ng1 > ng2', async(() => {
    //   const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
    //   const ng1Module = angular.module('ng1', []);

    //   const ng1 = {
    //     template: 'ng1(<ng2b></ng2b>)',
    //   };
    //   ng1Module.component('ng1', ng1);

    //   const Ng2a = Component({selector: 'ng2a', template: 'ng2a(<ng1></ng1>)'}).Class({
    //     constructor: function() {}
    //   });
    //   ng1Module.directive('ng2a', adapter.downgradeNg2Component(Ng2a));

    //   const Ng2b =
    //       Component({selector: 'ng2b', template: 'ng2b'}).Class({constructor: function() {}});
    //   ng1Module.directive('ng2b', adapter.downgradeNg2Component(Ng2b));

    //   const Ng2Module = NgModule({
    //                       declarations: [adapter.upgradeNg1Component('ng1'), Ng2a, Ng2b],
    //                       imports: [BrowserModule],
    //                       schemas: [NO_ERRORS_SCHEMA],
    //                     }).Class({constructor: function() {}});

    //   const element = html(`<div><ng2a></ng2a></div>`);
    //   adapter.bootstrap(element, ['ng1']).ready((ref) => {
    //     expect(multiTrim(document.body.textContent)).toEqual('ng2a(ng1(ng2b))');
    //   });
    // }));
  });
}
