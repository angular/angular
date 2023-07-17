/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {provideLocationMocks} from '@angular/common/testing';
import {Component, Inject, Injectable, NgModule} from '@angular/core';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {Router, RouterModule, RouterStateSnapshot, TitleStrategy} from '@angular/router';

import {provideRouter} from '../src/provide_router';

describe('title strategy', () => {
  describe('DefaultTitleStrategy', () => {
    let router: Router;
    let document: Document;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [
          TestModule,
        ],
        providers: [
          provideLocationMocks(),
          provideRouter([]),
        ]
      });
      router = TestBed.inject(Router);
      document = TestBed.inject(DOCUMENT);
    });

    it('sets page title from data', fakeAsync(() => {
         router.resetConfig([{path: 'home', title: 'My Application', component: BlankCmp}]);
         router.navigateByUrl('home');
         tick();
         expect(document.title).toBe('My Application');
       }));

    it('sets page title from resolved data', fakeAsync(() => {
         router.resetConfig([{path: 'home', title: TitleResolver, component: BlankCmp}]);
         router.navigateByUrl('home');
         tick();
         expect(document.title).toBe('resolved title');
       }));

    it('sets page title from resolved data function', fakeAsync(() => {
         router.resetConfig([{path: 'home', title: () => 'resolved title', component: BlankCmp}]);
         router.navigateByUrl('home');
         tick();
         expect(document.title).toBe('resolved title');
       }));

    it('sets title with child routes', fakeAsync(() => {
         router.resetConfig([{
           path: 'home',
           title: 'My Application',
           children: [
             {path: '', title: 'child title', component: BlankCmp},
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
             title: 'My Application',
             children: [
               {path: '', title: 'child title', component: BlankCmp},
               {path: '', outlet: 'childaux', title: 'child aux title', component: BlankCmp},
             ],
           },
           {path: 'compose', component: BlankCmp, outlet: 'aux', title: 'compose'}
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
             title: 'My Application',
             children: [
               {
                 path: '',
                 title: TitleResolver,
                 component: BlankCmp,
               },
             ],
           },
         ]);
         router.navigateByUrl('home');
         tick();
         expect(document.title).toBe('resolved title');
       }));

    it('can get the title from the ActivatedRouteSnapshot', async () => {
      router.resetConfig([
        {
          path: 'home',
          title: 'My Application',
          component: BlankCmp,
        },
      ]);
      await router.navigateByUrl('home');
      expect(router.routerState.snapshot.root.firstChild!.title).toEqual('My Application');
    });
  });

  describe('custom strategies', () => {
    it('overriding the setTitle method', fakeAsync(() => {
         @Injectable({providedIn: 'root'})
         class TemplatePageTitleStrategy extends TitleStrategy {
           constructor(@Inject(DOCUMENT) private readonly document: Document) {
             super();
           }

           // Example of how setTitle could implement a template for the title
           override updateTitle(state: RouterStateSnapshot) {
             const title = this.buildTitle(state);
             this.document.title = `My Application | ${title}`;
           }
         }

         TestBed.configureTestingModule({
           imports: [
             TestModule,
           ],
           providers: [
             provideLocationMocks(),
             provideRouter([]),
             {provide: TitleStrategy, useClass: TemplatePageTitleStrategy},
           ]
         });
         const router = TestBed.inject(Router);
         const document = TestBed.inject(DOCUMENT);
         router.resetConfig([
           {
             path: 'home',
             title: 'Home',
             children: [
               {path: '', title: 'Child', component: BlankCmp},
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
  imports: [RouterModule.forRoot([])],
})
export class TestModule {
}


@Injectable({providedIn: 'root'})
export class TitleResolver {
  resolve() {
    return 'resolved title';
  }
}
