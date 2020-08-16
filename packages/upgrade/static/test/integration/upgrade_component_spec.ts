/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, destroyPlatform, Directive, ElementRef, EventEmitter, Inject, Injector, Input, NgModule, NO_ERRORS_SCHEMA, Output, SimpleChanges} from '@angular/core';
import {fakeAsync, tick, waitForAsync} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import * as angular from '../../../src/common/src/angular1';
import {$EXCEPTION_HANDLER, $SCOPE} from '../../../src/common/src/constants';
import {html, multiTrim, withEachNg1Version} from '../../../src/common/test/helpers/common_test_helpers';
import {downgradeComponent, UpgradeComponent, UpgradeModule} from '../../index';

import {$digest, bootstrap} from './static_test_helpers';


withEachNg1Version(() => {
  describe('upgrade ng1 component', () => {
    beforeEach(() => destroyPlatform());
    afterEach(() => destroyPlatform());

    describe('template/templateUrl', () => {
      it('should support `template` (string)', waitForAsync(() => {
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
           const ng1Module = angular.module_('ng1Module', [])
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

      it('should support `template` (function)', waitForAsync(() => {
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
           const ng1Module = angular.module_('ng1Module', [])
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

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
             expect(multiTrim(element.textContent)).toBe('Hello, Angular!');
           });
         }));

      it('should pass $element to `template` function and not $attrs', waitForAsync(() => {
           // Define `ng1Component`
           const ng1Component: angular.IComponent = {
             template: ($attrs: angular.IAttributes, $element: angular.IAugmentedJQuery) => {
               expect($attrs).toBeUndefined();
               expect($element).toBeDefined();

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
           const ng1Module = angular.module_('ng1Module', [])
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

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
             expect(multiTrim(element.textContent)).toBe('Hello, Angular!');
           });
         }));

      it('should support `templateUrl` (string) fetched from `$templateCache`', waitForAsync(() => {
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
               angular.module_('ng1Module', [])
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

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
             expect(multiTrim(element.textContent)).toBe('Hello, Angular!');
           });
         }));

      it('should support `templateUrl` (function) fetched from `$templateCache`',
         waitForAsync(() => {
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
               angular.module_('ng1Module', [])
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

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
             expect(multiTrim(element.textContent)).toBe('Hello, Angular!');
           });
         }));

      it('should pass $element to `templateUrl` function and not $attrs', waitForAsync(() => {
           // Define `ng1Component`
           const ng1Component: angular.IComponent = {
             templateUrl: ($attrs: angular.IAttributes, $element: angular.IAugmentedJQuery) => {
               expect($attrs).toBeUndefined();
               expect($element).toBeDefined();

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
               angular.module_('ng1Module', [])
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

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
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
                angular.module_('ng1Module', [])
                    .component('ng1', ng1Component)
                    .directive('ng2', downgradeComponent({component: Ng2Component}))
                    .value(
                        '$httpBackend',
                        (method: string, url: string, post?: any, callback?: Function) =>
                            setTimeout(
                                () => callback!(200, `${method}:${url}`.toLowerCase()), 1000));

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

            bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
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
                angular.module_('ng1Module', [])
                    .component('ng1', ng1Component)
                    .directive('ng2', downgradeComponent({component: Ng2Component}))
                    .value(
                        '$httpBackend',
                        (method: string, url: string, post?: any, callback?: Function) =>
                            setTimeout(
                                () => callback!(200, `${method}:${url}`.toLowerCase()), 1000));

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

            bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
              tick(500);
              expect(multiTrim(element.textContent)).toBe('');

              tick(500);
              expect(multiTrim(element.textContent)).toBe('get:ng1.component.html');
            });
          }));

      it('should support empty templates', waitForAsync(() => {
           // Define `ng1Component`s
           const ng1ComponentA: angular.IComponent = {template: ''};
           const ng1ComponentB: angular.IComponent = {template: () => ''};
           const ng1ComponentC: angular.IComponent = {templateUrl: 'ng1.component.html'};
           const ng1ComponentD: angular.IComponent = {templateUrl: () => 'ng1.component.html'};

           // Define `Ng1ComponentFacade`s
           @Directive({selector: 'ng1A'})
           class Ng1ComponentAFacade extends UpgradeComponent {
             constructor(e: ElementRef, i: Injector) {
               super('ng1A', e, i);
             }
           }
           @Directive({selector: 'ng1B'})
           class Ng1ComponentBFacade extends UpgradeComponent {
             constructor(e: ElementRef, i: Injector) {
               super('ng1B', e, i);
             }
           }
           @Directive({selector: 'ng1C'})
           class Ng1ComponentCFacade extends UpgradeComponent {
             constructor(e: ElementRef, i: Injector) {
               super('ng1C', e, i);
             }
           }
           @Directive({selector: 'ng1D'})
           class Ng1ComponentDFacade extends UpgradeComponent {
             constructor(e: ElementRef, i: Injector) {
               super('ng1D', e, i);
             }
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
           const ng1Module = angular.module_('ng1Module', [])
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

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
             expect(multiTrim(element.textContent)).toBe('');
           });
         }));
    });

    describe('bindings', () => {
      it('should support `@` bindings', fakeAsync(() => {
           let ng2ComponentInstance: Ng2Component;

           // Define `ng1Component`
           const ng1Component: angular.IComponent = {
             template: 'Inside: {{ $ctrl.inputA }}, {{ $ctrl.inputB }}',
             bindings: {inputA: '@inputAttrA', inputB: '@'}
           };

           // Define `Ng1ComponentFacade`
           @Directive({selector: 'ng1'})
           class Ng1ComponentFacade extends UpgradeComponent {
             // TODO(issue/24571): remove '!'.
             @Input('inputAttrA') inputA!: string;
             // TODO(issue/24571): remove '!'.
             @Input() inputB!: string;

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

             constructor() {
               ng2ComponentInstance = this;
             }
           }

           // Define `ng1Module`
           const ng1Module = angular.module_('ng1Module', [])
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

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(adapter => {
             const ng1 = element.querySelector('ng1')!;
             const ng1Controller = angular.element(ng1).controller!('ng1');

             expect(multiTrim(element.textContent)).toBe('Inside: foo, bar | Outside: foo, bar');

             ng1Controller.inputA = 'baz';
             ng1Controller.inputB = 'qux';
             tick();

             expect(multiTrim(element.textContent)).toBe('Inside: baz, qux | Outside: foo, bar');

             ng2ComponentInstance.dataA = 'foo2';
             ng2ComponentInstance.dataB = 'bar2';
             $digest(adapter);
             tick();

             expect(multiTrim(element.textContent))
                 .toBe('Inside: foo2, bar2 | Outside: foo2, bar2');
           });
         }));

      it('should support `<` bindings', fakeAsync(() => {
           let ng2ComponentInstance: Ng2Component;

           // Define `ng1Component`
           const ng1Component: angular.IComponent = {
             template: 'Inside: {{ $ctrl.inputA.value }}, {{ $ctrl.inputB.value }}',
             bindings: {inputA: '<inputAttrA', inputB: '<'}
           };

           // Define `Ng1ComponentFacade`
           @Directive({selector: 'ng1'})
           class Ng1ComponentFacade extends UpgradeComponent {
             // TODO(issue/24571): remove '!'.
             @Input('inputAttrA') inputA!: string;
             // TODO(issue/24571): remove '!'.
             @Input() inputB!: string;

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

             constructor() {
               ng2ComponentInstance = this;
             }
           }

           // Define `ng1Module`
           const ng1Module = angular.module_('ng1Module', [])
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

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(adapter => {
             const ng1 = element.querySelector('ng1')!;
             const ng1Controller = angular.element(ng1).controller!('ng1');

             expect(multiTrim(element.textContent)).toBe('Inside: foo, bar | Outside: foo, bar');

             ng1Controller.inputA = {value: 'baz'};
             ng1Controller.inputB = {value: 'qux'};
             tick();

             expect(multiTrim(element.textContent)).toBe('Inside: baz, qux | Outside: foo, bar');

             ng2ComponentInstance.dataA = {value: 'foo2'};
             ng2ComponentInstance.dataB = {value: 'bar2'};
             $digest(adapter);
             tick();

             expect(multiTrim(element.textContent))
                 .toBe('Inside: foo2, bar2 | Outside: foo2, bar2');
           });
         }));

      it('should support `=` bindings', fakeAsync(() => {
           let ng2ComponentInstance: Ng2Component;

           // Define `ng1Component`
           const ng1Component: angular.IComponent = {
             template: 'Inside: {{ $ctrl.inputA.value }}, {{ $ctrl.inputB.value }}',
             bindings: {inputA: '=inputAttrA', inputB: '='}
           };

           // Define `Ng1ComponentFacade`
           @Directive({selector: 'ng1'})
           class Ng1ComponentFacade extends UpgradeComponent {
             // TODO(issue/24571): remove '!'.
             @Input('inputAttrA') inputA!: string;
             // TODO(issue/24571): remove '!'.
             @Output('inputAttrAChange') inputAChange!: EventEmitter<any>;
             // TODO(issue/24571): remove '!'.
             @Input() inputB!: string;
             // TODO(issue/24571): remove '!'.
             @Output() inputBChange!: EventEmitter<any>;

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

             constructor() {
               ng2ComponentInstance = this;
             }
           }

           // Define `ng1Module`
           const ng1Module = angular.module_('ng1Module', [])
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

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(adapter => {
             const ng1 = element.querySelector('ng1')!;
             const ng1Controller = angular.element(ng1).controller!('ng1');

             expect(multiTrim(element.textContent)).toBe('Inside: foo, bar | Outside: foo, bar');

             ng1Controller.inputA = {value: 'baz'};
             ng1Controller.inputB = {value: 'qux'};
             tick();

             expect(multiTrim(element.textContent)).toBe('Inside: baz, qux | Outside: baz, qux');

             ng2ComponentInstance.dataA = {value: 'foo2'};
             ng2ComponentInstance.dataB = {value: 'bar2'};
             $digest(adapter);
             tick();

             expect(multiTrim(element.textContent))
                 .toBe('Inside: foo2, bar2 | Outside: foo2, bar2');
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
             // TODO(issue/24571): remove '!'.
             @Output('outputAttrA') outputA!: EventEmitter<any>;
             // TODO(issue/24571): remove '!'.
             @Output() outputB!: EventEmitter<any>;

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
           const ng1Module = angular.module_('ng1Module', [])
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

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
             const ng1 = element.querySelector('ng1')!;
             const ng1Controller = angular.element(ng1).controller!('ng1');

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
             controller: function(this: any, $scope: angular.IScope) {
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
             // TODO(issue/24571): remove '!'.
             @Input() fullName!: string;
             @Input('dataA') modelA: any;
             @Input('dataB') modelB: any;
             // TODO(issue/24571): remove '!'.
             @Output('dataBChange') modelBChange!: EventEmitter<any>;
             @Input() modelC: any;
             // TODO(issue/24571): remove '!'.
             @Output() modelCChange!: EventEmitter<any>;
             // TODO(issue/24571): remove '!'.
             @Output() event!: EventEmitter<any>;

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
           const ng1Module = angular.module_('ng1Module', [])
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

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
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
             // TODO(issue/24571): remove '!'.
             @Input('inputAttrA') inputA!: string;
             // TODO(issue/24571): remove '!'.
             @Output('inputAttrAChange') inputAChange!: EventEmitter<any>;
             // TODO(issue/24571): remove '!'.
             @Input() inputB!: string;
             // TODO(issue/24571): remove '!'.
             @Output() inputBChange!: EventEmitter<any>;
             // TODO(issue/24571): remove '!'.
             @Output('outputAttrA') outputA!: EventEmitter<any>;
             // TODO(issue/24571): remove '!'.
             @Output() outputB!: EventEmitter<any>;

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

             updateDataB(value: any) {
               this.dataB.value = value;
             }
           }

           // Define `ng1Module`
           const ng1Module = angular.module_('ng1Module', [])
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

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(adapter => {
             const ng1s = element.querySelectorAll('ng1')!;
             const ng1Controller0 = angular.element(ng1s[0]).controller!('ng1');
             const ng1Controller1 = angular.element(ng1s[1]).controller!('ng1');
             const ng1Controller2 = angular.element(ng1s[2]).controller!('ng1');

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
             $digest(adapter);
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
             controller: function(this: any, $scope: angular.IScope) {
               $scope['someText'] = 'ng1';
               this.$scope = $scope;
             }
           };

           // Define `Ng1ComponentFacade`
           @Directive({selector: '[ng1]'})
           class Ng1ComponentFacade extends UpgradeComponent {
             // TODO(issue/24571): remove '!'.
             @Input() inputA!: string;
             // TODO(issue/24571): remove '!'.
             @Output() inputAChange!: EventEmitter<any>;
             // TODO(issue/24571): remove '!'.
             @Output() outputA!: EventEmitter<any>;

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
           const ng1Module = angular.module_('ng1Module', [])
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

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(adapter => {
             const ng1 = element.querySelector('[ng1]')!;
             const ng1Controller = angular.element(ng1).controller!('ng1');

             expect(multiTrim(element.textContent))
                 .toBe('ng1 - Data: [1,2,3] - Length: 3 | ng2 - Data: 1,2,3 - Length: 3');

             ng1Controller.$scope.inputA = [4, 5];
             tick();

             expect(multiTrim(element.textContent))
                 .toBe('ng1 - Data: [4,5] - Length: 2 | ng2 - Data: 4,5 - Length: 2');

             ng1Controller.$scope.outputA(6);
             $digest(adapter);
             tick();

             expect(ng1Controller.$scope.inputA).toEqual([4, 5, 6]);
             expect(multiTrim(element.textContent))
                 .toBe('ng1 - Data: [4,5,6] - Length: 3 | ng2 - Data: 4,5,6 - Length: 3');
           });
         }));
    });

    describe('compiling', () => {
      it('should compile the ng1 template in the correct DOM context', waitForAsync(() => {
           let grandParentNodeName: string;

           // Define `ng1Component`
           const ng1ComponentA: angular.IComponent = {template: 'ng1A(<ng1-b></ng1-b>)'};
           const ng1DirectiveB: angular.IDirective = {
             compile: tElem => {
               grandParentNodeName = tElem.parent!().parent!()[0].nodeName;
               return {};
             }
           };

           // Define `Ng1ComponentAFacade`
           @Directive({selector: 'ng1A'})
           class Ng1ComponentAFacade extends UpgradeComponent {
             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1A', elementRef, injector);
             }
           }

           // Define `Ng2ComponentX`
           @Component({selector: 'ng2-x', template: 'ng2X(<ng1A></ng1A>)'})
           class Ng2ComponentX {
           }

           // Define `ng1Module`
           const ng1Module = angular.module_('ng1', [])
                                 .component('ng1A', ng1ComponentA)
                                 .directive('ng1B', () => ng1DirectiveB)
                                 .directive('ng2X', downgradeComponent({component: Ng2ComponentX}));

           // Define `Ng2Module`
           @NgModule({
             imports: [BrowserModule, UpgradeModule],
             declarations: [Ng1ComponentAFacade, Ng2ComponentX],
             entryComponents: [Ng2ComponentX],
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2-x></ng2-x>`);

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
             expect(grandParentNodeName).toBe('NG2-X');
           });
         }));
    });

    describe('linking', () => {
      it('should run the pre-linking after instantiating the controller', waitForAsync(() => {
           const log: string[] = [];

           // Define `ng1Directive`
           const ng1Directive: angular.IDirective = {
             template: '',
             link: {pre: () => log.push('ng1-pre')},
             controller: class {
               constructor() {
                 log.push('ng1-ctrl');
               }
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
           const ng1Module = angular.module_('ng1', [])
                                 .directive('ng1', () => ng1Directive)
                                 .directive('ng2', downgradeComponent({component: Ng2Component}));

           // Define `Ng2Module`
           @NgModule({
             imports: [BrowserModule, UpgradeModule],
             declarations: [Ng1ComponentFacade, Ng2Component],
             entryComponents: [Ng2Component],
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
             expect(log).toEqual(['ng1-ctrl', 'ng1-pre']);
           });
         }));

      it('should run the pre-linking function before linking', waitForAsync(() => {
           const log: string[] = [];

           // Define `ng1Directive`
           const ng1DirectiveA: angular.IDirective = {
             template: '<ng1-b></ng1-b>',
             link: {pre: () => log.push('ng1A-pre')}
           };

           const ng1DirectiveB: angular.IDirective = {link: () => log.push('ng1B-post')};

           // Define `Ng1ComponentAFacade`
           @Directive({selector: 'ng1A'})
           class Ng1ComponentAFacade extends UpgradeComponent {
             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1A', elementRef, injector);
             }
           }

           // Define `Ng2Component`
           @Component({selector: 'ng2', template: '<ng1A></ng1A>'})
           class Ng2Component {
           }

           // Define `ng1Module`
           const ng1Module = angular.module_('ng1', [])
                                 .directive('ng1A', () => ng1DirectiveA)
                                 .directive('ng1B', () => ng1DirectiveB)
                                 .directive('ng2', downgradeComponent({component: Ng2Component}));

           // Define `Ng2Module`
           @NgModule({
             imports: [BrowserModule, UpgradeModule],
             declarations: [Ng1ComponentAFacade, Ng2Component],
             entryComponents: [Ng2Component],
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
             expect(log).toEqual(['ng1A-pre', 'ng1B-post']);
           });
         }));

      it('should run the post-linking function after linking (link: object)', waitForAsync(() => {
           const log: string[] = [];

           // Define `ng1Directive`
           const ng1DirectiveA: angular.IDirective = {
             template: '<ng1-b></ng1-b>',
             link: {post: () => log.push('ng1A-post')}
           };

           const ng1DirectiveB: angular.IDirective = {link: () => log.push('ng1B-post')};

           // Define `Ng1ComponentAFacade`
           @Directive({selector: 'ng1A'})
           class Ng1ComponentAFacade extends UpgradeComponent {
             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1A', elementRef, injector);
             }
           }

           // Define `Ng2Component`
           @Component({selector: 'ng2', template: '<ng1A></ng1A>'})
           class Ng2Component {
           }

           // Define `ng1Module`
           const ng1Module = angular.module_('ng1', [])
                                 .directive('ng1A', () => ng1DirectiveA)
                                 .directive('ng1B', () => ng1DirectiveB)
                                 .directive('ng2', downgradeComponent({component: Ng2Component}));

           // Define `Ng2Module`
           @NgModule({
             imports: [BrowserModule, UpgradeModule],
             declarations: [Ng1ComponentAFacade, Ng2Component],
             entryComponents: [Ng2Component],
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
             expect(log).toEqual(['ng1B-post', 'ng1A-post']);
           });
         }));

      it('should run the post-linking function after linking (link: function)', waitForAsync(() => {
           const log: string[] = [];

           // Define `ng1Directive`
           const ng1DirectiveA: angular.IDirective = {
             template: '<ng1-b></ng1-b>',
             link: () => log.push('ng1A-post')
           };

           const ng1DirectiveB: angular.IDirective = {link: () => log.push('ng1B-post')};

           // Define `Ng1ComponentAFacade`
           @Directive({selector: 'ng1A'})
           class Ng1ComponentAFacade extends UpgradeComponent {
             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1A', elementRef, injector);
             }
           }

           // Define `Ng2Component`
           @Component({selector: 'ng2', template: '<ng1A></ng1A>'})
           class Ng2Component {
           }

           // Define `ng1Module`
           const ng1Module = angular.module_('ng1', [])
                                 .directive('ng1A', () => ng1DirectiveA)
                                 .directive('ng1B', () => ng1DirectiveB)
                                 .directive('ng2', downgradeComponent({component: Ng2Component}));

           // Define `Ng2Module`
           @NgModule({
             imports: [BrowserModule, UpgradeModule],
             declarations: [Ng1ComponentAFacade, Ng2Component],
             entryComponents: [Ng2Component],
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
             expect(log).toEqual(['ng1B-post', 'ng1A-post']);
           });
         }));

      it('should run the post-linking function before `$postLink`', waitForAsync(() => {
           const log: string[] = [];

           // Define `ng1Directive`
           const ng1Directive: angular.IDirective = {
             template: '',
             link: () => log.push('ng1-post'),
             controller: class {
               $postLink() {
                 log.push('ng1-$post');
               }
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
           const ng1Module = angular.module_('ng1', [])
                                 .directive('ng1', () => ng1Directive)
                                 .directive('ng2', downgradeComponent({component: Ng2Component}));

           // Define `Ng2Module`
           @NgModule({
             imports: [BrowserModule, UpgradeModule],
             declarations: [Ng1ComponentFacade, Ng2Component],
             entryComponents: [Ng2Component],
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
             expect(log).toEqual(['ng1-post', 'ng1-$post']);
           });
         }));
    });

    describe('controller', () => {
      it('should support `controllerAs`', waitForAsync(() => {
           // Define `ng1Directive`
           const ng1Directive: angular.IDirective = {
             template:
                 '{{ vm.scope }}; {{ vm.isClass }}; {{ vm.hasElement }}; {{ vm.isPublished() }}',
             scope: true,
             controllerAs: 'vm',
             controller: class {
               hasElement: string;  // TODO(issue/24571): remove '!'.
               isClass!: string;
               scope: string;

               constructor(public $element: angular.IAugmentedJQuery, $scope: angular.IScope) {
                 this.hasElement = $element[0].nodeName;
                 this.scope = $scope.$parent.$parent === $scope.$root ? 'scope' : 'wrong-scope';

                 this.verifyIAmAClass();
               }

               isPublished() {
                 return this.$element.controller!('ng1') === this ? 'published' : 'not-published';
               }

               verifyIAmAClass() {
                 this.isClass = 'isClass';
               }
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
           const ng1Module = angular.module_('ng1Module', [])
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

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
             expect(multiTrim(element.textContent)).toBe('scope; isClass; NG1; published');
           });
         }));

      it('should support `bindToController` (boolean)', waitForAsync(() => {
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
             // TODO(issue/24571): remove '!'.
             @Input() title!: string;

             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1A', elementRef, injector);
             }
           }

           @Directive({selector: 'ng1B'})
           class Ng1ComponentBFacade extends UpgradeComponent {
             // TODO(issue/24571): remove '!'.
             @Input() title!: string;

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
           const ng1Module = angular.module_('ng1Module', [])
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

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
             expect(multiTrim(element.textContent))
                 .toBe('Scope: WORKS; Controller: | Scope: ; Controller: WORKS');
           });
         }));

      it('should support `bindToController` (object)', waitForAsync(() => {
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
             // TODO(issue/24571): remove '!'.
             @Input() title!: string;

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
           const ng1Module = angular.module_('ng1Module', [])
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

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
             expect(multiTrim(element.textContent)).toBe('WORKS');
           });
         }));

      it('should support `controller` as string', waitForAsync(() => {
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
             // TODO(issue/24571): remove '!'.
             @Input() title!: string;

             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1', elementRef, injector);
             }
           }

           // Define `Ng2Component`
           @Component({selector: 'ng2', template: '<ng1 title="WORKS"></ng1>'})
           class Ng2Component {
           }

           // Define `ng1Module`
           const ng1Module = angular.module_('ng1Module', [])
                                 .controller(
                                     'Ng1Controller',
                                     class {
                                       text = 'GREAT';
                                     })
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

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
             expect(multiTrim(element.textContent)).toBe('WORKS GREAT');
           });
         }));

      it('should insert the compiled content before instantiating the controller',
         waitForAsync(() => {
           let compiledContent: string;
           let getCurrentContent: () => string;

           // Define `ng1Component`
           const ng1Component: angular.IComponent = {
             template: 'Hello, {{ $ctrl.name }}!',
             controller: class {
               name = 'world';

               constructor($element: angular.IAugmentedJQuery) {
                 getCurrentContent = () => $element.text!();
                 compiledContent = getCurrentContent();
               }
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
           const ng1Module = angular.module_('ng1Module', [])
                                 .component('ng1', ng1Component)
                                 .directive('ng2', downgradeComponent({component: Ng2Component}));

           // Define `Ng2Module`
           @NgModule({
             imports: [BrowserModule, UpgradeModule],
             declarations: [Ng1ComponentFacade, Ng2Component],
             entryComponents: [Ng2Component]
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
             expect(multiTrim(compiledContent)).toBe('Hello, {{ $ctrl.name }}!');
             expect(multiTrim(getCurrentContent())).toBe('Hello, world!');
           });
         }));
    });

    describe('require', () => {
      // NOT YET SUPPORTED
      xdescribe('in pre-/post-link', () => {
        it('should resolve to its own controller if falsy', waitForAsync(() => {
             // Define `ng1Directive`
             const ng1Directive: angular.IDirective = {
               template: 'Pre: {{ pre }} | Post: {{ post }}',
               controller: class {
                 value = 'foo';
               },
               link: {
                 pre: function(scope: any, elem: any, attrs: any, ctrl: any) {
                   scope['pre'] = ctrl.value;
                 },
                 post: function(scope: any, elem: any, attrs: any, ctrl: any) {
                   scope['post'] = ctrl.value;
                 }
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
             const ng1Module = angular.module_('ng1Module', [])
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

             bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
               expect(multiTrim(document.body.textContent)).toBe('Pre: foo | Post: foo');
             });
           }));

        // TODO: Add more tests
      });

      describe('in controller', () => {
        it('should be available to children', waitForAsync(() => {
             // Define `ng1Component`
             const ng1ComponentA: angular.IComponent = {
               template: '<ng1-b></ng1-b>',
               controller: class {
                 value = 'ng1A';
               }
             };

             const ng1ComponentB: angular.IComponent = {
               template: 'Required: {{ $ctrl.required.value }}',
               require: {required: '^^ng1A'}
             };

             // Define `Ng1ComponentFacade`
             @Directive({selector: 'ng1A'})
             class Ng1ComponentAFacade extends UpgradeComponent {
               constructor(elementRef: ElementRef, injector: Injector) {
                 super('ng1A', elementRef, injector);
               }
             }

             // Define `Ng2Component`
             @Component({selector: 'ng2', template: '<ng1A></ng1A>'})
             class Ng2Component {
             }

             // Define `ng1Module`
             const ng1Module = angular.module_('ng1Module', [])
                                   .component('ng1A', ng1ComponentA)
                                   .component('ng1B', ng1ComponentB)
                                   .directive('ng2', downgradeComponent({component: Ng2Component}));

             // Define `Ng2Module`
             @NgModule({
               declarations: [Ng1ComponentAFacade, Ng2Component],
               entryComponents: [Ng2Component],
               imports: [BrowserModule, UpgradeModule]
             })
             class Ng2Module {
               ngDoBootstrap() {}
             }

             // Bootstrap
             const element = html(`<ng2></ng2>`);

             bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
               expect(multiTrim(element.textContent)).toBe('Required: ng1A');
             });
           }));

        it('should throw if required controller cannot be found', waitForAsync(() => {
             // Define `ng1Component`
             const ng1ComponentA: angular.IComponent = {require: {foo: 'iDoNotExist'}};
             const ng1ComponentB: angular.IComponent = {require: {foo: '^iDoNotExist'}};
             const ng1ComponentC: angular.IComponent = {require: {foo: '^^iDoNotExist'}};

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

             @Directive({selector: 'ng1C'})
             class Ng1ComponentCFacade extends UpgradeComponent {
               constructor(elementRef: ElementRef, injector: Injector) {
                 super('ng1C', elementRef, injector);
               }
             }

             // Define `Ng2Component`
             @Component({selector: 'ng2-a', template: '<ng1A></ng1A>'})
             class Ng2ComponentA {
             }

             @Component({selector: 'ng2-b', template: '<ng1B></ng1B>'})
             class Ng2ComponentB {
             }

             @Component({selector: 'ng2-c', template: '<ng1C></ng1C>'})
             class Ng2ComponentC {
             }

             // Define `ng1Module`
             const mockExceptionHandler = jasmine.createSpy($EXCEPTION_HANDLER);
             const ng1Module =
                 angular.module_('ng1Module', [])
                     .component('ng1A', ng1ComponentA)
                     .component('ng1B', ng1ComponentB)
                     .component('ng1C', ng1ComponentC)
                     .directive('ng2A', downgradeComponent({component: Ng2ComponentA}))
                     .directive('ng2B', downgradeComponent({component: Ng2ComponentB}))
                     .directive('ng2C', downgradeComponent({component: Ng2ComponentC}))
                     .value($EXCEPTION_HANDLER, mockExceptionHandler);

             // Define `Ng2Module`
             @NgModule({
               declarations: [
                 Ng1ComponentAFacade, Ng1ComponentBFacade, Ng1ComponentCFacade, Ng2ComponentA,
                 Ng2ComponentB, Ng2ComponentC
               ],
               entryComponents: [Ng2ComponentA, Ng2ComponentB, Ng2ComponentC],
               imports: [BrowserModule, UpgradeModule]
             })
             class Ng2Module {
               ngDoBootstrap() {}
             }

             // Bootstrap
             const elementA = html(`<ng2-a></ng2-a>`);
             const elementB = html(`<ng2-b></ng2-b>`);
             const elementC = html(`<ng2-c></ng2-c>`);

             bootstrap(platformBrowserDynamic(), Ng2Module, elementA, ng1Module).then(() => {
               expect(mockExceptionHandler)
                   .toHaveBeenCalledWith(new Error(
                       'Unable to find required \'iDoNotExist\' in upgraded directive \'ng1A\'.'));
             });

             bootstrap(platformBrowserDynamic(), Ng2Module, elementB, ng1Module).then(() => {
               expect(mockExceptionHandler)
                   .toHaveBeenCalledWith(new Error(
                       'Unable to find required \'^iDoNotExist\' in upgraded directive \'ng1B\'.'));
             });

             bootstrap(platformBrowserDynamic(), Ng2Module, elementC, ng1Module).then(() => {
               expect(mockExceptionHandler)
                   .toHaveBeenCalledWith(new Error(
                       'Unable to find required \'^^iDoNotExist\' in upgraded directive \'ng1C\'.'));
             });
           }));

        it('should not throw if missing required controller is optional', waitForAsync(() => {
             // Define `ng1Component`
             const ng1Component: angular.IComponent = {
               require: {
                 foo: '?iDoNotExist',
                 bar: '^?iDoNotExist',
                 baz: '?^^iDoNotExist',
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
             const mockExceptionHandler = jasmine.createSpy($EXCEPTION_HANDLER);
             const ng1Module = angular.module_('ng1Module', [])
                                   .component('ng1', ng1Component)
                                   .directive('ng2', downgradeComponent({component: Ng2Component}))
                                   .value($EXCEPTION_HANDLER, mockExceptionHandler);

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

             bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
               expect(mockExceptionHandler).not.toHaveBeenCalled();
             });
           }));

        it('should assign resolved values to the controller instance (if `require` is not object)',
           waitForAsync(() => {
             // Define `ng1Component`
             const ng1ComponentA: angular.IComponent = {
               template: 'ng1A(<div><ng2></ng2></div>)',
               controller: class {
                 value = 'A';
               }
             };

             const ng1ComponentB: angular.IComponent = {
               template: `ng1B({{ $ctrl.getProps() }})`,
               require: '^ng1A',
               controller: class {
                 getProps() {
                   // If all goes well, there should be no keys on `this`
                   return Object.keys(this).join(', ');
                 }
               }
             };

             const ng1ComponentC: angular.IComponent = {
               template: `ng1C({{ $ctrl.getProps() }})`,
               require: ['?ng1A', '^ng1A', '^^ng1A', 'ng1C', '^ng1C', '?^^ng1C'],
               controller: class {
                 getProps() {
                   // If all goes well, there should be no keys on `this`
                   return Object.keys(this).join(', ');
                 }
               }
             };

             // Define `Ng1ComponentFacade`
             @Directive({selector: 'ng1B'})
             class Ng1ComponentBFacade extends UpgradeComponent {
               constructor(elementRef: ElementRef, injector: Injector) {
                 super('ng1B', elementRef, injector);
               }
             }

             @Directive({selector: 'ng1C'})
             class Ng1ComponentCFacade extends UpgradeComponent {
               constructor(elementRef: ElementRef, injector: Injector) {
                 super('ng1C', elementRef, injector);
               }
             }

             // Define `Ng2Component`
             @Component(
                 {selector: 'ng2', template: 'ng2(<div><ng1B></ng1B> | <ng1C></ng1C></div>)'})
             class Ng2Component {
             }

             // Define `ng1Module`
             const ng1Module = angular.module_('ng1Module', [])
                                   .component('ng1A', ng1ComponentA)
                                   .component('ng1B', ng1ComponentB)
                                   .component('ng1C', ng1ComponentC)
                                   .directive('ng2', downgradeComponent({component: Ng2Component}));

             // Define `Ng2Module`
             @NgModule({
               declarations: [Ng1ComponentBFacade, Ng1ComponentCFacade, Ng2Component],
               entryComponents: [Ng2Component],
               imports: [BrowserModule, UpgradeModule]
             })
             class Ng2Module {
               ngDoBootstrap() {}
             }

             // Bootstrap
             const element = html(`<ng1-a></ng1-a>`);

             bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
               expect(multiTrim(element.textContent)).toBe('ng1A(ng2(ng1B() | ng1C()))');
             });
           }));

        it('should assign resolved values to the controller instance (if `require` is object)',
           waitForAsync(() => {
             // Define `ng1Component`
             const ng1ComponentA: angular.IComponent = {
               template: 'ng1A(<div><ng2></ng2></div>)',
               controller: class {
                 value = 'A';
               }
             };

             const ng1ComponentB: angular.IComponent = {
               template: `ng1B(
                 ng1A: {{ $ctrl.ng1ASelf.value }} |
                 ^ng1A: {{ $ctrl.ng1ASelfUp.value }} |
                 ^^ng1A: {{ $ctrl.ng1AParentUp.value }} |
                 ng1B: {{ $ctrl.ng1BSelf.value }} |
                 ^ng1B: {{ $ctrl.ng1BSelfUp.value }} |
                 ^^ng1B: {{ $ctrl.ng1BParentUp.value }}
               )`,
               require: {
                 ng1ASelf: '?ng1A',
                 ng1ASelfUp: '^ng1A',
                 ng1AParentUp: '^^ng1A',
                 ng1BSelf: 'ng1B',
                 ng1BSelfUp: '^ng1B',
                 ng1BParentUp: '?^^ng1B',
               },
               controller: class {
                 value = 'B';
               }
             };

             // Define `Ng1ComponentFacade`
             @Directive({selector: 'ng1B'})
             class Ng1ComponentBFacade extends UpgradeComponent {
               constructor(elementRef: ElementRef, injector: Injector) {
                 super('ng1B', elementRef, injector);
               }
             }

             // Define `Ng2Component`
             @Component({selector: 'ng2', template: 'ng2(<div><ng1B></ng1B></div>)'})
             class Ng2Component {
             }

             // Define `ng1Module`
             const ng1Module = angular.module_('ng1Module', [])
                                   .component('ng1A', ng1ComponentA)
                                   .component('ng1B', ng1ComponentB)
                                   .directive('ng2', downgradeComponent({component: Ng2Component}));

             // Define `Ng2Module`
             @NgModule({
               declarations: [Ng1ComponentBFacade, Ng2Component],
               entryComponents: [Ng2Component],
               imports: [BrowserModule, UpgradeModule]
             })
             class Ng2Module {
               ngDoBootstrap() {}
             }

             // Bootstrap
             const element = html(`<ng1-a></ng1-a>`);

             bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
               expect(multiTrim(element.textContent))
                   .toBe(
                       'ng1A(ng2(ng1B( ng1A: | ^ng1A: A | ^^ng1A: A | ng1B: B | ^ng1B: B | ^^ng1B: )))');
             });
           }));

        it('should assign to controller before calling `$onInit()`', waitForAsync(() => {
             // Define `ng1Component`
             const ng1ComponentA: angular.IComponent = {
               template: '<ng2></ng2>',
               controller: class {
                 value = 'ng1A';
               }
             };

             const ng1ComponentB: angular.IComponent = {
               template: '$onInit: {{ $ctrl.onInitValue }}',
               require: {required: '^^ng1A'},
               controller: class {
                 $onInit() {
                   const self = this as any;
                   self.onInitValue = self.required.value;
                 }
               }
             };

             // Define `Ng1ComponentFacade`
             @Directive({selector: 'ng1B'})
             class Ng1ComponentBFacade extends UpgradeComponent {
               constructor(elementRef: ElementRef, injector: Injector) {
                 super('ng1B', elementRef, injector);
               }
             }

             // Define `Ng2Component`
             @Component({selector: 'ng2', template: '<ng1B></ng1B>'})
             class Ng2Component {
             }

             // Define `ng1Module`
             const ng1Module = angular.module_('ng1Module', [])
                                   .component('ng1A', ng1ComponentA)
                                   .component('ng1B', ng1ComponentB)
                                   .directive('ng2', downgradeComponent({component: Ng2Component}));

             // Define `Ng2Module`
             @NgModule({
               declarations: [Ng1ComponentBFacade, Ng2Component],
               entryComponents: [Ng2Component],
               imports: [BrowserModule, UpgradeModule]
             })
             class Ng2Module {
               ngDoBootstrap() {}
             }

             // Bootstrap
             const element = html(`<ng1-a></ng1-a>`);

             bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
               expect(multiTrim(element.textContent)).toBe('$onInit: ng1A');
             });
           }));

        it('should use the key as name if the required controller name is omitted',
           waitForAsync(() => {
             // Define `ng1Component`
             const ng1ComponentA: angular.IComponent = {
               template: '<ng1-b></ng1-b>',
               controller: class {
                 value = 'A';
               }
             };

             const ng1ComponentB: angular.IComponent = {
               template: '<ng2></ng2>',
               controller: class {
                 value = 'B';
               }
             };

             const ng1ComponentC: angular.IComponent = {
               template:
                   'ng1A: {{ $ctrl.ng1A.value }} | ng1B: {{ $ctrl.ng1B.value }} | ng1C: {{ $ctrl.ng1C.value }}',
               require: {
                 ng1A: '^^',
                 ng1B: '?^',
                 ng1C: '',
               },
               controller: class {
                 value = 'C';
               }
             };

             // Define `Ng1ComponentFacade`
             @Directive({selector: 'ng1C'})
             class Ng1ComponentCFacade extends UpgradeComponent {
               constructor(elementRef: ElementRef, injector: Injector) {
                 super('ng1C', elementRef, injector);
               }
             }

             // Define `Ng2Component`
             @Component({selector: 'ng2', template: '<ng1C></ng1C>'})
             class Ng2Component {
             }

             // Define `ng1Module`
             const ng1Module = angular.module_('ng1Module', [])
                                   .component('ng1A', ng1ComponentA)
                                   .component('ng1B', ng1ComponentB)
                                   .component('ng1C', ng1ComponentC)
                                   .directive('ng2', downgradeComponent({component: Ng2Component}));

             // Define `Ng2Module`
             @NgModule({
               declarations: [Ng1ComponentCFacade, Ng2Component],
               entryComponents: [Ng2Component],
               imports: [BrowserModule, UpgradeModule]
             })
             class Ng2Module {
               ngDoBootstrap() {}
             }

             // Bootstrap
             const element = html('<ng1-a></ng1-a>');

             bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
               expect(multiTrim(element.textContent)).toBe('ng1A: A | ng1B: B | ng1C: C');
             });
           }));
      });
    });

    describe('transclusion', () => {
      it('should support single-slot transclusion', waitForAsync(() => {
           let ng2ComponentAInstance: Ng2ComponentA;
           let ng2ComponentBInstance: Ng2ComponentB;

           // Define `ng1Component`
           const ng1Component:
               angular.IComponent = {template: 'ng1(<div ng-transclude></div>)', transclude: true};

           // Define `Ng1ComponentFacade`
           @Directive({selector: 'ng1'})
           class Ng1ComponentFacade extends UpgradeComponent {
             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1', elementRef, injector);
             }
           }

           // Define `Ng2Component`
           @Component({
             selector: 'ng2A',
             template: 'ng2A(<ng1>{{ value }} | <ng2B *ngIf="showB"></ng2B></ng1>)'
           })
           class Ng2ComponentA {
             value = 'foo';
             showB = false;
             constructor() {
               ng2ComponentAInstance = this;
             }
           }

           @Component({selector: 'ng2B', template: 'ng2B({{ value }})'})
           class Ng2ComponentB {
             value = 'bar';
             constructor() {
               ng2ComponentBInstance = this;
             }
           }

           // Define `ng1Module`
           const ng1Module = angular.module_('ng1Module', [])
                                 .component('ng1', ng1Component)
                                 .directive('ng2A', downgradeComponent({component: Ng2ComponentA}));

           // Define `Ng2Module`
           @NgModule({
             imports: [BrowserModule, UpgradeModule],
             declarations: [Ng1ComponentFacade, Ng2ComponentA, Ng2ComponentB],
             entryComponents: [Ng2ComponentA]
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2-a></ng2-a>`);

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(adapter => {
             expect(multiTrim(element.textContent)).toBe('ng2A(ng1(foo | ))');

             ng2ComponentAInstance.value = 'baz';
             ng2ComponentAInstance.showB = true;
             $digest(adapter);

             expect(multiTrim(element.textContent)).toBe('ng2A(ng1(baz | ng2B(bar)))');

             ng2ComponentBInstance.value = 'qux';
             $digest(adapter);

             expect(multiTrim(element.textContent)).toBe('ng2A(ng1(baz | ng2B(qux)))');
           });
         }));

      it('should support single-slot transclusion with fallback content', waitForAsync(() => {
           let ng1ControllerInstances: any[] = [];
           let ng2ComponentInstance: Ng2Component;

           // Define `ng1Component`
           const ng1Component: angular.IComponent = {
             template: 'ng1(<div ng-transclude>{{ $ctrl.value }}</div>)',
             transclude: true,
             controller: class {
               value = 'from-ng1';
               constructor() {
                 ng1ControllerInstances.push(this);
               }
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
           @Component({selector: 'ng2', template: 'ng2(<ng1>{{ value }}</ng1> | <ng1></ng1>)'})
           class Ng2Component {
             value = 'from-ng2';
             constructor() {
               ng2ComponentInstance = this;
             }
           }

           // Define `ng1Module`
           const ng1Module = angular.module_('ng1Module', [])
                                 .component('ng1', ng1Component)
                                 .directive('ng2', downgradeComponent({component: Ng2Component}));

           // Define `Ng2Module`
           @NgModule({
             imports: [BrowserModule, UpgradeModule],
             declarations: [Ng1ComponentFacade, Ng2Component],
             entryComponents: [Ng2Component]
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(adapter => {
             expect(multiTrim(element.textContent)).toBe('ng2(ng1(from-ng2) | ng1(from-ng1))');

             ng1ControllerInstances.forEach(ctrl => ctrl.value = 'ng1-foo');
             ng2ComponentInstance.value = 'ng2-bar';
             $digest(adapter);

             expect(multiTrim(element.textContent)).toBe('ng2(ng1(ng2-bar) | ng1(ng1-foo))');
           });
         }));

      it('should support multi-slot transclusion', waitForAsync(() => {
           let ng2ComponentInstance: Ng2Component;

           // Define `ng1Component`
           const ng1Component: angular.IComponent = {
             template:
                 'ng1(x(<div ng-transclude="slotX"></div>) | y(<div ng-transclude="slotY"></div>))',
             transclude: {slotX: 'contentX', slotY: 'contentY'}
           };

           // Define `Ng1ComponentFacade`
           @Directive({selector: 'ng1'})
           class Ng1ComponentFacade extends UpgradeComponent {
             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1', elementRef, injector);
             }
           }

           // Define `Ng2Component`
           @Component({
             selector: 'ng2',
             template: `
               ng2(
                 <ng1>
                   <content-x>{{ x }}1</content-x>
                   <content-y>{{ y }}1</content-y>
                   <content-x>{{ x }}2</content-x>
                   <content-y>{{ y }}2</content-y>
                 </ng1>
               )`
           })
           class Ng2Component {
             x = 'foo';
             y = 'bar';
             constructor() {
               ng2ComponentInstance = this;
             }
           }

           // Define `ng1Module`
           const ng1Module = angular.module_('ng1Module', [])
                                 .component('ng1', ng1Component)
                                 .directive('ng2', downgradeComponent({component: Ng2Component}));

           // Define `Ng2Module`
           @NgModule({
             imports: [BrowserModule, UpgradeModule],
             declarations: [Ng1ComponentFacade, Ng2Component],
             entryComponents: [Ng2Component],
             schemas: [NO_ERRORS_SCHEMA]
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(adapter => {
             expect(multiTrim(element.textContent, true)).toBe('ng2(ng1(x(foo1foo2)|y(bar1bar2)))');

             ng2ComponentInstance.x = 'baz';
             ng2ComponentInstance.y = 'qux';
             $digest(adapter);

             expect(multiTrim(element.textContent, true)).toBe('ng2(ng1(x(baz1baz2)|y(qux1qux2)))');
           });
         }));

      it('should support default slot (with fallback content)', waitForAsync(() => {
           let ng1ControllerInstances: any[] = [];
           let ng2ComponentInstance: Ng2Component;

           // Define `ng1Component`
           const ng1Component: angular.IComponent = {
             template: 'ng1(default(<div ng-transclude="">fallback-{{ $ctrl.value }}</div>))',
             transclude: {slotX: 'contentX', slotY: 'contentY'},
             controller: class {
               value = 'ng1';
               constructor() {
                 ng1ControllerInstances.push(this);
               }
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
           @Component({
             selector: 'ng2',
             template: `
               ng2(
                 <ng1>
                   ({{ x }})
                   <content-x>ignored x</content-x>
                   {{ x }}-<span>{{ y }}</span>
                   <content-y>ignored y</content-y>
                   <span>({{ y }})</span>
                 </ng1> |
                 <!--
                   Remove any whitespace, because in AngularJS versions prior to 1.6
                   even whitespace counts as transcluded content.
                 -->
                 <ng1><content-x>ignored x</content-x><content-y>ignored y</content-y></ng1>
               )`
           })
           class Ng2Component {
             x = 'foo';
             y = 'bar';
             constructor() {
               ng2ComponentInstance = this;
             }
           }

           // Define `ng1Module`
           const ng1Module = angular.module_('ng1Module', [])
                                 .component('ng1', ng1Component)
                                 .directive('ng2', downgradeComponent({component: Ng2Component}));

           // Define `Ng2Module`
           @NgModule({
             imports: [BrowserModule, UpgradeModule],
             declarations: [Ng1ComponentFacade, Ng2Component],
             entryComponents: [Ng2Component],
             schemas: [NO_ERRORS_SCHEMA]
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(adapter => {
             expect(multiTrim(element.textContent, true))
                 .toBe('ng2(ng1(default((foo)foo-bar(bar)))|ng1(default(fallback-ng1)))');

             ng1ControllerInstances.forEach(ctrl => ctrl.value = 'ng1-plus');
             ng2ComponentInstance.x = 'baz';
             ng2ComponentInstance.y = 'qux';
             $digest(adapter);

             expect(multiTrim(element.textContent, true))
                 .toBe('ng2(ng1(default((baz)baz-qux(qux)))|ng1(default(fallback-ng1-plus)))');
           });
         }));

      it('should support optional transclusion slots (with fallback content)', waitForAsync(() => {
           let ng1ControllerInstances: any[] = [];
           let ng2ComponentInstance: Ng2Component;

           // Define `ng1Component`
           const ng1Component: angular.IComponent = {
             template: `
               ng1(
                x(<div ng-transclude="slotX">{{ $ctrl.x }}</div>) |
                y(<div ng-transclude="slotY">{{ $ctrl.y }}</div>)
               )`,
             transclude: {slotX: '?contentX', slotY: '?contentY'},
             controller: class {
               x = 'ng1X';
               y = 'ng1Y';
               constructor() {
                 ng1ControllerInstances.push(this);
               }
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
           @Component({
             selector: 'ng2',
             template: `
               ng2(
                 <ng1><content-x>{{ x }}</content-x></ng1> |
                 <ng1><content-y>{{ y }}</content-y></ng1>
               )`
           })
           class Ng2Component {
             x = 'ng2X';
             y = 'ng2Y';
             constructor() {
               ng2ComponentInstance = this;
             }
           }

           // Define `ng1Module`
           const ng1Module = angular.module_('ng1Module', [])
                                 .component('ng1', ng1Component)
                                 .directive('ng2', downgradeComponent({component: Ng2Component}));

           // Define `Ng2Module`
           @NgModule({
             imports: [BrowserModule, UpgradeModule],
             declarations: [Ng1ComponentFacade, Ng2Component],
             entryComponents: [Ng2Component],
             schemas: [NO_ERRORS_SCHEMA]
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(adapter => {
             expect(multiTrim(element.textContent, true))
                 .toBe('ng2(ng1(x(ng2X)|y(ng1Y))|ng1(x(ng1X)|y(ng2Y)))');

             ng1ControllerInstances.forEach(ctrl => {
               ctrl.x = 'ng1X-foo';
               ctrl.y = 'ng1Y-bar';
             });
             ng2ComponentInstance.x = 'ng2X-baz';
             ng2ComponentInstance.y = 'ng2Y-qux';
             $digest(adapter);

             expect(multiTrim(element.textContent, true))
                 .toBe('ng2(ng1(x(ng2X-baz)|y(ng1Y-bar))|ng1(x(ng1X-foo)|y(ng2Y-qux)))');
           });
         }));

      it('should throw if a non-optional slot is not filled', waitForAsync(() => {
           let errorMessage: string;

           // Define `ng1Component`
           const ng1Component: angular.IComponent = {
             template: '',
             transclude: {slotX: '?contentX', slotY: 'contentY'}
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
               angular.module_('ng1Module', [])
                   .value($EXCEPTION_HANDLER, (error: Error) => errorMessage = error.message)
                   .component('ng1', ng1Component)
                   .directive('ng2', downgradeComponent({component: Ng2Component}));

           // Define `Ng2Module`
           @NgModule({
             imports: [BrowserModule, UpgradeModule],
             declarations: [Ng1ComponentFacade, Ng2Component],
             entryComponents: [Ng2Component]
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(adapter => {
             expect(errorMessage)
                 .toContain('Required transclusion slot \'slotY\' on directive: ng1');
           });
         }));

      it('should support structural directives in transcluded content', waitForAsync(() => {
           let ng2ComponentInstance: Ng2Component;

           // Define `ng1Component`
           const ng1Component: angular.IComponent = {
             template:
                 'ng1(x(<div ng-transclude="slotX"></div>) | default(<div ng-transclude=""></div>))',
             transclude: {slotX: 'contentX'}
           };

           // Define `Ng1ComponentFacade`
           @Directive({selector: 'ng1'})
           class Ng1ComponentFacade extends UpgradeComponent {
             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1', elementRef, injector);
             }
           }

           // Define `Ng2Component`
           @Component({
             selector: 'ng2',
             template: `
               ng2(
                 <ng1>
                   <content-x><div *ngIf="show">{{ x }}1</div></content-x>
                   <div *ngIf="!show">{{ y }}1</div>
                   <content-x><div *ngIf="!show">{{ x }}2</div></content-x>
                   <div *ngIf="show">{{ y }}2</div>
                 </ng1>
               )`
           })
           class Ng2Component {
             x = 'foo';
             y = 'bar';
             show = true;
             constructor() {
               ng2ComponentInstance = this;
             }
           }

           // Define `ng1Module`
           const ng1Module = angular.module_('ng1Module', [])
                                 .component('ng1', ng1Component)
                                 .directive('ng2', downgradeComponent({component: Ng2Component}));

           // Define `Ng2Module`
           @NgModule({
             imports: [BrowserModule, UpgradeModule],
             declarations: [Ng1ComponentFacade, Ng2Component],
             entryComponents: [Ng2Component],
             schemas: [NO_ERRORS_SCHEMA]
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(adapter => {
             expect(multiTrim(element.textContent, true)).toBe('ng2(ng1(x(foo1)|default(bar2)))');

             ng2ComponentInstance.x = 'baz';
             ng2ComponentInstance.y = 'qux';
             ng2ComponentInstance.show = false;
             $digest(adapter);

             expect(multiTrim(element.textContent, true)).toBe('ng2(ng1(x(baz2)|default(qux1)))');

             ng2ComponentInstance.show = true;
             $digest(adapter);

             expect(multiTrim(element.textContent, true)).toBe('ng2(ng1(x(baz1)|default(qux2)))');
           });
         }));
    });

    describe('lifecycle hooks', () => {
      it('should call `$onChanges()` on binding destination (prototype)', fakeAsync(() => {
           const scopeOnChanges = jasmine.createSpy('scopeOnChanges');
           const controllerOnChangesA = jasmine.createSpy('controllerOnChangesA');
           const controllerOnChangesB = jasmine.createSpy('controllerOnChangesB');
           let ng2ComponentInstance: Ng2Component;

           // Define `ng1Directive`
           const ng1DirectiveA: angular.IDirective = {
             template: '',
             scope: {inputA: '<'},
             bindToController: false,
             controllerAs: '$ctrl',
             controller: class {
               $onChanges(changes: SimpleChanges) {
                 controllerOnChangesA(changes);
               }
             }
           };

           const ng1DirectiveB: angular.IDirective = {
             template: '',
             scope: {inputB: '<'},
             bindToController: true,
             controllerAs: '$ctrl',
             controller: class {
               $onChanges(changes: SimpleChanges) {
                 controllerOnChangesB(changes);
               }
             }
           };

           // Define `Ng1ComponentFacade`
           @Directive({selector: 'ng1A'})
           class Ng1ComponentAFacade extends UpgradeComponent {
             @Input() inputA: any;

             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1A', elementRef, injector);
             }
           }

           @Directive({selector: 'ng1B'})
           class Ng1ComponentBFacade extends UpgradeComponent {
             @Input() inputB: any;

             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1B', elementRef, injector);
             }
           }

           // Define `Ng2Component`
           @Component({
             selector: 'ng2',
             template: '<ng1A [inputA]="data"></ng1A> | <ng1B [inputB]="data"></ng1B>'
           })
           class Ng2Component {
             data = {foo: 'bar'};

             constructor() {
               ng2ComponentInstance = this;
             }
           }

           // Define `ng1Module`
           const ng1Module = angular.module_('ng1Module', [])
                                 .directive('ng1A', () => ng1DirectiveA)
                                 .directive('ng1B', () => ng1DirectiveB)
                                 .directive('ng2', downgradeComponent({component: Ng2Component}))
                                 .run(($rootScope: angular.IRootScopeService) => {
                                   Object.getPrototypeOf($rootScope)['$onChanges'] = scopeOnChanges;
                                 });

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

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(adapter => {
             // Initial change
             expect(scopeOnChanges.calls.count()).toBe(1);
             expect(controllerOnChangesA).not.toHaveBeenCalled();
             expect(controllerOnChangesB.calls.count()).toBe(1);

             expect(scopeOnChanges.calls.argsFor(0)[0]).toEqual({inputA: jasmine.any(Object)});
             expect(scopeOnChanges.calls.argsFor(0)[0].inputA.currentValue).toEqual({foo: 'bar'});
             expect(scopeOnChanges.calls.argsFor(0)[0].inputA.isFirstChange()).toBe(true);
             expect(controllerOnChangesB.calls.argsFor(0)[0].inputB.currentValue).toEqual({
               foo: 'bar'
             });
             expect(controllerOnChangesB.calls.argsFor(0)[0].inputB.isFirstChange()).toBe(true);

             // Change: Re-assign `data`
             ng2ComponentInstance.data = {foo: 'baz'};
             $digest(adapter);
             tick();

             expect(scopeOnChanges.calls.count()).toBe(2);
             expect(controllerOnChangesA).not.toHaveBeenCalled();
             expect(controllerOnChangesB.calls.count()).toBe(2);

             expect(scopeOnChanges.calls.argsFor(1)[0]).toEqual({inputA: jasmine.any(Object)});
             expect(scopeOnChanges.calls.argsFor(1)[0].inputA.previousValue).toEqual({foo: 'bar'});
             expect(scopeOnChanges.calls.argsFor(1)[0].inputA.currentValue).toEqual({foo: 'baz'});
             expect(scopeOnChanges.calls.argsFor(1)[0].inputA.isFirstChange()).toBe(false);
             expect(controllerOnChangesB.calls.argsFor(1)[0].inputB.previousValue).toEqual({
               foo: 'bar'
             });
             expect(controllerOnChangesB.calls.argsFor(1)[0].inputB.currentValue).toEqual({
               foo: 'baz'
             });
             expect(controllerOnChangesB.calls.argsFor(1)[0].inputB.isFirstChange()).toBe(false);

             // No change: Update internal property
             ng2ComponentInstance.data.foo = 'qux';
             $digest(adapter);
             tick();

             expect(scopeOnChanges.calls.count()).toBe(2);
             expect(controllerOnChangesA).not.toHaveBeenCalled();
             expect(controllerOnChangesB.calls.count()).toBe(2);

             // Change: Re-assign `data` (even if it looks the same)
             ng2ComponentInstance.data = {foo: 'qux'};
             $digest(adapter);
             tick();

             expect(scopeOnChanges.calls.count()).toBe(3);
             expect(controllerOnChangesA).not.toHaveBeenCalled();
             expect(controllerOnChangesB.calls.count()).toBe(3);

             expect(scopeOnChanges.calls.argsFor(2)[0]).toEqual({inputA: jasmine.any(Object)});
             expect(scopeOnChanges.calls.argsFor(2)[0].inputA.previousValue).toEqual({foo: 'qux'});
             expect(scopeOnChanges.calls.argsFor(2)[0].inputA.currentValue).toEqual({foo: 'qux'});
             expect(scopeOnChanges.calls.argsFor(2)[0].inputA.isFirstChange()).toBe(false);
             expect(controllerOnChangesB.calls.argsFor(2)[0].inputB.previousValue).toEqual({
               foo: 'qux'
             });
             expect(controllerOnChangesB.calls.argsFor(2)[0].inputB.currentValue).toEqual({
               foo: 'qux'
             });
             expect(controllerOnChangesB.calls.argsFor(2)[0].inputB.isFirstChange()).toBe(false);
           });
         }));

      it('should call `$onChanges()` on binding destination (instance)', fakeAsync(() => {
           const scopeOnChangesA = jasmine.createSpy('scopeOnChangesA');
           const scopeOnChangesB = jasmine.createSpy('scopeOnChangesB');
           const controllerOnChangesA = jasmine.createSpy('controllerOnChangesA');
           const controllerOnChangesB = jasmine.createSpy('controllerOnChangesB');
           let ng2ComponentInstance: Ng2Component;

           // Define `ng1Directive`
           const ng1DirectiveA: angular.IDirective = {
             template: '',
             scope: {inputA: '<'},
             bindToController: false,
             controllerAs: '$ctrl',
             controller: class {
               constructor($scope: angular.IScope) {
                 $scope['$onChanges'] = scopeOnChangesA;
                 (this as any).$onChanges = controllerOnChangesA;
               }
             }
           };

           const ng1DirectiveB: angular.IDirective = {
             template: '',
             scope: {inputB: '<'},
             bindToController: true,
             controllerAs: '$ctrl',
             controller: class {
               constructor($scope: angular.IScope) {
                 $scope['$onChanges'] = scopeOnChangesB;
                 (this as any).$onChanges = controllerOnChangesB;
               }
             }
           };

           // Define `Ng1ComponentFacade`
           @Directive({selector: 'ng1A'})
           class Ng1ComponentAFacade extends UpgradeComponent {
             @Input() inputA: any;

             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1A', elementRef, injector);
             }
           }

           @Directive({selector: 'ng1B'})
           class Ng1ComponentBFacade extends UpgradeComponent {
             @Input() inputB: any;

             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1B', elementRef, injector);
             }
           }

           // Define `Ng2Component`
           @Component({
             selector: 'ng2',
             template: '<ng1A [inputA]="data"></ng1A> | <ng1B [inputB]="data"></ng1B>'
           })
           class Ng2Component {
             data = {foo: 'bar'};

             constructor() {
               ng2ComponentInstance = this;
             }
           }

           // Define `ng1Module`
           const ng1Module = angular.module_('ng1Module', [])
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

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(adapter => {
             // Initial change
             expect(scopeOnChangesA.calls.count()).toBe(1);
             expect(scopeOnChangesB).not.toHaveBeenCalled();
             expect(controllerOnChangesA).not.toHaveBeenCalled();
             expect(controllerOnChangesB.calls.count()).toBe(1);

             expect(scopeOnChangesA.calls.argsFor(0)[0].inputA.currentValue).toEqual({foo: 'bar'});
             expect(scopeOnChangesA.calls.argsFor(0)[0].inputA.isFirstChange()).toBe(true);
             expect(controllerOnChangesB.calls.argsFor(0)[0].inputB.currentValue).toEqual({
               foo: 'bar'
             });
             expect(controllerOnChangesB.calls.argsFor(0)[0].inputB.isFirstChange()).toBe(true);

             // Change: Re-assign `data`
             ng2ComponentInstance.data = {foo: 'baz'};
             $digest(adapter);
             tick();

             expect(scopeOnChangesA.calls.count()).toBe(2);
             expect(scopeOnChangesB).not.toHaveBeenCalled();
             expect(controllerOnChangesA).not.toHaveBeenCalled();
             expect(controllerOnChangesB.calls.count()).toBe(2);

             expect(scopeOnChangesA.calls.argsFor(1)[0].inputA.previousValue).toEqual({foo: 'bar'});
             expect(scopeOnChangesA.calls.argsFor(1)[0].inputA.currentValue).toEqual({foo: 'baz'});
             expect(scopeOnChangesA.calls.argsFor(1)[0].inputA.isFirstChange()).toBe(false);
             expect(controllerOnChangesB.calls.argsFor(1)[0].inputB.previousValue).toEqual({
               foo: 'bar'
             });
             expect(controllerOnChangesB.calls.argsFor(1)[0].inputB.currentValue).toEqual({
               foo: 'baz'
             });
             expect(controllerOnChangesB.calls.argsFor(1)[0].inputB.isFirstChange()).toBe(false);

             // No change: Update internal property
             ng2ComponentInstance.data.foo = 'qux';
             $digest(adapter);
             tick();

             expect(scopeOnChangesA.calls.count()).toBe(2);
             expect(scopeOnChangesB).not.toHaveBeenCalled();
             expect(controllerOnChangesA).not.toHaveBeenCalled();
             expect(controllerOnChangesB.calls.count()).toBe(2);

             // Change: Re-assign `data` (even if it looks the same)
             ng2ComponentInstance.data = {foo: 'qux'};
             $digest(adapter);
             tick();

             expect(scopeOnChangesA.calls.count()).toBe(3);
             expect(scopeOnChangesB).not.toHaveBeenCalled();
             expect(controllerOnChangesA).not.toHaveBeenCalled();
             expect(controllerOnChangesB.calls.count()).toBe(3);

             expect(scopeOnChangesA.calls.argsFor(2)[0].inputA.previousValue).toEqual({foo: 'qux'});
             expect(scopeOnChangesA.calls.argsFor(2)[0].inputA.currentValue).toEqual({foo: 'qux'});
             expect(scopeOnChangesA.calls.argsFor(2)[0].inputA.isFirstChange()).toBe(false);
             expect(controllerOnChangesB.calls.argsFor(2)[0].inputB.previousValue).toEqual({
               foo: 'qux'
             });
             expect(controllerOnChangesB.calls.argsFor(2)[0].inputB.currentValue).toEqual({
               foo: 'qux'
             });
             expect(controllerOnChangesB.calls.argsFor(2)[0].inputB.isFirstChange()).toBe(false);
           });
         }));

      it('should call `$onInit()` on controller', waitForAsync(() => {
           // Define `ng1Directive`
           const ng1DirectiveA: angular.IDirective = {
             template: 'Called: {{ called }}',
             bindToController: false,
             controller: class {
               constructor(private $scope: angular.IScope) {
                 $scope['called'] = 'no';
               }

               $onInit() {
                 this.$scope['called'] = 'yes';
               }
             }
           };

           const ng1DirectiveB: angular.IDirective = {
             template: 'Called: {{ called }}',
             bindToController: true,
             controller: class {
               constructor($scope: angular.IScope) {
                 $scope['called'] = 'no';
                 (this as any)['$onInit'] = () => $scope['called'] = 'yes';
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
           const ng1Module = angular.module_('ng1Module', [])
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

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
             expect(multiTrim(element.textContent)).toBe('Called: yes | Called: yes');
           });
         }));

      it('should not call `$onInit()` on scope', waitForAsync(() => {
           // Define `ng1Directive`
           const ng1DirectiveA: angular.IDirective = {
             template: 'Called: {{ called }}',
             bindToController: false,
             controller: class {
               constructor($scope: angular.IScope) {
                 $scope['called'] = 'no';
                 $scope['$onInit'] = () => $scope['called'] = 'yes';
                 Object.getPrototypeOf($scope)['$onInit'] = () => $scope['called'] = 'yes';
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
                 Object.getPrototypeOf($scope)['$onInit'] = () => $scope['called'] = 'yes';
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
           const ng1Module = angular.module_('ng1Module', [])
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

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
             expect(multiTrim(element.textContent)).toBe('Called: no | Called: no');
           });
         }));

      it('should call `$postLink()` on controller', waitForAsync(() => {
           // Define `ng1Directive`
           const ng1DirectiveA: angular.IDirective = {
             template: 'Called: {{ called }}',
             bindToController: false,
             controller: class {
               constructor(private $scope: angular.IScope) {
                 $scope['called'] = 'no';
               }

               $postLink() {
                 this.$scope['called'] = 'yes';
               }
             }
           };

           const ng1DirectiveB: angular.IDirective = {
             template: 'Called: {{ called }}',
             bindToController: true,
             controller: class {
               constructor($scope: angular.IScope) {
                 $scope['called'] = 'no';
                 (this as any)['$postLink'] = () => $scope['called'] = 'yes';
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
           const ng1Module = angular.module_('ng1Module', [])
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

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
             expect(multiTrim(element.textContent)).toBe('Called: yes | Called: yes');
           });
         }));

      it('should not call `$postLink()` on scope', waitForAsync(() => {
           // Define `ng1Directive`
           const ng1DirectiveA: angular.IDirective = {
             template: 'Called: {{ called }}',
             bindToController: false,
             controller: class {
               constructor($scope: angular.IScope) {
                 $scope['called'] = 'no';
                 $scope['$postLink'] = () => $scope['called'] = 'yes';
                 Object.getPrototypeOf($scope)['$postLink'] = () => $scope['called'] = 'yes';
               }
             }
           };

           const ng1DirectiveB: angular.IDirective = {
             template: 'Called: {{ called }}',
             bindToController: true,
             controller: class {
               constructor($scope: angular.IScope) {
                 $scope['called'] = 'no';
                 $scope['$postLink'] = () => $scope['called'] = 'yes';
                 Object.getPrototypeOf($scope)['$postLink'] = () => $scope['called'] = 'yes';
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
           const ng1Module = angular.module_('ng1Module', [])
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

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
             expect(multiTrim(element.textContent)).toBe('Called: no | Called: no');
           });
         }));


      it('should call `$doCheck()` on controller', waitForAsync(() => {
           const controllerDoCheckA = jasmine.createSpy('controllerDoCheckA');
           const controllerDoCheckB = jasmine.createSpy('controllerDoCheckB');

           // Define `ng1Directive`
           const ng1DirectiveA: angular.IDirective = {
             template: 'ng1A',
             bindToController: false,
             controller: class {
               $doCheck() {
                 controllerDoCheckA();
               }
             }
           };

           const ng1DirectiveB: angular.IDirective = {
             template: 'ng1B',
             bindToController: true,
             controller: class {
               constructor() {
                 (this as any)['$doCheck'] = controllerDoCheckB;
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
           const ng1Module = angular.module_('ng1Module', [])
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

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(adapter => {
             // Get to a stable `$digest` state.
             $digest(adapter);

             // Initial change.
             // (Do not use a specific number due to differences between AngularJS 1.5/1.6.)
             expect(controllerDoCheckA.calls.count()).toBeGreaterThan(0);
             expect(controllerDoCheckB.calls.count()).toBeGreaterThan(0);
             controllerDoCheckA.calls.reset();
             controllerDoCheckB.calls.reset();

             // Run a `$digest`
             $digest(adapter);
             expect(controllerDoCheckA.calls.count()).toBe(1);
             expect(controllerDoCheckB.calls.count()).toBe(1);

             // Run another `$digest`
             $digest(adapter);
             expect(controllerDoCheckA.calls.count()).toBe(2);
             expect(controllerDoCheckB.calls.count()).toBe(2);
           });
         }));

      it('should not call `$doCheck()` on scope', waitForAsync(() => {
           const scopeDoCheck = jasmine.createSpy('scopeDoCheck');

           // Define `ng1Directive`
           const ng1DirectiveA: angular.IDirective = {
             template: 'ng1A',
             bindToController: false,
             controller: class {
               constructor(private $scope: angular.IScope) {
                 $scope['$doCheck'] = scopeDoCheck;
               }
             }
           };

           const ng1DirectiveB: angular.IDirective = {
             template: 'ng1B',
             bindToController: true,
             controller: class {
               constructor(private $scope: angular.IScope) {
                 $scope['$doCheck'] = scopeDoCheck;
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
           const ng1Module = angular.module_('ng1Module', [])
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

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(adapter => {
             // Initial change
             expect(scopeDoCheck).not.toHaveBeenCalled();

             // Run a `$digest`
             $digest(adapter);
             expect(scopeDoCheck).not.toHaveBeenCalled();

             // Run another `$digest`
             $digest(adapter);
             expect(scopeDoCheck).not.toHaveBeenCalled();
           });
         }));


      it('should call `$onDestroy()` on controller', waitForAsync(() => {
           const controllerOnDestroyA = jasmine.createSpy('controllerOnDestroyA');
           const controllerOnDestroyB = jasmine.createSpy('controllerOnDestroyB');

           // Define `ng1Directive`
           const ng1DirectiveA: angular.IDirective = {
             template: 'ng1A',
             scope: {},
             bindToController: false,
             controllerAs: '$ctrl',
             controller: class {
               $onDestroy() {
                 controllerOnDestroyA();
               }
             }
           };

           const ng1DirectiveB: angular.IDirective = {
             template: 'ng1B',
             scope: {},
             bindToController: true,
             controllerAs: '$ctrl',
             controller: class {
               constructor() {
                 (this as any)['$onDestroy'] = controllerOnDestroyB;
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
           @Component(
               {selector: 'ng2', template: '<div *ngIf="show"><ng1A></ng1A> | <ng1B></ng1B></div>'})
           class Ng2Component {
             // TODO(issue/24571): remove '!'.
             @Input() show!: boolean;
           }

           // Define `ng1Module`
           const ng1Module = angular.module_('ng1Module', [])
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
           const element = html('<ng2 [show]="!destroyFromNg2" ng-if="!destroyFromNg1"></ng2>');

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(adapter => {
             const $rootScope = adapter.$injector.get('$rootScope') as angular.IRootScopeService;

             expect(multiTrim(document.body.textContent)).toBe('ng1A | ng1B');
             expect(controllerOnDestroyA).not.toHaveBeenCalled();
             expect(controllerOnDestroyB).not.toHaveBeenCalled();

             $rootScope.$apply('destroyFromNg1 = true');

             expect(multiTrim(document.body.textContent)).toBe('');
             expect(controllerOnDestroyA).toHaveBeenCalled();
             expect(controllerOnDestroyB).toHaveBeenCalled();

             controllerOnDestroyA.calls.reset();
             controllerOnDestroyB.calls.reset();
             $rootScope.$apply('destroyFromNg1 = false');

             expect(multiTrim(document.body.textContent)).toBe('ng1A | ng1B');
             expect(controllerOnDestroyA).not.toHaveBeenCalled();
             expect(controllerOnDestroyB).not.toHaveBeenCalled();

             $rootScope.$apply('destroyFromNg2 = true');

             expect(multiTrim(document.body.textContent)).toBe('');
             expect(controllerOnDestroyA).toHaveBeenCalled();
             expect(controllerOnDestroyB).toHaveBeenCalled();
           });
         }));

      it('should not call `$onDestroy()` on scope', waitForAsync(() => {
           const scopeOnDestroy = jasmine.createSpy('scopeOnDestroy');

           // Define `ng1Directive`
           const ng1DirectiveA: angular.IDirective = {
             template: 'ng1A',
             scope: {},
             bindToController: false,
             controllerAs: '$ctrl',
             controller: class {
               constructor($scope: angular.IScope) {
                 $scope['$onDestroy'] = scopeOnDestroy;
                 Object.getPrototypeOf($scope)['$onDestroy'] = scopeOnDestroy;
               }
             }
           };

           const ng1DirectiveB: angular.IDirective = {
             template: 'ng1B',
             scope: {},
             bindToController: true,
             controllerAs: '$ctrl',
             controller: class {
               constructor($scope: angular.IScope) {
                 $scope['$onDestroy'] = scopeOnDestroy;
                 Object.getPrototypeOf($scope)['$onDestroy'] = scopeOnDestroy;
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
           @Component(
               {selector: 'ng2', template: '<div *ngIf="show"><ng1A></ng1A> | <ng1B></ng1B></div>'})
           class Ng2Component {
             // TODO(issue/24571): remove '!'.
             @Input() show!: boolean;
           }

           // Define `ng1Module`
           const ng1Module = angular.module_('ng1Module', [])
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
           const element = html('<ng2 [show]="!destroyFromNg2" ng-if="!destroyFromNg1"></ng2>');

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(adapter => {
             const $rootScope = adapter.$injector.get('$rootScope') as angular.IRootScopeService;

             expect(multiTrim(document.body.textContent)).toBe('ng1A | ng1B');
             expect(scopeOnDestroy).not.toHaveBeenCalled();

             $rootScope.$apply('destroyFromNg1 = true');

             expect(multiTrim(document.body.textContent)).toBe('');
             expect(scopeOnDestroy).not.toHaveBeenCalled();

             $rootScope.$apply('destroyFromNg1 = false');

             expect(multiTrim(document.body.textContent)).toBe('ng1A | ng1B');
             expect(scopeOnDestroy).not.toHaveBeenCalled();

             $rootScope.$apply('destroyFromNg2 = true');

             expect(multiTrim(document.body.textContent)).toBe('');
             expect(scopeOnDestroy).not.toHaveBeenCalled();
           });
         }));

      it('should be called in order `$onChanges()` > `$onInit()` > `$doCheck()` > `$postLink()`',
         waitForAsync(() => {
           // Define `ng1Component`
           const ng1Component: angular.IComponent = {
             // `$doCheck()` will keep getting called as long as the interpolated value keeps
             // changing (by appending `> $doCheck`). Only care about the first 4 values.
             template: '{{ $ctrl.calls.slice(0, 4).join(" > ") }}',
             bindings: {value: '<'},
             controller: class {
               calls: string[] = [];

               $onChanges() {
                 this.calls.push('$onChanges');
               }

               $onInit() {
                 this.calls.push('$onInit');
               }

               $doCheck() {
                 this.calls.push('$doCheck');
               }

               $postLink() {
                 this.calls.push('$postLink');
               }
             }
           };

           // Define `Ng1ComponentFacade`
           @Directive({selector: 'ng1'})
           class Ng1ComponentFacade extends UpgradeComponent {
             @Input() value: any;

             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1', elementRef, injector);
             }
           }

           // Define `Ng2Component`
           @Component({selector: 'ng2', template: '<ng1 value="foo"></ng1>'})
           class Ng2Component {
           }

           // Define `ng1Module`
           const ng1Module = angular.module_('ng1Module', [])
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

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
             expect(multiTrim(element.textContent))
                 .toBe('$onChanges > $onInit > $doCheck > $postLink');
           });
         }));
    });

    describe('destroying the upgraded component', () => {
      it('should destroy `$componentScope`', waitForAsync(() => {
           const scopeDestroyListener = jasmine.createSpy('scopeDestroyListener');
           let ng2ComponentAInstance: Ng2ComponentA;

           // Define `ng1Component`
           const ng1Component: angular.IComponent = {
             controller: class {
               constructor($scope: angular.IScope) {
                 $scope.$on('$destroy', scopeDestroyListener);
               }
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
           @Component({selector: 'ng2A', template: '<ng2B *ngIf="!destroyIt"></ng2B>'})
           class Ng2ComponentA {
             destroyIt = false;

             constructor() {
               ng2ComponentAInstance = this;
             }
           }

           @Component({selector: 'ng2B', template: '<ng1></ng1>'})
           class Ng2ComponentB {
           }

           // Define `ng1Module`
           const ng1Module = angular.module_('ng1Module', [])
                                 .component('ng1', ng1Component)
                                 .directive('ng2A', downgradeComponent({component: Ng2ComponentA}));

           // Define `Ng2Module`
           @NgModule({
             declarations: [Ng1ComponentFacade, Ng2ComponentA, Ng2ComponentB],
             entryComponents: [Ng2ComponentA],
             imports: [BrowserModule, UpgradeModule]
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2-a></ng2-a>`);

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(adapter => {
             expect(scopeDestroyListener).not.toHaveBeenCalled();

             ng2ComponentAInstance.destroyIt = true;
             $digest(adapter);

             expect(scopeDestroyListener).toHaveBeenCalledTimes(1);
           });
         }));

      it('should emit `$destroy` on `$element` and descendants', waitForAsync(() => {
           const elementDestroyListener = jasmine.createSpy('elementDestroyListener');
           const descendantDestroyListener = jasmine.createSpy('descendantDestroyListener');
           let ng2ComponentAInstance: Ng2ComponentA;

           // Define `ng1Component`
           const ng1Component: angular.IComponent = {
             controller: class {
               constructor($element: angular.IAugmentedJQuery) {
                 $element.on!('$destroy', elementDestroyListener);
                 $element.contents!().on!('$destroy', descendantDestroyListener);
               }
             },
             template: '<div></div>'
           };

           // Define `Ng1ComponentFacade`
           @Directive({selector: 'ng1'})
           class Ng1ComponentFacade extends UpgradeComponent {
             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1', elementRef, injector);
             }
           }

           // Define `Ng2Component`
           @Component({selector: 'ng2A', template: '<ng2B *ngIf="!destroyIt"></ng2B>'})
           class Ng2ComponentA {
             destroyIt = false;

             constructor() {
               ng2ComponentAInstance = this;
             }
           }

           @Component({selector: 'ng2B', template: '<ng1></ng1>'})
           class Ng2ComponentB {
           }

           // Define `ng1Module`
           const ng1Module = angular.module_('ng1Module', [])
                                 .component('ng1', ng1Component)
                                 .directive('ng2A', downgradeComponent({component: Ng2ComponentA}));

           // Define `Ng2Module`
           @NgModule({
             declarations: [Ng1ComponentFacade, Ng2ComponentA, Ng2ComponentB],
             entryComponents: [Ng2ComponentA],
             imports: [BrowserModule, UpgradeModule]
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2-a></ng2-a>`);

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(adapter => {
             expect(elementDestroyListener).not.toHaveBeenCalled();
             expect(descendantDestroyListener).not.toHaveBeenCalled();

             ng2ComponentAInstance.destroyIt = true;
             $digest(adapter);

             expect(elementDestroyListener).toHaveBeenCalledTimes(1);
             expect(descendantDestroyListener).toHaveBeenCalledTimes(1);
           });
         }));

      it('should clear data on `$element` and descendants`', waitForAsync(() => {
           let ng1ComponentElement: angular.IAugmentedJQuery;
           let ng2ComponentAInstance: Ng2ComponentA;

           // Define `ng1Component`
           const ng1Component: angular.IComponent = {
             controller: class {
               constructor($element: angular.IAugmentedJQuery) {
                 $element.data!('test', 1);
                 $element.contents!().data!('test', 2);

                 ng1ComponentElement = $element;
               }
             },
             template: '<div></div>'
           };

           // Define `Ng1ComponentFacade`
           @Directive({selector: 'ng1'})
           class Ng1ComponentFacade extends UpgradeComponent {
             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1', elementRef, injector);
             }
           }

           // Define `Ng2Component`
           @Component({selector: 'ng2A', template: '<ng2B *ngIf="!destroyIt"></ng2B>'})
           class Ng2ComponentA {
             destroyIt = false;

             constructor() {
               ng2ComponentAInstance = this;
             }
           }

           @Component({selector: 'ng2B', template: '<ng1></ng1>'})
           class Ng2ComponentB {
           }

           // Define `ng1Module`
           const ng1Module = angular.module_('ng1Module', [])
                                 .component('ng1', ng1Component)
                                 .directive('ng2A', downgradeComponent({component: Ng2ComponentA}));

           // Define `Ng2Module`
           @NgModule({
             declarations: [Ng1ComponentFacade, Ng2ComponentA, Ng2ComponentB],
             entryComponents: [Ng2ComponentA],
             imports: [BrowserModule, UpgradeModule]
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2-a></ng2-a>`);

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(adapter => {
             expect(ng1ComponentElement.data!('test')).toBe(1);
             expect(ng1ComponentElement.contents!().data!('test')).toBe(2);

             ng2ComponentAInstance.destroyIt = true;
             $digest(adapter);

             expect(ng1ComponentElement.data!('test')).toBeUndefined();
             expect(ng1ComponentElement.contents!().data!('test')).toBeUndefined();
           });
         }));

      it('should clear dom listeners on `$element` and descendants`', waitForAsync(() => {
           const elementClickListener = jasmine.createSpy('elementClickListener');
           const descendantClickListener = jasmine.createSpy('descendantClickListener');
           let ng1DescendantElement: angular.IAugmentedJQuery;
           let ng2ComponentAInstance: Ng2ComponentA;

           // Define `ng1Component`
           const ng1Component: angular.IComponent = {
             controller: class {
               constructor($element: angular.IAugmentedJQuery) {
                 ng1DescendantElement = $element.contents!();

                 $element.on!('click', elementClickListener);
                 ng1DescendantElement.on!('click', descendantClickListener);
               }
             },
             template: '<div></div>'
           };

           // Define `Ng1ComponentFacade`
           @Directive({selector: 'ng1'})
           class Ng1ComponentFacade extends UpgradeComponent {
             constructor(elementRef: ElementRef, injector: Injector) {
               super('ng1', elementRef, injector);
             }
           }

           // Define `Ng2Component`
           @Component({selector: 'ng2A', template: '<ng2B *ngIf="!destroyIt"></ng2B>'})
           class Ng2ComponentA {
             destroyIt = false;

             constructor() {
               ng2ComponentAInstance = this;
             }
           }

           @Component({selector: 'ng2B', template: '<ng1></ng1>'})
           class Ng2ComponentB {
           }

           // Define `ng1Module`
           const ng1Module = angular.module_('ng1Module', [])
                                 .component('ng1', ng1Component)
                                 .directive('ng2A', downgradeComponent({component: Ng2ComponentA}));

           // Define `Ng2Module`
           @NgModule({
             declarations: [Ng1ComponentFacade, Ng2ComponentA, Ng2ComponentB],
             entryComponents: [Ng2ComponentA],
             imports: [BrowserModule, UpgradeModule]
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2-a></ng2-a>`);

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(adapter => {
             (ng1DescendantElement[0] as HTMLElement).click();
             expect(elementClickListener).toHaveBeenCalledTimes(1);
             expect(descendantClickListener).toHaveBeenCalledTimes(1);

             ng2ComponentAInstance.destroyIt = true;
             $digest(adapter);

             (ng1DescendantElement[0] as HTMLElement).click();
             expect(elementClickListener).toHaveBeenCalledTimes(1);
             expect(descendantClickListener).toHaveBeenCalledTimes(1);
           });
         }));

      it('should clean up `$doCheck()` watchers from the parent scope', waitForAsync(() => {
           let ng2Component: Ng2Component;

           // Define `ng1Component`
           const ng1Component: angular.IComponent = {
             template: 'ng1',
             controller: class {
               $doCheck() {}
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
           @Component({selector: 'ng2', template: '<ng1 *ngIf="doShow"></ng1>'})
           class Ng2Component {
             doShow: boolean = false;
             constructor(@Inject($SCOPE) public $scope: angular.IScope) {
               ng2Component = this;
             }
           }

           // Define `ng1Module`
           const ng1Module = angular.module_('ng1Module', [])
                                 .component('ng1', ng1Component)
                                 .directive('ng2', downgradeComponent({component: Ng2Component}));

           // Define `Ng2Module`
           @NgModule({
             imports: [BrowserModule, UpgradeModule],
             declarations: [Ng1ComponentFacade, Ng2Component],
             entryComponents: [Ng2Component]
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(adapter => {
             const getWatcherCount: () => number = () =>
                 (ng2Component.$scope as any).$$watchers.length;
             const baseWatcherCount = getWatcherCount();

             expect(multiTrim(document.body.textContent)).toBe('');

             ng2Component.doShow = true;
             $digest(adapter);
             expect(multiTrim(document.body.textContent)).toBe('ng1');
             expect(getWatcherCount()).toBe(baseWatcherCount + 1);

             ng2Component.doShow = false;
             $digest(adapter);
             expect(multiTrim(document.body.textContent)).toBe('');
             expect(getWatcherCount()).toBe(baseWatcherCount);

             ng2Component.doShow = true;
             $digest(adapter);
             expect(multiTrim(document.body.textContent)).toBe('ng1');
             expect(getWatcherCount()).toBe(baseWatcherCount + 1);
           });
         }));
    });

    it('should support ng2 > ng1 > ng2 (no inputs/outputs)', waitForAsync(() => {
         // Define `ng1Component`
         const ng1Component: angular.IComponent = {template: 'ng1X(<ng2-b></ng2-b>)'};

         // Define `Ng1ComponentFacade`
         @Directive({selector: 'ng1X'})
         class Ng1ComponentFacade extends UpgradeComponent {
           constructor(elementRef: ElementRef, injector: Injector) {
             super('ng1X', elementRef, injector);
           }
         }

         // Define `Ng2Component`
         @Component({selector: 'ng2-a', template: 'ng2A(<ng1X></ng1X>)'})
         class Ng2ComponentA {
         }

         @Component({selector: 'ng2-b', template: 'ng2B'})
         class Ng2ComponentB {
         }

         // Define `ng1Module`
         const ng1Module = angular.module_('ng1', [])
                               .component('ng1X', ng1Component)
                               .directive('ng2A', downgradeComponent({component: Ng2ComponentA}))
                               .directive('ng2B', downgradeComponent({component: Ng2ComponentB}));

         // Define `Ng2Module`
         @NgModule({
           declarations: [Ng1ComponentFacade, Ng2ComponentA, Ng2ComponentB],
           entryComponents: [Ng2ComponentA, Ng2ComponentB],
           imports: [BrowserModule, UpgradeModule],
           schemas: [NO_ERRORS_SCHEMA],
         })
         class Ng2Module {
           ngDoBootstrap() {}
         }

         // Bootstrap
         const element = html(`<ng2-a></ng2-a>`);

         bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
           expect(multiTrim(document.body.textContent)).toBe('ng2A(ng1X(ng2B))');
         });
       }));

    it('should support ng2 > ng1 > ng2 (with inputs/outputs)', fakeAsync(() => {
         let ng2ComponentAInstance: Ng2ComponentA;
         let ng2ComponentBInstance: Ng2ComponentB;
         let ng1ControllerXInstance: Ng1ControllerX;

         // Define `ng1Component`
         class Ng1ControllerX {
           // TODO(issue/24571): remove '!'.
           ng1XInputA!: string;
           ng1XInputB: any;
           ng1XInputC: any;

           constructor() {
             ng1ControllerXInstance = this;
           }
         }
         const ng1Component: angular.IComponent = {
           template: `
              ng1X({{ $ctrl.ng1XInputA }}, {{ $ctrl.ng1XInputB.value }}, {{ $ctrl.ng1XInputC.value }}) |
              <ng2-b
                [ng2-b-input1]="$ctrl.ng1XInputA"
                [ng2-b-input-c]="$ctrl.ng1XInputC.value"
                (ng2-b-output-c)="$ctrl.ng1XInputC = {value: $event}">
              </ng2-b>
            `,
           bindings: {
             ng1XInputA: '@',
             ng1XInputB: '<',
             ng1XInputC: '=',
             ng1XOutputA: '&',
             ng1XOutputB: '&'
           },
           controller: Ng1ControllerX
         };

         // Define `Ng1ComponentFacade`
         @Directive({selector: 'ng1X'})
         class Ng1ComponentXFacade extends UpgradeComponent {
           // TODO(issue/24571): remove '!'.
           @Input() ng1XInputA!: string;
           @Input() ng1XInputB: any;
           @Input() ng1XInputC: any;
           // TODO(issue/24571): remove '!'.
           @Output() ng1XInputCChange!: EventEmitter<any>;
           // TODO(issue/24571): remove '!'.
           @Output() ng1XOutputA!: EventEmitter<any>;
           // TODO(issue/24571): remove '!'.
           @Output() ng1XOutputB!: EventEmitter<any>;

           constructor(elementRef: ElementRef, injector: Injector) {
             super('ng1X', elementRef, injector);
           }
         }

         // Define `Ng2Component`
         @Component({
           selector: 'ng2-a',
           template: `
              ng2A({{ ng2ADataA.value }}, {{ ng2ADataB.value }}, {{ ng2ADataC.value }}) |
              <ng1X
                  ng1XInputA="{{ ng2ADataA.value }}"
                  bind-ng1XInputB="ng2ADataB"
                  [(ng1XInputC)]="ng2ADataC"
                  (ng1XOutputA)="ng2ADataA = $event"
                  on-ng1XOutputB="ng2ADataB.value = $event">
              </ng1X>
            `
         })
         class Ng2ComponentA {
           ng2ADataA = {value: 'foo'};
           ng2ADataB = {value: 'bar'};
           ng2ADataC = {value: 'baz'};

           constructor() {
             ng2ComponentAInstance = this;
           }
         }

         @Component({selector: 'ng2-b', template: 'ng2B({{ ng2BInputA }}, {{ ng2BInputC }})'})
         class Ng2ComponentB {
           @Input('ng2BInput1') ng2BInputA: any;
           @Input() ng2BInputC: any;
           @Output() ng2BOutputC = new EventEmitter();

           constructor() {
             ng2ComponentBInstance = this;
           }
         }

         // Define `ng1Module`
         const ng1Module = angular.module_('ng1', [])
                               .component('ng1X', ng1Component)
                               .directive('ng2A', downgradeComponent({component: Ng2ComponentA}))
                               .directive('ng2B', downgradeComponent({component: Ng2ComponentB}));

         // Define `Ng2Module`
         @NgModule({
           declarations: [Ng1ComponentXFacade, Ng2ComponentA, Ng2ComponentB],
           entryComponents: [Ng2ComponentA, Ng2ComponentB],
           imports: [BrowserModule, UpgradeModule],
           schemas: [NO_ERRORS_SCHEMA],
         })
         class Ng2Module {
           ngDoBootstrap() {}
         }

         // Bootstrap
         const element = html(`<ng2-a></ng2-a>`);

         bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(adapter => {
           // Initial value propagation.
           // (ng2A > ng1X > ng2B)
           expect(multiTrim(document.body.textContent))
               .toBe('ng2A(foo, bar, baz) | ng1X(foo, bar, baz) | ng2B(foo, baz)');

           // Update `ng2BInputA`/`ng2BInputC`.
           // (Should not propagate upwards.)
           ng2ComponentBInstance.ng2BInputA = 'foo2';
           ng2ComponentBInstance.ng2BInputC = 'baz2';
           $digest(adapter);
           tick();

           expect(multiTrim(document.body.textContent))
               .toBe('ng2A(foo, bar, baz) | ng1X(foo, bar, baz) | ng2B(foo2, baz2)');

           // Emit from `ng2BOutputC`.
           // (Should propagate all the way up to `ng1ADataC` and back all the way down to
           // `ng2BInputC`.)
           ng2ComponentBInstance.ng2BOutputC.emit('baz3');
           $digest(adapter);
           tick();

           expect(multiTrim(document.body.textContent))
               .toBe('ng2A(foo, bar, baz3) | ng1X(foo, bar, baz3) | ng2B(foo2, baz3)');

           // Update `ng1XInputA`/`ng1XInputB`.
           // (Should not propagate upwards, only downwards.)
           ng1ControllerXInstance.ng1XInputA = 'foo4';
           ng1ControllerXInstance.ng1XInputB = {value: 'bar4'};
           $digest(adapter);
           tick();

           expect(multiTrim(document.body.textContent))
               .toBe('ng2A(foo, bar, baz3) | ng1X(foo4, bar4, baz3) | ng2B(foo4, baz3)');

           // Update `ng1XInputC`.
           // (Should propagate upwards and downwards.)
           ng1ControllerXInstance.ng1XInputC = {value: 'baz5'};
           $digest(adapter);
           tick();

           expect(multiTrim(document.body.textContent))
               .toBe('ng2A(foo, bar, baz5) | ng1X(foo4, bar4, baz5) | ng2B(foo4, baz5)');

           // Update a property on `ng1XInputC`.
           // (Should propagate upwards and downwards.)
           ng1ControllerXInstance.ng1XInputC.value = 'baz6';
           $digest(adapter);
           tick();

           expect(multiTrim(document.body.textContent))
               .toBe('ng2A(foo, bar, baz6) | ng1X(foo4, bar4, baz6) | ng2B(foo4, baz6)');

           // Emit from `ng1XOutputA`.
           // (Should propagate upwards to `ng1ADataA` and back all the way down to
           // `ng2BInputA`.)
           (ng1ControllerXInstance as any).ng1XOutputA({value: 'foo7'});
           $digest(adapter);
           tick();

           expect(multiTrim(document.body.textContent))
               .toBe('ng2A(foo7, bar, baz6) | ng1X(foo7, bar4, baz6) | ng2B(foo7, baz6)');

           // Emit from `ng1XOutputB`.
           // (Should propagate upwards to `ng1ADataB`, but not downwards,
           //  since `ng1XInputB` has been re-assigned (i.e. `ng2ADataB !== ng1XInputB`).)
           (ng1ControllerXInstance as any).ng1XOutputB('bar8');
           $digest(adapter);
           tick();

           expect(multiTrim(document.body.textContent))
               .toBe('ng2A(foo7, bar8, baz6) | ng1X(foo7, bar4, baz6) | ng2B(foo7, baz6)');

           // Update `ng2ADataA`/`ng2ADataB`/`ng2ADataC`.
           // (Should propagate everywhere.)
           ng2ComponentAInstance.ng2ADataA = {value: 'foo9'};
           ng2ComponentAInstance.ng2ADataB = {value: 'bar9'};
           ng2ComponentAInstance.ng2ADataC = {value: 'baz9'};
           $digest(adapter);
           tick();

           expect(multiTrim(document.body.textContent))
               .toBe('ng2A(foo9, bar9, baz9) | ng1X(foo9, bar9, baz9) | ng2B(foo9, baz9)');
         });
       }));

    it('should support ng2 > ng1 > ng2 > ng1 (with `require`)', waitForAsync(() => {
         // Define `ng1Component`
         const ng1ComponentA: angular.IComponent = {
           template: 'ng1A(<ng2-b></ng2-b>)',
           controller: class {
             value = 'ng1A';
           }
         };

         const ng1ComponentB: angular.IComponent = {
           template:
               'ng1B(^^ng1A: {{ $ctrl.ng1A.value }} | ?^^ng1B: {{ $ctrl.ng1B.value }} | ^ng1B: {{ $ctrl.ng1BSelf.value }})',
           require: {ng1A: '^^', ng1B: '?^^', ng1BSelf: '^ng1B'},
           controller: class {
             value = 'ng1B';
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
         @Component({selector: 'ng2-a', template: 'ng2A(<ng1A></ng1A>)'})
         class Ng2ComponentA {
         }

         @Component({selector: 'ng2-b', template: 'ng2B(<ng1B></ng1B>)'})
         class Ng2ComponentB {
         }

         // Define `ng1Module`
         const ng1Module = angular.module_('ng1', [])
                               .component('ng1A', ng1ComponentA)
                               .component('ng1B', ng1ComponentB)
                               .directive('ng2A', downgradeComponent({component: Ng2ComponentA}))
                               .directive('ng2B', downgradeComponent({component: Ng2ComponentB}));

         // Define `Ng2Module`
         @NgModule({
           declarations: [Ng1ComponentAFacade, Ng1ComponentBFacade, Ng2ComponentA, Ng2ComponentB],
           entryComponents: [Ng2ComponentA, Ng2ComponentB],
           imports: [BrowserModule, UpgradeModule],
           schemas: [NO_ERRORS_SCHEMA],
         })
         class Ng2Module {
           ngDoBootstrap() {}
         }

         // Bootstrap
         const element = html(`<ng2-a></ng2-a>`);

         bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(() => {
           expect(multiTrim(document.body.textContent))
               .toBe('ng2A(ng1A(ng2B(ng1B(^^ng1A: ng1A | ?^^ng1B: | ^ng1B: ng1B))))');
         });
       }));
  });
});
