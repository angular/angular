/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, destroyPlatform, Directive, ElementRef, Injector, Input, NgModule} from '@angular/core';
import {waitForAsync} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {downgradeComponent, UpgradeComponent, UpgradeModule} from '@angular/upgrade/static';

import * as angular from '../../../src/common/src/angular1';
import {html, multiTrim, withEachNg1Version} from '../../../src/common/test/helpers/common_test_helpers';

import {bootstrap} from './static_test_helpers';

withEachNg1Version(() => {
  describe('content projection', () => {
    beforeEach(() => destroyPlatform());
    afterEach(() => destroyPlatform());

    it('should instantiate ng2 in ng1 template and project content', waitForAsync(() => {
         // the ng2 component that will be used in ng1 (downgraded)
         @Component({selector: 'ng2', template: `{{ prop }}(<ng-content></ng-content>)`})
         class Ng2Component {
           prop = 'NG2';
           ngContent = 'ng2-content';
         }

         // our upgrade module to host the component to downgrade
         @NgModule({
           imports: [BrowserModule, UpgradeModule],
           declarations: [Ng2Component],
         })
         class Ng2Module {
           ngDoBootstrap() {}
         }

         // the ng1 app module that will consume the downgraded component
         const ng1Module = angular
                               .module_('ng1', [])
                               // create an ng1 facade of the ng2 component
                               .directive('ng2', downgradeComponent({component: Ng2Component}))
                               .run(($rootScope: angular.IRootScopeService) => {
                                 $rootScope['prop'] = 'NG1';
                                 $rootScope['ngContent'] = 'ng1-content';
                               });

         const element = html('<div>{{ \'ng1[\' }}<ng2>~{{ ngContent }}~</ng2>{{ \']\' }}</div>');

         bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then((upgrade) => {
           expect(document.body.textContent).toEqual('ng1[NG2(~ng1-content~)]');
         });
       }));

    it('should correctly project structural directives', waitForAsync(() => {
         @Component({selector: 'ng2', template: 'ng2-{{ itemId }}(<ng-content></ng-content>)'})
         class Ng2Component {
           @Input() itemId: string = '';
         }

         @NgModule({
           imports: [BrowserModule, UpgradeModule],
           declarations: [Ng2Component],
         })
         class Ng2Module {
           ngDoBootstrap() {}
         }

         const ng1Module = angular.module_('ng1', [])
                               .directive('ng2', downgradeComponent({component: Ng2Component}))
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

         bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(upgrade => {
           expect(multiTrim(document.body.textContent))
               .toBe('ng2-a( 123 )ng2-b( 456 )ng2-c( 789 )');
         });
       }));

    it('should instantiate ng1 in ng2 template and project content', waitForAsync(() => {
         @Component({
           selector: 'ng2',
           template: `{{ 'ng2(' }}<ng1>{{ transclude }}</ng1>{{ ')' }}`,
         })
         class Ng2Component {
           prop = 'ng2';
           transclude = 'ng2-transclude';
         }

         @Directive({selector: 'ng1'})
         class Ng1WrapperComponent extends UpgradeComponent {
           constructor(elementRef: ElementRef, injector: Injector) {
             super('ng1', elementRef, injector);
           }
         }

         @NgModule({
           declarations: [Ng1WrapperComponent, Ng2Component],
           imports: [BrowserModule, UpgradeModule]
         })
         class Ng2Module {
           ngDoBootstrap() {}
         }

         const ng1Module =
             angular.module_('ng1', [])
                 .directive('ng1', () => ({
                                     transclude: true,
                                     template: '{{ prop }}(<ng-transclude></ng-transclude>)'
                                   }))
                 .directive('ng2', downgradeComponent({component: Ng2Component}))
                 .run(($rootScope: angular.IRootScopeService) => {
                   $rootScope['prop'] = 'ng1';
                   $rootScope['transclude'] = 'ng1-transclude';
                 });

         const element = html('<div>{{ \'ng1(\' }}<ng2></ng2>{{ \')\' }}</div>');

         bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then((upgrade) => {
           expect(document.body.textContent).toEqual('ng1(ng2(ng1(ng2-transclude)))');
         });
       }));

    it('should support multi-slot projection', waitForAsync(() => {
         @Component({
           selector: 'ng2',
           template: '2a(<ng-content select=".ng1a"></ng-content>)' +
               '2b(<ng-content select=".ng1b"></ng-content>)'
         })
         class Ng2Component {
           constructor() {}
         }

         @NgModule({declarations: [Ng2Component], imports: [BrowserModule, UpgradeModule]})
         class Ng2Module {
           ngDoBootstrap() {}
         }

         const ng1Module = angular.module_('ng1', []).directive(
             'ng2', downgradeComponent({component: Ng2Component}));

         // The ng-if on one of the projected children is here to make sure
         // the correct slot is targeted even with structural directives in play.
         const element = html(
             '<ng2><div ng-if="true" class="ng1a">1a</div><div' +
             ' class="ng1b">1b</div></ng2>');

         bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then((upgrade) => {
           expect(document.body.textContent).toEqual('2a(1a)2b(1b)');
         });
       }));
  });
});
