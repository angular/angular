/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CommonModule, Location} from '@angular/common';
import {provideLocationMocks, SpyLocation} from '@angular/common/testing';
import {Component, Injectable, NgModule, Type} from '@angular/core';
import {fakeAsync, ComponentFixture, TestBed, tick} from '@angular/core/testing';
import {expect} from '@angular/private/testing/matchers';
import {Router, RouterModule, RouterOutlet, UrlTree, withRouterConfig} from '../index';
import {EMPTY, of} from 'rxjs';

import {provideRouter} from '../src/provide_router';
import {isUrlTree} from '../src/url_tree';

describe('`restoredState#ɵrouterPageId`', () => {
  @Injectable({providedIn: 'root'})
  class MyCanDeactivateGuard {
    allow: boolean = true;
    canDeactivate(): boolean {
      return this.allow;
    }
  }

  @Injectable({providedIn: 'root'})
  class ThrowingCanActivateGuard {
    throw = false;

    constructor(private router: Router) {}

    canActivate(): boolean {
      if (this.throw) {
        throw new Error('error in guard');
      }
      return true;
    }
  }

  @Injectable({providedIn: 'root'})
  class MyCanActivateGuard {
    allow: boolean = true;
    redirectTo: string | null | UrlTree = null;

    constructor(private router: Router) {}

    canActivate(): boolean | UrlTree {
      if (typeof this.redirectTo === 'string') {
        this.router.navigateByUrl(this.redirectTo);
      } else if (isUrlTree(this.redirectTo)) {
        return this.redirectTo;
      }
      return this.allow;
    }
  }
  @Injectable({providedIn: 'root'})
  class MyResolve {
    myresolve = of(2);
    resolve() {
      return this.myresolve;
    }
  }

  let fixture: ComponentFixture<unknown>;

  function createNavigationHistory(urlUpdateStrategy: 'eager' | 'deferred' = 'deferred') {
    TestBed.configureTestingModule({
      imports: [TestModule],
      providers: [
        {provide: Location, useClass: SpyLocation},
        provideRouter(
          [
            {
              path: 'first',
              component: SimpleCmp,
              canDeactivate: [MyCanDeactivateGuard],
              canActivate: [MyCanActivateGuard, ThrowingCanActivateGuard],
              resolve: {x: MyResolve},
            },
            {
              path: 'second',
              component: SimpleCmp,
              canDeactivate: [MyCanDeactivateGuard],
              canActivate: [MyCanActivateGuard, ThrowingCanActivateGuard],
              resolve: {x: MyResolve},
            },
            {
              path: 'third',
              component: SimpleCmp,
              canDeactivate: [MyCanDeactivateGuard],
              canActivate: [MyCanActivateGuard, ThrowingCanActivateGuard],
              resolve: {x: MyResolve},
            },
            {
              path: 'unguarded',
              component: SimpleCmp,
            },
            {
              path: 'throwing',
              component: ThrowingCmp,
            },
            {
              path: 'loaded',
              loadChildren: () => of(ModuleWithSimpleCmpAsRoute),
              canLoad: [() => false],
            },
          ],
          withRouterConfig({
            urlUpdateStrategy,
            canceledNavigationResolution: 'computed',
            resolveNavigationPromiseOnError: true,
          }),
        ),
      ],
    });
    const router = TestBed.inject(Router);
    const location = TestBed.inject(Location);
    fixture = createRoot(router, RootCmp);
    router.initialNavigation();
    advance(fixture);
    expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 0}));

    router.navigateByUrl('/first');
    advance(fixture);
    expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 1}));

    router.navigateByUrl('/second');
    advance(fixture);
    expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

    router.navigateByUrl('/third');
    advance(fixture);
    expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 3}));

    location.back();
    advance(fixture);
    expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));
  }

  describe('deferred url updates', () => {
    beforeEach(fakeAsync(() => {
      createNavigationHistory();
    }));

    it('should work when CanActivate returns false', () =>
      fakeAsync(() => {
        const location = TestBed.inject(Location);
        const router = TestBed.inject(Router);
        expect(location.path()).toEqual('/second');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

        TestBed.inject(MyCanActivateGuard).allow = false;
        location.back();
        advance(fixture);
        expect(location.path()).toEqual('/second');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

        TestBed.inject(MyCanActivateGuard).allow = true;
        location.back();
        advance(fixture);
        expect(location.path()).toEqual('/first');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 1}));

        TestBed.inject(MyCanActivateGuard).allow = false;
        location.forward();
        advance(fixture);
        expect(location.path()).toEqual('/first');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 1}));

        router.navigateByUrl('/second');
        advance(fixture);
        expect(location.path()).toEqual('/first');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 1}));
      }));

    it('should work when CanDeactivate returns false', () =>
      fakeAsync(() => {
        const location = TestBed.inject(Location);
        const router = TestBed.inject(Router);

        TestBed.inject(MyCanDeactivateGuard).allow = false;
        location.back();
        advance(fixture);
        expect(location.path()).toEqual('/second');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

        location.forward();
        advance(fixture);
        expect(location.path()).toEqual('/second');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

        router.navigateByUrl('third');
        advance(fixture);
        expect(location.path()).toEqual('/second');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

        TestBed.inject(MyCanDeactivateGuard).allow = true;
        location.forward();
        advance(fixture);
        expect(location.path()).toEqual('/third');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 3}));
      }));

    it('should work when using `NavigationExtras.skipLocationChange`', () =>
      fakeAsync(() => {
        const location = TestBed.inject(Location);
        const router = TestBed.inject(Router);

        expect(location.path()).toEqual('/second');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

        router.navigateByUrl('/first', {skipLocationChange: true});
        advance(fixture);
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

        router.navigateByUrl('/third');
        advance(fixture);
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 3}));

        location.back();
        advance(fixture);
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));
      }));

    it('should work when using `NavigationExtras.replaceUrl`', () =>
      fakeAsync(() => {
        const location = TestBed.inject(Location);
        const router = TestBed.inject(Router);

        expect(location.path()).toEqual('/second');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

        router.navigateByUrl('/first', {replaceUrl: true});
        advance(fixture);
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));
        expect(location.path()).toEqual('/first');
      }));

    it('should work when CanLoad returns false', () =>
      fakeAsync(() => {
        const location = TestBed.inject(Location);
        const router = TestBed.inject(Router);

        router.navigateByUrl('/loaded');
        advance(fixture);
        expect(location.path()).toEqual('/second');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));
      }));

    it('should work when resolve empty', () =>
      fakeAsync(() => {
        const location = TestBed.inject(Location);
        const router = TestBed.inject(Router);

        expect(location.path()).toEqual('/second');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

        TestBed.inject(MyResolve).myresolve = EMPTY;

        location.back();
        advance(fixture);
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));
        expect(location.path()).toEqual('/second');

        TestBed.inject(MyResolve).myresolve = of(2);

        location.back();
        advance(fixture);
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 1}));
        expect(location.path()).toEqual('/first');

        TestBed.inject(MyResolve).myresolve = EMPTY;

        // We should cancel the navigation to `/third` when myresolve is empty
        router.navigateByUrl('/third');
        advance(fixture);
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 1}));
        expect(location.path()).toEqual('/first');

        location.historyGo(2);
        advance(fixture);
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 1}));
        expect(location.path()).toEqual('/first');

        TestBed.inject(MyResolve).myresolve = of(2);
        location.historyGo(2);
        advance(fixture);
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 3}));
        expect(location.path()).toEqual('/third');

        TestBed.inject(MyResolve).myresolve = EMPTY;
        location.historyGo(-2);
        advance(fixture);
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 3}));
        expect(location.path()).toEqual('/third');
      }));

    it('should work when an error occurred during navigation', () =>
      fakeAsync(() => {
        const location = TestBed.inject(Location);
        const router = TestBed.inject(Router);

        expect(location.path()).toEqual('/second');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

        router.navigateByUrl('/invalid').catch(() => null);
        advance(fixture);
        expect(location.path()).toEqual('/second');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

        location.back();
        advance(fixture);
        expect(location.path()).toEqual('/first');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 1}));
      }));

    it('should work when CanActivate redirects', () =>
      fakeAsync(() => {
        const location = TestBed.inject(Location);

        TestBed.inject(MyCanActivateGuard).redirectTo = '/unguarded';
        location.back();
        advance(fixture);
        expect(location.path()).toEqual('/unguarded');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

        TestBed.inject(MyCanActivateGuard).redirectTo = null;

        location.back();
        advance(fixture);
        expect(location.path()).toEqual('/first');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 1}));
      }));

    it('restores history correctly when component throws error in constructor and replaceUrl=true', () =>
      fakeAsync(() => {
        const location = TestBed.inject(Location);
        const router = TestBed.inject(Router);

        router.navigateByUrl('/throwing', {replaceUrl: true}).catch(() => null);
        advance(fixture);
        expect(location.path()).toEqual('/second');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

        location.back();
        advance(fixture);
        expect(location.path()).toEqual('/first');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 1}));
      }));

    it('restores history correctly when component throws error in constructor and skipLocationChange=true', () =>
      fakeAsync(() => {
        const location = TestBed.inject(Location);
        const router = TestBed.inject(Router);

        router.navigateByUrl('/throwing', {skipLocationChange: true}).catch(() => null);
        advance(fixture);
        expect(location.path()).toEqual('/second');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

        location.back();
        advance(fixture);
        expect(location.path()).toEqual('/first');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 1}));
      }));
  });

  describe('eager url updates', () => {
    beforeEach(fakeAsync(() => {
      createNavigationHistory('eager');
    }));
    it('should work', () =>
      fakeAsync(() => {
        const location = TestBed.inject(Location) as SpyLocation;
        const router = TestBed.inject(Router);
        expect(location.path()).toEqual('/second');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

        TestBed.inject(MyCanActivateGuard).allow = false;
        router.navigateByUrl('/first');
        advance(fixture);
        expect(location.path()).toEqual('/second');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

        location.back();
        advance(fixture);
        expect(location.path()).toEqual('/second');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));
      }));
    it('should work when CanActivate redirects', () =>
      fakeAsync(() => {
        const location = TestBed.inject(Location);
        const router = TestBed.inject(Router);

        TestBed.inject(MyCanActivateGuard).redirectTo = '/unguarded';
        router.navigateByUrl('/third');
        advance(fixture);
        expect(location.path()).toEqual('/unguarded');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 4}));

        TestBed.inject(MyCanActivateGuard).redirectTo = null;

        location.back();
        advance(fixture);
        expect(location.path()).toEqual('/third');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 3}));
      }));
    it('should work when CanActivate redirects with UrlTree', () =>
      fakeAsync(() => {
        // Note that this test is different from the above case because we are able to specifically
        // handle the `UrlTree` case as a proper redirect and set `replaceUrl: true` on the
        // follow-up navigation.
        const location = TestBed.inject(Location);
        const router = TestBed.inject(Router);
        let allowNavigation = true;
        router.resetConfig([
          {path: 'initial', children: []},
          {path: 'redirectFrom', redirectTo: 'redirectTo'},
          {path: 'redirectTo', children: [], canActivate: [() => allowNavigation]},
        ]);

        // already at '2' from the `beforeEach` navigations
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));
        router.navigateByUrl('/initial');
        advance(fixture);
        expect(location.path()).toEqual('/initial');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 3}));

        TestBed.inject(MyCanActivateGuard).redirectTo = null;

        router.navigateByUrl('redirectTo');
        advance(fixture);
        expect(location.path()).toEqual('/redirectTo');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 4}));

        // Navigate to different URL but get redirected to same URL should result in same page id
        router.navigateByUrl('redirectFrom');
        advance(fixture);
        expect(location.path()).toEqual('/redirectTo');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 4}));

        // Back and forward should have page IDs 1 apart
        location.back();
        advance(fixture);
        expect(location.path()).toEqual('/initial');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 3}));
        location.forward();
        advance(fixture);
        expect(location.path()).toEqual('/redirectTo');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 4}));

        // Rejected navigation after redirect to same URL should have the same page ID
        allowNavigation = false;
        router.navigateByUrl('redirectFrom');
        advance(fixture);
        expect(location.path()).toEqual('/redirectTo');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 4}));
      }));
    it('redirectTo with same url, and guard reject', () =>
      fakeAsync(() => {
        const location = TestBed.inject(Location);
        const router = TestBed.inject(Router);

        TestBed.inject(MyCanActivateGuard).redirectTo = router.createUrlTree(['unguarded']);
        router.navigateByUrl('/third');
        advance(fixture);
        expect(location.path()).toEqual('/unguarded');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 3}));

        TestBed.inject(MyCanActivateGuard).redirectTo = null;

        location.back();
        advance(fixture);
        expect(location.path()).toEqual('/second');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));
      }));
  });

  for (const urlUpdateStrategy of ['deferred', 'eager'] as const) {
    it(`restores history correctly when an error is thrown in guard with urlUpdateStrategy ${urlUpdateStrategy}`, () =>
      fakeAsync(() => {
        createNavigationHistory(urlUpdateStrategy);
        const location = TestBed.inject(Location);

        TestBed.inject(ThrowingCanActivateGuard).throw = true;

        location.back();
        advance(fixture);
        expect(location.path()).toEqual('/second');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

        TestBed.inject(ThrowingCanActivateGuard).throw = false;
        location.back();
        advance(fixture);
        expect(location.path()).toEqual('/first');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 1}));
      }));

    it(`restores history correctly when component throws error in constructor with urlUpdateStrategy ${urlUpdateStrategy}`, () =>
      fakeAsync(() => {
        createNavigationHistory(urlUpdateStrategy);
        const location = TestBed.inject(Location);
        const router = TestBed.inject(Router);

        router.navigateByUrl('/throwing').catch(() => null);
        advance(fixture);
        expect(location.path()).toEqual('/second');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

        location.back();
        advance(fixture);
        expect(location.path()).toEqual('/first');
        expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 1}));
      }));
  }
});

function createRoot<T>(router: Router, type: Type<T>): ComponentFixture<T> {
  const f = TestBed.createComponent(type);
  advance(f);
  router.initialNavigation();
  advance(f);
  return f;
}

@Component({
  selector: 'simple-cmp',
  template: `simple`,
  standalone: false,
})
class SimpleCmp {}

@NgModule({imports: [RouterModule.forChild([{path: '', component: SimpleCmp}])]})
class ModuleWithSimpleCmpAsRoute {}

@Component({
  selector: 'root-cmp',
  template: `<router-outlet></router-outlet>`,
  standalone: false,
})
class RootCmp {}

@Component({
  selector: 'throwing-cmp',
  template: '',
  standalone: false,
})
class ThrowingCmp {
  constructor() {
    throw new Error('Throwing Cmp');
  }
}

function advance(fixture: ComponentFixture<unknown>, millis?: number): void {
  tick(millis);
  fixture.detectChanges();
}

@NgModule({
  imports: [RouterOutlet, CommonModule],
  providers: [provideLocationMocks()],
  exports: [SimpleCmp, RootCmp, ThrowingCmp],
  declarations: [SimpleCmp, RootCmp, ThrowingCmp],
})
class TestModule {}
