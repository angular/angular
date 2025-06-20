/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, inject} from '@angular/core';
import {Location} from '@angular/common';
import {TestBed, fakeAsync, tick} from '@angular/core/testing';
import {
  DefaultUrlSerializer,
  provideRouter,
  withRouterConfig,
  Router,
  GuardsCheckStart,
  NavigationStart,
  RoutesRecognized,
  Navigation,
} from '../../src';
import {of} from 'rxjs';
import {delay, mapTo} from 'rxjs/operators';
import {
  advance,
  TeamCmp,
  RootCmp,
  BlankCmp,
  SimpleCmp,
  AbsoluteSimpleLinkCmp,
  createRoot,
} from './integration_helpers';
import {expect} from '@angular/private/testing/matchers';

export function eagerUrlUpdateStrategyIntegrationSuite() {
  describe('"eager" urlUpdateStrategy', () => {
    @Injectable()
    class AuthGuard {
      canActivateResult = true;

      canActivate() {
        return this.canActivateResult;
      }
    }
    @Injectable()
    class DelayedGuard {
      canActivate() {
        return of('').pipe(delay(1000), mapTo(true));
      }
    }

    beforeEach(() => {
      const serializer = new DefaultUrlSerializer();
      TestBed.configureTestingModule({
        providers: [
          AuthGuard,
          DelayedGuard,
          provideRouter([], withRouterConfig({urlUpdateStrategy: 'eager'})),
        ],
      });
    });

    it('should eagerly update the URL', () =>
      fakeAsync(() => {
        const router = TestBed.inject(Router);
        const location = TestBed.inject(Location);
        const fixture = TestBed.createComponent(RootCmp);
        advance(fixture);

        router.resetConfig([{path: 'team/:id', component: TeamCmp}]);

        router.navigateByUrl('/team/22');
        advance(fixture);
        expect(location.path()).toEqual('/team/22');

        expect(fixture.nativeElement).toHaveText('team 22 [ , right:  ]');

        router.events.subscribe((e) => {
          if (!(e instanceof GuardsCheckStart)) {
            return;
          }
          expect(location.path()).toEqual('/team/33');
          expect(fixture.nativeElement).toHaveText('team 22 [ , right:  ]');
          return of(null);
        });
        router.navigateByUrl('/team/33');

        advance(fixture);
        expect(fixture.nativeElement).toHaveText('team 33 [ , right:  ]');
      }));

    it('should eagerly update the URL', () =>
      fakeAsync(() => {
        const router = TestBed.inject(Router);
        const location = TestBed.inject(Location);
        const fixture = TestBed.createComponent(RootCmp);
        advance(fixture);

        router.resetConfig([
          {
            path: 'team/:id',
            component: SimpleCmp,
            canActivate: [
              () =>
                new Promise((res) => {
                  setTimeout(() => res(new DefaultUrlSerializer().parse('/login')), 1);
                }),
            ],
          },
          {path: 'login', component: AbsoluteSimpleLinkCmp},
        ]);

        router.navigateByUrl('/team/22');
        advance(fixture);
        expect(location.path()).toEqual('/team/22');

        // Redirects to /login
        advance(fixture, 1);
        expect(location.path()).toEqual('/login');

        // Perform the same logic again, and it should produce the same result
        router.navigateByUrl('/team/22');
        advance(fixture);
        expect(location.path()).toEqual('/team/22');

        // Redirects to /login
        advance(fixture, 1);
        expect(location.path()).toEqual('/login');
      }));

    it('should eagerly update URL after redirects are applied', () =>
      fakeAsync(() => {
        const router = TestBed.inject(Router);
        const location = TestBed.inject(Location);
        const fixture = TestBed.createComponent(RootCmp);
        advance(fixture);

        router.resetConfig([{path: 'team/:id', component: TeamCmp}]);

        router.navigateByUrl('/team/22');
        advance(fixture);
        expect(location.path()).toEqual('/team/22');

        expect(fixture.nativeElement).toHaveText('team 22 [ , right:  ]');

        let urlAtNavStart = '';
        let urlAtRoutesRecognized = '';
        router.events.subscribe((e) => {
          if (e instanceof NavigationStart) {
            urlAtNavStart = location.path();
          }
          if (e instanceof RoutesRecognized) {
            urlAtRoutesRecognized = location.path();
          }
        });

        router.navigateByUrl('/team/33');

        advance(fixture);
        expect(urlAtNavStart).toBe('/team/22');
        expect(urlAtRoutesRecognized).toBe('/team/33');
        expect(fixture.nativeElement).toHaveText('team 33 [ , right:  ]');
      }));

    it('should set `state`', () =>
      fakeAsync(() => {
        const router = TestBed.inject(Router);
        const location = TestBed.inject(Location);
        router.resetConfig([
          {path: '', component: SimpleCmp},
          {path: 'simple', component: SimpleCmp},
        ]);

        const fixture = createRoot(router, RootCmp);
        let navigation: Navigation = null!;
        router.events.subscribe((e) => {
          if (e instanceof NavigationStart) {
            navigation = router.getCurrentNavigation()!;
          }
        });

        router.navigateByUrl('/simple', {state: {foo: 'bar'}});
        tick();

        const state = location.getState() as any;
        expect(state).toEqual({foo: 'bar', navigationId: 2});
        expect(navigation.extras.state).toBeDefined();
        expect(navigation.extras.state).toEqual({foo: 'bar'});
      }));

    it('can renavigate to rejected URL', () =>
      fakeAsync(() => {
        const router = TestBed.inject(Router);
        const canActivate = TestBed.inject(AuthGuard);
        const location = TestBed.inject(Location);
        router.resetConfig([
          {path: '', component: BlankCmp},
          {
            path: 'simple',
            component: SimpleCmp,
            canActivate: [() => inject(AuthGuard).canActivate()],
          },
        ]);
        const fixture = createRoot(router, RootCmp);

        // Try to navigate to /simple but guard rejects
        canActivate.canActivateResult = false;
        router.navigateByUrl('/simple');
        advance(fixture);
        expect(location.path()).toEqual('');
        expect(fixture.nativeElement.innerHTML).not.toContain('simple');

        // Renavigate to /simple without guard rejection, should succeed.
        canActivate.canActivateResult = true;
        router.navigateByUrl('/simple');
        advance(fixture);
        expect(location.path()).toEqual('/simple');
        expect(fixture.nativeElement.innerHTML).toContain('simple');
      }));

    it('can renavigate to same URL during in-flight navigation', () =>
      fakeAsync(() => {
        const router = TestBed.inject(Router);
        const location = TestBed.inject(Location);
        router.resetConfig([
          {path: '', component: BlankCmp},
          {
            path: 'simple',
            component: SimpleCmp,
            canActivate: [() => inject(DelayedGuard).canActivate()],
          },
        ]);
        const fixture = createRoot(router, RootCmp);

        // Start navigating to /simple, but do not flush the guard delay
        router.navigateByUrl('/simple');
        tick();
        // eager update strategy so URL is already updated.
        expect(location.path()).toEqual('/simple');
        expect(fixture.nativeElement.innerHTML).not.toContain('simple');

        // Start an additional navigation to /simple and ensure at least one of those succeeds.
        // It's not super important which one gets processed, but in the past, the router would
        // cancel the in-flight one and not process the new one.
        router.navigateByUrl('/simple');
        tick(1000);
        expect(location.path()).toEqual('/simple');
        expect(fixture.nativeElement.innerHTML).toContain('simple');
      }));
  });
}
