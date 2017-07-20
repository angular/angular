/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef, Class, Component, EventEmitter, Input, NO_ERRORS_SCHEMA, NgModule, NgZone, OnChanges, SimpleChange, SimpleChanges, Testability, destroyPlatform, forwardRef} from '@angular/core';
import {async, fakeAsync, flushMicrotasks, tick} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import * as angular from '@angular/upgrade/src/common/angular1';
import {UpgradeAdapter, UpgradeAdapterRef} from '@angular/upgrade/src/dynamic/upgrade_adapter';
import {$digest, html, multiTrim} from './test_helpers';

export function main() {
  describe('adapter: ng1 to ng2', () => {
    beforeEach(() => destroyPlatform());
    afterEach(() => destroyPlatform());

    describe('(basic use)', () => {
      it('should have AngularJS loaded', () => expect(angular.version.major).toBe(1));

      it('should instantiate ng2 in ng1 template and project content', async(() => {
           const ng1Module = angular.module('ng1', []);

           const Ng2 = Component({
                         selector: 'ng2',
                         template: `{{ 'NG2' }}(<ng-content></ng-content>)`,
                       }).Class({constructor: function() {}});

           const Ng2Module = NgModule({declarations: [Ng2], imports: [BrowserModule]}).Class({
             constructor: function() {}
           });

           const element =
               html('<div>{{ \'ng1[\' }}<ng2>~{{ \'ng-content\' }}~</ng2>{{ \']\' }}</div>');

           const adapter: UpgradeAdapter = new UpgradeAdapter(Ng2Module);
           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(document.body.textContent).toEqual('ng1[NG2(~ng-content~)]');
             ref.dispose();
           });
         }));

      it('should instantiate ng1 in ng2 template and project content', async(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module('ng1', []);

           const Ng2 = Component({
                         selector: 'ng2',
                         template: `{{ 'ng2(' }}<ng1>{{'transclude'}}</ng1>{{ ')' }}`,
                       }).Class({constructor: function Ng2() {}});

           const Ng2Module = NgModule({
                               declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
                               imports: [BrowserModule],
                             }).Class({constructor: function Ng2Module() {}});

           ng1Module.directive('ng1', () => {
             return {transclude: true, template: '{{ "ng1" }}(<ng-transclude></ng-transclude>)'};
           });
           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));

           const element = html('<div>{{\'ng1(\'}}<ng2></ng2>{{\')\'}}</div>');

           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(document.body.textContent).toEqual('ng1(ng2(ng1(transclude)))');
             ref.dispose();
           });
         }));

      it('supports the compilerOptions argument', async(() => {
           const platformRef = platformBrowserDynamic();
           spyOn(platformRef, '_bootstrapModuleWithZone').and.callThrough();

           const ng1Module = angular.module('ng1', []);
           const Ng2 = Component({
                         selector: 'ng2',
                         template: `{{ 'NG2' }}(<ng-content></ng-content>)`
                       }).Class({constructor: function() {}});

           const element =
               html('<div>{{ \'ng1[\' }}<ng2>~{{ \'ng-content\' }}~</ng2>{{ \']\' }}</div>');

           const Ng2AppModule =
               NgModule({
                 declarations: [Ng2],
                 imports: [BrowserModule],
               }).Class({constructor: function Ng2AppModule() {}, ngDoBootstrap: function() {}});

           const adapter: UpgradeAdapter = new UpgradeAdapter(Ng2AppModule, {providers: []});
           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect((platformRef as any)._bootstrapModuleWithZone)
                 .toHaveBeenCalledWith(jasmine.any(Function), {providers: []}, jasmine.any(Object));
             ref.dispose();
           });
         }));
    });

    describe('bootstrap errors', () => {
      let adapter: UpgradeAdapter;

      beforeEach(() => {
        angular.module('ng1', []);

        const ng2Component = Component({
                               selector: 'ng2',
                               template: `<BAD TEMPLATE div></div>`,
                             }).Class({constructor: function() {}});

        const Ng2Module = NgModule({
                            declarations: [ng2Component],
                            imports: [BrowserModule],
                          }).Class({constructor: function() {}});

        adapter = new UpgradeAdapter(Ng2Module);
      });

      it('should throw an uncaught error', fakeAsync(() => {
           const resolveSpy = jasmine.createSpy('resolveSpy');
           spyOn(console, 'error');

           expect(() => {
             adapter.bootstrap(html('<ng2></ng2>'), ['ng1']).ready(resolveSpy);
             flushMicrotasks();
           }).toThrowError();
           expect(resolveSpy).not.toHaveBeenCalled();
         }));

      it('should output an error message to the console and re-throw', fakeAsync(() => {
           const consoleErrorSpy: jasmine.Spy = spyOn(console, 'error');
           expect(() => {
             adapter.bootstrap(html('<ng2></ng2>'), ['ng1']);
             flushMicrotasks();
           }).toThrowError();
           const args: any[] = consoleErrorSpy.calls.mostRecent().args;
           expect(consoleErrorSpy).toHaveBeenCalled();
           expect(args.length).toBeGreaterThan(0);
           expect(args[0]).toEqual(jasmine.any(Error));
         }));
    });

    describe('scope/component change-detection', () => {
      it('should interleave scope and component expressions', async(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module('ng1', []);
           const log: string[] = [];
           const l = (value: string) => {
             log.push(value);
             return value + ';';
           };

           ng1Module.directive('ng1a', () => ({template: '{{ l(\'ng1a\') }}'}));
           ng1Module.directive('ng1b', () => ({template: '{{ l(\'ng1b\') }}'}));
           ng1Module.run(($rootScope: any) => {
             $rootScope.l = l;
             $rootScope.reset = () => log.length = 0;
           });

           const Ng2 = Component({
                         selector: 'ng2',
                         template: `{{l('2A')}}<ng1a></ng1a>{{l('2B')}}<ng1b></ng1b>{{l('2C')}}`
                       }).Class({constructor: function() { this.l = l; }});

           const Ng2Module =
               NgModule({
                 declarations: [
                   adapter.upgradeNg1Component('ng1a'), adapter.upgradeNg1Component('ng1b'), Ng2
                 ],
                 imports: [BrowserModule],
               }).Class({constructor: function() {}});

           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));

           const element =
               html('<div>{{reset(); l(\'1A\');}}<ng2>{{l(\'1B\')}}</ng2>{{l(\'1C\')}}</div>');
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(document.body.textContent).toEqual('1A;2A;ng1a;2B;ng1b;2C;1C;');
             // https://github.com/angular/angular.js/issues/12983
             expect(log).toEqual(['1A', '1C', '2A', '2B', '2C', 'ng1a', 'ng1b']);
             ref.dispose();
           });
         }));


      it('should propagate changes to a downgraded component inside the ngZone', async(() => {
           let appComponent: AppComponent;
           let upgradeRef: UpgradeAdapterRef;

           @Component({selector: 'my-app', template: '<my-child [value]="value"></my-child>'})
           class AppComponent {
             value: number;
             constructor() { appComponent = this; }
           }

           @Component({
             selector: 'my-child',
             template: '<div>{{valueFromPromise}}',
           })
           class ChildComponent {
             valueFromPromise: number;
             @Input()
             set value(v: number) { expect(NgZone.isInAngularZone()).toBe(true); }

             constructor(private zone: NgZone) {}

             ngOnChanges(changes: SimpleChanges) {
               if (changes['value'].isFirstChange()) return;

               this.zone.onMicrotaskEmpty.subscribe(() => {
                 expect(element.textContent).toEqual('5');
                 upgradeRef.dispose();
               });

               Promise.resolve().then(() => this.valueFromPromise = changes['value'].currentValue);
             }
           }

           @NgModule({declarations: [AppComponent, ChildComponent], imports: [BrowserModule]})
           class Ng2Module {
           }

           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module('ng1', []).directive(
               'myApp', adapter.downgradeNg2Component(AppComponent));

           const element = html('<my-app></my-app>');

           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             upgradeRef = ref;
             appComponent.value = 5;
           });
         }));

      // This test demonstrates https://github.com/angular/angular/issues/6385
      // which was invalidly fixed by https://github.com/angular/angular/pull/6386
      // it('should not trigger $digest from an async operation in a watcher', async(() => {
      //      @Component({selector: 'my-app', template: ''})
      //      class AppComponent {
      //      }

      //      @NgModule({declarations: [AppComponent], imports: [BrowserModule]})
      //      class Ng2Module {
      //      }

      //      const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
      //      const ng1Module = angular.module('ng1', []).directive(
      //          'myApp', adapter.downgradeNg2Component(AppComponent));

      //      const element = html('<my-app></my-app>');

      //      adapter.bootstrap(element, ['ng1']).ready((ref) => {
      //        let doTimeout = false;
      //        let timeoutId: number;
      //        ref.ng1RootScope.$watch(() => {
      //          if (doTimeout && !timeoutId) {
      //            timeoutId = window.setTimeout(function() {
      //              timeoutId = null;
      //            }, 10);
      //          }
      //        });
      //        doTimeout = true;
      //      });
      //    }));
    });

    describe('downgrade ng2 component', () => {
      it('should allow non-element selectors for downgraded components', async(() => {
           @Component({selector: '[itWorks]', template: 'It works'})
           class WorksComponent {
           }

           @NgModule({declarations: [WorksComponent], imports: [BrowserModule]})
           class Ng2Module {
           }

           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module('ng1', []);
           ng1Module.directive('ng2', adapter.downgradeNg2Component(WorksComponent));

           const element = html('<ng2></ng2>');
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(multiTrim(document.body.textContent !)).toBe('It works');
           });
         }));

      it('should bind properties, events', async(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module =
               angular.module('ng1', []).value('$exceptionHandler', (err: any) => { throw err; });

           ng1Module.run(($rootScope: any) => {
             $rootScope.name = 'world';
             $rootScope.dataA = 'A';
             $rootScope.dataB = 'B';
             $rootScope.modelA = 'initModelA';
             $rootScope.modelB = 'initModelB';
             $rootScope.eventA = '?';
             $rootScope.eventB = '?';
           });
           const Ng2 = Component({
                         selector: 'ng2',
                         inputs:
                             ['literal', 'interpolate', 'oneWayA', 'oneWayB', 'twoWayA', 'twoWayB'],
                         outputs: [
                           'eventA', 'eventB', 'twoWayAEmitter: twoWayAChange',
                           'twoWayBEmitter: twoWayBChange'
                         ],
                         template: 'ignore: {{ignore}}; ' +
                             'literal: {{literal}}; interpolate: {{interpolate}}; ' +
                             'oneWayA: {{oneWayA}}; oneWayB: {{oneWayB}}; ' +
                             'twoWayA: {{twoWayA}}; twoWayB: {{twoWayB}}; ({{ngOnChangesCount}})'
                       }).Class({
             constructor: function() {
               this.ngOnChangesCount = 0;
               this.ignore = '-';
               this.literal = '?';
               this.interpolate = '?';
               this.oneWayA = '?';
               this.oneWayB = '?';
               this.twoWayA = '?';
               this.twoWayB = '?';
               this.eventA = new EventEmitter();
               this.eventB = new EventEmitter();
               this.twoWayAEmitter = new EventEmitter();
               this.twoWayBEmitter = new EventEmitter();
             },
             ngOnChanges: function(changes: SimpleChanges) {
               const assert = (prop: string, value: any) => {
                 if (this[prop] != value) {
                   throw new Error(`Expected: '${prop}' to be '${value}' but was '${this[prop]}'`);
                 }
               };

               const assertChange = (prop: string, value: any) => {
                 assert(prop, value);
                 if (!changes[prop]) {
                   throw new Error(`Changes record for '${prop}' not found.`);
                 }
                 const actValue = changes[prop].currentValue;
                 if (actValue != value) {
                   throw new Error(
                       `Expected changes record for'${prop}' to be '${value}' but was '${actValue}'`);
                 }
               };

               switch (this.ngOnChangesCount++) {
                 case 0:
                   assert('ignore', '-');
                   assertChange('literal', 'Text');
                   assertChange('interpolate', 'Hello world');
                   assertChange('oneWayA', 'A');
                   assertChange('oneWayB', 'B');
                   assertChange('twoWayA', 'initModelA');
                   assertChange('twoWayB', 'initModelB');

                   this.twoWayAEmitter.emit('newA');
                   this.twoWayBEmitter.emit('newB');
                   this.eventA.emit('aFired');
                   this.eventB.emit('bFired');
                   break;
                 case 1:
                   assertChange('twoWayA', 'newA');
                   assertChange('twoWayB', 'newB');
                   break;
                 case 2:
                   assertChange('interpolate', 'Hello everyone');
                   break;
                 default:
                   throw new Error('Called too many times! ' + JSON.stringify(changes));
               }
             }
           });
           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));

           const Ng2Module = NgModule({
                               declarations: [Ng2],
                               imports: [BrowserModule],
                             }).Class({constructor: function() {}});

           const element = html(`<div>
              <ng2 literal="Text" interpolate="Hello {{name}}"
                   bind-one-way-a="dataA" [one-way-b]="dataB"
                   bindon-two-way-a="modelA" [(two-way-b)]="modelB"
                   on-event-a='eventA=$event' (event-b)="eventB=$event"></ng2>
              | modelA: {{modelA}}; modelB: {{modelB}}; eventA: {{eventA}}; eventB: {{eventB}};
              </div>`);
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(multiTrim(document.body.textContent !))
                 .toEqual(
                     'ignore: -; ' +
                     'literal: Text; interpolate: Hello world; ' +
                     'oneWayA: A; oneWayB: B; twoWayA: newA; twoWayB: newB; (2) | ' +
                     'modelA: newA; modelB: newB; eventA: aFired; eventB: bFired;');

             ref.ng1RootScope.$apply('name = "everyone"');
             expect(multiTrim(document.body.textContent !))
                 .toEqual(
                     'ignore: -; ' +
                     'literal: Text; interpolate: Hello everyone; ' +
                     'oneWayA: A; oneWayB: B; twoWayA: newA; twoWayB: newB; (3) | ' +
                     'modelA: newA; modelB: newB; eventA: aFired; eventB: bFired;');

             ref.dispose();
           });

         }));

      it('should initialize inputs in time for `ngOnChanges`', async(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));

           @Component({
             selector: 'ng2',
             template: `
               ngOnChangesCount: {{ ngOnChangesCount }} |
               firstChangesCount: {{ firstChangesCount }} |
               initialValue: {{ initialValue }}`
           })
           class Ng2Component implements OnChanges {
             ngOnChangesCount = 0;
             firstChangesCount = 0;
             initialValue: string;
             @Input() foo: string;

             ngOnChanges(changes: SimpleChanges) {
               this.ngOnChangesCount++;

               if (this.ngOnChangesCount === 1) {
                 this.initialValue = this.foo;
               }

               if (changes['foo'] && changes['foo'].isFirstChange()) {
                 this.firstChangesCount++;
               }
             }
           }

           @NgModule({imports: [BrowserModule], declarations: [Ng2Component]})
           class Ng2Module {
           }

           const ng1Module = angular.module('ng1', []).directive(
               'ng2', adapter.downgradeNg2Component(Ng2Component));

           const element = html(`
             <ng2 [foo]="'foo'"></ng2>
             <ng2 foo="bar"></ng2>
             <ng2 [foo]="'baz'" ng-if="true"></ng2>
             <ng2 foo="qux" ng-if="true"></ng2>
           `);

           adapter.bootstrap(element, ['ng1']).ready(ref => {
             const nodes = element.querySelectorAll('ng2');
             const expectedTextWith = (value: string) =>
                 `ngOnChangesCount: 1 | firstChangesCount: 1 | initialValue: ${value}`;

             expect(multiTrim(nodes[0].textContent)).toBe(expectedTextWith('foo'));
             expect(multiTrim(nodes[1].textContent)).toBe(expectedTextWith('bar'));
             expect(multiTrim(nodes[2].textContent)).toBe(expectedTextWith('baz'));
             expect(multiTrim(nodes[3].textContent)).toBe(expectedTextWith('qux'));

             ref.dispose();
           });
         }));

      it('should bind to ng-model', async(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module('ng1', []);

           ng1Module.run(($rootScope: any /** TODO #9100 */) => { $rootScope.modelA = 'A'; });

           let ng2Instance: Ng2;
           @Component({selector: 'ng2', template: '{{_value}}'})
           class Ng2 {
             private _value: any = '';
             private _onChangeCallback: (_: any) => void = () => {};
             constructor() { ng2Instance = this; }
             writeValue(value: any) { this._value = value; }
             registerOnChange(fn: any) { this._onChangeCallback = fn; }
             doChange(newValue: string) {
               this._value = newValue;
               this._onChangeCallback(newValue);
             }
           }

           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           const element = html(`<div><ng2 ng-model="modelA"></ng2> | {{modelA}}</div>`);

           const Ng2Module = NgModule({
                               declarations: [Ng2],
                               imports: [BrowserModule],
                               schemas: [NO_ERRORS_SCHEMA],
                             }).Class({constructor: function() {}});

           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             let $rootScope: any = ref.ng1RootScope;

             expect(multiTrim(document.body.textContent)).toEqual('A | A');

             $rootScope.modelA = 'B';
             $rootScope.$apply();
             expect(multiTrim(document.body.textContent)).toEqual('B | B');

             ng2Instance.doChange('C');
             expect($rootScope.modelA).toBe('C');
             expect(multiTrim(document.body.textContent)).toEqual('C | C');

             ref.dispose();
           });
         }));

      it('should properly run cleanup when ng1 directive is destroyed', async(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module('ng1', []);
           const onDestroyed: EventEmitter<string> = new EventEmitter<string>();

           ng1Module.directive('ng1', () => {
             return {
               template: '<div ng-if="!destroyIt"><ng2></ng2></div>',
               controller: function($rootScope: any, $timeout: Function) {
                 $timeout(() => { $rootScope.destroyIt = true; });
               }
             };
           });

           const Ng2 = Component({selector: 'ng2', template: 'test'}).Class({
             constructor: function() {},
             ngOnDestroy: function() { onDestroyed.emit('destroyed'); }
           });

           const Ng2Module = NgModule({
                               declarations: [Ng2],
                               imports: [BrowserModule],
                             }).Class({constructor: function() {}});

           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           const element = html('<ng1></ng1>');
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             onDestroyed.subscribe(() => { ref.dispose(); });
           });
         }));

      it('should fallback to the root ng2.injector when compiled outside the dom', async(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module('ng1', []);

           ng1Module.directive('ng1', [
             '$compile',
             ($compile: Function) => {
               return {
                 link: function($scope: any, $element: any, $attrs: any) {
                   const compiled = $compile('<ng2></ng2>');
                   const template = compiled($scope);
                   $element.append(template);
                 }
               };
             }
           ]);

           const Ng2 =
               Component({selector: 'ng2', template: 'test'}).Class({constructor: function() {}});

           const Ng2Module = NgModule({
                               declarations: [Ng2],
                               imports: [BrowserModule],
                             }).Class({constructor: function() {}});

           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           const element = html('<ng1></ng1>');
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(multiTrim(document.body.textContent)).toEqual('test');
             ref.dispose();
           });
         }));

      it('should support multi-slot projection', async(() => {
           const ng1Module = angular.module('ng1', []);

           const Ng2 = Component({
                         selector: 'ng2',
                         template: '2a(<ng-content select=".ng1a"></ng-content>)' +
                             '2b(<ng-content select=".ng1b"></ng-content>)'
                       }).Class({constructor: function() {}});

           const Ng2Module = NgModule({declarations: [Ng2], imports: [BrowserModule]}).Class({
             constructor: function() {}
           });

           // The ng-if on one of the projected children is here to make sure
           // the correct slot is targeted even with structural directives in play.
           const element = html(
               '<ng2><div ng-if="true" class="ng1a">1a</div><div' +
               ' class="ng1b">1b</div></ng2>');

           const adapter: UpgradeAdapter = new UpgradeAdapter(Ng2Module);
           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(document.body.textContent).toEqual('2a(1a)2b(1b)');
             ref.dispose();
           });
         }));

      it('should correctly project structural directives', async(() => {
           @Component({selector: 'ng2', template: 'ng2-{{ itemId }}(<ng-content></ng-content>)'})
           class Ng2Component {
             @Input() itemId: string;
           }

           @NgModule({imports: [BrowserModule], declarations: [Ng2Component]})
           class Ng2Module {
           }

           const adapter: UpgradeAdapter = new UpgradeAdapter(Ng2Module);
           const ng1Module = angular.module('ng1', [])
                                 .directive('ng2', adapter.downgradeNg2Component(Ng2Component))
                                 .run(($rootScope: angular.IRootScopeService) => {
                                   $rootScope['items'] = [
                                     {id: 'a', subitems: [1, 2, 3]}, {id: 'b', subitems: [4, 5, 6]},
                                     {id: 'c', subitems: [7, 8, 9]}
                                   ];
                                 });

           const element = html(`
             <ng2 ng-repeat="item in items" [item-id]="item.id">
               <div ng-repeat="subitem in item.subitems">{{ subitem }}</div>
             </ng2>
           `);

           adapter.bootstrap(element, [ng1Module.name]).ready(ref => {
             expect(multiTrim(document.body.textContent))
                 .toBe('ng2-a( 123 )ng2-b( 456 )ng2-c( 789 )');
             ref.dispose();
           });
         }));

      it('should allow attribute selectors for components in ng2', async(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => MyNg2Module));
           const ng1Module = angular.module('myExample', []);

           @Component({selector: '[works]', template: 'works!'})
           class WorksComponent {
           }

           @Component({selector: 'root-component', template: 'It <div works></div>'})
           class RootComponent {
           }

           @NgModule({imports: [BrowserModule], declarations: [RootComponent, WorksComponent]})
           class MyNg2Module {
           }

           ng1Module.directive('rootComponent', adapter.downgradeNg2Component(RootComponent));

           document.body.innerHTML = '<root-component></root-component>';
           adapter.bootstrap(document.body.firstElementChild !, ['myExample']).ready((ref) => {
             expect(multiTrim(document.body.textContent)).toEqual('It works!');
             ref.dispose();
           });
         }));
    });

    describe('upgrade ng1 component', () => {
      it('should support `@` bindings', fakeAsync(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           let ng2ComponentInstance: Ng2Component;

           // Define `ng1Component`
           const ng1Component: angular.IComponent = {
             template: 'Inside: {{ $ctrl.inputA }}, {{ $ctrl.inputB }}',
             bindings: {inputA: '@inputAttrA', inputB: '@'}
           };

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

             constructor() { ng2ComponentInstance = this; }
           }

           // Define `ng1Module`
           const ng1Module = angular.module('ng1Module', [])
                                 .component('ng1', ng1Component)
                                 .directive('ng2', adapter.downgradeNg2Component(Ng2Component));

           // Define `Ng2Module`
           @NgModule({
             declarations: [adapter.upgradeNg1Component('ng1'), Ng2Component],
             imports: [BrowserModule]
           })
           class Ng2Module {
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           adapter.bootstrap(element, ['ng1Module']).ready(ref => {
             const ng1 = element.querySelector('ng1') !;
             const ng1Controller = angular.element(ng1).controller !('ng1');

             expect(multiTrim(element.textContent)).toBe('Inside: foo, bar | Outside: foo, bar');

             ng1Controller.inputA = 'baz';
             ng1Controller.inputB = 'qux';
             $digest(ref);

             expect(multiTrim(element.textContent)).toBe('Inside: baz, qux | Outside: foo, bar');

             ng2ComponentInstance.dataA = 'foo2';
             ng2ComponentInstance.dataB = 'bar2';
             $digest(ref);

             expect(multiTrim(element.textContent))
                 .toBe('Inside: foo2, bar2 | Outside: foo2, bar2');

             ref.dispose();
           });
         }));

      it('should support `<` bindings', fakeAsync(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           let ng2ComponentInstance: Ng2Component;

           // Define `ng1Component`
           const ng1Component: angular.IComponent = {
             template: 'Inside: {{ $ctrl.inputA.value }}, {{ $ctrl.inputB.value }}',
             bindings: {inputA: '<inputAttrA', inputB: '<'}
           };

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

             constructor() { ng2ComponentInstance = this; }
           }

           // Define `ng1Module`
           const ng1Module = angular.module('ng1Module', [])
                                 .component('ng1', ng1Component)
                                 .directive('ng2', adapter.downgradeNg2Component(Ng2Component));

           // Define `Ng2Module`
           @NgModule({
             declarations: [adapter.upgradeNg1Component('ng1'), Ng2Component],
             imports: [BrowserModule]
           })
           class Ng2Module {
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           adapter.bootstrap(element, ['ng1Module']).ready(ref => {
             const ng1 = element.querySelector('ng1') !;
             const ng1Controller = angular.element(ng1).controller !('ng1');

             expect(multiTrim(element.textContent)).toBe('Inside: foo, bar | Outside: foo, bar');

             ng1Controller.inputA = {value: 'baz'};
             ng1Controller.inputB = {value: 'qux'};
             $digest(ref);

             expect(multiTrim(element.textContent)).toBe('Inside: baz, qux | Outside: foo, bar');

             ng2ComponentInstance.dataA = {value: 'foo2'};
             ng2ComponentInstance.dataB = {value: 'bar2'};
             $digest(ref);

             expect(multiTrim(element.textContent))
                 .toBe('Inside: foo2, bar2 | Outside: foo2, bar2');

             ref.dispose();
           });
         }));

      it('should support `=` bindings', fakeAsync(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           let ng2ComponentInstance: Ng2Component;

           // Define `ng1Component`
           const ng1Component: angular.IComponent = {
             template: 'Inside: {{ $ctrl.inputA.value }}, {{ $ctrl.inputB.value }}',
             bindings: {inputA: '=inputAttrA', inputB: '='}
           };

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

             constructor() { ng2ComponentInstance = this; }
           }

           // Define `ng1Module`
           const ng1Module = angular.module('ng1Module', [])
                                 .component('ng1', ng1Component)
                                 .directive('ng2', adapter.downgradeNg2Component(Ng2Component));

           // Define `Ng2Module`
           @NgModule({
             declarations: [adapter.upgradeNg1Component('ng1'), Ng2Component],
             imports: [BrowserModule]
           })
           class Ng2Module {
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           adapter.bootstrap(element, ['ng1Module']).ready(ref => {
             const ng1 = element.querySelector('ng1') !;
             const ng1Controller = angular.element(ng1).controller !('ng1');

             expect(multiTrim(element.textContent)).toBe('Inside: foo, bar | Outside: foo, bar');

             ng1Controller.inputA = {value: 'baz'};
             ng1Controller.inputB = {value: 'qux'};
             $digest(ref);

             expect(multiTrim(element.textContent)).toBe('Inside: baz, qux | Outside: baz, qux');

             ng2ComponentInstance.dataA = {value: 'foo2'};
             ng2ComponentInstance.dataB = {value: 'bar2'};
             $digest(ref);

             expect(multiTrim(element.textContent))
                 .toBe('Inside: foo2, bar2 | Outside: foo2, bar2');

             ref.dispose();
           });
         }));

      it('should support `&` bindings', fakeAsync(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));

           // Define `ng1Component`
           const ng1Component: angular.IComponent = {
             template: 'Inside: -',
             bindings: {outputA: '&outputAttrA', outputB: '&'}
           };

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
                                 .directive('ng2', adapter.downgradeNg2Component(Ng2Component));

           // Define `Ng2Module`
           @NgModule({
             declarations: [adapter.upgradeNg1Component('ng1'), Ng2Component],
             imports: [BrowserModule]
           })
           class Ng2Module {
           }

           // Bootstrap
           const element = html(`<ng2></ng2>`);

           adapter.bootstrap(element, ['ng1Module']).ready(ref => {
             const ng1 = element.querySelector('ng1') !;
             const ng1Controller = angular.element(ng1).controller !('ng1');

             expect(multiTrim(element.textContent)).toBe('Inside: - | Outside: foo, bar');

             ng1Controller.outputA('baz');
             ng1Controller.outputB('qux');
             $digest(ref);

             expect(multiTrim(element.textContent)).toBe('Inside: - | Outside: baz, qux');

             ref.dispose();
           });
         }));

      it('should bind properties, events', async(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module('ng1', []);

           const ng1 = () => {
             return {
               template: 'Hello {{fullName}}; A: {{modelA}}; B: {{modelB}}; C: {{modelC}}; | ',
               scope: {fullName: '@', modelA: '=dataA', modelB: '=dataB', modelC: '=', event: '&'},
               link: function(scope: any) {
                 scope.$watch('modelB', (v: string) => {
                   if (v == 'Savkin') {
                     scope.modelB = 'SAVKIN';
                     scope.event('WORKS');

                     // Should not update because [model-a] is uni directional
                     scope.modelA = 'VICTOR';
                   }
                 });
               }
             };
           };
           ng1Module.directive('ng1', ng1);
           const Ng2 =
               Component({
                 selector: 'ng2',
                 template:
                     '<ng1 fullName="{{last}}, {{first}}, {{city}}" [dataA]="first" [(dataB)]="last" [modelC]="city" ' +
                     '(event)="event=$event"></ng1>' +
                     '<ng1 fullName="{{\'TEST\'}}" dataA="First" dataB="Last" modelC="City"></ng1>' +
                     '{{event}}-{{last}}, {{first}}, {{city}}'
               }).Class({
                 constructor: function() {
                   this.first = 'Victor';
                   this.last = 'Savkin';
                   this.city = 'SF';
                   this.event = '?';
                 }
               });

           const Ng2Module = NgModule({
                               declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
                               imports: [BrowserModule],
                             }).Class({constructor: function() {}});

           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           const element = html(`<div><ng2></ng2></div>`);
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             // we need to do setTimeout, because the EventEmitter uses setTimeout to schedule
             // events, and so without this we would not see the events processed.
             setTimeout(() => {
               expect(multiTrim(document.body.textContent))
                   .toEqual(
                       'Hello SAVKIN, Victor, SF; A: VICTOR; B: SAVKIN; C: SF; | Hello TEST; A: First; B: Last; C: City; | WORKS-SAVKIN, Victor, SF');
               ref.dispose();
             }, 0);
           });
         }));

      it('should bind optional properties', async(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module('ng1', []);

           const ng1 = () => {
             return {
               template: 'Hello; A: {{modelA}}; B: {{modelB}}; | ',
               scope: {modelA: '=?dataA', modelB: '=?'}
             };
           };
           ng1Module.directive('ng1', ng1);
           const Ng2 = Component({
                         selector: 'ng2',
                         template: '<ng1 [dataA]="first" [modelB]="last"></ng1>' +
                             '<ng1 dataA="First" modelB="Last"></ng1>' +
                             '<ng1></ng1>' +
                             '<ng1></ng1>'
                       }).Class({
             constructor: function() {
               this.first = 'Victor';
               this.last = 'Savkin';
             }
           });

           const Ng2Module = NgModule({
                               declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
                               imports: [BrowserModule],
                             }).Class({constructor: function() {}});

           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           const element = html(`<div><ng2></ng2></div>`);
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             // we need to do setTimeout, because the EventEmitter uses setTimeout to schedule
             // events, and so without this we would not see the events processed.
             setTimeout(() => {
               expect(multiTrim(document.body.textContent))
                   .toEqual(
                       'Hello; A: Victor; B: Savkin; | Hello; A: First; B: Last; | Hello; A: ; B: ; | Hello; A: ; B: ; |');
               ref.dispose();
             }, 0);
           });
         }));

      it('should bind properties, events in controller when bindToController is not used',
         async(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module('ng1', []);

           const ng1 = () => {
             return {
               restrict: 'E',
               template: '{{someText}} - Length: {{data.length}}',
               scope: {data: '='},
               controller: function($scope: any) { $scope.someText = 'ng1 - Data: ' + $scope.data; }
             };
           };

           ng1Module.directive('ng1', ng1);
           const Ng2 =
               Component({
                 selector: 'ng2',
                 template:
                     '{{someText}} - Length: {{dataList.length}} | <ng1 [(data)]="dataList"></ng1>'
               }).Class({

                 constructor: function() {
                   this.dataList = [1, 2, 3];
                   this.someText = 'ng2';
                 }
               });

           const Ng2Module = NgModule({
                               declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
                               imports: [BrowserModule],
                             }).Class({constructor: function() {}});

           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           const element = html(`<div><ng2></ng2></div>`);
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             // we need to do setTimeout, because the EventEmitter uses setTimeout to schedule
             // events, and so without this we would not see the events processed.
             setTimeout(() => {
               expect(multiTrim(document.body.textContent))
                   .toEqual('ng2 - Length: 3 | ng1 - Data: 1,2,3 - Length: 3');
               ref.dispose();
             }, 0);
           });
         }));

      it('should bind properties, events in link function', async(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module('ng1', []);

           const ng1 = () => {
             return {
               restrict: 'E',
               template: '{{someText}} - Length: {{data.length}}',
               scope: {data: '='},
               link: function($scope: any) { $scope.someText = 'ng1 - Data: ' + $scope.data; }
             };
           };

           ng1Module.directive('ng1', ng1);
           const Ng2 =
               Component({
                 selector: 'ng2',
                 template:
                     '{{someText}} - Length: {{dataList.length}} | <ng1 [(data)]="dataList"></ng1>'
               }).Class({

                 constructor: function() {
                   this.dataList = [1, 2, 3];
                   this.someText = 'ng2';
                 }
               });

           const Ng2Module = NgModule({
                               declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
                               imports: [BrowserModule],
                             }).Class({constructor: function() {}});

           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           const element = html(`<div><ng2></ng2></div>`);
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             // we need to do setTimeout, because the EventEmitter uses setTimeout to schedule
             // events, and so without this we would not see the events processed.
             setTimeout(() => {
               expect(multiTrim(document.body.textContent))
                   .toEqual('ng2 - Length: 3 | ng1 - Data: 1,2,3 - Length: 3');
               ref.dispose();
             }, 0);
           });
         }));

      it('should support templateUrl fetched from $httpBackend', async(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module('ng1', []);
           ng1Module.value(
               '$httpBackend', (method: string, url: string, post: any, cbFn: Function) => {
                 cbFn(200, `${method}:${url}`);
               });

           const ng1 = () => { return {templateUrl: 'url.html'}; };
           ng1Module.directive('ng1', ng1);
           const Ng2 = Component({selector: 'ng2', template: '<ng1></ng1>'}).Class({
             constructor: function() {}
           });

           const Ng2Module = NgModule({
                               declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
                               imports: [BrowserModule],
                             }).Class({constructor: function() {}});

           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           const element = html(`<div><ng2></ng2></div>`);
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(multiTrim(document.body.textContent)).toEqual('GET:url.html');
             ref.dispose();
           });
         }));

      it('should support templateUrl as a function', async(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module('ng1', []);
           ng1Module.value(
               '$httpBackend', (method: string, url: string, post: any, cbFn: Function) => {
                 cbFn(200, `${method}:${url}`);
               });

           const ng1 = () => { return {templateUrl() { return 'url.html'; }}; };
           ng1Module.directive('ng1', ng1);
           const Ng2 = Component({selector: 'ng2', template: '<ng1></ng1>'}).Class({
             constructor: function() {}
           });

           const Ng2Module = NgModule({
                               declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
                               imports: [BrowserModule],
                             }).Class({constructor: function() {}});

           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           const element = html(`<div><ng2></ng2></div>`);
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(multiTrim(document.body.textContent)).toEqual('GET:url.html');
             ref.dispose();
           });
         }));

      it('should support empty template', async(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module('ng1', []);

           const ng1 = () => { return {template: ''}; };
           ng1Module.directive('ng1', ng1);

           const Ng2 = Component({selector: 'ng2', template: '<ng1></ng1>'}).Class({
             constructor: function() {}
           });

           const Ng2Module = NgModule({
                               declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
                               imports: [BrowserModule],
                             }).Class({constructor: function() {}});

           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           const element = html(`<div><ng2></ng2></div>`);
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(multiTrim(document.body.textContent)).toEqual('');
             ref.dispose();
           });
         }));

      it('should support template as a function', async(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module('ng1', []);

           const ng1 = () => { return {template() { return ''; }}; };
           ng1Module.directive('ng1', ng1);

           const Ng2 = Component({selector: 'ng2', template: '<ng1></ng1>'}).Class({
             constructor: function() {}
           });

           const Ng2Module = NgModule({
                               declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
                               imports: [BrowserModule],
                             }).Class({constructor: function() {}});

           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           const element = html(`<div><ng2></ng2></div>`);
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(multiTrim(document.body.textContent)).toEqual('');
             ref.dispose();
           });
         }));

      it('should support templateUrl fetched from $templateCache', async(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module('ng1', []);
           ng1Module.run(($templateCache: any) => $templateCache.put('url.html', 'WORKS'));

           const ng1 = () => { return {templateUrl: 'url.html'}; };
           ng1Module.directive('ng1', ng1);

           const Ng2 = Component({selector: 'ng2', template: '<ng1></ng1>'}).Class({
             constructor: function() {}
           });

           const Ng2Module = NgModule({
                               declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
                               imports: [BrowserModule],
                             }).Class({constructor: function() {}});

           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           const element = html(`<div><ng2></ng2></div>`);
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(multiTrim(document.body.textContent)).toEqual('WORKS');
             ref.dispose();
           });
         }));

      it('should support controller with controllerAs', async(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module('ng1', []);

           const ng1 = () => {
             return {
               scope: true,
               template:
                   '{{ctl.scope}}; {{ctl.isClass}}; {{ctl.hasElement}}; {{ctl.isPublished()}}',
               controllerAs: 'ctl',
               controller: Class({
                 constructor: function($scope: any, $element: any) {
                   (<any>this).verifyIAmAClass();
                   this.scope = $scope.$parent.$parent == $scope.$root ? 'scope' : 'wrong-scope';
                   this.hasElement = $element[0].nodeName;
                   this.$element = $element;
                 },
                 verifyIAmAClass: function() { this.isClass = 'isClass'; },
                 isPublished: function() {
                   return this.$element.controller('ng1') == this ? 'published' : 'not-published';
                 }
               })
             };
           };
           ng1Module.directive('ng1', ng1);

           const Ng2 = Component({selector: 'ng2', template: '<ng1></ng1>'}).Class({
             constructor: function() {}
           });

           const Ng2Module = NgModule({
                               declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
                               imports: [BrowserModule],
                             }).Class({constructor: function() {}});

           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           const element = html(`<div><ng2></ng2></div>`);
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(multiTrim(document.body.textContent)).toEqual('scope; isClass; NG1; published');
             ref.dispose();
           });
         }));

      it('should support bindToController', async(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module('ng1', []);

           const ng1 = () => {
             return {
               scope: {title: '@'},
               bindToController: true,
               template: '{{ctl.title}}',
               controllerAs: 'ctl',
               controller: Class({constructor: function() {}})
             };
           };
           ng1Module.directive('ng1', ng1);

           const Ng2 = Component({selector: 'ng2', template: '<ng1 title="WORKS"></ng1>'}).Class({
             constructor: function() {}
           });

           const Ng2Module = NgModule({
                               declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
                               imports: [BrowserModule],
                             }).Class({constructor: function() {}});

           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           const element = html(`<div><ng2></ng2></div>`);
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(multiTrim(document.body.textContent)).toEqual('WORKS');
             ref.dispose();
           });
         }));

      it('should support bindToController with bindings', async(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module('ng1', []);

           const ng1 = () => {
             return {
               scope: {},
               bindToController: {title: '@'},
               template: '{{ctl.title}}',
               controllerAs: 'ctl',
               controller: Class({constructor: function() {}})
             };
           };
           ng1Module.directive('ng1', ng1);

           const Ng2 = Component({selector: 'ng2', template: '<ng1 title="WORKS"></ng1>'}).Class({
             constructor: function() {}
           });

           const Ng2Module = NgModule({
                               declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
                               imports: [BrowserModule],
                             }).Class({constructor: function() {}});

           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           const element = html(`<div><ng2></ng2></div>`);
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(multiTrim(document.body.textContent)).toEqual('WORKS');
             ref.dispose();
           });
         }));

      it('should support single require in linking fn', async(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module('ng1', []);

           const ng1 = ($rootScope: any) => {
             return {
               scope: {title: '@'},
               bindToController: true,
               template: '{{ctl.status}}',
               require: 'ng1',
               controllerAs: 'ctrl',
               controller: Class({constructor: function() { this.status = 'WORKS'; }}),
               link: function(scope: any, element: any, attrs: any, linkController: any) {
                 expect(scope.$root).toEqual($rootScope);
                 expect(element[0].nodeName).toEqual('NG1');
                 expect(linkController.status).toEqual('WORKS');
                 scope.ctl = linkController;
               }
             };
           };
           ng1Module.directive('ng1', ng1);

           const Ng2 = Component({selector: 'ng2', template: '<ng1></ng1>'}).Class({
             constructor: function() {}
           });

           const Ng2Module = NgModule({
                               declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
                               imports: [BrowserModule],
                             }).Class({constructor: function() {}});

           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           const element = html(`<div><ng2></ng2></div>`);
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(multiTrim(document.body.textContent)).toEqual('WORKS');
             ref.dispose();
           });
         }));

      it('should support array require in linking fn', async(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module('ng1', []);

           const parent = () => {
             return {controller: Class({constructor: function() { this.parent = 'PARENT'; }})};
           };
           const ng1 = () => {
             return {
               scope: {title: '@'},
               bindToController: true,
               template: '{{parent.parent}}:{{ng1.status}}',
               require: ['ng1', '^parent', '?^^notFound'],
               controllerAs: 'ctrl',
               controller: Class({constructor: function() { this.status = 'WORKS'; }}),
               link: function(scope: any, element: any, attrs: any, linkControllers: any) {
                 expect(linkControllers[0].status).toEqual('WORKS');
                 expect(linkControllers[1].parent).toEqual('PARENT');
                 expect(linkControllers[2]).toBe(undefined);
                 scope.ng1 = linkControllers[0];
                 scope.parent = linkControllers[1];
               }
             };
           };
           ng1Module.directive('parent', parent);
           ng1Module.directive('ng1', ng1);

           const Ng2 = Component({selector: 'ng2', template: '<ng1></ng1>'}).Class({
             constructor: function() {}
           });

           const Ng2Module = NgModule({
                               declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
                               imports: [BrowserModule],
                             }).Class({constructor: function() {}});

           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           const element = html(`<div><parent><ng2></ng2></parent></div>`);
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(multiTrim(document.body.textContent)).toEqual('PARENT:WORKS');
             ref.dispose();
           });
         }));

      describe('with lifecycle hooks', () => {
        it('should call `$onInit()` on controller', async(() => {
             const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
             const $onInitSpyA = jasmine.createSpy('$onInitA');
             const $onInitSpyB = jasmine.createSpy('$onInitB');

             @Component({selector: 'ng2', template: '<ng1-a></ng1-a> | <ng1-b></ng1-b>'})
             class Ng2Component {
             }

             angular.module('ng1', [])
                 .directive('ng1A', () => ({
                                      template: '',
                                      scope: {},
                                      bindToController: true,
                                      controllerAs: '$ctrl',
                                      controller: class {$onInit() { $onInitSpyA(); }}
                                    }))
                 .directive('ng1B', () => ({
                                      template: '',
                                      scope: {},
                                      bindToController: false,
                                      controllerAs: '$ctrl',
                                      controller: function() { this.$onInit = $onInitSpyB; }
                                    }))
                 .directive('ng2', adapter.downgradeNg2Component(Ng2Component));

             @NgModule({
               declarations: [
                 adapter.upgradeNg1Component('ng1A'), adapter.upgradeNg1Component('ng1B'),
                 Ng2Component
               ],
               imports: [BrowserModule],
             })
             class Ng2Module {
             }

             const element = html(`<div><ng2></ng2></div>`);
             adapter.bootstrap(element, ['ng1']).ready((ref) => {
               expect($onInitSpyA).toHaveBeenCalled();
               expect($onInitSpyB).toHaveBeenCalled();

               ref.dispose();
             });
           }));

        it('should not call `$onInit()` on scope', async(() => {
             const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
             const $onInitSpy = jasmine.createSpy('$onInit');

             @Component({selector: 'ng2', template: '<ng1-a></ng1-a> | <ng1-b></ng1-b>'})
             class Ng2Component {
             }

             angular.module('ng1', [])
                 .directive('ng1A', () => ({
                                      template: '',
                                      scope: {},
                                      bindToController: true,
                                      controllerAs: '$ctrl',
                                      controller: function($scope: angular.IScope) {
                                        Object.getPrototypeOf($scope).$onInit = $onInitSpy;
                                      }
                                    }))
                 .directive('ng1B', () => ({
                                      template: '',
                                      scope: {},
                                      bindToController: false,
                                      controllerAs: '$ctrl',
                                      controller: function($scope: angular.IScope) {
                                        $scope['$onInit'] = $onInitSpy;
                                      }
                                    }))
                 .directive('ng2', adapter.downgradeNg2Component(Ng2Component));

             @NgModule({
               declarations: [
                 adapter.upgradeNg1Component('ng1A'), adapter.upgradeNg1Component('ng1B'),
                 Ng2Component
               ],
               imports: [BrowserModule],
             })
             class Ng2Module {
             }

             const element = html(`<div><ng2></ng2></div>`);
             adapter.bootstrap(element, ['ng1']).ready((ref) => {
               expect($onInitSpy).not.toHaveBeenCalled();
               ref.dispose();
             });
           }));

        it('should call `$doCheck()` on controller', async(() => {
             const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
             const $doCheckSpyA = jasmine.createSpy('$doCheckA');
             const $doCheckSpyB = jasmine.createSpy('$doCheckB');
             let changeDetector: ChangeDetectorRef;

             @Component({selector: 'ng2', template: '<ng1-a></ng1-a> | <ng1-b></ng1-b>'})
             class Ng2Component {
               constructor(cd: ChangeDetectorRef) { changeDetector = cd; }
             }

             angular.module('ng1', [])
                 .directive('ng1A', () => ({
                                      template: '',
                                      scope: {},
                                      bindToController: true,
                                      controllerAs: '$ctrl',
                                      controller: class {$doCheck() { $doCheckSpyA(); }}
                                    }))
                 .directive('ng1B', () => ({
                                      template: '',
                                      scope: {},
                                      bindToController: false,
                                      controllerAs: '$ctrl',
                                      controller: function() { this.$doCheck = $doCheckSpyB; }
                                    }))
                 .directive('ng2', adapter.downgradeNg2Component(Ng2Component));

             @NgModule({
               declarations: [
                 adapter.upgradeNg1Component('ng1A'), adapter.upgradeNg1Component('ng1B'),
                 Ng2Component
               ],
               imports: [BrowserModule],
             })
             class Ng2Module {
             }

             const element = html(`<div><ng2></ng2></div>`);
             adapter.bootstrap(element, ['ng1']).ready((ref) => {
               expect($doCheckSpyA).toHaveBeenCalled();
               expect($doCheckSpyB).toHaveBeenCalled();

               $doCheckSpyA.calls.reset();
               $doCheckSpyB.calls.reset();
               changeDetector.detectChanges();

               expect($doCheckSpyA).toHaveBeenCalled();
               expect($doCheckSpyB).toHaveBeenCalled();

               ref.dispose();
             });
           }));

        it('should not call `$doCheck()` on scope', async(() => {
             const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
             const $doCheckSpyA = jasmine.createSpy('$doCheckA');
             const $doCheckSpyB = jasmine.createSpy('$doCheckB');
             let changeDetector: ChangeDetectorRef;

             @Component({selector: 'ng2', template: '<ng1-a></ng1-a> | <ng1-b></ng1-b>'})
             class Ng2Component {
               constructor(cd: ChangeDetectorRef) { changeDetector = cd; }
             }

             angular.module('ng1', [])
                 .directive('ng1A', () => ({
                                      template: '',
                                      scope: {},
                                      bindToController: true,
                                      controllerAs: '$ctrl',
                                      controller: function($scope: angular.IScope) {
                                        Object.getPrototypeOf($scope).$doCheck = $doCheckSpyA;
                                      }
                                    }))
                 .directive('ng1B', () => ({
                                      template: '',
                                      scope: {},
                                      bindToController: false,
                                      controllerAs: '$ctrl',
                                      controller: function($scope: angular.IScope) {
                                        $scope['$doCheck'] = $doCheckSpyB;
                                      }
                                    }))
                 .directive('ng2', adapter.downgradeNg2Component(Ng2Component));

             @NgModule({
               declarations: [
                 adapter.upgradeNg1Component('ng1A'), adapter.upgradeNg1Component('ng1B'),
                 Ng2Component
               ],
               imports: [BrowserModule],
             })
             class Ng2Module {
             }

             const element = html(`<div><ng2></ng2></div>`);
             adapter.bootstrap(element, ['ng1']).ready((ref) => {
               $doCheckSpyA.calls.reset();
               $doCheckSpyB.calls.reset();
               changeDetector.detectChanges();

               expect($doCheckSpyA).not.toHaveBeenCalled();
               expect($doCheckSpyB).not.toHaveBeenCalled();

               ref.dispose();
             });
           }));

        it('should call `$postLink()` on controller', async(() => {
             const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
             const $postLinkSpyA = jasmine.createSpy('$postLinkA');
             const $postLinkSpyB = jasmine.createSpy('$postLinkB');

             @Component({selector: 'ng2', template: '<ng1-a></ng1-a> | <ng1-b></ng1-b>'})
             class Ng2Component {
             }

             angular.module('ng1', [])
                 .directive('ng1A', () => ({
                                      template: '',
                                      scope: {},
                                      bindToController: true,
                                      controllerAs: '$ctrl',
                                      controller: class {$postLink() { $postLinkSpyA(); }}
                                    }))
                 .directive('ng1B', () => ({
                                      template: '',
                                      scope: {},
                                      bindToController: false,
                                      controllerAs: '$ctrl',
                                      controller: function() { this.$postLink = $postLinkSpyB; }
                                    }))
                 .directive('ng2', adapter.downgradeNg2Component(Ng2Component));

             @NgModule({
               declarations: [
                 adapter.upgradeNg1Component('ng1A'), adapter.upgradeNg1Component('ng1B'),
                 Ng2Component
               ],
               imports: [BrowserModule],
             })
             class Ng2Module {
             }

             const element = html(`<div><ng2></ng2></div>`);
             adapter.bootstrap(element, ['ng1']).ready((ref) => {
               expect($postLinkSpyA).toHaveBeenCalled();
               expect($postLinkSpyB).toHaveBeenCalled();

               ref.dispose();
             });
           }));

        it('should not call `$postLink()` on scope', async(() => {
             const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
             const $postLinkSpy = jasmine.createSpy('$postLink');

             @Component({selector: 'ng2', template: '<ng1-a></ng1-a> | <ng1-b></ng1-b>'})
             class Ng2Component {
             }

             angular.module('ng1', [])
                 .directive('ng1A', () => ({
                                      template: '',
                                      scope: {},
                                      bindToController: true,
                                      controllerAs: '$ctrl',
                                      controller: function($scope: angular.IScope) {
                                        Object.getPrototypeOf($scope).$postLink = $postLinkSpy;
                                      }
                                    }))
                 .directive('ng1B', () => ({
                                      template: '',
                                      scope: {},
                                      bindToController: false,
                                      controllerAs: '$ctrl',
                                      controller: function($scope: angular.IScope) {
                                        $scope['$postLink'] = $postLinkSpy;
                                      }
                                    }))
                 .directive('ng2', adapter.downgradeNg2Component(Ng2Component));

             @NgModule({
               declarations: [
                 adapter.upgradeNg1Component('ng1A'), adapter.upgradeNg1Component('ng1B'),
                 Ng2Component
               ],
               imports: [BrowserModule],
             })
             class Ng2Module {
             }

             const element = html(`<div><ng2></ng2></div>`);
             adapter.bootstrap(element, ['ng1']).ready((ref) => {
               expect($postLinkSpy).not.toHaveBeenCalled();
               ref.dispose();
             });
           }));

        it('should call `$onChanges()` on binding destination', fakeAsync(() => {
             const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
             const $onChangesControllerSpyA = jasmine.createSpy('$onChangesControllerA');
             const $onChangesControllerSpyB = jasmine.createSpy('$onChangesControllerB');
             const $onChangesScopeSpy = jasmine.createSpy('$onChangesScope');
             let ng2Instance: any;

             @Component({
               selector: 'ng2',
               template: '<ng1-a [valA]="val"></ng1-a> | <ng1-b [valB]="val"></ng1-b>'
             })
             class Ng2Component {
               constructor() { ng2Instance = this; }
             }

             angular.module('ng1', [])
                 .directive('ng1A', () => ({
                                      template: '',
                                      scope: {valA: '<'},
                                      bindToController: true,
                                      controllerAs: '$ctrl',
                                      controller: function($scope: angular.IScope) {
                                        this.$onChanges = $onChangesControllerSpyA;
                                      }
                                    }))
                 .directive(
                     'ng1B',
                     () => ({
                       template: '',
                       scope: {valB: '<'},
                       bindToController: false,
                       controllerAs: '$ctrl',
                       controller: class {
                         $onChanges(changes: SimpleChanges) { $onChangesControllerSpyB(changes); }
                       }
                     }))
                 .directive('ng2', adapter.downgradeNg2Component(Ng2Component))
                 .run(($rootScope: angular.IRootScopeService) => {
                   Object.getPrototypeOf($rootScope).$onChanges = $onChangesScopeSpy;
                 });


             @NgModule({
               declarations: [
                 adapter.upgradeNg1Component('ng1A'), adapter.upgradeNg1Component('ng1B'),
                 Ng2Component
               ],
               imports: [BrowserModule],
             })
             class Ng2Module {
             }

             const element = html(`<div><ng2></ng2></div>`);
             adapter.bootstrap(element, ['ng1']).ready((ref) => {
               // Initial `$onChanges()` call
               tick();

               expect($onChangesControllerSpyA.calls.count()).toBe(1);
               expect($onChangesControllerSpyA.calls.argsFor(0)[0]).toEqual({
                 valA: jasmine.any(SimpleChange)
               });

               expect($onChangesControllerSpyB).not.toHaveBeenCalled();

               expect($onChangesScopeSpy.calls.count()).toBe(1);
               expect($onChangesScopeSpy.calls.argsFor(0)[0]).toEqual({
                 valB: jasmine.any(SimpleChange)
               });

               $onChangesControllerSpyA.calls.reset();
               $onChangesControllerSpyB.calls.reset();
               $onChangesScopeSpy.calls.reset();

               // `$onChanges()` call after a change
               ng2Instance.val = 'new value';
               tick();
               ref.ng1RootScope.$digest();

               expect($onChangesControllerSpyA.calls.count()).toBe(1);
               expect($onChangesControllerSpyA.calls.argsFor(0)[0]).toEqual({
                 valA: jasmine.objectContaining({currentValue: 'new value'})
               });

               expect($onChangesControllerSpyB).not.toHaveBeenCalled();

               expect($onChangesScopeSpy.calls.count()).toBe(1);
               expect($onChangesScopeSpy.calls.argsFor(0)[0]).toEqual({
                 valB: jasmine.objectContaining({currentValue: 'new value'})
               });

               ref.dispose();
             });
           }));

        it('should call `$onDestroy()` on controller', fakeAsync(() => {
             const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
             const $onDestroySpyA = jasmine.createSpy('$onDestroyA');
             const $onDestroySpyB = jasmine.createSpy('$onDestroyB');
             let ng2ComponentInstance: Ng2Component;

             @Component({
               selector: 'ng2',
               template: `
                <div *ngIf="!ng2Destroy">
                  <ng1-a></ng1-a> | <ng1-b></ng1-b>
                </div>
              `
             })
             class Ng2Component {
               ng2Destroy: boolean = false;
               constructor() { ng2ComponentInstance = this; }
             }

             // On browsers that don't support `requestAnimationFrame` (IE 9, Android <= 4.3),
             // `$animate` will use `setTimeout(..., 16.6)` instead. This timeout will still be on
             // the queue at the end of the test, causing it to fail.
             // Mocking animations (via `ngAnimateMock`) avoids the issue.
             angular.module('ng1', ['ngAnimateMock'])
                 .directive('ng1A', () => ({
                                      template: '',
                                      scope: {},
                                      bindToController: true,
                                      controllerAs: '$ctrl',
                                      controller: class {$onDestroy() { $onDestroySpyA(); }}
                                    }))
                 .directive('ng1B', () => ({
                                      template: '',
                                      scope: {},
                                      bindToController: false,
                                      controllerAs: '$ctrl',
                                      controller: function() { this.$onDestroy = $onDestroySpyB; }
                                    }))
                 .directive('ng2', adapter.downgradeNg2Component(Ng2Component));

             @NgModule({
               declarations: [
                 adapter.upgradeNg1Component('ng1A'), adapter.upgradeNg1Component('ng1B'),
                 Ng2Component
               ],
               imports: [BrowserModule],
             })
             class Ng2Module {
             }

             const element = html(`<div ng-if="!ng1Destroy"><ng2></ng2></div>`);
             adapter.bootstrap(element, ['ng1']).ready((ref) => {
               const $rootScope = ref.ng1RootScope as any;

               $rootScope.ng1Destroy = false;
               tick();
               $rootScope.$digest();

               expect($onDestroySpyA).not.toHaveBeenCalled();
               expect($onDestroySpyB).not.toHaveBeenCalled();

               $rootScope.ng1Destroy = true;
               tick();
               $rootScope.$digest();

               expect($onDestroySpyA).toHaveBeenCalled();
               expect($onDestroySpyB).toHaveBeenCalled();

               $onDestroySpyA.calls.reset();
               $onDestroySpyB.calls.reset();

               $rootScope.ng1Destroy = false;
               tick();
               $rootScope.$digest();

               expect($onDestroySpyA).not.toHaveBeenCalled();
               expect($onDestroySpyB).not.toHaveBeenCalled();

               ng2ComponentInstance.ng2Destroy = true;
               tick();
               $rootScope.$digest();

               expect($onDestroySpyA).toHaveBeenCalled();
               expect($onDestroySpyB).toHaveBeenCalled();

               ref.dispose();
             });
           }));

        it('should not call `$onDestroy()` on scope', fakeAsync(() => {
             const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
             const $onDestroySpy = jasmine.createSpy('$onDestroy');
             let ng2ComponentInstance: Ng2Component;

             @Component({
               selector: 'ng2',
               template: `
                <div *ngIf="!ng2Destroy">
                  <ng1-a></ng1-a> | <ng1-b></ng1-b>
                </div>
              `
             })
             class Ng2Component {
               ng2Destroy: boolean = false;
               constructor() { ng2ComponentInstance = this; }
             }

             // On browsers that don't support `requestAnimationFrame` (IE 9, Android <= 4.3),
             // `$animate` will use `setTimeout(..., 16.6)` instead. This timeout will still be on
             // the queue at the end of the test, causing it to fail.
             // Mocking animations (via `ngAnimateMock`) avoids the issue.
             angular.module('ng1', ['ngAnimateMock'])
                 .directive('ng1A', () => ({
                                      template: '',
                                      scope: {},
                                      bindToController: true,
                                      controllerAs: '$ctrl',
                                      controller: function($scope: angular.IScope) {
                                        Object.getPrototypeOf($scope).$onDestroy = $onDestroySpy;
                                      }
                                    }))
                 .directive('ng1B', () => ({
                                      template: '',
                                      scope: {},
                                      bindToController: false,
                                      controllerAs: '$ctrl',
                                      controller: function($scope: angular.IScope) {
                                        $scope['$onDestroy'] = $onDestroySpy;
                                      }
                                    }))
                 .directive('ng2', adapter.downgradeNg2Component(Ng2Component));

             @NgModule({
               declarations: [
                 adapter.upgradeNg1Component('ng1A'), adapter.upgradeNg1Component('ng1B'),
                 Ng2Component
               ],
               imports: [BrowserModule],
             })
             class Ng2Module {
             }

             const element = html(`<div ng-if="!ng1Destroy"><ng2></ng2></div>`);
             adapter.bootstrap(element, ['ng1']).ready((ref) => {
               const $rootScope = ref.ng1RootScope as any;

               $rootScope.ng1Destroy = false;
               tick();
               $rootScope.$digest();

               $rootScope.ng1Destroy = true;
               tick();
               $rootScope.$digest();

               $rootScope.ng1Destroy = false;
               tick();
               $rootScope.$digest();

               ng2ComponentInstance.ng2Destroy = true;
               tick();
               $rootScope.$digest();

               expect($onDestroySpy).not.toHaveBeenCalled();

               ref.dispose();
             });
           }));
      });

      it('should bind input properties (<) of components', async(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module('ng1', []);

           const ng1 = {
             bindings: {personProfile: '<'},
             template: 'Hello {{$ctrl.personProfile.firstName}} {{$ctrl.personProfile.lastName}}',
             controller: Class({constructor: function() {}})
           };
           ng1Module.component('ng1', ng1);

           const Ng2 =
               Component({selector: 'ng2', template: '<ng1 [personProfile]="goku"></ng1>'}).Class({
                 constructor: function() { this.goku = {firstName: 'GOKU', lastName: 'SAN'}; }
               });

           const Ng2Module = NgModule({
                               declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
                               imports: [BrowserModule],
                             }).Class({constructor: function() {}});

           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));

           const element = html(`<div><ng2></ng2></div>`);
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(multiTrim(document.body.textContent)).toEqual(`Hello GOKU SAN`);
             ref.dispose();
           });
         }));

      it('should support ng2 > ng1 > ng2', async(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module('ng1', []);

           const ng1 = {
             template: 'ng1(<ng2b></ng2b>)',
           };
           ng1Module.component('ng1', ng1);

           const Ng2a = Component({selector: 'ng2a', template: 'ng2a(<ng1></ng1>)'}).Class({
             constructor: function() {}
           });
           ng1Module.directive('ng2a', adapter.downgradeNg2Component(Ng2a));

           const Ng2b =
               Component({selector: 'ng2b', template: 'ng2b'}).Class({constructor: function() {}});
           ng1Module.directive('ng2b', adapter.downgradeNg2Component(Ng2b));

           const Ng2Module = NgModule({
                               declarations: [adapter.upgradeNg1Component('ng1'), Ng2a, Ng2b],
                               imports: [BrowserModule],
                             }).Class({constructor: function() {}});

           const element = html(`<div><ng2a></ng2a></div>`);
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(multiTrim(document.body.textContent)).toEqual('ng2a(ng1(ng2b))');
           });
         }));
    });

    describe('injection', () => {
      function SomeToken() {}

      it('should export ng2 instance to ng1', async(() => {
           const MyNg2Module = NgModule({
                                 providers: [{provide: SomeToken, useValue: 'correct_value'}],
                                 imports: [BrowserModule],
                               }).Class({constructor: function() {}});

           const adapter: UpgradeAdapter = new UpgradeAdapter(MyNg2Module);
           const module = angular.module('myExample', []);
           module.factory('someToken', adapter.downgradeNg2Provider(SomeToken));
           adapter.bootstrap(html('<div>'), ['myExample']).ready((ref) => {
             expect(ref.ng1Injector.get('someToken')).toBe('correct_value');
             ref.dispose();
           });
         }));

      it('should export ng1 instance to ng2', async(() => {
           const MyNg2Module =
               NgModule({imports: [BrowserModule]}).Class({constructor: function() {}});

           const adapter: UpgradeAdapter = new UpgradeAdapter(MyNg2Module);
           const module = angular.module('myExample', []);
           module.value('testValue', 'secreteToken');
           adapter.upgradeNg1Provider('testValue');
           adapter.upgradeNg1Provider('testValue', {asToken: 'testToken'});
           adapter.upgradeNg1Provider('testValue', {asToken: String});
           adapter.bootstrap(html('<div>'), ['myExample']).ready((ref) => {
             expect(ref.ng2Injector.get('testValue')).toBe('secreteToken');
             expect(ref.ng2Injector.get(String)).toBe('secreteToken');
             expect(ref.ng2Injector.get('testToken')).toBe('secreteToken');
             ref.dispose();
           });
         }));

      it('should respect hierarchical dependency injection for ng2', async(() => {
           const ng1Module = angular.module('ng1', []);

           const Ng2Parent = Component({
                               selector: 'ng2-parent',
                               template: `ng2-parent(<ng-content></ng-content>)`
                             }).Class({constructor: function() {}});
           const Ng2Child = Component({selector: 'ng2-child', template: `ng2-child`}).Class({
             constructor: [Ng2Parent, function(parent: any) {}]
           });

           const Ng2Module =
               NgModule({declarations: [Ng2Parent, Ng2Child], imports: [BrowserModule]}).Class({
                 constructor: function() {}
               });

           const element = html('<ng2-parent><ng2-child></ng2-child></ng2-parent>');

           const adapter: UpgradeAdapter = new UpgradeAdapter(Ng2Module);
           ng1Module.directive('ng2Parent', adapter.downgradeNg2Component(Ng2Parent))
               .directive('ng2Child', adapter.downgradeNg2Component(Ng2Child));
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(document.body.textContent).toEqual('ng2-parent(ng2-child)');
             ref.dispose();
           });
         }));
    });

    describe('testability', () => {
      it('should handle deferred bootstrap', async(() => {
           const MyNg2Module =
               NgModule({imports: [BrowserModule]}).Class({constructor: function() {}});

           const adapter: UpgradeAdapter = new UpgradeAdapter(MyNg2Module);
           angular.module('ng1', []);
           let bootstrapResumed: boolean = false;

           const element = html('<div></div>');
           window.name = 'NG_DEFER_BOOTSTRAP!' + window.name;

           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(bootstrapResumed).toEqual(true);
             ref.dispose();
           });

           setTimeout(() => {
             bootstrapResumed = true;
             (<any>window).angular.resumeBootstrap();
           }, 100);
         }));

      it('should wait for ng2 testability', async(() => {
           const MyNg2Module =
               NgModule({imports: [BrowserModule]}).Class({constructor: function() {}});

           const adapter: UpgradeAdapter = new UpgradeAdapter(MyNg2Module);
           angular.module('ng1', []);
           const element = html('<div></div>');
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             const ng2Testability: Testability = ref.ng2Injector.get(Testability);
             ng2Testability.increasePendingRequestCount();
             let ng2Stable = false;

             angular.getTestability(element).whenStable(() => {
               expect(ng2Stable).toEqual(true);
               ref.dispose();
             });

             setTimeout(() => {
               ng2Stable = true;
               ng2Testability.decreasePendingRequestCount();
             }, 100);
           });
         }));
    });

    describe('examples', () => {
      it('should verify UpgradeAdapter example', async(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const module = angular.module('myExample', []);

           const ng1 = () => {
             return {
               scope: {title: '='},
               transclude: true,
               template: 'ng1[Hello {{title}}!](<span ng-transclude></span>)'
             };
           };
           module.directive('ng1', ng1);

           const Ng2 =
               Component({
                 selector: 'ng2',
                 inputs: ['name'],
                 template: 'ng2[<ng1 [title]="name">transclude</ng1>](<ng-content></ng-content>)'
               }).Class({constructor: function() {}});

           const Ng2Module = NgModule({
                               declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
                               imports: [BrowserModule],
                             }).Class({constructor: function() {}});

           module.directive('ng2', adapter.downgradeNg2Component(Ng2));

           document.body.innerHTML = '<ng2 name="World">project</ng2>';

           adapter.bootstrap(document.body.firstElementChild !, ['myExample']).ready((ref) => {
             expect(multiTrim(document.body.textContent))
                 .toEqual('ng2[ng1[Hello World!](transclude)](project)');
             ref.dispose();
           });
         }));
    });

    describe('registerForNg1Tests', () => {
      let upgradeAdapterRef: UpgradeAdapterRef;
      let $compile: angular.ICompileService;
      let $rootScope: angular.IRootScopeService;

      beforeEach(() => {
        const ng1Module = angular.module('ng1', []);

        const Ng2 = Component({
                      selector: 'ng2',
                      template: 'Hello World',
                    }).Class({constructor: function() {}});

        const Ng2Module = NgModule({declarations: [Ng2], imports: [BrowserModule]}).Class({
          constructor: function() {}
        });

        const upgradeAdapter = new UpgradeAdapter(Ng2Module);
        ng1Module.directive('ng2', upgradeAdapter.downgradeNg2Component(Ng2));

        upgradeAdapterRef = upgradeAdapter.registerForNg1Tests(['ng1']);
      });

      beforeEach(
          inject((_$compile_: angular.ICompileService, _$rootScope_: angular.IRootScopeService) => {
            $compile = _$compile_;
            $rootScope = _$rootScope_;
          }));

      it('should be able to test ng1 components that use ng2 components', async(() => {
           upgradeAdapterRef.ready(() => {
             const element = $compile('<ng2></ng2>')($rootScope);
             $rootScope.$digest();
             expect(element[0].textContent).toContain('Hello World');
           });
         }));
    });
  });
}
