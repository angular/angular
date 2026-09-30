/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Location} from '@angular/common';
import {Component, inject, Injectable} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {expect} from '@angular/private/testing/matchers';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  ActivationEnd,
  ActivationStart,
  BaseRouteReuseStrategy,
  ChildActivationEnd,
  ChildActivationStart,
  Event,
  GuardsCheckEnd,
  GuardsCheckStart,
  NavigationCancel,
  NavigationCancellationCode,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  provideRouter,
  RedirectCommand,
  ResolveEnd,
  ResolveStart,
  RouteReuseStrategy,
  Router,
  RouterModule,
  RoutesRecognized,
  withNavigationErrorHandler,
  withRouterConfig,
} from '../../src';
import {RouterTestingHarness} from '../../testing';
import {
  RootCmp,
  BlankCmp,
  UserCmp,
  expectEvents,
  SimpleCmp,
  ThrowingCmp,
  TwoOutletsCmp,
  ConditionalThrowingCmp,
  EmptyQueryParamsCmp,
  createRoot,
  advance,
  simulateLocationChange,
} from './integration_helpers';
import {timeout} from '@angular/private/testing';

export function navigationErrorsIntegrationSuite(browserAPI: 'history' | 'navigation') {
  it('should handle failed navigations gracefully', async () => {
    const router = TestBed.inject(Router);
    const fixture = await createRoot(router, RootCmp);

    router.resetConfig([{path: 'user/:name', component: UserCmp}]);

    const recordedEvents: Event[] = [];
    router.events.forEach((e) => recordedEvents.push(e));

    let e: any;
    router.navigateByUrl('/invalid').catch((_) => (e = _));
    await advance(fixture);
    expect(e.message).toContain('Cannot match any routes');

    router.navigateByUrl('/user/fedor');
    await advance(fixture);

    expect(fixture.nativeElement).toHaveText('user fedor');

    expectEvents(recordedEvents, [
      [NavigationStart, '/invalid'],
      [NavigationError, '/invalid'],

      [NavigationStart, '/user/fedor'],
      [RoutesRecognized, '/user/fedor'],
      [GuardsCheckStart, '/user/fedor'],
      [ChildActivationStart],
      [ActivationStart],
      [GuardsCheckEnd, '/user/fedor'],
      [ResolveStart, '/user/fedor'],
      [ResolveEnd, '/user/fedor'],
      [ActivationEnd],
      [ChildActivationEnd],
      [NavigationEnd, '/user/fedor'],
    ]);
  });

  it('should be able to provide an error handler with DI dependencies', async () => {
    @Injectable({providedIn: 'root'})
    class Handler {
      handlerCalled = false;
    }
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {
              path: 'throw',
              canMatch: [
                () => {
                  throw new Error('');
                },
              ],
              component: BlankCmp,
            },
          ],
          withRouterConfig({resolveNavigationPromiseOnError: true}),
          withNavigationErrorHandler(() => (inject(Handler).handlerCalled = true)),
        ),
      ],
    });
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/throw');
    expect(TestBed.inject(Handler).handlerCalled).toBeTrue();
  });

  it('can redirect from error handler with RouterModule.forRoot', async () => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot(
          [
            {
              path: 'throw',
              canMatch: [
                () => {
                  throw new Error('');
                },
              ],
              component: BlankCmp,
            },
            {path: 'error', component: BlankCmp},
          ],
          {
            resolveNavigationPromiseOnError: true,
            errorHandler: () => new RedirectCommand(inject(Router).parseUrl('/error')),
          },
        ),
      ],
    });
    const router = TestBed.inject(Router);
    let emitNavigationError = false;
    let emitNavigationCancelWithRedirect = false;
    router.events.subscribe((e) => {
      if (e instanceof NavigationError) {
        emitNavigationError = true;
      }
      if (e instanceof NavigationCancel && e.code === NavigationCancellationCode.Redirect) {
        emitNavigationCancelWithRedirect = true;
      }
    });
    await router.navigateByUrl('/throw');
    expect(router.url).toEqual('/error');
    expect(emitNavigationError).toBe(false);
    expect(emitNavigationCancelWithRedirect).toBe(true);
  });

  it('can redirect from error handler', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {
              path: 'throw',
              canMatch: [
                () => {
                  throw new Error('');
                },
              ],
              component: BlankCmp,
            },
            {path: 'error', component: BlankCmp},
          ],
          withRouterConfig({resolveNavigationPromiseOnError: true}),
          withNavigationErrorHandler(() => new RedirectCommand(inject(Router).parseUrl('/error'))),
        ),
      ],
    });
    const router = TestBed.inject(Router);
    let emitNavigationError = false;
    let emitNavigationCancelWithRedirect = false;
    router.events.subscribe((e) => {
      if (e instanceof NavigationError) {
        emitNavigationError = true;
      }
      if (e instanceof NavigationCancel && e.code === NavigationCancellationCode.Redirect) {
        emitNavigationCancelWithRedirect = true;
      }
    });
    await router.navigateByUrl('/throw');
    expect(router.url).toEqual('/error');
    expect(emitNavigationError).toBe(false);
    expect(emitNavigationCancelWithRedirect).toBe(true);
  });

  it('should not break navigation if an error happens in NavigationErrorHandler', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {
              path: 'throw',
              canMatch: [
                () => {
                  throw new Error('');
                },
              ],
              component: BlankCmp,
            },
            {path: '**', component: BlankCmp},
          ],
          withRouterConfig({resolveNavigationPromiseOnError: true}),
          withNavigationErrorHandler(() => {
            throw new Error('e');
          }),
        ),
      ],
    });
    const router = TestBed.inject(Router);
  });

  if (browserAPI === 'history') {
    it('can redirect from error handler after the browser URL update fails', async () => {
      const errors: string[] = [];
      TestBed.configureTestingModule({
        providers: [
          provideRouter(
            [
              {path: 'simple', component: SimpleCmp},
              {path: 'user/:name', component: UserCmp},
              {path: 'user/:name', outlet: 'aux', component: UserCmp},
              {path: 'error', component: SimpleCmp},
            ],
            withRouterConfig({resolveNavigationPromiseOnError: true}),
            withNavigationErrorHandler((e: NavigationError) => {
              errors.push((e.error as Error).message);
              // Bound redirects so a regression fails instead of looping forever.
              return errors.length <= 3
                ? new RedirectCommand(inject(Router).parseUrl('/error'))
                : undefined;
            }),
          ),
        ],
      });
      const router = TestBed.inject(Router);
      const location = TestBed.inject(Location);
      const fixture = TestBed.createComponent(TwoOutletsCmp);
      await router.navigateByUrl('/simple(aux:user/fred)');
      await fixture.whenStable();
      expect(fixture.nativeElement).toHaveText('[ simple, aux: user fred ]');

      const go = location.go.bind(location);
      spyOn(location, 'go').and.callFake((path, query, state) => {
        if (path === '/user/victor') {
          throw new Error('browser URL update failed');
        }
        go(path, query, state);
      });
      await router.navigateByUrl('/user/victor');
      await fixture.whenStable();

      expect(errors).toEqual(['browser URL update failed']);
      expect(router.url).toEqual('/error');
      expect(location.path()).toEqual('/error');
      expect(fixture.nativeElement).toHaveText('[ simple, aux:  ]');
    });
  }

  it('can redirect from error handler after a component fails to be destroyed', async () => {
    let throwOnDestroy = false;
    @Component({template: 'destroy throwing'})
    class DestroyThrowingCmp {
      ngOnDestroy() {
        if (throwOnDestroy) {
          throwOnDestroy = false;
          throw new Error('destroy failed');
        }
      }
    }
    // Only reuses routes that opt in, so the root route is recreated by every navigation and is
    // not activated yet when the previous component is destroyed.
    class OptInReuseStrategy extends BaseRouteReuseStrategy {
      override shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot) {
        return future.routeConfig === curr.routeConfig && future.data['reuse'] === true;
      }
    }
    const errors: string[] = [];
    TestBed.configureTestingModule({
      providers: [
        {provide: RouteReuseStrategy, useClass: OptInReuseStrategy},
        provideRouter(
          [
            {path: 'destroy-throwing', component: DestroyThrowingCmp},
            {path: 'user/:name', component: UserCmp},
            {path: 'error', component: SimpleCmp},
          ],
          withRouterConfig({resolveNavigationPromiseOnError: true}),
          withNavigationErrorHandler((e: NavigationError) => {
            errors.push((e.error as Error).message);
            return errors.length <= 3
              ? new RedirectCommand(inject(Router).parseUrl('/error'))
              : undefined;
          }),
        ),
      ],
    });
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(RootCmp);
    await router.navigateByUrl('/destroy-throwing');
    await fixture.whenStable();

    throwOnDestroy = true;
    await router.navigateByUrl('/user/victor');
    await fixture.whenStable();

    expect(errors).toEqual(['destroy failed']);
    expect(router.url).toEqual('/error');
    expect(fixture.nativeElement).toHaveText('simple');
  });

  it('can redirect from error handler after a component fails to be created next to another outlet', async () => {
    class MissingService {}
    @Component({template: 'missing provider'})
    class MissingProviderCmp {
      readonly service = inject(MissingService);
    }
    // Custom strategies read the snapshots they are given.
    class DataRouteReuseStrategy extends BaseRouteReuseStrategy {
      override shouldDetach(route: ActivatedRouteSnapshot): boolean {
        return route.data['reuse'] === true;
      }
    }
    const errors: string[] = [];
    TestBed.configureTestingModule({
      providers: [
        {provide: RouteReuseStrategy, useClass: DataRouteReuseStrategy},
        provideRouter(
          [
            {path: 'error', component: SimpleCmp},
            {path: 'missing-provider', component: MissingProviderCmp},
            {path: 'blank', outlet: 'aux', component: BlankCmp},
          ],
          withRouterConfig({resolveNavigationPromiseOnError: true}),
          withNavigationErrorHandler((e: NavigationError) => {
            errors.push((e.error as Error).message);
            return errors.length <= 3
              ? new RedirectCommand(inject(Router).parseUrl('/error'))
              : undefined;
          }),
        ),
      ],
    });
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(TwoOutletsCmp);
    await router.navigateByUrl('/error');
    await fixture.whenStable();

    await router.navigateByUrl('/missing-provider(aux:blank)');
    await fixture.whenStable();

    expect(errors.length).toEqual(1);
    expect(errors[0]).toContain('MissingService');
    expect(router.url).toEqual('/error');
    expect(fixture.nativeElement).toHaveText('[ simple, aux:  ]');
  });

  it('can redirect after a malformed query value fails component creation beside a named outlet', async () => {
    @Component({template: 'login {{returnUrl}}'})
    class LoginCmp {
      readonly returnUrl = decodeURIComponent(
        inject(ActivatedRoute).snapshot.queryParamMap.get('returnUrl') ?? '/',
      );
    }
    const errors: Error[] = [];
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {path: 'shell', component: SimpleCmp},
            {path: 'error', component: SimpleCmp},
            {path: 'login', component: LoginCmp},
            {path: 'room/:name', outlet: 'aux', component: UserCmp},
          ],
          withRouterConfig({resolveNavigationPromiseOnError: true}),
          withNavigationErrorHandler((e: NavigationError) => {
            errors.push(e.error as Error);
            // Bound redirects so the regression reports a failure instead of looping forever.
            return errors.length <= 3
              ? new RedirectCommand(inject(Router).parseUrl('/error'))
              : undefined;
          }),
        ),
      ],
    });
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(TwoOutletsCmp);

    await router.navigateByUrl('/login?returnUrl=%2Fapp');
    await fixture.whenStable();
    expect(fixture.nativeElement).toHaveText('[ login /app, aux:  ]');

    await router.navigateByUrl('/login(aux:room/42)?returnUrl=%2Fapp');
    await fixture.whenStable();
    expect(fixture.nativeElement).toHaveText('[ login /app, aux: user 42 ]');

    await router.navigateByUrl('/shell');
    await fixture.whenStable();
    await router.navigateByUrl('/login?returnUrl=%25');
    await fixture.whenStable();
    expect(errors.length).toBe(1);
    expect(errors[0] instanceof URIError).toBeTrue();
    expect(router.url).toBe('/error');
    expect(fixture.nativeElement).toHaveText('[ simple, aux:  ]');

    await router.navigateByUrl('/shell');
    await fixture.whenStable();
    expect(fixture.nativeElement).toHaveText('[ simple, aux:  ]');

    await router.navigateByUrl('/login(aux:room/42)?returnUrl=%25');
    await fixture.whenStable();
    expect(errors.length).toBe(2);
    expect(errors[1] instanceof URIError).toBeTrue();
    expect(router.url).toBe('/error');
    expect(fixture.nativeElement).toHaveText('[ simple, aux:  ]');

    await router.navigateByUrl('/shell');
    await fixture.whenStable();
    expect(fixture.nativeElement).toHaveText('[ simple, aux:  ]');
  });

  // Errors should behave the same for both deferred and eager URL update strategies
  (['deferred', 'eager'] as const).forEach((urlUpdateStrategy) => {
    it(`should dispatch NavigationError after the url has been reset back (${urlUpdateStrategy})`, async () => {
      TestBed.configureTestingModule({
        providers: [provideRouter([], withRouterConfig({urlUpdateStrategy}))],
      });
      const router = TestBed.inject(Router);
      const location = TestBed.inject(Location);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([
        {path: 'simple', component: SimpleCmp},
        {path: 'throwing', component: ThrowingCmp},
      ]);

      router.navigateByUrl('/simple');
      await advance(fixture);

      let routerUrlBeforeEmittingError = '';
      let locationUrlBeforeEmittingError = '';
      router.events.forEach((e) => {
        if (e instanceof NavigationError) {
          routerUrlBeforeEmittingError = router.url;
          locationUrlBeforeEmittingError = location.path();
        }
      });
      router.navigateByUrl('/throwing').catch(() => null);
      await advance(fixture);

      expect(routerUrlBeforeEmittingError).toEqual('/simple');
      expect(locationUrlBeforeEmittingError).toEqual('/simple');
    });

    it(`can renavigate to throwing component (${urlUpdateStrategy})`, async () => {
      TestBed.configureTestingModule({
        providers: [provideRouter([], withRouterConfig({urlUpdateStrategy: 'eager'}))],
      });
      const router = TestBed.inject(Router);
      const location = TestBed.inject(Location);
      router.resetConfig([
        {path: '', component: BlankCmp},
        {path: 'throwing', component: ConditionalThrowingCmp},
      ]);
      const fixture = await createRoot(router, RootCmp);

      // Try navigating to a component which throws an error during activation.
      ConditionalThrowingCmp.throwError = true;
      await expectAsync(router.navigateByUrl('/throwing')).toBeRejected();
      expect(location.path()).toEqual('');
      expect(fixture.nativeElement.innerHTML).not.toContain('throwing');

      // Ensure we can re-navigate to that same URL and succeed.
      ConditionalThrowingCmp.throwError = false;
      router.navigateByUrl('/throwing');
      await advance(fixture);
      expect(location.path()).toEqual('/throwing');
      expect(fixture.nativeElement.innerHTML).toContain('throwing');
    });

    it(`should reset the url with the right state when navigation errors  (${urlUpdateStrategy})`, async () => {
      TestBed.configureTestingModule({
        providers: [provideRouter([], withRouterConfig({urlUpdateStrategy}))],
      });
      const router = TestBed.inject(Router);
      const location = TestBed.inject(Location);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([
        {path: 'simple1', component: SimpleCmp},
        {path: 'simple2', component: SimpleCmp},
        {path: 'throwing', component: ThrowingCmp},
      ]);

      let event: NavigationStart;
      router.events.subscribe((e) => {
        if (e instanceof NavigationStart) {
          event = e;
        }
      });

      router.navigateByUrl('/simple1');
      await advance(fixture);
      const simple1NavStart = event!;

      router.navigateByUrl('/throwing').catch(() => null);
      await advance(fixture);

      router.navigateByUrl('/simple2');
      await advance(fixture);

      location.back();
      await timeout();

      expect(event!.restoredState!.navigationId).toEqual(simple1NavStart.id);
    });

    it(`should not trigger another navigation when resetting the url back due to a NavigationError (${urlUpdateStrategy})`, async () => {
      TestBed.configureTestingModule({
        providers: [provideRouter([], withRouterConfig({urlUpdateStrategy}))],
      });
      const router = TestBed.inject(Router);
      router.onSameUrlNavigation = 'reload';

      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([
        {path: 'simple', component: SimpleCmp},
        {path: 'throwing', component: ThrowingCmp},
      ]);

      const events: any[] = [];
      router.events.forEach((e: any) => {
        if (e instanceof NavigationStart) {
          events.push(e.url);
        }
      });

      router.navigateByUrl('/simple');
      await advance(fixture);

      router.navigateByUrl('/throwing').catch(() => null);
      await advance(fixture);

      // we do not trigger another navigation to /simple
      expect(events).toEqual(['/simple', '/throwing']);
    });
  });

  it('should dispatch NavigationCancel after the url has been reset back', async () => {
    const router = TestBed.inject(Router);
    const location = TestBed.inject(Location);

    const fixture = await createRoot(router, RootCmp);

    router.resetConfig([
      {path: 'simple', component: SimpleCmp},
      {
        path: 'throwing',
        loadChildren: jasmine.createSpy('doesnotmatter'),
        canLoad: [() => false],
      },
    ]);

    router.navigateByUrl('/simple');
    await advance(fixture);

    let routerUrlBeforeEmittingError = '';
    let locationUrlBeforeEmittingError = '';
    router.events.forEach((e) => {
      if (e instanceof NavigationCancel) {
        expect(e.code).toBe(NavigationCancellationCode.GuardRejected);
        routerUrlBeforeEmittingError = router.url;
        locationUrlBeforeEmittingError = location.path();
      }
    });

    simulateLocationChange('/throwing', browserAPI);
    await advance(fixture);

    expect(routerUrlBeforeEmittingError).toEqual('/simple');
    expect(locationUrlBeforeEmittingError).toEqual('/simple');
  });

  it('should recover from malformed uri errors', async () => {
    const router = TestBed.inject(Router);
    const location = TestBed.inject(Location);
    router.resetConfig([{path: 'simple', component: SimpleCmp}]);
    const fixture = await createRoot(router, RootCmp);
    router.navigateByUrl('/invalid/url%with%percent');
    await advance(fixture);
    expect(location.path()).toEqual('');
  });

  it('should not swallow errors', async () => {
    const router = TestBed.inject(Router);
    const fixture = await createRoot(router, RootCmp);

    router.resetConfig([{path: 'simple', component: SimpleCmp}]);

    await expectAsync(router.navigateByUrl('/invalid')).toBeRejected();

    await expectAsync(router.navigateByUrl('/invalid2')).toBeRejected();
  });

  it('should not swallow errors from browser state update', async () => {
    if (browserAPI === 'navigation') {
      // Router interfaces with the browser APIs at different times. We cannot use the same test for this because the events will be different.
      return;
    }
    const routerEvents: Event[] = [];
    TestBed.inject(Router).resetConfig([{path: '**', component: BlankCmp}]);
    TestBed.inject(Router).events.subscribe((e) => {
      routerEvents.push(e);
    });
    spyOn(TestBed.inject(Location), 'go').and.callFake(() => {
      throw new Error();
    });
    try {
      await RouterTestingHarness.create('/abc123');
    } catch {}
    // Ensure the first event is the start and that we get to the ResolveEnd event. If this is not
    // true, then NavigationError may have been triggered at a time we don't expect here.
    expect(routerEvents[0]).toBeInstanceOf(NavigationStart);
    expect(routerEvents[routerEvents.length - 2]).toBeInstanceOf(ResolveEnd);

    expect(routerEvents[routerEvents.length - 1]).toBeInstanceOf(NavigationError);
  });

  it('should throw an error when one of the commands is null/undefined', async () => {
    const router = TestBed.inject(Router);
    await createRoot(router, RootCmp);

    router.resetConfig([{path: 'query', component: EmptyQueryParamsCmp}]);

    expect(() => router.navigate([undefined, 'query'])).toThrowError(
      /The requested path contains undefined segment at index 0/,
    );
  });
}
