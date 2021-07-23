/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule, Location, LocationStrategy, PlatformLocation} from '@angular/common';
import {SpyLocation} from '@angular/common/testing';
import {Component, EventEmitter, Injectable, NgModule} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {CanActivate, CanDeactivate, Resolve, Router, RouterModule, UrlTree} from '@angular/router';
import {EMPTY, Observable, of, SubscriptionLike} from 'rxjs';

import {isUrlTree} from '../src/utils/type_guards';
import {RouterTestingModule} from '../testing';

describe('`restoredState#ɵrouterPageId`', () => {
  // TODO: Remove RouterSpyLocation after #38884 is submitted.
  class RouterSpyLocation implements Location {
    urlChanges: string[] = [];
    private _history: LocationState[] = [new LocationState('', '', null)];
    private _historyIndex: number = 0;
    /** @internal */
    _subject: EventEmitter<any> = new EventEmitter();
    /** @internal */
    _baseHref: string = '';
    /** @internal */
    _platformStrategy: LocationStrategy = null!;
    /** @internal */
    _platformLocation: PlatformLocation = null!;
    /** @internal */
    _urlChangeListeners: ((url: string, state: unknown) => void)[] = [];
    /** @internal */
    _urlChangeSubscription?: SubscriptionLike;

    setInitialPath(url: string) {
      this._history[this._historyIndex].path = url;
    }

    setBaseHref(url: string) {
      this._baseHref = url;
    }

    path(): string {
      return this._history[this._historyIndex].path;
    }

    getState(): unknown {
      return this._history[this._historyIndex].state;
    }

    isCurrentPathEqualTo(path: string, query: string = ''): boolean {
      const givenPath = path.endsWith('/') ? path.substring(0, path.length - 1) : path;
      const currPath = this.path().endsWith('/') ?
          this.path().substring(0, this.path().length - 1) :
          this.path();

      return currPath == givenPath + (query.length > 0 ? ('?' + query) : '');
    }

    simulateUrlPop(pathname: string) {
      this._subject.emit({'url': pathname, 'pop': true, 'type': 'popstate'});
    }

    simulateHashChange(pathname: string) {
      // Because we don't prevent the native event, the browser will independently update the path
      this.setInitialPath(pathname);
      this.urlChanges.push('hash: ' + pathname);
      this._subject.emit({'url': pathname, 'pop': true, 'type': 'hashchange'});
    }

    prepareExternalUrl(url: string): string {
      if (url.length > 0 && !url.startsWith('/')) {
        url = '/' + url;
      }
      return this._baseHref + url;
    }

    go(path: string, query: string = '', state: any = null) {
      path = this.prepareExternalUrl(path);

      if (this._historyIndex > 0) {
        this._history.splice(this._historyIndex + 1);
      }
      this._history.push(new LocationState(path, query, state));
      this._historyIndex = this._history.length - 1;

      const locationState = this._history[this._historyIndex - 1];
      if (locationState.path == path && locationState.query == query) {
        return;
      }

      const url = path + (query.length > 0 ? ('?' + query) : '');
      this.urlChanges.push(url);
    }

    replaceState(path: string, query: string = '', state: any = null) {
      path = this.prepareExternalUrl(path);

      const history = this._history[this._historyIndex];
      if (history.path == path && history.query == query) {
        return;
      }

      history.path = path;
      history.query = query;
      history.state = state;

      const url = path + (query.length > 0 ? ('?' + query) : '');
      this.urlChanges.push('replace: ' + url);
    }

    forward() {
      if (this._historyIndex < (this._history.length - 1)) {
        this._historyIndex++;
        this._subject.emit(
            {'url': this.path(), 'state': this.getState(), 'pop': true, 'type': 'popstate'});
      }
    }

    back() {
      if (this._historyIndex > 0) {
        this._historyIndex--;
        this._subject.emit(
            {'url': this.path(), 'state': this.getState(), 'pop': true, 'type': 'popstate'});
      }
    }

    historyGo(relativePosition: number = 0): void {
      const nextPageIndex = this._historyIndex + relativePosition;
      if (nextPageIndex >= 0 && nextPageIndex < this._history.length) {
        this._historyIndex = nextPageIndex;
        this._subject.emit(
            {'url': this.path(), 'state': this.getState(), 'pop': true, 'type': 'popstate'});
      }
    }

    onUrlChange(fn: (url: string, state: unknown) => void) {
      this._urlChangeListeners.push(fn);

      if (!this._urlChangeSubscription) {
        this._urlChangeSubscription = this.subscribe(v => {
          this._notifyUrlChangeListeners(v.url, v.state);
        });
      }
    }

    /** @internal */
    _notifyUrlChangeListeners(url: string = '', state: unknown) {
      this._urlChangeListeners.forEach(fn => fn(url, state));
    }

    subscribe(
        onNext: (value: any) => void, onThrow?: ((error: any) => void)|null,
        onReturn?: (() => void)|null): SubscriptionLike {
      return this._subject.subscribe({next: onNext, error: onThrow, complete: onReturn});
    }

    normalize(url: string): string {
      return null!;
    }
  }

  class LocationState {
    constructor(public path: string, public query: string, public state: any) {}
  }

  @Injectable({providedIn: 'root'})
  class MyCanDeactivateGuard implements CanDeactivate<any> {
    allow: boolean = true;
    canDeactivate(): boolean {
      return this.allow;
    }
  }

  @Injectable({providedIn: 'root'})
  class ThrowingCanActivateGuard implements CanActivate {
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
  class MyCanActivateGuard implements CanActivate {
    allow: boolean = true;
    redirectTo: string|null|UrlTree = null;

    constructor(private router: Router) {}

    canActivate(): boolean|UrlTree {
      if (typeof this.redirectTo === 'string') {
        this.router.navigateByUrl(this.redirectTo);
      } else if (isUrlTree(this.redirectTo)) {
        return this.redirectTo;
      }
      return this.allow;
    }
  }
  @Injectable({providedIn: 'root'})
  class MyResolve implements Resolve<Observable<any>> {
    myresolve: Observable<any> = of(2);
    resolve(): Observable<any> {
      return this.myresolve;
    }
  }

  @NgModule(
      {imports: [RouterModule.forChild([{path: '', component: SimpleCmp}])]},
      )
  class LoadedModule {
  }

  let fixture: ComponentFixture<unknown>;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestModule],
      providers: [
        {provide: 'alwaysFalse', useValue: (a: any) => false},
        {provide: Location, useClass: RouterSpyLocation}
      ]
    });
    const router = TestBed.inject(Router);
    (router as any).canceledNavigationResolution = 'computed';
    const location = TestBed.inject(Location);
    fixture = createRoot(router, RootCmp);
    router.resetConfig([
      {
        path: 'first',
        component: SimpleCmp,
        canDeactivate: [MyCanDeactivateGuard],
        canActivate: [MyCanActivateGuard, ThrowingCanActivateGuard],
        resolve: [MyResolve]
      },
      {
        path: 'second',
        component: SimpleCmp,
        canDeactivate: [MyCanDeactivateGuard],
        canActivate: [MyCanActivateGuard, ThrowingCanActivateGuard],
        resolve: [MyResolve]
      },
      {
        path: 'third',
        component: SimpleCmp,
        canDeactivate: [MyCanDeactivateGuard],
        canActivate: [MyCanActivateGuard, ThrowingCanActivateGuard],
        resolve: [MyResolve]
      },
      {
        path: 'unguarded',
        component: SimpleCmp,
      },
      {
        path: 'throwing',
        component: ThrowingCmp,
      },
      {path: 'loaded', loadChildren: () => of(LoadedModule), canLoad: ['alwaysFalse']}
    ]);
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
  }));

  it('should work when CanActivate returns false', fakeAsync(() => {
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


  it('should work when CanDeactivate returns false', fakeAsync(() => {
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

  it('should work when using `NavigationExtras.skipLocationChange`', fakeAsync(() => {
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

  it('should work when using `NavigationExtras.replaceUrl`', fakeAsync(() => {
       const location = TestBed.inject(Location);
       const router = TestBed.inject(Router);

       expect(location.path()).toEqual('/second');
       expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

       router.navigateByUrl('/first', {replaceUrl: true});
       advance(fixture);
       expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));
       expect(location.path()).toEqual('/first');
     }));

  it('should work when CanLoad returns false', fakeAsync(() => {
       const location = TestBed.inject(Location);
       const router = TestBed.inject(Router);

       router.navigateByUrl('/loaded');
       advance(fixture);
       expect(location.path()).toEqual('/second');
       expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));
     }));

  it('should work when resolve empty', fakeAsync(() => {
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


  it('should work when an error occured during navigation', fakeAsync(() => {
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

  it('should work when urlUpdateStrategy="eager"', fakeAsync(() => {
       const location = TestBed.inject(Location) as SpyLocation;
       const router = TestBed.inject(Router);
       expect(location.path()).toEqual('/second');
       expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));
       router.urlUpdateStrategy = 'eager';

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

  it('should work when CanActivate redirects', fakeAsync(() => {
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

  it('should work when CanActivate redirects and urlUpdateStrategy="eager"', fakeAsync(() => {
       const location = TestBed.inject(Location);
       const router = TestBed.inject(Router);
       router.urlUpdateStrategy = 'eager';

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

  it('should work when CanActivate redirects with UrlTree and urlUpdateStrategy="eager"',
     fakeAsync(() => {
       // Note that this test is different from the above case because we are able to specifically
       // handle the `UrlTree` case as a proper redirect and set `replaceUrl: true` on the
       // follow-up navigation.
       const location = TestBed.inject(Location);
       const router = TestBed.inject(Router);
       router.urlUpdateStrategy = 'eager';

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

  for (const urlUpdateSrategy of ['deferred', 'eager'] as const) {
    it(`restores history correctly when an error is thrown in guard with urlUpdateStrategy ${
           urlUpdateSrategy}`,
       fakeAsync(() => {
         const location = TestBed.inject(Location);
         const router = TestBed.inject(Router);
         router.urlUpdateStrategy = urlUpdateSrategy;

         TestBed.inject(ThrowingCanActivateGuard).throw = true;

         expect(() => {
           location.back();
           advance(fixture);
         }).toThrow();
         expect(location.path()).toEqual('/second');
         expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 2}));

         TestBed.inject(ThrowingCanActivateGuard).throw = false;
         location.back();
         advance(fixture);
         expect(location.path()).toEqual('/first');
         expect(location.getState()).toEqual(jasmine.objectContaining({ɵrouterPageId: 1}));
       }));

    it(`restores history correctly when component throws error in constructor with urlUpdateStrategy ${
           urlUpdateSrategy}`,
       fakeAsync(() => {
         const location = TestBed.inject(Location);
         const router = TestBed.inject(Router);
         router.urlUpdateStrategy = urlUpdateSrategy;

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

  it('restores history correctly when component throws error in constructor and replaceUrl=true',
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

  it('restores history correctly when component throws error in constructor and skipLocationChange=true',
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

function createRoot(router: Router, type: any): ComponentFixture<any> {
  const f = TestBed.createComponent(type);
  advance(f);
  router.initialNavigation();
  advance(f);
  return f;
}

@Component({selector: 'simple-cmp', template: `simple`})
class SimpleCmp {
}

@Component({selector: 'root-cmp', template: `<router-outlet></router-outlet>`})
class RootCmp {
}

@Component({selector: 'throwing-cmp', template: ''})
class ThrowingCmp {
  constructor() {
    throw new Error('Throwing Cmp');
  }
}



function advance(fixture: ComponentFixture<any>, millis?: number): void {
  tick(millis);
  fixture.detectChanges();
}

@NgModule({
  imports: [RouterTestingModule, CommonModule],
  exports: [SimpleCmp, RootCmp, ThrowingCmp],
  entryComponents: [SimpleCmp, RootCmp, ThrowingCmp],
  declarations: [SimpleCmp, RootCmp, ThrowingCmp]
})
class TestModule {
}
