import {DOCUMENT} from '@angular/common';
import {Component, Injectable, NgModule} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {Router, RouterModule} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';

import {BasePageTitleStrategy, DocumentPageTitleStrategy, PageTitleStrategy, RouterStateSnapshot} from '../src';

fdescribe('page title strategy', () => {
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

  describe('DocumentPageTitleStrategy', () => {
    let router: Router;
    let document: Document;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [
          RouterTestingModule,
          TestModule,
        ],
        providers: [
          {provide: PageTitleStrategy, useClass: DocumentPageTitleStrategy},
        ]
      });
      router = TestBed.inject(Router);
      document = TestBed.inject(DOCUMENT);
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
         expect(document.title).toBe('My Application child title');
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
         // This shouldn't fail. What's wrong with the test environment????
         expect(document.title).toBe('My Application child title child aux title compose');
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
         expect(document.title).toBe('My Application resolved title');
       }));
  });

  describe('custom strategies', () => {
    it('overriding the setTile method', fakeAsync(() => {
         @Injectable()
         class LastPageTitleStrategy extends BasePageTitleStrategy {
           setTitle(route: RouterStateSnapshot) {
             const titles = this.collectPageTitles(route);
             if (titles.length > 0) {
               this.document.title = titles[titles.length - 1];
             }
           }
         }

         TestBed.configureTestingModule({
           imports: [
             RouterTestingModule,
             TestModule,
           ],
           providers: [
             {provide: PageTitleStrategy, useClass: LastPageTitleStrategy},
           ]
         });
         const router = TestBed.inject(Router);
         const document = TestBed.inject(DOCUMENT);
         router.resetConfig([
           {
             path: 'home',
             data: {pageTitle: 'My Application'},
             children: [
               {path: '', data: {pageTitle: 'child title'}, component: BlankCmp},
             ],
           },
         ]);

         router.navigateByUrl('home');
         tick();
         expect(document.title).toEqual('child title');
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
  entryComponents: [BlankCmp],
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