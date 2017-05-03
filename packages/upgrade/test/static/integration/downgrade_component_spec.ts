/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Compiler, Component, ComponentFactoryResolver, EventEmitter, Injector, Input, NgModule, NgModuleRef, OnChanges, OnDestroy, SimpleChanges, destroyPlatform} from '@angular/core';
import {async} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import * as angular from '@angular/upgrade/src/common/angular1';
import {UpgradeModule, downgradeComponent} from '@angular/upgrade/static';

import {$apply, bootstrap, html, multiTrim} from '../test_helpers';

export function main() {
  describe('downgrade ng2 component', () => {

    beforeEach(() => destroyPlatform());
    afterEach(() => destroyPlatform());

    it('should bind properties, events', async(() => {
         const ng1Module =
             angular.module('ng1', []).value('$exceptionHandler', (err: any) => {
                                        throw err;
                                      }).run(($rootScope: angular.IScope) => {
               $rootScope['name'] = 'world';
               $rootScope['dataA'] = 'A';
               $rootScope['dataB'] = 'B';
               $rootScope['modelA'] = 'initModelA';
               $rootScope['modelB'] = 'initModelB';
               $rootScope['eventA'] = '?';
               $rootScope['eventB'] = '?';
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
         class Ng2Component implements OnChanges {
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
               const propVal = (this as any)[prop];
               if (propVal != value) {
                 throw new Error(`Expected: '${prop}' to be '${value}' but was '${propVal}'`);
               }
             };

             const assertChange = (prop: string, value: any) => {
               assert(prop, value);
               if (!changes[prop]) {
                 throw new Error(`Changes record for '${prop}' not found.`);
               }
               const actualValue = changes[prop].currentValue;
               if (actualValue != value) {
                 throw new Error(
                     `Expected changes record for'${prop}' to be '${value}' but was '${actualValue}'`);
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
           };
         }

         ng1Module.directive('ng2', downgradeComponent({
                               component: Ng2Component,
                             }));

         @NgModule({
           declarations: [Ng2Component],
           entryComponents: [Ng2Component],
           imports: [BrowserModule, UpgradeModule]
         })
         class Ng2Module {
           ngDoBootstrap() {}
         }

         const element = html(`
           <div>
             <ng2 literal="Text" interpolate="Hello {{name}}"
                 bind-one-way-a="dataA" [one-way-b]="dataB"
                 bindon-two-way-a="modelA" [(two-way-b)]="modelB"
                 on-event-a='eventA=$event' (event-b)="eventB=$event"></ng2>
             | modelA: {{modelA}}; modelB: {{modelB}}; eventA: {{eventA}}; eventB: {{eventB}};
           </div>`);

         bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then((upgrade) => {
           expect(multiTrim(document.body.textContent))
               .toEqual(
                   'ignore: -; ' +
                   'literal: Text; interpolate: Hello world; ' +
                   'oneWayA: A; oneWayB: B; twoWayA: newA; twoWayB: newB; (2) | ' +
                   'modelA: newA; modelB: newB; eventA: aFired; eventB: bFired;');

           $apply(upgrade, 'name = "everyone"');
           expect(multiTrim(document.body.textContent))
               .toEqual(
                   'ignore: -; ' +
                   'literal: Text; interpolate: Hello everyone; ' +
                   'oneWayA: A; oneWayB: B; twoWayA: newA; twoWayB: newB; (3) | ' +
                   'modelA: newA; modelB: newB; eventA: aFired; eventB: bFired;');
         });
       }));

    it('should initialize inputs in time for `ngOnChanges`', async(() => {
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

         @NgModule({
           imports: [BrowserModule, UpgradeModule],
           declarations: [Ng2Component],
           entryComponents: [Ng2Component]
         })
         class Ng2Module {
           ngDoBootstrap() {}
         }

         const ng1Module = angular.module('ng1', []).directive(
             'ng2', downgradeComponent({component: Ng2Component}));

         const element = html(`
           <ng2 [foo]="'foo'"></ng2>
           <ng2 foo="bar"></ng2>
           <ng2 [foo]="'baz'" ng-if="true"></ng2>
           <ng2 foo="qux" ng-if="true"></ng2>
         `);

         bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(upgrade => {
           const nodes = element.querySelectorAll('ng2');
           const expectedTextWith = (value: string) =>
               `ngOnChangesCount: 1 | firstChangesCount: 1 | initialValue: ${value}`;

           expect(multiTrim(nodes[0].textContent)).toBe(expectedTextWith('foo'));
           expect(multiTrim(nodes[1].textContent)).toBe(expectedTextWith('bar'));
           expect(multiTrim(nodes[2].textContent)).toBe(expectedTextWith('baz'));
           expect(multiTrim(nodes[3].textContent)).toBe(expectedTextWith('qux'));
         });
       }));

    it('should bind to ng-model', async(() => {
         const ng1Module = angular.module('ng1', []).run(
             ($rootScope: angular.IScope) => { $rootScope['modelA'] = 'A'; });

         let ng2Instance: Ng2;
         @Component({selector: 'ng2', template: '<span>{{_value}}</span>'})
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

         ng1Module.directive('ng2', downgradeComponent({component: Ng2}));

         const element = html(`<div><ng2 ng-model="modelA"></ng2> | {{modelA}}</div>`);

         @NgModule(
             {declarations: [Ng2], entryComponents: [Ng2], imports: [BrowserModule, UpgradeModule]})
         class Ng2Module {
           ngDoBootstrap() {}
         }

         platformBrowserDynamic().bootstrapModule(Ng2Module).then((ref) => {
           const adapter = ref.injector.get(UpgradeModule) as UpgradeModule;
           adapter.bootstrap(element, [ng1Module.name]);
           const $rootScope = adapter.$injector.get('$rootScope');

           expect(multiTrim(document.body.textContent)).toEqual('A | A');

           $rootScope.modelA = 'B';
           $rootScope.$apply();
           expect(multiTrim(document.body.textContent)).toEqual('B | B');

           ng2Instance.doChange('C');
           expect($rootScope.modelA).toBe('C');
           expect(multiTrim(document.body.textContent)).toEqual('C | C');
         });
       }));

    it('should properly run cleanup when ng1 directive is destroyed', async(() => {

         let destroyed = false;
         @Component({selector: 'ng2', template: 'test'})
         class Ng2Component implements OnDestroy {
           ngOnDestroy() { destroyed = true; }
         }

         @NgModule({
           declarations: [Ng2Component],
           entryComponents: [Ng2Component],
           imports: [BrowserModule, UpgradeModule]
         })
         class Ng2Module {
           ngDoBootstrap() {}
         }

         const ng1Module =
             angular.module('ng1', [])
                 .directive(
                     'ng1',
                     () => { return {template: '<div ng-if="!destroyIt"><ng2></ng2></div>'}; })
                 .directive('ng2', downgradeComponent({component: Ng2Component}));
         const element = html('<ng1></ng1>');
         platformBrowserDynamic().bootstrapModule(Ng2Module).then((ref) => {
           const adapter = ref.injector.get(UpgradeModule) as UpgradeModule;
           adapter.bootstrap(element, [ng1Module.name]);
           expect(element.textContent).toContain('test');
           expect(destroyed).toBe(false);

           const $rootScope = adapter.$injector.get('$rootScope');
           $rootScope.$apply('destroyIt = true');

           expect(element.textContent).not.toContain('test');
           expect(destroyed).toBe(true);
         });
       }));

    it('should work when compiled outside the dom (by fallback to the root ng2.injector)',
       async(() => {

         @Component({selector: 'ng2', template: 'test'})
         class Ng2Component {
         }

         @NgModule({
           declarations: [Ng2Component],
           entryComponents: [Ng2Component],
           imports: [BrowserModule, UpgradeModule]
         })
         class Ng2Module {
           ngDoBootstrap() {}
         }

         const ng1Module =
             angular.module('ng1', [])
                 .directive(
                     'ng1',
                     [
                       '$compile',
                       ($compile: angular.ICompileService) => {
                         return {
                           link: function(
                               $scope: angular.IScope, $element: angular.IAugmentedJQuery,
                               $attrs: angular.IAttributes) {
                             // here we compile some HTML that contains a downgraded component
                             // since it is not currently in the DOM it is not able to "require"
                             // an ng2 injector so it should use the `moduleInjector` instead.
                             const compiled = $compile('<ng2></ng2>');
                             const template = compiled($scope);
                             $element.append !(template);
                           }
                         };
                       }
                     ])
                 .directive('ng2', downgradeComponent({component: Ng2Component}));

         const element = html('<ng1></ng1>');
         bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then((upgrade) => {
           // the fact that the body contains the correct text means that the
           // downgraded component was able to access the moduleInjector
           // (since there is no other injector in this system)
           expect(multiTrim(document.body.textContent)).toEqual('test');
         });
       }));

    it('should allow attribute selectors for downgraded components', async(() => {
         @Component({selector: '[itWorks]', template: 'It works'})
         class WorksComponent {
         }

         @NgModule({
           declarations: [WorksComponent],
           entryComponents: [WorksComponent],
           imports: [BrowserModule, UpgradeModule]
         })
         class Ng2Module {
           ngDoBootstrap() {}
         }

         const ng1Module = angular.module('ng1', []).directive(
             'worksComponent', downgradeComponent({component: WorksComponent}));

         const element = html('<works-component></works-component>');

         bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then((upgrade) => {
           expect(multiTrim(document.body.textContent)).toBe('It works');
         });
       }));

    it('should allow attribute selectors for components in ng2', async(() => {
         @Component({selector: '[itWorks]', template: 'It works'})
         class WorksComponent {
         }

         @Component({selector: 'root-component', template: '<span itWorks></span>!'})
         class RootComponent {
         }

         @NgModule({
           declarations: [RootComponent, WorksComponent],
           entryComponents: [RootComponent],
           imports: [BrowserModule, UpgradeModule]
         })
         class Ng2Module {
           ngDoBootstrap() {}
         }

         const ng1Module = angular.module('ng1', []).directive(
             'rootComponent', downgradeComponent({component: RootComponent}));

         const element = html('<root-component></root-component>');

         bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then((upgrade) => {
           expect(multiTrim(document.body.textContent)).toBe('It works!');
         });
       }));

    it('should respect hierarchical dependency injection for ng2', async(() => {
         @Component({selector: 'parent', template: 'parent(<ng-content></ng-content>)'})
         class ParentComponent {
         }

         @Component({selector: 'child', template: 'child'})
         class ChildComponent {
           constructor(parent: ParentComponent) {}
         }

         @NgModule({
           declarations: [ParentComponent, ChildComponent],
           entryComponents: [ParentComponent, ChildComponent],
           imports: [BrowserModule, UpgradeModule]
         })
         class Ng2Module {
           ngDoBootstrap() {}
         }

         const ng1Module =
             angular.module('ng1', [])
                 .directive('parent', downgradeComponent({component: ParentComponent}))
                 .directive('child', downgradeComponent({component: ChildComponent}));

         const element = html('<parent><child></child></parent>');

         bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(upgrade => {
           expect(multiTrim(document.body.textContent)).toBe('parent(child)');
         });
       }));

    it('should work with ng2 lazy loaded components', async(() => {

         let componentInjector: Injector;

         @Component({selector: 'ng2', template: ''})
         class Ng2Component {
           constructor(injector: Injector) { componentInjector = injector; }
         }

         @NgModule({
           declarations: [Ng2Component],
           entryComponents: [Ng2Component],
           imports: [BrowserModule, UpgradeModule],
         })
         class Ng2Module {
           ngDoBootstrap() {}
         }

         @Component({template: ''})
         class LazyLoadedComponent {
           constructor(public module: NgModuleRef<any>){};
         }

         @NgModule({
           declarations: [LazyLoadedComponent],
           entryComponents: [LazyLoadedComponent],
         })
         class LazyLoadedModule {
         }

         const ng1Module = angular.module('ng1', []).directive(
             'ng2', downgradeComponent({component: Ng2Component}));

         const element = html('<ng2></ng2>');

         bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(upgrade => {
           const modInjector = upgrade.injector;
           // Emulate the router lazy loading a module and creating a component
           const compiler = modInjector.get(Compiler);
           const modFactory = compiler.compileModuleSync(LazyLoadedModule);
           const childMod = modFactory.create(modInjector);
           const cmpFactory =
               childMod.componentFactoryResolver.resolveComponentFactory(LazyLoadedComponent) !;
           const lazyCmp = cmpFactory.create(componentInjector);

           expect(lazyCmp.instance.module).toBe(childMod.injector);
         });

       }));
  });
}
