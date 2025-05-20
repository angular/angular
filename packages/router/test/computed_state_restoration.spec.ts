/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Location} from '@angular/common';
import {Component, Injectable, NgModule, Type} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {expect} from '@angular/private/testing/matchers';
import {Router, RouterModule, RouterOutlet, UrlTree, withRouterConfig} from '../index';
import {EMPTY, of} from 'rxjs';

import {provideRouter} from '../src/provide_router';
import {isUrlTree} from '../src/url_tree';
import {timeout} from './helpers';
import {afterNextNavigation} from '../src/utils/navigations';

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

  async function createNavigationHistory(urlUpdateStrategy: 'eager' | 'deferred' = 'deferred') {
    TestBed.configureTestingModule({
      providers: [
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
    fixture = await createRoot(router, RootCmp);
    expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 0}));

    await router.navigateByUrl('/first');
    expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 1}));

    await router.navigateByUrl('/second');
    expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

    await router.navigateByUrl('/third');
    expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 3}));

    location.back();
    await nextNavigation();
    expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));
  }

  describe('deferred url updates', () => {
    beforeEach(async () => {
      await createNavigationHistory();
    });

    it('should work when CanActivate returns false', async () => {
      const location = TestBed.inject(Location);
      const router = TestBed.inject(Router);
      expect(location.path()).toEqual('/second');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

      TestBed.inject(MyCanActivateGuard).allow = false;
      location.back();
      await nextNavigation();
      await timeout(5);
      expect(location.path()).toEqual('/second');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

      TestBed.inject(MyCanActivateGuard).allow = true;
      location.back();
      await nextNavigation();
      expect(location.path()).toEqual('/first');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 1}));

      TestBed.inject(MyCanActivateGuard).allow = false;
      location.forward();
      await nextNavigation();
      await timeout(5);
      expect(location.path()).toEqual('/first');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 1}));

      await router.navigateByUrl('/second');
      expect(location.path()).toEqual('/first');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 1}));
    });

    it('should work when CanDeactivate returns false', async () => {
      const location = TestBed.inject(Location);
      const router = TestBed.inject(Router);

      TestBed.inject(MyCanDeactivateGuard).allow = false;
      location.back();
      await nextNavigation();
      await timeout(5);
      expect(location.path()).toEqual('/second');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

      location.forward();
      await nextNavigation();
      await timeout(5);
      expect(location.path()).toEqual('/second');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

      await router.navigateByUrl('third');
      expect(location.path()).toEqual('/second');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

      TestBed.inject(MyCanDeactivateGuard).allow = true;
      location.forward();
      await nextNavigation();
      expect(location.path()).toEqual('/third');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 3}));
    });

    it('should work when using `NavigationExtras.skipLocationChange`', async () => {
      const location = TestBed.inject(Location);
      const router = TestBed.inject(Router);

      expect(location.path()).toEqual('/second');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

      await router.navigateByUrl('/first', {skipLocationChange: true});
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

      await router.navigateByUrl('/third');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 3}));

      location.back();
      await nextNavigation();
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));
    });

    it('should work when using `NavigationExtras.replaceUrl`', async () => {
      const location = TestBed.inject(Location);
      const router = TestBed.inject(Router);

      expect(location.path()).toEqual('/second');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

      await router.navigateByUrl('/first', {replaceUrl: true});
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));
      expect(location.path()).toEqual('/first');
    });

    it('should work when CanLoad returns false', async () => {
      const location = TestBed.inject(Location);
      const router = TestBed.inject(Router);

      await router.navigateByUrl('/loaded');
      expect(location.path()).toEqual('/second');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));
    });

    it('should work when resolve empty', async () => {
      const location = TestBed.inject(Location);
      const router = TestBed.inject(Router);

      expect(location.path()).toEqual('/second');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

      TestBed.inject(MyResolve).myresolve = EMPTY;

      location.back();
      await nextNavigation();
      await timeout(5);
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));
      expect(location.path()).toEqual('/second');

      TestBed.inject(MyResolve).myresolve = of(2);

      location.back();
      await nextNavigation();
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 1}));
      expect(location.path()).toEqual('/first');

      TestBed.inject(MyResolve).myresolve = EMPTY;

      // We should cancel the navigation to `/third` when myresolve is empty
      await router.navigateByUrl('/third');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 1}));
      expect(location.path()).toEqual('/first');

      location.historyGo(2);
      await nextNavigation();
      await timeout(5);
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 1}));
      expect(location.path()).toEqual('/first');

      TestBed.inject(MyResolve).myresolve = of(2);
      location.historyGo(2);
      await nextNavigation();
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 3}));
      expect(location.path()).toEqual('/third');

      TestBed.inject(MyResolve).myresolve = EMPTY;
      location.historyGo(-2);
      await nextNavigation();
      await timeout(5);
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 3}));
      expect(location.path()).toEqual('/third');
    });

    it('should work when an error occurred during navigation', async () => {
      const location = TestBed.inject(Location);
      const router = TestBed.inject(Router);

      expect(location.path()).toEqual('/second');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

      await router.navigateByUrl('/invalid').catch(() => null);
      expect(location.path()).toEqual('/second');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

      location.back();
      await nextNavigation();
      expect(location.path()).toEqual('/first');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 1}));
    });

    it('should work when CanActivate redirects', async () => {
      const location = TestBed.inject(Location);

      TestBed.inject(MyCanActivateGuard).redirectTo = '/unguarded';
      location.back();
      await nextNavigation();
      expect(location.path()).toEqual('/unguarded');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

      TestBed.inject(MyCanActivateGuard).redirectTo = null;

      location.back();
      await nextNavigation();
      expect(location.path()).toEqual('/first');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 1}));
    });

    it('restores history correctly when component throws error in constructor and replaceUrl=true', async () => {
      const location = TestBed.inject(Location);
      const router = TestBed.inject(Router);

      await router.navigateByUrl('/throwing', {replaceUrl: true}).catch(() => null);
      expect(location.path()).toEqual('/second');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

      location.back();
      await nextNavigation();
      expect(location.path()).toEqual('/first');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 1}));
    });

    it('restores history correctly when component throws error in constructor and skipLocationChange=true', async () => {
      const location = TestBed.inject(Location);
      const router = TestBed.inject(Router);

      await router.navigateByUrl('/throwing', {skipLocationChange: true}).catch(() => null);
      expect(location.path()).toEqual('/second');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

      location.back();
      await nextNavigation();
      expect(location.path()).toEqual('/first');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 1}));
    });
  });

  describe('eager url updates', () => {
    beforeEach(async () => {
      await createNavigationHistory('eager');
    });
    it('should work', async () => {
      const location = TestBed.inject(Location);
      const router = TestBed.inject(Router);
      expect(location.path()).toEqual('/second');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

      TestBed.inject(MyCanActivateGuard).allow = false;
      await router.navigateByUrl('/first');
      await nextNavigation();
      expect(location.path()).toEqual('/second');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

      location.back();
      await nextNavigation();
      expect(location.path()).toEqual('/second');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));
    });
    it('should work when CanActivate redirects', async () => {
      const location = TestBed.inject(Location);
      const router = TestBed.inject(Router);

      TestBed.inject(MyCanActivateGuard).redirectTo = '/unguarded';
      await router.navigateByUrl('/third');
      expect(location.path()).toEqual('/unguarded');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 4}));

      TestBed.inject(MyCanActivateGuard).redirectTo = null;

      location.back();
      await nextNavigation();
      expect(location.path()).toEqual('/third');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 3}));
    });
    it('should work when CanActivate redirects with UrlTree', async () => {
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
      await router.navigateByUrl('/initial');
      expect(location.path()).toEqual('/initial');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 3}));

      TestBed.inject(MyCanActivateGuard).redirectTo = null;

      await router.navigateByUrl('redirectTo');
      expect(location.path()).toEqual('/redirectTo');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 4}));

      // Navigate to different URL but get redirected to same URL should result in same page id
      await router.navigateByUrl('redirectFrom');
      expect(location.path()).toEqual('/redirectTo');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 4}));

      // Back and forward should have page IDs 1 apart
      location.back();
      await nextNavigation();
      expect(location.path()).toEqual('/initial');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 3}));
      location.forward();
      await nextNavigation();
      expect(location.path()).toEqual('/redirectTo');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 4}));

      // Rejected navigation after redirect to same URL should have the same page ID
      allowNavigation = false;
      await router.navigateByUrl('redirectFrom');
      expect(location.path()).toEqual('/redirectTo');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 4}));
    });
    it('redirectTo with same url, and guard reject', async () => {
      const location = TestBed.inject(Location);
      const router = TestBed.inject(Router);

      TestBed.inject(MyCanActivateGuard).redirectTo = router.createUrlTree(['unguarded']);
      await router.navigateByUrl('/third');
      expect(location.path()).toEqual('/unguarded');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 3}));

      TestBed.inject(MyCanActivateGuard).redirectTo = null;

      location.back();
      await nextNavigation();
      expect(location.path()).toEqual('/second');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));
    });
  });

  for (const urlUpdateStrategy of ['deferred', 'eager'] as const) {
    it(`restores history correctly when an error is thrown in guard with urlUpdateStrategy ${urlUpdateStrategy}`, async () => {
      await createNavigationHistory(urlUpdateStrategy);
      const location = TestBed.inject(Location);

      TestBed.inject(ThrowingCanActivateGuard).throw = true;

      location.back();
      await nextNavigation();
      await timeout(5);
      expect(location.path()).toEqual('/second');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

      TestBed.inject(ThrowingCanActivateGuard).throw = false;
      location.back();
      await nextNavigation();
      expect(location.path()).toEqual('/first');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 1}));
    });

    it(`restores history correctly when component throws error in constructor with urlUpdateStrategy ${urlUpdateStrategy}`, async () => {
      await createNavigationHistory(urlUpdateStrategy);
      const location = TestBed.inject(Location);
      const router = TestBed.inject(Router);

      await router.navigateByUrl('/throwing').catch(() => null);
      await timeout(5);
      expect(location.path()).toEqual('/second');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

      location.back();
      await nextNavigation();
      expect(location.path()).toEqual('/first');
      expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 1}));
    });
  }
});

async function createRoot<T>(router: Router, type: Type<T>): Promise<ComponentFixture<T>> {
  const f = TestBed.createComponent(type);
  router.initialNavigation();
  await nextNavigation();
  return f;
}

@Component({
  selector: 'simple-cmp',
  template: `simple`,
})
class SimpleCmp {}

@NgModule({imports: [RouterModule.forChild([{path: '', component: SimpleCmp}])]})
class ModuleWithSimpleCmpAsRoute {}

@Component({
  selector: 'root-cmp',
  template: `<router-outlet></router-outlet>`,
  imports: [RouterOutlet],
})
class RootCmp {}

@Component({
  selector: 'throwing-cmp',
  template: '',
})
class ThrowingCmp {
  constructor() {
    throw new Error('Throwing Cmp');
  }
}

function nextNavigation(): Promise<void> {
  return new Promise<void>((resolve) => {
    afterNextNavigation(TestBed.inject(Router), resolve);
  });
}
