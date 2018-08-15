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
  describe('examples', () => {
    beforeEach(() => destroyPlatform());
    afterEach(() => destroyPlatform());

    it('should have AngularJS loaded',
       () => expect(angular.getAngularJSGlobal().version.major).toBe(1));

    it('should verify UpgradeAdapter example', waitForAsync(() => {
         // This is wrapping (upgrading) an AngularJS component to be used in an Angular
         // component
         @Directive({selector: 'ng1'})
         class Ng1Component extends UpgradeComponent {
           // TODO(issue/24571): remove '!'.
           @Input() title!: string;

           constructor(elementRef: ElementRef, injector: Injector) {
             super('ng1', elementRef, injector);
           }
         }

         // This is an Angular component that will be downgraded
         @Component({
           selector: 'ng2',
           template: 'ng2[<ng1 [title]="nameProp">transclude</ng1>](<ng-content></ng-content>)'
         })
         class Ng2Component {
           // TODO(issue/24571): remove '!'.
           @Input('name') nameProp!: string;
         }

         // This module represents the Angular pieces of the application
         @NgModule({
           declarations: [Ng1Component, Ng2Component],
           entryComponents: [Ng2Component],
           imports: [BrowserModule, UpgradeModule]
         })
         class Ng2Module {
           ngDoBootstrap() { /* this is a placeholder to stop the bootstrapper from
                                complaining */
           }
         }

         // This module represents the AngularJS pieces of the application
         const ng1Module =
             angular
                 .module_('myExample', [])
                 // This is an AngularJS component that will be upgraded
                 .directive(
                     'ng1',
                     () => {
                       return {
                         scope: {title: '='},
                         transclude: true,
                         template: 'ng1[Hello {{title}}!](<span ng-transclude></span>)'
                       };
                     })
                 // This is wrapping (downgrading) an Angular component to be used in
                 // AngularJS
                 .directive('ng2', downgradeComponent({component: Ng2Component}));

         // This is the (AngularJS) application bootstrap element
         // Notice that it is actually a downgraded Angular component
         const element = html('<ng2 name="World">project</ng2>');

         // Let's use a helper function to make this simpler
         bootstrap(platformBrowserDynamic(), Ng2Module, element, ng1Module).then(upgrade => {
           expect(multiTrim(element.textContent))
               .toBe('ng2[ng1[Hello World!](transclude)](project)');
         });
       }));
  });
});
