/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, EventEmitter, NgModule, OnChanges, OnDestroy, SimpleChanges, destroyPlatform} from '@angular/core';
import {async} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import * as angular from '@angular/upgrade/src/angular_js';
import {UpgradeModule, downgradeComponent} from '@angular/upgrade/static';

import {bootstrap, html, multiTrim} from '../test_helpers';

export function main() {
  describe('downgrade ng2 component', () => {

    beforeEach(() => destroyPlatform());
    afterEach(() => destroyPlatform());

    it('should bind properties, events', async(() => {

         const ng1Module = angular.module('ng1', []).run(($rootScope: angular.IScope) => {
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
                 break;
               case 2:
                 assertChange('twoWayB', 'newB');
                 break;
               default:
                 throw new Error('Called too many times! ' + JSON.stringify(changes));
             }
           };
         }

         ng1Module.directive(
             'ng2', downgradeComponent({
               component: Ng2Component,
               inputs: ['literal', 'interpolate', 'oneWayA', 'oneWayB', 'twoWayA', 'twoWayB'],
               outputs: [
                 'eventA', 'eventB', 'twoWayAEmitter: twoWayAChange',
                 'twoWayBEmitter: twoWayBChange'
               ]
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
             <ng2 literal="Text" interpolate="Hello {{'world'}}"
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
                             $element.append(template);
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
  });
}
