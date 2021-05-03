/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef, Component, destroyPlatform, EventEmitter, forwardRef, Input, NgModule, NgModuleFactory, NgZone, NO_ERRORS_SCHEMA, OnChanges, OnDestroy, Output, SimpleChange, SimpleChanges, Testability} from '@angular/core';
import {fakeAsync, flushMicrotasks, tick, waitForAsync} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import * as angular from '../../common/src/angular1';
import {$EXCEPTION_HANDLER, $ROOT_SCOPE} from '../../common/src/constants';
import {html, multiTrim, withEachNg1Version} from '../../common/test/helpers/common_test_helpers';
import {UpgradeAdapter, UpgradeAdapterRef} from '../src/upgrade_adapter';


declare global {
  export var inject: Function;
}

withEachNg1Version(() => {
  describe('adapter: ng1 to ng2', () => {
    beforeEach(() => destroyPlatform());
    afterEach(() => destroyPlatform());

    describe('(basic use)', () => {
      it('should have AngularJS loaded',
         () => expect(angular.getAngularJSGlobal().version.major).toBe(1));

      it('should instantiate ng2 in ng1 template and project content', waitForAsync(() => {
           const ng1Module = angular.module_('ng1', []);

           @Component({
             selector: 'ng2',
             template: `{{ 'NG2' }}(<ng-content></ng-content>)`,
           })
           class Ng2 {
           }

           @NgModule({declarations: [Ng2], imports: [BrowserModule]})
           class Ng2Module {
           }

           const element =
               html('<div>{{ \'ng1[\' }}<ng2>~{{ \'ng-content\' }}~</ng2>{{ \']\' }}</div>');

           const adapter: UpgradeAdapter = new UpgradeAdapter(Ng2Module);
           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(document.body.textContent).toEqual('ng1[NG2(~ng-content~)]');
             ref.dispose();
           });
         }));

      it('should instantiate ng1 in ng2 template and project content', waitForAsync(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module_('ng1', []);

           @Component({
             selector: 'ng2',
             template: `{{ 'ng2(' }}<ng1>{{'transclude'}}</ng1>{{ ')' }}`,
           })
           class Ng2 {
           }

           @NgModule({
             declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
             imports: [BrowserModule],
           })
           class Ng2Module {
           }

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

      it('should support the compilerOptions argument', waitForAsync(() => {
           const platformRef = platformBrowserDynamic();
           spyOn(platformRef, 'bootstrapModule').and.callThrough();
           spyOn(platformRef, 'bootstrapModuleFactory').and.callThrough();

           const ng1Module = angular.module_('ng1', []);
           @Component({selector: 'ng2', template: `{{ 'NG2' }}(<ng-content></ng-content>)`})
           class Ng2 {
           }

           const element =
               html('<div>{{ \'ng1[\' }}<ng2>~{{ \'ng-content\' }}~</ng2>{{ \']\' }}</div>');

           @NgModule({
             declarations: [Ng2],
             imports: [BrowserModule],
           })
           class Ng2AppModule {
             ngDoBootstrap() {}
           }

           const adapter: UpgradeAdapter = new UpgradeAdapter(Ng2AppModule, {providers: []});
           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(platformRef.bootstrapModule).toHaveBeenCalledWith(jasmine.any(Function), [
               {providers: []}, jasmine.any(Object) as any
             ]);
             expect(platformRef.bootstrapModuleFactory)
                 .toHaveBeenCalledWith(
                     jasmine.any(NgModuleFactory),
                     jasmine.objectContaining({ngZone: jasmine.any(NgZone), providers: []}));
             ref.dispose();
           });
         }));

      it('should destroy the AngularJS app when `PlatformRef` is destroyed', waitForAsync(() => {
           const platformRef = platformBrowserDynamic();
           const adapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module_('ng1', []);

           @Component({selector: 'ng2', template: '<span>NG2</span>'})
           class Ng2Component {
           }

           @NgModule({
             declarations: [Ng2Component],
             imports: [BrowserModule],
           })
           class Ng2Module {
             ngDoBootstrap() {}
           }

           ng1Module.component('ng1', {template: '<ng2></ng2>'});
           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2Component));

           const element = html('<div><ng1></ng1></div>');

           adapter.bootstrap(element, [ng1Module.name]).ready(ref => {
             const $rootScope: angular.IRootScopeService = ref.ng1Injector.get($ROOT_SCOPE);
             const rootScopeDestroySpy = spyOn($rootScope, '$destroy');

             const appElem = angular.element(element);
             const ng1Elem = angular.element(element.querySelector('ng1') as Element);
             const ng2Elem = angular.element(element.querySelector('ng2') as Element);
             const ng2ChildElem = angular.element(element.querySelector('ng2 span') as Element);

             // Attach data to all elements.
             appElem.data!('testData', 1);
             ng1Elem.data!('testData', 2);
             ng2Elem.data!('testData', 3);
             ng2ChildElem.data!('testData', 4);

             // Verify data can be retrieved.
             expect(appElem.data!('testData')).toBe(1);
             expect(ng1Elem.data!('testData')).toBe(2);
             expect(ng2Elem.data!('testData')).toBe(3);
             expect(ng2ChildElem.data!('testData')).toBe(4);

             expect(rootScopeDestroySpy).not.toHaveBeenCalled();

             // Destroy `PlatformRef`.
             platformRef.destroy();

             // Verify `$rootScope` has been destroyed and data has been cleaned up.
             expect(rootScopeDestroySpy).toHaveBeenCalled();

             expect(appElem.data!('testData')).toBeUndefined();
             expect(ng1Elem.data!('testData')).toBeUndefined();
             expect(ng2Elem.data!('testData')).toBeUndefined();
             expect(ng2ChildElem.data!('testData')).toBeUndefined();
           });
         }));
    });

    describe('bootstrap errors', () => {
      let adapter: UpgradeAdapter;

      beforeEach(() => {
        angular.module_('ng1', []);

        @Component({
          selector: 'ng2',
          template: `<BAD TEMPLATE div></div>`,
        })
        class ng2Component {
        }

        @NgModule({
          declarations: [ng2Component],
          imports: [BrowserModule],
        })
        class Ng2Module {
        }

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

    describe('change-detection', () => {
      it('should not break if a $digest is already in progress', waitForAsync(() => {
           @Component({selector: 'my-app', template: ''})
           class AppComponent {
           }

           @NgModule({declarations: [AppComponent], imports: [BrowserModule]})
           class Ng2Module {
           }

           const ng1Module = angular.module_('ng1', []);
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const element = html('<my-app></my-app>');

           adapter.bootstrap(element, [ng1Module.name]).ready((ref) => {
             const $rootScope: any = ref.ng1RootScope;
             const ngZone: NgZone = ref.ng2ModuleRef.injector.get<NgZone>(NgZone);
             const digestSpy = spyOn($rootScope, '$digest').and.callThrough();

             // Step 1: Ensure `$digest` is run on `onMicrotaskEmpty`.
             ngZone.onMicrotaskEmpty.emit(null);
             expect(digestSpy).toHaveBeenCalledTimes(1);

             digestSpy.calls.reset();

             // Step 2: Cause the issue.
             $rootScope.$apply(() => ngZone.onMicrotaskEmpty.emit(null));

             // With the fix, `$digest` will only be run once (for `$apply()`).
             // Without the fix, `$digest()` would have been run an extra time (`onMicrotaskEmpty`).
             expect(digestSpy).toHaveBeenCalledTimes(1);

             digestSpy.calls.reset();

             // Step 3: Ensure that `$digest()` is still executed on `onMicrotaskEmpty`.
             ngZone.onMicrotaskEmpty.emit(null);
             expect(digestSpy).toHaveBeenCalledTimes(1);
           });
         }));

      it('should interleave scope and component expressions', waitForAsync(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module_('ng1', []);
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

           @Component({
             selector: 'ng2',
             template: `{{l('2A')}}<ng1a></ng1a>{{l('2B')}}<ng1b></ng1b>{{l('2C')}}`
           })
           class Ng2 {
             l: any;
             constructor() {
               this.l = l;
             }
           }

           @NgModule({
             declarations:
                 [adapter.upgradeNg1Component('ng1a'), adapter.upgradeNg1Component('ng1b'), Ng2],
             imports: [BrowserModule],
           })
           class Ng2Module {
           }

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

      it('should propagate changes to a downgraded component inside the ngZone',
         waitForAsync(() => {
           let appComponent: AppComponent;
           let upgradeRef: UpgradeAdapterRef;

           @Component({selector: 'my-app', template: '<my-child [value]="value"></my-child>'})
           class AppComponent {
             value?: number;
             constructor() {
               appComponent = this;
             }
           }

           @Component({
             selector: 'my-child',
             template: '<div>{{valueFromPromise}}',
           })
           class ChildComponent {
             valueFromPromise?: number;
             @Input()
             set value(v: number) {
               expect(NgZone.isInAngularZone()).toBe(true);
             }

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
           const ng1Module = angular.module_('ng1', []).directive(
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
      //      const ng1Module = angular.module_('ng1', []).directive(
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
      it('should allow non-element selectors for downgraded components', waitForAsync(() => {
           @Component({selector: '[itWorks]', template: 'It works'})
           class WorksComponent {
           }

           @NgModule({declarations: [WorksComponent], imports: [BrowserModule]})
           class Ng2Module {
           }

           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module_('ng1', []);
           ng1Module.directive('ng2', adapter.downgradeNg2Component(WorksComponent));

           const element = html('<ng2></ng2>');
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(multiTrim(document.body.textContent!)).toBe('It works');
           });
         }));

      it('should bind properties, events', waitForAsync(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module_('ng1', []).value($EXCEPTION_HANDLER, (err: any) => {
             throw err;
           });

           ng1Module.run(($rootScope: any) => {
             $rootScope.name = 'world';
             $rootScope.dataA = 'A';
             $rootScope.dataB = 'B';
             $rootScope.modelA = 'initModelA';
             $rootScope.modelB = 'initModelB';
             $rootScope.eventA = '?';
             $rootScope.eventB = '?';
           });
           @Component({
             selector: 'ng2',
             inputs: ['literal', 'interpolate', 'oneWayA', 'oneWayB', 'twoWayA', 'twoWayB'],
             outputs: [
               'eventA', 'eventB', 'twoWayAEmitter: twoWayAChange', 'twoWayBEmitter: twoWayBChange'
             ],
             template: 'ignore: {{ignore}}; ' +
                 'literal: {{literal}}; interpolate: {{interpolate}}; ' +
                 'oneWayA: {{oneWayA}}; oneWayB: {{oneWayB}}; ' +
                 'twoWayA: {{twoWayA}}; twoWayB: {{twoWayB}}; ({{ngOnChangesCount}})'
           })
           class Ng2 {
             ngOnChangesCount = 0;
             ignore = '-';
             literal = '?';
             interpolate = '?';
             oneWayA = '?';
             oneWayB = '?';
             twoWayA = '?';
             twoWayB = '?';
             eventA = new EventEmitter();
             eventB = new EventEmitter();
             twoWayAEmitter = new EventEmitter();
             twoWayBEmitter = new EventEmitter();
             ngOnChanges(changes: SimpleChanges) {
               const assert = (prop: string, value: any) => {
                 if ((this as any)[prop] != value) {
                   throw new Error(
                       `Expected: '${prop}' to be '${value}' but was '${(this as any)[prop]}'`);
                 }
               };

               const assertChange = (prop: string, value: any) => {
                 assert(prop, value);
                 if (!changes[prop]) {
                   throw new Error(`Changes record for '${prop}' not found.`);
                 }
                 const actValue = changes[prop].currentValue;
                 if (actValue != value) {
                   throw new Error(`Expected changes record for'${prop}' to be '${
                       value}' but was '${actValue}'`);
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
           }
           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));

           @NgModule({
             declarations: [Ng2],
             imports: [BrowserModule],
           })
           class Ng2Module {
           }

           const element = html(`<div>
              <ng2 literal="Text" interpolate="Hello {{name}}"
                   bind-one-way-a="dataA" [one-way-b]="dataB"
                   bindon-two-way-a="modelA" [(two-way-b)]="modelB"
                   on-event-a='eventA=$event' (event-b)="eventB=$event"></ng2>
              | modelA: {{modelA}}; modelB: {{modelB}}; eventA: {{eventA}}; eventB: {{eventB}};
              </div>`);
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(multiTrim(document.body.textContent!))
                 .toEqual(
                     'ignore: -; ' +
                     'literal: Text; interpolate: Hello world; ' +
                     'oneWayA: A; oneWayB: B; twoWayA: newA; twoWayB: newB; (2) | ' +
                     'modelA: newA; modelB: newB; eventA: aFired; eventB: bFired;');

             ref.ng1RootScope.$apply('name = "everyone"');
             expect(multiTrim(document.body.textContent!))
                 .toEqual(
                     'ignore: -; ' +
                     'literal: Text; interpolate: Hello everyone; ' +
                     'oneWayA: A; oneWayB: B; twoWayA: newA; twoWayB: newB; (3) | ' +
                     'modelA: newA; modelB: newB; eventA: aFired; eventB: bFired;');

             ref.dispose();
           });
         }));

      it('should support two-way binding and event listener', waitForAsync(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const listenerSpy = jasmine.createSpy('$rootScope.listener');
           const ng1Module = angular.module_('ng1', []).run(($rootScope: angular.IScope) => {
             $rootScope['value'] = 'world';
             $rootScope['listener'] = listenerSpy;
           });

           @Component({selector: 'ng2', template: `model: {{model}};`})
           class Ng2Component implements OnChanges {
             ngOnChangesCount = 0;
             @Input() model = '?';
             @Output() modelChange = new EventEmitter();

             ngOnChanges(changes: SimpleChanges) {
               switch (this.ngOnChangesCount++) {
                 case 0:
                   expect(changes.model.currentValue).toBe('world');
                   this.modelChange.emit('newC');
                   break;
                 case 1:
                   expect(changes.model.currentValue).toBe('newC');
                   break;
                 default:
                   throw new Error('Called too many times! ' + JSON.stringify(changes));
               }
             }
           }

           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2Component));

           @NgModule({declarations: [Ng2Component], imports: [BrowserModule]})
           class Ng2Module {
             ngDoBootstrap() {}
           }

           const element = html(`
           <div>
             <ng2 [(model)]="value" (model-change)="listener($event)"></ng2>
             | value: {{value}}
           </div>
         `);
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(multiTrim(element.textContent)).toEqual('model: newC; | value: newC');
             expect(listenerSpy).toHaveBeenCalledWith('newC');
             ref.dispose();
           });
         }));

      it('should initialize inputs in time for `ngOnChanges`', waitForAsync(() => {
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
             // TODO(issue/24571): remove '!'.
             initialValue!: string;
             // TODO(issue/24571): remove '!'.
             @Input() foo!: string;

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

           const ng1Module = angular.module_('ng1', []).directive(
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

      it('should bind to ng-model', waitForAsync(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module_('ng1', []);

           ng1Module.run(($rootScope: any /** TODO #9100 */) => {
             $rootScope.modelA = 'A';
           });

           let ng2Instance: Ng2;
           @Component({selector: 'ng2', template: '{{_value}}'})
           class Ng2 {
             private _value: any = '';
             private _onChangeCallback: (_: any) => void = () => {};
             private _onTouchedCallback: () => void = () => {};
             constructor() {
               ng2Instance = this;
             }
             writeValue(value: any) {
               this._value = value;
             }
             registerOnChange(fn: any) {
               this._onChangeCallback = fn;
             }
             registerOnTouched(fn: any) {
               this._onTouchedCallback = fn;
             }
             doTouch() {
               this._onTouchedCallback();
             }
             doChange(newValue: string) {
               this._value = newValue;
               this._onChangeCallback(newValue);
             }
           }

           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           const element = html(`<div><ng2 ng-model="modelA"></ng2> | {{modelA}}</div>`);

           @NgModule({
             declarations: [Ng2],
             imports: [BrowserModule],
             schemas: [NO_ERRORS_SCHEMA],
           })
           class Ng2Module {
           }

           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             let $rootScope: any = ref.ng1RootScope;

             expect(multiTrim(document.body.textContent)).toEqual('A | A');

             $rootScope.modelA = 'B';
             $rootScope.$apply();
             expect(multiTrim(document.body.textContent)).toEqual('B | B');

             ng2Instance.doChange('C');
             expect($rootScope.modelA).toBe('C');
             expect(multiTrim(document.body.textContent)).toEqual('C | C');

             const downgradedElement = <Element>document.body.querySelector('ng2');
             expect(downgradedElement.classList.contains('ng-touched')).toBe(false);

             ng2Instance.doTouch();
             $rootScope.$apply();
             expect(downgradedElement.classList.contains('ng-touched')).toBe(true);

             ref.dispose();
           });
         }));

      it('should properly run cleanup when ng1 directive is destroyed', waitForAsync(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module_('ng1', []);
           let ng2ComponentDestroyed = false;

           ng1Module.directive('ng1', () => ({
                                        template: '<div ng-if="!destroyIt"><ng2></ng2></div>',
                                      }));

           @Component({selector: 'ng2', template: '<ul><li>test1</li><li>test2</li></ul>'})
           class Ng2 {
             ngOnDestroy() {
               ng2ComponentDestroyed = true;
             }
           }

           @NgModule({
             declarations: [Ng2],
             imports: [BrowserModule],
           })
           class Ng2Module {
           }

           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           const element = html('<ng1></ng1>');
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             const ng2Element = angular.element(element.querySelector('ng2') as Element);
             const ng2Descendants =
                 Array.from(element.querySelectorAll('ng2 li')).map(angular.element);
             let ng2ElementDestroyed = false;
             let ng2DescendantsDestroyed = ng2Descendants.map(() => false);

             ng2Element.data!('test', 42);
             ng2Descendants.forEach((elem, i) => elem.data!('test', i));
             ng2Element.on!('$destroy', () => ng2ElementDestroyed = true);
             ng2Descendants.forEach(
                 (elem, i) => elem.on!('$destroy', () => ng2DescendantsDestroyed[i] = true));

             expect(element.textContent).toBe('test1test2');
             expect(ng2Element.data!('test')).toBe(42);
             ng2Descendants.forEach((elem, i) => expect(elem.data!('test')).toBe(i));
             expect(ng2ElementDestroyed).toBe(false);
             expect(ng2DescendantsDestroyed).toEqual([false, false]);
             expect(ng2ComponentDestroyed).toBe(false);

             ref.ng1RootScope.$apply('destroyIt = true');

             expect(element.textContent).toBe('');
             expect(ng2Element.data!('test')).toBeUndefined();
             ng2Descendants.forEach(elem => expect(elem.data!('test')).toBeUndefined());
             expect(ng2ElementDestroyed).toBe(true);
             expect(ng2DescendantsDestroyed).toEqual([true, true]);
             expect(ng2ComponentDestroyed).toBe(true);

             ref.dispose();
           });
         }));

      it('should properly run cleanup with multiple levels of nesting', waitForAsync(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           let destroyed = false;

           @Component(
               {selector: 'ng2-outer', template: '<div *ngIf="!destroyIt"><ng1></ng1></div>'})
           class Ng2OuterComponent {
             @Input() destroyIt = false;
           }

           @Component({selector: 'ng2-inner', template: 'test'})
           class Ng2InnerComponent implements OnDestroy {
             ngOnDestroy() {
               destroyed = true;
             }
           }

           @NgModule({
             imports: [BrowserModule],
             declarations:
                 [Ng2InnerComponent, Ng2OuterComponent, adapter.upgradeNg1Component('ng1')],
             schemas: [NO_ERRORS_SCHEMA],
           })
           class Ng2Module {
           }

           const ng1Module =
               angular.module_('ng1', [])
                   .directive('ng1', () => ({template: '<ng2-inner></ng2-inner>'}))
                   .directive('ng2Inner', adapter.downgradeNg2Component(Ng2InnerComponent))
                   .directive('ng2Outer', adapter.downgradeNg2Component(Ng2OuterComponent));

           const element = html('<ng2-outer [destroy-it]="destroyIt"></ng2-outer>');

           adapter.bootstrap(element, [ng1Module.name]).ready(ref => {
             expect(element.textContent).toBe('test');
             expect(destroyed).toBe(false);

             $apply(ref, 'destroyIt = true');

             expect(element.textContent).toBe('');
             expect(destroyed).toBe(true);
           });
         }));

      it('should fallback to the root ng2.injector when compiled outside the dom',
         waitForAsync(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module_('ng1', []);

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

           @Component({selector: 'ng2', template: 'test'})
           class Ng2 {
           }

           @NgModule({
             declarations: [Ng2],
             imports: [BrowserModule],
           })
           class Ng2Module {
           }

           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           const element = html('<ng1></ng1>');
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(multiTrim(document.body.textContent)).toEqual('test');
             ref.dispose();
           });
         }));

      it('should support multi-slot projection', waitForAsync(() => {
           const ng1Module = angular.module_('ng1', []);

           @Component({
             selector: 'ng2',
             template: '2a(<ng-content select=".ng1a"></ng-content>)' +
                 '2b(<ng-content select=".ng1b"></ng-content>)'
           })
           class Ng2 {
           }

           @NgModule({declarations: [Ng2], imports: [BrowserModule]})
           class Ng2Module {
           }

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

      it('should correctly project structural directives', waitForAsync(() => {
           @Component({selector: 'ng2', template: 'ng2-{{ itemId }}(<ng-content></ng-content>)'})
           class Ng2Component {
             // TODO(issue/24571): remove '!'.
             @Input() itemId!: string;
           }

           @NgModule({imports: [BrowserModule], declarations: [Ng2Component]})
           class Ng2Module {
           }

           const adapter: UpgradeAdapter = new UpgradeAdapter(Ng2Module);
           const ng1Module = angular.module_('ng1', [])
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

      it('should allow attribute selectors for components in ng2', waitForAsync(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => MyNg2Module));
           const ng1Module = angular.module_('myExample', []);

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
           adapter.bootstrap(document.body.firstElementChild!, ['myExample']).ready((ref) => {
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

             constructor() {
               ng2ComponentInstance = this;
             }
           }

           // Define `ng1Module`
           const ng1Module = angular.module_('ng1Module', [])
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
             const ng1 = element.querySelector('ng1')!;
             const ng1Controller = angular.element(ng1).controller!('ng1');

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

             constructor() {
               ng2ComponentInstance = this;
             }
           }

           // Define `ng1Module`
           const ng1Module = angular.module_('ng1Module', [])
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
             const ng1 = element.querySelector('ng1')!;
             const ng1Controller = angular.element(ng1).controller!('ng1');

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

             constructor() {
               ng2ComponentInstance = this;
             }
           }

           // Define `ng1Module`
           const ng1Module = angular.module_('ng1Module', [])
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
             const ng1 = element.querySelector('ng1')!;
             const ng1Controller = angular.element(ng1).controller!('ng1');

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
           const ng1Module = angular.module_('ng1Module', [])
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
             const ng1 = element.querySelector('ng1')!;
             const ng1Controller = angular.element(ng1).controller!('ng1');

             expect(multiTrim(element.textContent)).toBe('Inside: - | Outside: foo, bar');

             ng1Controller.outputA('baz');
             ng1Controller.outputB('qux');
             $digest(ref);

             expect(multiTrim(element.textContent)).toBe('Inside: - | Outside: baz, qux');

             ref.dispose();
           });
         }));

      it('should bind properties, events', waitForAsync(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module_('ng1', []);

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
           @Component({
             selector: 'ng2',
             template:
                 '<ng1 fullName="{{last}}, {{first}}, {{city}}" [dataA]="first" [(dataB)]="last" [modelC]="city" ' +
                 '(event)="event=$event"></ng1>' +
                 '<ng1 fullName="{{\'TEST\'}}" dataA="First" dataB="Last" modelC="City"></ng1>' +
                 '{{event}}-{{last}}, {{first}}, {{city}}'
           })
           class Ng2 {
             first = 'Victor';
             last = 'Savkin';
             city = 'SF';
             event = '?';
           }

           @NgModule({
             declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
             imports: [BrowserModule],
           })
           class Ng2Module {
           }

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

      it('should bind optional properties', waitForAsync(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module_('ng1', []);

           const ng1 = () => {
             return {
               template: 'Hello; A: {{modelA}}; B: {{modelB}}; | ',
               scope: {modelA: '=?dataA', modelB: '=?'}
             };
           };
           ng1Module.directive('ng1', ng1);
           @Component({
             selector: 'ng2',
             template: '<ng1 [dataA]="first" [modelB]="last"></ng1>' +
                 '<ng1 dataA="First" modelB="Last"></ng1>' +
                 '<ng1></ng1>' +
                 '<ng1></ng1>'
           })
           class Ng2 {
             first = 'Victor';
             last = 'Savkin';
           }

           @NgModule({
             declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
             imports: [BrowserModule],
           })
           class Ng2Module {
           }

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
         waitForAsync(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module_('ng1', []);

           const ng1 = () => {
             return {
               restrict: 'E',
               template: '{{someText}} - Length: {{data.length}}',
               scope: {data: '='},
               controller: function($scope: any) {
                 $scope.someText = 'ng1 - Data: ' + $scope.data;
               }
             };
           };

           ng1Module.directive('ng1', ng1);
           @Component({
             selector: 'ng2',
             template:
                 '{{someText}} - Length: {{dataList.length}} | <ng1 [(data)]="dataList"></ng1>'
           })
           class Ng2 {
             dataList = [1, 2, 3];
             someText = 'ng2';
           }

           @NgModule({
             declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
             imports: [BrowserModule],
           })
           class Ng2Module {
           }

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

      it('should bind properties, events in link function', waitForAsync(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module_('ng1', []);

           const ng1 = () => {
             return {
               restrict: 'E',
               template: '{{someText}} - Length: {{data.length}}',
               scope: {data: '='},
               link: function($scope: any) {
                 $scope.someText = 'ng1 - Data: ' + $scope.data;
               }
             };
           };

           ng1Module.directive('ng1', ng1);
           @Component({
             selector: 'ng2',
             template:
                 '{{someText}} - Length: {{dataList.length}} | <ng1 [(data)]="dataList"></ng1>'
           })
           class Ng2 {
             dataList = [1, 2, 3];
             someText = 'ng2';
           }

           @NgModule({
             declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
             imports: [BrowserModule],
           })
           class Ng2Module {
           }

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

      it('should support templateUrl fetched from $httpBackend', waitForAsync(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module_('ng1', []);
           ng1Module.value(
               '$httpBackend', (method: string, url: string, post: any, cbFn: Function) => {
                 cbFn(200, `${method}:${url}`);
               });

           const ng1 = () => {
             return {templateUrl: 'url.html'};
           };
           ng1Module.directive('ng1', ng1);
           @Component({selector: 'ng2', template: '<ng1></ng1>'})
           class Ng2 {
           }

           @NgModule({
             declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
             imports: [BrowserModule],
           })
           class Ng2Module {
           }

           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           const element = html(`<div><ng2></ng2></div>`);
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(multiTrim(document.body.textContent)).toEqual('GET:url.html');
             ref.dispose();
           });
         }));

      it('should support templateUrl as a function', waitForAsync(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module_('ng1', []);
           ng1Module.value(
               '$httpBackend', (method: string, url: string, post: any, cbFn: Function) => {
                 cbFn(200, `${method}:${url}`);
               });

           const ng1 = () => {
             return {
               templateUrl() {
                 return 'url.html';
               }
             };
           };
           ng1Module.directive('ng1', ng1);
           @Component({selector: 'ng2', template: '<ng1></ng1>'})
           class Ng2 {
           }

           @NgModule({
             declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
             imports: [BrowserModule],
           })
           class Ng2Module {
           }

           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           const element = html(`<div><ng2></ng2></div>`);
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(multiTrim(document.body.textContent)).toEqual('GET:url.html');
             ref.dispose();
           });
         }));

      it('should support empty template', waitForAsync(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module_('ng1', []);

           const ng1 = () => {
             return {template: ''};
           };
           ng1Module.directive('ng1', ng1);

           @Component({selector: 'ng2', template: '<ng1></ng1>'})
           class Ng2 {
           }

           @NgModule({
             declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
             imports: [BrowserModule],
           })
           class Ng2Module {
           }

           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           const element = html(`<div><ng2></ng2></div>`);
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(multiTrim(document.body.textContent)).toEqual('');
             ref.dispose();
           });
         }));

      it('should support template as a function', waitForAsync(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module_('ng1', []);

           const ng1 = () => {
             return {
               template() {
                 return '';
               }
             };
           };
           ng1Module.directive('ng1', ng1);

           @Component({selector: 'ng2', template: '<ng1></ng1>'})
           class Ng2 {
           }

           @NgModule({
             declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
             imports: [BrowserModule],
           })
           class Ng2Module {
           }

           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           const element = html(`<div><ng2></ng2></div>`);
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(multiTrim(document.body.textContent)).toEqual('');
             ref.dispose();
           });
         }));

      it('should support templateUrl fetched from $templateCache', waitForAsync(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module_('ng1', []);
           ng1Module.run(($templateCache: any) => $templateCache.put('url.html', 'WORKS'));

           const ng1 = () => {
             return {templateUrl: 'url.html'};
           };
           ng1Module.directive('ng1', ng1);

           @Component({selector: 'ng2', template: '<ng1></ng1>'})
           class Ng2 {
           }

           @NgModule({
             declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
             imports: [BrowserModule],
           })
           class Ng2Module {
           }

           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           const element = html(`<div><ng2></ng2></div>`);
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(multiTrim(document.body.textContent)).toEqual('WORKS');
             ref.dispose();
           });
         }));

      it('should support controller with controllerAs', waitForAsync(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module_('ng1', []);

           const ng1 = () => {
             return {
               scope: true,
               template:
                   '{{ctl.scope}}; {{ctl.isClass}}; {{ctl.hasElement}}; {{ctl.isPublished()}}',
               controllerAs: 'ctl',
               controller: class {
                 scope: any;
                 hasElement: string;
                 $element: any;
                 isClass: any;
                 constructor($scope: any, $element: any) {
                   this.verifyIAmAClass();
                   this.scope = $scope.$parent.$parent == $scope.$root ? 'scope' : 'wrong-scope';
                   this.hasElement = $element[0].nodeName;
                   this.$element = $element;
                 }
                 verifyIAmAClass() {
                   this.isClass = 'isClass';
                 }
                 isPublished() {
                   return this.$element.controller('ng1') == this ? 'published' : 'not-published';
                 }
               }
             };
           };
           ng1Module.directive('ng1', ng1);

           @Component({selector: 'ng2', template: '<ng1></ng1>'})
           class Ng2 {
           }

           @NgModule({
             declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
             imports: [BrowserModule],
           })
           class Ng2Module {
           }

           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           const element = html(`<div><ng2></ng2></div>`);
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(multiTrim(document.body.textContent)).toEqual('scope; isClass; NG1; published');
             ref.dispose();
           });
         }));

      it('should support bindToController', waitForAsync(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module_('ng1', []);

           const ng1 = () => {
             return {
               scope: {title: '@'},
               bindToController: true,
               template: '{{ctl.title}}',
               controllerAs: 'ctl',
               controller: class {}
             };
           };
           ng1Module.directive('ng1', ng1);

           @Component({selector: 'ng2', template: '<ng1 title="WORKS"></ng1>'})
           class Ng2 {
           }

           @NgModule({
             declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
             imports: [BrowserModule],
           })
           class Ng2Module {
           }

           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           const element = html(`<div><ng2></ng2></div>`);
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(multiTrim(document.body.textContent)).toEqual('WORKS');
             ref.dispose();
           });
         }));

      it('should support bindToController with bindings', waitForAsync(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module_('ng1', []);

           const ng1 = () => {
             return {
               scope: {},
               bindToController: {title: '@'},
               template: '{{ctl.title}}',
               controllerAs: 'ctl',
               controller: class {}
             };
           };
           ng1Module.directive('ng1', ng1);

           @Component({selector: 'ng2', template: '<ng1 title="WORKS"></ng1>'})
           class Ng2 {
           }

           @NgModule({
             declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
             imports: [BrowserModule],
           })
           class Ng2Module {
           }

           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           const element = html(`<div><ng2></ng2></div>`);
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(multiTrim(document.body.textContent)).toEqual('WORKS');
             ref.dispose();
           });
         }));

      it('should support single require in linking fn', waitForAsync(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module_('ng1', []);

           const ng1 = ($rootScope: any) => {
             return {
               scope: {title: '@'},
               bindToController: true,
               template: '{{ctl.status}}',
               require: 'ng1',
               controllerAs: 'ctrl',
               controller: class {
                 status = 'WORKS';
               },
               link: function(scope: any, element: any, attrs: any, linkController: any) {
                 expect(scope.$root).toEqual($rootScope);
                 expect(element[0].nodeName).toEqual('NG1');
                 expect(linkController.status).toEqual('WORKS');
                 scope.ctl = linkController;
               }
             };
           };
           ng1Module.directive('ng1', ng1);

           @Component({selector: 'ng2', template: '<ng1></ng1>'})
           class Ng2 {
           }

           @NgModule({
             declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
             imports: [BrowserModule],
           })
           class Ng2Module {
           }

           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           const element = html(`<div><ng2></ng2></div>`);
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(multiTrim(document.body.textContent)).toEqual('WORKS');
             ref.dispose();
           });
         }));

      it('should support array require in linking fn', waitForAsync(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module_('ng1', []);

           const parent = () => {
             return {
               controller: class {
                 parent = 'PARENT';
               }
             };
           };
           const ng1 = () => {
             return {
               scope: {title: '@'},
               bindToController: true,
               template: '{{parent.parent}}:{{ng1.status}}',
               require: ['ng1', '^parent', '?^^notFound'],
               controllerAs: 'ctrl',
               controller: class {
                 status = 'WORKS';
               },
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

           @Component({selector: 'ng2', template: '<ng1></ng1>'})
           class Ng2 {
           }

           @NgModule({
             declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
             imports: [BrowserModule],
           })
           class Ng2Module {
           }

           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));
           const element = html(`<div><parent><ng2></ng2></parent></div>`);
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(multiTrim(document.body.textContent)).toEqual('PARENT:WORKS');
             ref.dispose();
           });
         }));

      describe('with life-cycle hooks', () => {
        it('should call `$onInit()` on controller', waitForAsync(() => {
             const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
             const $onInitSpyA = jasmine.createSpy('$onInitA');
             const $onInitSpyB = jasmine.createSpy('$onInitB');

             @Component({selector: 'ng2', template: '<ng1-a></ng1-a> | <ng1-b></ng1-b>'})
             class Ng2Component {
             }

             angular.module_('ng1', [])
                 .directive('ng1A', () => ({
                                      template: '',
                                      scope: {},
                                      bindToController: true,
                                      controllerAs: '$ctrl',
                                      controller: class {
                                        $onInit() {
                                          $onInitSpyA();
                                        }
                                      }
                                    }))
                 .directive('ng1B', () => ({
                                      template: '',
                                      scope: {},
                                      bindToController: false,
                                      controllerAs: '$ctrl',
                                      controller: function(this: any) {
                                        this.$onInit = $onInitSpyB;
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
               expect($onInitSpyA).toHaveBeenCalled();
               expect($onInitSpyB).toHaveBeenCalled();

               ref.dispose();
             });
           }));

        it('should not call `$onInit()` on scope', waitForAsync(() => {
             const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
             const $onInitSpy = jasmine.createSpy('$onInit');

             @Component({selector: 'ng2', template: '<ng1-a></ng1-a> | <ng1-b></ng1-b>'})
             class Ng2Component {
             }

             angular.module_('ng1', [])
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

        it('should call `$doCheck()` on controller', waitForAsync(() => {
             const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
             const $doCheckSpyA = jasmine.createSpy('$doCheckA');
             const $doCheckSpyB = jasmine.createSpy('$doCheckB');
             let changeDetector: ChangeDetectorRef;

             @Component({selector: 'ng2', template: '<ng1-a></ng1-a> | <ng1-b></ng1-b>'})
             class Ng2Component {
               constructor(cd: ChangeDetectorRef) {
                 changeDetector = cd;
               }
             }

             angular.module_('ng1', [])
                 .directive('ng1A', () => ({
                                      template: '',
                                      scope: {},
                                      bindToController: true,
                                      controllerAs: '$ctrl',
                                      controller: class {
                                        $doCheck() {
                                          $doCheckSpyA();
                                        }
                                      }
                                    }))
                 .directive('ng1B', () => ({
                                      template: '',
                                      scope: {},
                                      bindToController: false,
                                      controllerAs: '$ctrl',
                                      controller: function(this: any) {
                                        this.$doCheck = $doCheckSpyB;
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

        it('should not call `$doCheck()` on scope', waitForAsync(() => {
             const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
             const $doCheckSpyA = jasmine.createSpy('$doCheckA');
             const $doCheckSpyB = jasmine.createSpy('$doCheckB');
             let changeDetector: ChangeDetectorRef;

             @Component({selector: 'ng2', template: '<ng1-a></ng1-a> | <ng1-b></ng1-b>'})
             class Ng2Component {
               constructor(cd: ChangeDetectorRef) {
                 changeDetector = cd;
               }
             }

             angular.module_('ng1', [])
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

        it('should call `$postLink()` on controller', waitForAsync(() => {
             const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
             const $postLinkSpyA = jasmine.createSpy('$postLinkA');
             const $postLinkSpyB = jasmine.createSpy('$postLinkB');

             @Component({selector: 'ng2', template: '<ng1-a></ng1-a> | <ng1-b></ng1-b>'})
             class Ng2Component {
             }

             angular.module_('ng1', [])
                 .directive('ng1A', () => ({
                                      template: '',
                                      scope: {},
                                      bindToController: true,
                                      controllerAs: '$ctrl',
                                      controller: class {
                                        $postLink() {
                                          $postLinkSpyA();
                                        }
                                      }
                                    }))
                 .directive('ng1B', () => ({
                                      template: '',
                                      scope: {},
                                      bindToController: false,
                                      controllerAs: '$ctrl',
                                      controller: function(this: any) {
                                        this.$postLink = $postLinkSpyB;
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
               expect($postLinkSpyA).toHaveBeenCalled();
               expect($postLinkSpyB).toHaveBeenCalled();

               ref.dispose();
             });
           }));

        it('should not call `$postLink()` on scope', waitForAsync(() => {
             const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
             const $postLinkSpy = jasmine.createSpy('$postLink');

             @Component({selector: 'ng2', template: '<ng1-a></ng1-a> | <ng1-b></ng1-b>'})
             class Ng2Component {
             }

             angular.module_('ng1', [])
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
               constructor() {
                 ng2Instance = this;
               }
             }

             angular.module_('ng1', [])
                 .directive('ng1A', () => ({
                                      template: '',
                                      scope: {valA: '<'},
                                      bindToController: true,
                                      controllerAs: '$ctrl',
                                      controller: function(this: any, $scope: angular.IScope) {
                                        this.$onChanges = $onChangesControllerSpyA;
                                      }
                                    }))
                 .directive('ng1B', () => ({
                                      template: '',
                                      scope: {valB: '<'},
                                      bindToController: false,
                                      controllerAs: '$ctrl',
                                      controller: class {
                                        $onChanges(changes: SimpleChanges) {
                                          $onChangesControllerSpyB(changes);
                                        }
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
               constructor() {
                 ng2ComponentInstance = this;
               }
             }

             // On browsers that don't support `requestAnimationFrame` (Android <= 4.3),
             // `$animate` will use `setTimeout(..., 16.6)` instead. This timeout will still be
             // on
             // the queue at the end of the test, causing it to fail.
             // Mocking animations (via `ngAnimateMock`) avoids the issue.
             angular.module_('ng1', ['ngAnimateMock'])
                 .directive('ng1A', () => ({
                                      template: '',
                                      scope: {},
                                      bindToController: true,
                                      controllerAs: '$ctrl',
                                      controller: class {
                                        $onDestroy() {
                                          $onDestroySpyA();
                                        }
                                      }
                                    }))
                 .directive('ng1B', () => ({
                                      template: '',
                                      scope: {},
                                      bindToController: false,
                                      controllerAs: '$ctrl',
                                      controller: function(this: any) {
                                        this.$onDestroy = $onDestroySpyB;
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
               constructor() {
                 ng2ComponentInstance = this;
               }
             }

             // On browsers that don't support `requestAnimationFrame` (Android <= 4.3),
             // `$animate` will use `setTimeout(..., 16.6)` instead. This timeout will still be
             // on
             // the queue at the end of the test, causing it to fail.
             // Mocking animations (via `ngAnimateMock`) avoids the issue.
             angular.module_('ng1', ['ngAnimateMock'])
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

      describe('destroying the upgraded component', () => {
        it('should destroy `componentScope`', fakeAsync(() => {
             const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
             const scopeDestroyListener = jasmine.createSpy('scopeDestroyListener');
             let ng2ComponentInstance: Ng2Component;

             @Component({selector: 'ng2', template: '<div *ngIf="!ng2Destroy"><ng1></ng1></div>'})
             class Ng2Component {
               ng2Destroy: boolean = false;
               constructor() {
                 ng2ComponentInstance = this;
               }
             }

             // On browsers that don't support `requestAnimationFrame` (Android <= 4.3),
             // `$animate` will use `setTimeout(..., 16.6)` instead. This timeout will still be
             // on
             // the queue at the end of the test, causing it to fail.
             // Mocking animations (via `ngAnimateMock`) avoids the issue.
             angular.module_('ng1', ['ngAnimateMock'])
                 .component('ng1', {
                   controller: function($scope: angular.IScope) {
                     $scope.$on('$destroy', scopeDestroyListener);
                   },
                 })
                 .directive('ng2', adapter.downgradeNg2Component(Ng2Component));

             @NgModule({
               declarations: [adapter.upgradeNg1Component('ng1'), Ng2Component],
               imports: [BrowserModule],
             })
             class Ng2Module {
             }

             const element = html('<ng2></ng2>');
             adapter.bootstrap(element, ['ng1']).ready((ref) => {
               const $rootScope = ref.ng1RootScope as any;

               expect(scopeDestroyListener).not.toHaveBeenCalled();

               ng2ComponentInstance.ng2Destroy = true;
               tick();
               $rootScope.$digest();

               expect(scopeDestroyListener).toHaveBeenCalledTimes(1);
             });
           }));

        it('should emit `$destroy` on `$element` and descendants', fakeAsync(() => {
             const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
             const elementDestroyListener = jasmine.createSpy('elementDestroyListener');
             const descendantDestroyListener = jasmine.createSpy('descendantDestroyListener');
             let ng2ComponentInstance: Ng2Component;

             @Component({selector: 'ng2', template: '<div *ngIf="!ng2Destroy"><ng1></ng1></div>'})
             class Ng2Component {
               ng2Destroy: boolean = false;
               constructor() {
                 ng2ComponentInstance = this;
               }
             }

             // On browsers that don't support `requestAnimationFrame` (Android <= 4.3),
             // `$animate` will use `setTimeout(..., 16.6)` instead. This timeout will still be
             // on the queue at the end of the test, causing it to fail.
             // Mocking animations (via `ngAnimateMock`) avoids the issue.
             angular.module_('ng1', ['ngAnimateMock'])
                 .component('ng1', {
                   controller: class {
                     constructor(private $element: angular.IAugmentedJQuery) {} $onInit() {
                       this.$element.on!('$destroy', elementDestroyListener);
                       this.$element.contents!().on!('$destroy', descendantDestroyListener);
                     }
                   },
                   template: '<div></div>'
                 })
                 .directive('ng2', adapter.downgradeNg2Component(Ng2Component));

             @NgModule({
               declarations: [adapter.upgradeNg1Component('ng1'), Ng2Component],
               imports: [BrowserModule],
             })
             class Ng2Module {
             }

             const element = html('<ng2></ng2>');
             adapter.bootstrap(element, ['ng1']).ready((ref) => {
               const $rootScope = ref.ng1RootScope as any;
               tick();
               $rootScope.$digest();

               expect(elementDestroyListener).not.toHaveBeenCalled();
               expect(descendantDestroyListener).not.toHaveBeenCalled();

               ng2ComponentInstance.ng2Destroy = true;
               tick();
               $rootScope.$digest();

               expect(elementDestroyListener).toHaveBeenCalledTimes(1);
               expect(descendantDestroyListener).toHaveBeenCalledTimes(1);
             });
           }));

        it('should clear data on `$element` and descendants', fakeAsync(() => {
             const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
             let ng1ComponentElement: angular.IAugmentedJQuery;
             let ng2ComponentAInstance: Ng2ComponentA;

             // Define `ng1Component`
             const ng1Component: angular.IComponent = {
               controller: class {
                 constructor(private $element: angular.IAugmentedJQuery) {} $onInit() {
                   this.$element.data!('test', 1);
                   this.$element.contents!().data!('test', 2);

                   ng1ComponentElement = this.$element;
                 }
               },
               template: '<div></div>'
             };

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
             angular.module_('ng1Module', [])
                 .component('ng1', ng1Component)
                 .directive('ng2A', adapter.downgradeNg2Component(Ng2ComponentA));

             // Define `Ng2Module`
             @NgModule({
               declarations: [adapter.upgradeNg1Component('ng1'), Ng2ComponentA, Ng2ComponentB],
               entryComponents: [Ng2ComponentA],
               imports: [BrowserModule]
             })
             class Ng2Module {
               ngDoBootstrap() {}
             }

             // Bootstrap
             const element = html(`<ng2-a></ng2-a>`);

             adapter.bootstrap(element, ['ng1Module']).ready((ref) => {
               const $rootScope = ref.ng1RootScope as any;
               tick();
               $rootScope.$digest();
               expect(ng1ComponentElement.data!('test')).toBe(1);
               expect(ng1ComponentElement.contents!().data!('test')).toBe(2);

               ng2ComponentAInstance.destroyIt = true;
               tick();
               $rootScope.$digest();

               expect(ng1ComponentElement.data!('test')).toBeUndefined();
               expect(ng1ComponentElement.contents!().data!('test')).toBeUndefined();
             });
           }));

        it('should clear dom listeners on `$element` and descendants`', fakeAsync(() => {
             const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
             const elementClickListener = jasmine.createSpy('elementClickListener');
             const descendantClickListener = jasmine.createSpy('descendantClickListener');
             let ng1DescendantElement: angular.IAugmentedJQuery;
             let ng2ComponentAInstance: Ng2ComponentA;

             // Define `ng1Component`
             const ng1Component: angular.IComponent = {
               controller: class {
                 constructor(private $element: angular.IAugmentedJQuery) {} $onInit() {
                   ng1DescendantElement = this.$element.contents!();

                   this.$element.on!('click', elementClickListener);
                   ng1DescendantElement.on!('click', descendantClickListener);
                 }
               },
               template: '<div></div>'
             };

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
             angular.module_('ng1Module', [])
                 .component('ng1', ng1Component)
                 .directive('ng2A', adapter.downgradeNg2Component(Ng2ComponentA));

             // Define `Ng2Module`
             @NgModule({
               declarations: [adapter.upgradeNg1Component('ng1'), Ng2ComponentA, Ng2ComponentB],
               entryComponents: [Ng2ComponentA],
               imports: [BrowserModule]
             })
             class Ng2Module {
               ngDoBootstrap() {}
             }

             // Bootstrap
             const element = html(`<ng2-a></ng2-a>`);

             adapter.bootstrap(element, ['ng1Module']).ready((ref) => {
               const $rootScope = ref.ng1RootScope as any;
               tick();
               $rootScope.$digest();
               (ng1DescendantElement[0] as HTMLElement).click();
               expect(elementClickListener).toHaveBeenCalledTimes(1);
               expect(descendantClickListener).toHaveBeenCalledTimes(1);

               ng2ComponentAInstance.destroyIt = true;
               tick();
               $rootScope.$digest();

               (ng1DescendantElement[0] as HTMLElement).click();
               expect(elementClickListener).toHaveBeenCalledTimes(1);
               expect(descendantClickListener).toHaveBeenCalledTimes(1);
             });
           }));
      });

      describe('linking', () => {
        it('should run the pre-linking after instantiating the controller', waitForAsync(() => {
             const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
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

             // Define `Ng2Component`
             @Component({selector: 'ng2', template: '<ng1></ng1>'})
             class Ng2Component {
             }

             // Define `ng1Module`
             const ng1Module = angular.module_('ng1', [])
                                   .directive('ng1', () => ng1Directive)
                                   .directive('ng2', adapter.downgradeNg2Component(Ng2Component));

             // Define `Ng2Module`
             @NgModule({
               imports: [BrowserModule],
               declarations: [adapter.upgradeNg1Component('ng1'), Ng2Component]
             })
             class Ng2Module {
             }

             // Bootstrap
             const element = html(`<ng2></ng2>`);

             adapter.bootstrap(element, ['ng1']).ready(() => {
               setTimeout(() => expect(log).toEqual(['ng1-ctrl', 'ng1-pre']), 1000);
             });
           }));

        it('should run the pre-linking function before linking', waitForAsync(() => {
             const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
             const log: string[] = [];

             // Define `ng1Directive`
             const ng1DirectiveA: angular.IDirective = {
               template: '<ng1-b></ng1-b>',
               link: {pre: () => log.push('ng1A-pre')}
             };

             const ng1DirectiveB: angular.IDirective = {link: () => log.push('ng1B-post')};

             // Define `Ng2Component`
             @Component({selector: 'ng2', template: '<ng1-a></ng1-a>'})
             class Ng2Component {
             }

             // Define `ng1Module`
             const ng1Module = angular.module_('ng1', [])
                                   .directive('ng1A', () => ng1DirectiveA)
                                   .directive('ng1B', () => ng1DirectiveB)
                                   .directive('ng2', adapter.downgradeNg2Component(Ng2Component));

             // Define `Ng2Module`
             @NgModule({
               imports: [BrowserModule],
               declarations: [adapter.upgradeNg1Component('ng1A'), Ng2Component],
               schemas: [NO_ERRORS_SCHEMA]
             })
             class Ng2Module {
             }

             // Bootstrap
             const element = html(`<ng2></ng2>`);

             adapter.bootstrap(element, ['ng1']).ready(() => {
               expect(log).toEqual(['ng1A-pre', 'ng1B-post']);
             });
           }));

        it('should run the post-linking function after linking (link: object)', waitForAsync(() => {
             const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
             const log: string[] = [];

             // Define `ng1Directive`
             const ng1DirectiveA: angular.IDirective = {
               template: '<ng1-b></ng1-b>',
               link: {post: () => log.push('ng1A-post')}
             };

             const ng1DirectiveB: angular.IDirective = {link: () => log.push('ng1B-post')};

             // Define `Ng2Component`
             @Component({selector: 'ng2', template: '<ng1-a></ng1-a>'})
             class Ng2Component {
             }

             // Define `ng1Module`
             const ng1Module = angular.module_('ng1', [])
                                   .directive('ng1A', () => ng1DirectiveA)
                                   .directive('ng1B', () => ng1DirectiveB)
                                   .directive('ng2', adapter.downgradeNg2Component(Ng2Component));

             // Define `Ng2Module`
             @NgModule({
               imports: [BrowserModule],
               declarations: [adapter.upgradeNg1Component('ng1A'), Ng2Component],
               schemas: [NO_ERRORS_SCHEMA]
             })
             class Ng2Module {
             }

             // Bootstrap
             const element = html(`<ng2></ng2>`);

             adapter.bootstrap(element, ['ng1']).ready(() => {
               expect(log).toEqual(['ng1B-post', 'ng1A-post']);
             });
           }));

        it('should run the post-linking function after linking (link: function)',
           waitForAsync(() => {
             const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
             const log: string[] = [];

             // Define `ng1Directive`
             const ng1DirectiveA: angular.IDirective = {
               template: '<ng1-b></ng1-b>',
               link: () => log.push('ng1A-post')
             };

             const ng1DirectiveB: angular.IDirective = {link: () => log.push('ng1B-post')};

             // Define `Ng2Component`
             @Component({selector: 'ng2', template: '<ng1-a></ng1-a>'})
             class Ng2Component {
             }

             // Define `ng1Module`
             const ng1Module = angular.module_('ng1', [])
                                   .directive('ng1A', () => ng1DirectiveA)
                                   .directive('ng1B', () => ng1DirectiveB)
                                   .directive('ng2', adapter.downgradeNg2Component(Ng2Component));

             // Define `Ng2Module`
             @NgModule({
               imports: [BrowserModule],
               declarations: [adapter.upgradeNg1Component('ng1A'), Ng2Component],
               schemas: [NO_ERRORS_SCHEMA]
             })
             class Ng2Module {
             }

             // Bootstrap
             const element = html(`<ng2></ng2>`);

             adapter.bootstrap(element, ['ng1']).ready(() => {
               expect(log).toEqual(['ng1B-post', 'ng1A-post']);
             });
           }));

        it('should run the post-linking function before `$postLink`', waitForAsync(() => {
             const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
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

             // Define `Ng2Component`
             @Component({selector: 'ng2', template: '<ng1></ng1>'})
             class Ng2Component {
             }

             // Define `ng1Module`
             const ng1Module = angular.module_('ng1', [])
                                   .directive('ng1', () => ng1Directive)
                                   .directive('ng2', adapter.downgradeNg2Component(Ng2Component));

             // Define `Ng2Module`
             @NgModule({
               imports: [BrowserModule],
               declarations: [adapter.upgradeNg1Component('ng1'), Ng2Component]
             })
             class Ng2Module {
             }

             // Bootstrap
             const element = html(`<ng2></ng2>`);

             adapter.bootstrap(element, ['ng1']).ready(() => {
               expect(log).toEqual(['ng1-post', 'ng1-$post']);
             });
           }));
      });

      describe('transclusion', () => {
        it('should support single-slot transclusion', waitForAsync(() => {
             const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
             let ng2ComponentAInstance: Ng2ComponentA;
             let ng2ComponentBInstance: Ng2ComponentB;

             // Define `ng1Component`
             const ng1Component: angular.IComponent = {
               template: 'ng1(<div ng-transclude></div>)',
               transclude: true
             };

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
                                   .directive('ng2A', adapter.downgradeNg2Component(Ng2ComponentA));

             // Define `Ng2Module`
             @NgModule({
               imports: [BrowserModule],
               declarations: [adapter.upgradeNg1Component('ng1'), Ng2ComponentA, Ng2ComponentB]
             })
             class Ng2Module {
             }

             // Bootstrap
             const element = html(`<ng2-a></ng2-a>`);

             adapter.bootstrap(element, ['ng1Module']).ready((ref) => {
               expect(multiTrim(element.textContent)).toBe('ng2A(ng1(foo | ))');

               ng2ComponentAInstance.value = 'baz';
               ng2ComponentAInstance.showB = true;
               $digest(ref);

               expect(multiTrim(element.textContent)).toBe('ng2A(ng1(baz | ng2B(bar)))');

               ng2ComponentBInstance.value = 'qux';
               $digest(ref);

               expect(multiTrim(element.textContent)).toBe('ng2A(ng1(baz | ng2B(qux)))');
             });
           }));

        it('should support single-slot transclusion with fallback content', waitForAsync(() => {
             const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
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

             // Define `Ng2Component`
             @Component({
               selector: 'ng2',
               template: `
                ng2(
                  <ng1><div>{{ value }}</div></ng1> |

                  <!-- Interpolation-only content should still be detected as transcluded content. -->
                  <ng1>{{ value }}</ng1> |

                  <ng1></ng1>
                )`
             })
             class Ng2Component {
               value = 'from-ng2';
               constructor() {
                 ng2ComponentInstance = this;
               }
             }

             // Define `ng1Module`
             const ng1Module = angular.module_('ng1Module', [])
                                   .component('ng1', ng1Component)
                                   .directive('ng2', adapter.downgradeNg2Component(Ng2Component));

             // Define `Ng2Module`
             @NgModule({
               imports: [BrowserModule],
               declarations: [adapter.upgradeNg1Component('ng1'), Ng2Component]
             })
             class Ng2Module {
             }

             // Bootstrap
             const element = html(`<ng2></ng2>`);

             adapter.bootstrap(element, ['ng1Module']).ready(ref => {
               expect(multiTrim(element.textContent, true))
                   .toBe('ng2(ng1(from-ng2)|ng1(from-ng2)|ng1(from-ng1))');

               ng1ControllerInstances.forEach(ctrl => ctrl.value = 'ng1-foo');
               ng2ComponentInstance.value = 'ng2-bar';
               $digest(ref);

               expect(multiTrim(element.textContent, true))
                   .toBe('ng2(ng1(ng2-bar)|ng1(ng2-bar)|ng1(ng1-foo))');
             });
           }));

        it('should support multi-slot transclusion', waitForAsync(() => {
             const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
             let ng2ComponentInstance: Ng2Component;

             // Define `ng1Component`
             const ng1Component: angular.IComponent = {
               template:
                   'ng1(x(<div ng-transclude="slotX"></div>) | y(<div ng-transclude="slotY"></div>))',
               transclude: {slotX: 'contentX', slotY: 'contentY'}
             };

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
                                   .directive('ng2', adapter.downgradeNg2Component(Ng2Component));

             // Define `Ng2Module`
             @NgModule({
               imports: [BrowserModule],
               declarations: [adapter.upgradeNg1Component('ng1'), Ng2Component],
               schemas: [NO_ERRORS_SCHEMA]
             })
             class Ng2Module {
             }

             // Bootstrap
             const element = html(`<ng2></ng2>`);

             adapter.bootstrap(element, ['ng1Module']).ready(ref => {
               expect(multiTrim(element.textContent, true))
                   .toBe('ng2(ng1(x(foo1foo2)|y(bar1bar2)))');

               ng2ComponentInstance.x = 'baz';
               ng2ComponentInstance.y = 'qux';
               $digest(ref);

               expect(multiTrim(element.textContent, true))
                   .toBe('ng2(ng1(x(baz1baz2)|y(qux1qux2)))');
             });
           }));

        it('should support default slot (with fallback content)', waitForAsync(() => {
             const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
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
                  <ng1><content-x>ignored x</content-x><content-y>ignored y</content-y></ng1> |

                  <!--
                    Interpolation-only content should still be detected as transcluded content.
                  -->
                  <ng1>{{ x }}<content-x>ignored x</content-x>{{ y + x }}<content-y>ignored y</content-y>{{ y }}</ng1>
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
                                   .directive('ng2', adapter.downgradeNg2Component(Ng2Component));

             // Define `Ng2Module`
             @NgModule({
               imports: [BrowserModule],
               declarations: [adapter.upgradeNg1Component('ng1'), Ng2Component],
               schemas: [NO_ERRORS_SCHEMA]
             })
             class Ng2Module {
             }

             // Bootstrap
             const element = html(`<ng2></ng2>`);

             adapter.bootstrap(element, ['ng1Module']).ready(ref => {
               expect(multiTrim(element.textContent, true))
                   .toBe(
                       'ng2(ng1(default((foo)foo-bar(bar)))|ng1(default(fallback-ng1))|ng1(default(foobarfoobar)))');

               ng1ControllerInstances.forEach(ctrl => ctrl.value = 'ng1-plus');
               ng2ComponentInstance.x = 'baz';
               ng2ComponentInstance.y = 'qux';
               $digest(ref);

               expect(multiTrim(element.textContent, true))
                   .toBe(
                       'ng2(ng1(default((baz)baz-qux(qux)))|ng1(default(fallback-ng1-plus))|ng1(default(bazquxbazqux)))');
             });
           }));

        it('should support optional transclusion slots (with fallback content)',
           waitForAsync(() => {
             const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
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
                                   .directive('ng2', adapter.downgradeNg2Component(Ng2Component));

             // Define `Ng2Module`
             @NgModule({
               imports: [BrowserModule],
               declarations: [adapter.upgradeNg1Component('ng1'), Ng2Component],
               schemas: [NO_ERRORS_SCHEMA]
             })
             class Ng2Module {
             }

             // Bootstrap
             const element = html(`<ng2></ng2>`);

             adapter.bootstrap(element, ['ng1Module']).ready(ref => {
               expect(multiTrim(element.textContent, true))
                   .toBe('ng2(ng1(x(ng2X)|y(ng1Y))|ng1(x(ng1X)|y(ng2Y)))');

               ng1ControllerInstances.forEach(ctrl => {
                 ctrl.x = 'ng1X-foo';
                 ctrl.y = 'ng1Y-bar';
               });
               ng2ComponentInstance.x = 'ng2X-baz';
               ng2ComponentInstance.y = 'ng2Y-qux';
               $digest(ref);

               expect(multiTrim(element.textContent, true))
                   .toBe('ng2(ng1(x(ng2X-baz)|y(ng1Y-bar))|ng1(x(ng1X-foo)|y(ng2Y-qux)))');
             });
           }));

        it('should throw if a non-optional slot is not filled', waitForAsync(() => {
             const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
             let errorMessage: string;

             // Define `ng1Component`
             const ng1Component: angular.IComponent = {
               template: '',
               transclude: {slotX: '?contentX', slotY: 'contentY'}
             };

             // Define `Ng2Component`
             @Component({selector: 'ng2', template: '<ng1></ng1>'})
             class Ng2Component {
             }

             // Define `ng1Module`
             const ng1Module =
                 angular.module_('ng1Module', [])
                     .value($EXCEPTION_HANDLER, (error: Error) => errorMessage = error.message)
                     .component('ng1', ng1Component)
                     .directive('ng2', adapter.downgradeNg2Component(Ng2Component));

             // Define `Ng2Module`
             @NgModule({
               imports: [BrowserModule],
               declarations: [adapter.upgradeNg1Component('ng1'), Ng2Component]
             })
             class Ng2Module {
             }

             // Bootstrap
             const element = html(`<ng2></ng2>`);

             adapter.bootstrap(element, ['ng1Module']).ready(ref => {
               expect(errorMessage)
                   .toContain('Required transclusion slot \'slotY\' on directive: ng1');
             });
           }));

        it('should support structural directives in transcluded content', waitForAsync(() => {
             const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
             let ng2ComponentInstance: Ng2Component;

             // Define `ng1Component`
             const ng1Component: angular.IComponent = {
               template:
                   'ng1(x(<div ng-transclude="slotX"></div>) | default(<div ng-transclude=""></div>))',
               transclude: {slotX: 'contentX'}
             };

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
                                   .directive('ng2', adapter.downgradeNg2Component(Ng2Component));

             // Define `Ng2Module`
             @NgModule({
               imports: [BrowserModule],
               declarations: [adapter.upgradeNg1Component('ng1'), Ng2Component],
               schemas: [NO_ERRORS_SCHEMA]
             })
             class Ng2Module {
             }

             // Bootstrap
             const element = html(`<ng2></ng2>`);

             adapter.bootstrap(element, ['ng1Module']).ready(ref => {
               expect(multiTrim(element.textContent, true)).toBe('ng2(ng1(x(foo1)|default(bar2)))');

               ng2ComponentInstance.x = 'baz';
               ng2ComponentInstance.y = 'qux';
               ng2ComponentInstance.show = false;
               $digest(ref);

               expect(multiTrim(element.textContent, true)).toBe('ng2(ng1(x(baz2)|default(qux1)))');

               ng2ComponentInstance.show = true;
               $digest(ref);

               expect(multiTrim(element.textContent, true)).toBe('ng2(ng1(x(baz1)|default(qux2)))');
             });
           }));
      });

      it('should bind input properties (<) of components', waitForAsync(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module_('ng1', []);

           const ng1 = {
             bindings: {personProfile: '<'},
             template: 'Hello {{$ctrl.personProfile.firstName}} {{$ctrl.personProfile.lastName}}',
             controller: class {}
           };
           ng1Module.component('ng1', ng1);

           @Component({selector: 'ng2', template: '<ng1 [personProfile]="goku"></ng1>'})
           class Ng2 {
             goku = {firstName: 'GOKU', lastName: 'SAN'};
           }

           @NgModule({
             declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
             imports: [BrowserModule],
           })
           class Ng2Module {
           }

           ng1Module.directive('ng2', adapter.downgradeNg2Component(Ng2));

           const element = html(`<div><ng2></ng2></div>`);
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(multiTrim(document.body.textContent)).toEqual(`Hello GOKU SAN`);
             ref.dispose();
           });
         }));

      it('should support ng2 > ng1 > ng2', waitForAsync(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const ng1Module = angular.module_('ng1', []);

           const ng1 = {
             template: 'ng1(<ng2b></ng2b>)',
           };
           ng1Module.component('ng1', ng1);

           @Component({selector: 'ng2a', template: 'ng2a(<ng1></ng1>)'})
           class Ng2a {
           }
           ng1Module.directive('ng2a', adapter.downgradeNg2Component(Ng2a));

           @Component({selector: 'ng2b', template: 'ng2b'})
           class Ng2b {
           }
           ng1Module.directive('ng2b', adapter.downgradeNg2Component(Ng2b));

           @NgModule({
             declarations: [adapter.upgradeNg1Component('ng1'), Ng2a, Ng2b],
             imports: [BrowserModule],
           })
           class Ng2Module {
           }

           const element = html(`<div><ng2a></ng2a></div>`);
           adapter.bootstrap(element, ['ng1']).ready((ref) => {
             expect(multiTrim(document.body.textContent)).toEqual('ng2a(ng1(ng2b))');
           });
         }));
    });

    describe('injection', () => {
      function SomeToken() {}

      it('should export ng2 instance to ng1', waitForAsync(() => {
           @NgModule({
             providers: [{provide: SomeToken, useValue: 'correct_value'}],
             imports: [BrowserModule],
           })
           class MyNg2Module {
           }

           const adapter: UpgradeAdapter = new UpgradeAdapter(MyNg2Module);
           const module = angular.module_('myExample', []);
           module.factory('someToken', adapter.downgradeNg2Provider(SomeToken));
           adapter.bootstrap(html('<div>'), ['myExample']).ready((ref) => {
             expect(ref.ng1Injector.get('someToken')).toBe('correct_value');
             ref.dispose();
           });
         }));

      it('should export ng1 instance to ng2', waitForAsync(() => {
           @NgModule({imports: [BrowserModule]})
           class MyNg2Module {
           }

           const adapter: UpgradeAdapter = new UpgradeAdapter(MyNg2Module);
           const module = angular.module_('myExample', []);
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

      it('should respect hierarchical dependency injection for ng2', waitForAsync(() => {
           const ng1Module = angular.module_('ng1', []);

           @Component({selector: 'ng2-parent', template: `ng2-parent(<ng-content></ng-content>)`})
           class Ng2Parent {
           }
           @Component({selector: 'ng2-child', template: `ng2-child`})
           class Ng2Child {
             constructor(parent: Ng2Parent) {}
           }

           @NgModule({declarations: [Ng2Parent, Ng2Child], imports: [BrowserModule]})
           class Ng2Module {
           }

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
      it('should handle deferred bootstrap', waitForAsync(() => {
           @NgModule({imports: [BrowserModule]})
           class MyNg2Module {
           }

           const adapter: UpgradeAdapter = new UpgradeAdapter(MyNg2Module);
           angular.module_('ng1', []);
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

      it('should propagate return value of resumeBootstrap', fakeAsync(() => {
           @NgModule({imports: [BrowserModule]})
           class MyNg2Module {
           }

           const adapter: UpgradeAdapter = new UpgradeAdapter(MyNg2Module);
           const ng1Module = angular.module_('ng1', []);
           let a1Injector: angular.IInjectorService|undefined;
           ng1Module.run([
             '$injector',
             function($injector: angular.IInjectorService) {
               a1Injector = $injector;
             }
           ]);

           const element = html('<div></div>');
           window.name = 'NG_DEFER_BOOTSTRAP!' + window.name;

           adapter.bootstrap(element, [ng1Module.name]).ready((ref) => {
             ref.dispose();
           });

           tick(100);

           const value = (<any>window).angular.resumeBootstrap();
           expect(value).toBe(a1Injector);
         }));

      it('should wait for ng2 testability', waitForAsync(() => {
           @NgModule({imports: [BrowserModule]})
           class MyNg2Module {
           }

           const adapter: UpgradeAdapter = new UpgradeAdapter(MyNg2Module);
           angular.module_('ng1', []);
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
      it('should verify UpgradeAdapter example', waitForAsync(() => {
           const adapter: UpgradeAdapter = new UpgradeAdapter(forwardRef(() => Ng2Module));
           const module = angular.module_('myExample', []);

           const ng1 = () => {
             return {
               scope: {title: '='},
               transclude: true,
               template: 'ng1[Hello {{title}}!](<span ng-transclude></span>)'
             };
           };
           module.directive('ng1', ng1);

           @Component({
             selector: 'ng2',
             inputs: ['name'],
             template: 'ng2[<ng1 [title]="name">transclude</ng1>](<ng-content></ng-content>)'
           })
           class Ng2 {
           }

           @NgModule({
             declarations: [adapter.upgradeNg1Component('ng1'), Ng2],
             imports: [BrowserModule],
           })
           class Ng2Module {
           }

           module.directive('ng2', adapter.downgradeNg2Component(Ng2));

           document.body.innerHTML = '<ng2 name="World">project</ng2>';

           adapter.bootstrap(document.body.firstElementChild!, ['myExample']).ready((ref) => {
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
        const ng1Module = angular.module_('ng1', []);

        @Component({
          selector: 'ng2',
          template: 'Hello World',
        })
        class Ng2 {
        }

        @NgModule({declarations: [Ng2], imports: [BrowserModule]})
        class Ng2Module {
        }

        const upgradeAdapter = new UpgradeAdapter(Ng2Module);
        ng1Module.directive('ng2', upgradeAdapter.downgradeNg2Component(Ng2));

        upgradeAdapterRef = upgradeAdapter.registerForNg1Tests(['ng1']);
      });

      beforeEach(() => {
        inject((_$compile_: angular.ICompileService, _$rootScope_: angular.IRootScopeService) => {
          $compile = _$compile_;
          $rootScope = _$rootScope_;
        });
      });

      it('should be able to test ng1 components that use ng2 components', waitForAsync(() => {
           upgradeAdapterRef.ready(() => {
             const element = $compile('<ng2></ng2>')($rootScope);
             $rootScope.$digest();
             expect(element[0].textContent).toContain('Hello World');
           });
         }));
    });
  });
});

function $apply(adapter: UpgradeAdapterRef, exp: angular.Ng1Expression) {
  const $rootScope = adapter.ng1Injector.get($ROOT_SCOPE) as angular.IRootScopeService;
  $rootScope.$apply(exp);
}

function $digest(adapter: UpgradeAdapterRef) {
  const $rootScope = adapter.ng1Injector.get($ROOT_SCOPE) as angular.IRootScopeService;
  $rootScope.$digest();
}
