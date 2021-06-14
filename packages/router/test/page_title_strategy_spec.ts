/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {Component, Injectable, NgModule} from '@angular/core';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {Title} from '@angular/platform-browser';
import {Router, RouterModule} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';

import {PageTitleStrategy} from '../src';

describe('page title strategy', () => {
  it('does not set page title by default (so that the feature is non-breaking)', fakeAsync(() => {
       TestBed.configureTestingModule({
         imports: [
           RouterTestingModule.withRoutes(
               [{path: 'home', data: {pageTitle: 'My Application'}, component: BlankCmp}]),
           TestModule,
         ],
       });
       const router = TestBed.inject(Router);
       const document = TestBed.inject(DOCUMENT);
       document.title = 'before';

       router.navigateByUrl('home');
       tick();

       expect(document.title).toBe('before');
     }));

  describe('BrowserPageTitleStrategy', () => {
    let router: Router;
    let document: Document;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [
          RouterTestingModule,
          TestModule,
        ],
      });
      router = TestBed.inject(Router);
      document = TestBed.inject(DOCUMENT);
      TestBed.inject(PageTitleStrategy);
    });

    it('sets page title from data', fakeAsync(() => {
         router.resetConfig(
             [{path: 'home', data: {pageTitle: 'My Application'}, component: BlankCmp}]);
         router.navigateByUrl('home');
         tick();
         expect(document.title).toBe('My Application');
       }));

    it('sets page title from resolved data', fakeAsync(() => {
         router.resetConfig(
             [{path: 'home', resolve: {pageTitle: TitleResolver}, component: BlankCmp}]);
         router.navigateByUrl('home');
         tick();
         expect(document.title).toBe('resolved title');
       }));

    it('sets title with child routes', fakeAsync(() => {
         router.resetConfig([{
           path: 'home',
           data: {pageTitle: 'My Application'},
           children: [
             {path: '', data: {pageTitle: 'child title'}, component: BlankCmp},
           ]
         }]);
         router.navigateByUrl('home');
         tick();
         expect(document.title).toBe('child title');
       }));

    it('sets title with child routes and named outlets', fakeAsync(() => {
         router.resetConfig([
           {
             path: 'home',
             data: {pageTitle: 'My Application'},
             children: [
               {path: '', data: {pageTitle: 'child title'}, component: BlankCmp},
               {
                 path: '',
                 outlet: 'childaux',
                 data: {pageTitle: 'child aux title'},
                 component: BlankCmp
               },
             ],
           },
           {path: 'compose', component: BlankCmp, outlet: 'aux', data: {pageTile: 'compose'}}
         ]);
         router.navigateByUrl('home(aux:compose)');
         tick();
         expect(document.title).toBe('child title');
       }));

    it('sets page title with paramsInheritanceStrategy=always', fakeAsync(() => {
         router.paramsInheritanceStrategy = 'always';
         router.resetConfig([
           {
             path: 'home',
             data: {pageTitle: 'My Application'},
             children: [
               {
                 path: '',
                 // Must set pageTitle to `null` or it will inherit from parent if it doesn't have
                 // its own value
                 data: {pageTitle: null},
                 children: [{
                   path: '',
                   resolve: {pageTitle: TitleResolver},
                   component: BlankCmp,
                 }]
               },
             ],
           },
         ]);
         router.navigateByUrl('home');
         tick();
         expect(document.title).toBe('resolved title');
       }));
  });

  describe('custom strategies', () => {
    it('overriding the setTitle method', fakeAsync(() => {
         @Injectable({providedIn: 'root'})
         class TemplatePageTitleStrategy extends PageTitleStrategy {
           // Example of how setTitle could implement a template for the title
           override setTitle(title: string) {
             this.title.setTitle(`My Application | ${title}`);
           }
         }

         TestBed.configureTestingModule({
           imports: [
             RouterTestingModule,
             TestModule,
           ],
         });
         TestBed.inject(TemplatePageTitleStrategy);
         const router = TestBed.inject(Router);
         const document = TestBed.inject(DOCUMENT);
         router.resetConfig([
           {
             path: 'home',
             data: {pageTitle: 'Home'},
             children: [
               {path: '', data: {pageTitle: 'Child'}, component: BlankCmp},
             ],
           },
         ]);

         router.navigateByUrl('home');
         tick();
         expect(document.title).toEqual('My Application | Child');
       }));
  });
});

@Component({template: ''})
export class BlankCmp {
}

@Component({
  template: `
<router-outlet></router-outlet>
<router-outlet name="aux"></router-outlet>
`
})
export class RootCmp {
}

@NgModule({
  declarations: [BlankCmp],
  imports: [RouterModule],
})
export class TestModule {
}


@Injectable({providedIn: 'root'})
export class TitleResolver {
  resolve() {
    return 'resolved title';
  }
}
