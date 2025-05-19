/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {inject, Injectable} from '@angular/core';
import {expect} from '@angular/private/testing/matchers';
import {Location} from '@angular/common';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {
  Router,
  NavigationStart,
  NavigationError,
  RoutesRecognized,
  GuardsCheckStart,
  Event,
  ChildActivationStart,
  ActivationStart,
  GuardsCheckEnd,
  ResolveStart,
  ResolveEnd,
  ActivationEnd,
  ChildActivationEnd,
  NavigationEnd,
  provideRouter,
  withRouterConfig,
  withNavigationErrorHandler,
  RouterModule,
  RedirectCommand,
  NavigationCancel,
  NavigationCancellationCode,
} from '../../src';
import {RouterTestingHarness} from '../../testing';
import {
  createRoot,
  RootCmp,
  BlankCmp,
  UserCmp,
  advance,
  expectEvents,
  SimpleCmp,
  ThrowingCmp,
  ConditionalThrowingCmp,
  EmptyQueryParamsCmp,
} from './integration_helpers';

export function navigationErrorsIntegrationSuite() {
  it('should handle failed navigations gracefully', fakeAsync(() => {
    const router = TestBed.inject(Router);
    const fixture = createRoot(router, RootCmp);

    router.resetConfig([{path: 'user/:name', component: UserCmp}]);

    const recordedEvents: Event[] = [];
    router.events.forEach((e) => recordedEvents.push(e));

    let e: any;
    router.navigateByUrl('/invalid').catch((_) => (e = _));
    advance(fixture);
    expect(e.message).toContain('Cannot match any routes');

    router.navigateByUrl('/user/fedor');
    advance(fixture);

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
  }));

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

  // Errors should behave the same for both deferred and eager URL update strategies
  (['deferred', 'eager'] as const).forEach((urlUpdateStrategy) => {
    it('should dispatch NavigationError after the url has been reset back', fakeAsync(() => {
      TestBed.configureTestingModule({
        providers: [provideRouter([], withRouterConfig({urlUpdateStrategy}))],
      });
      const router = TestBed.inject(Router);
      const location = TestBed.inject(Location);
      const fixture = createRoot(router, RootCmp);

      router.resetConfig([
        {path: 'simple', component: SimpleCmp},
        {path: 'throwing', component: ThrowingCmp},
      ]);

      router.navigateByUrl('/simple');
      advance(fixture);

      let routerUrlBeforeEmittingError = '';
      let locationUrlBeforeEmittingError = '';
      router.events.forEach((e) => {
        if (e instanceof NavigationError) {
          routerUrlBeforeEmittingError = router.url;
          locationUrlBeforeEmittingError = location.path();
        }
      });
      router.navigateByUrl('/throwing').catch(() => null);
      advance(fixture);

      expect(routerUrlBeforeEmittingError).toEqual('/simple');
      expect(locationUrlBeforeEmittingError).toEqual('/simple');
    }));

    it('can renavigate to throwing component', fakeAsync(() => {
      TestBed.configureTestingModule({
        providers: [provideRouter([], withRouterConfig({urlUpdateStrategy: 'eager'}))],
      });
      const router = TestBed.inject(Router);
      const location = TestBed.inject(Location);
      router.resetConfig([
        {path: '', component: BlankCmp},
        {path: 'throwing', component: ConditionalThrowingCmp},
      ]);
      const fixture = createRoot(router, RootCmp);

      // Try navigating to a component which throws an error during activation.
      ConditionalThrowingCmp.throwError = true;
      expect(() => {
        router.navigateByUrl('/throwing');
        advance(fixture);
      }).toThrow();
      expect(location.path()).toEqual('');
      expect(fixture.nativeElement.innerHTML).not.toContain('throwing');

      // Ensure we can re-navigate to that same URL and succeed.
      ConditionalThrowingCmp.throwError = false;
      router.navigateByUrl('/throwing');
      advance(fixture);
      expect(location.path()).toEqual('/throwing');
      expect(fixture.nativeElement.innerHTML).toContain('throwing');
    }));

    it('should reset the url with the right state when navigation errors', fakeAsync(() => {
      TestBed.configureTestingModule({
        providers: [provideRouter([], withRouterConfig({urlUpdateStrategy}))],
      });
      const router = TestBed.inject(Router);
      const location = TestBed.inject(Location);
      const fixture = createRoot(router, RootCmp);

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
      advance(fixture);
      const simple1NavStart = event!;

      router.navigateByUrl('/throwing').catch(() => null);
      advance(fixture);

      router.navigateByUrl('/simple2');
      advance(fixture);

      location.back();
      tick();

      expect(event!.restoredState!.navigationId).toEqual(simple1NavStart.id);
    }));

    it('should not trigger another navigation when resetting the url back due to a NavigationError', fakeAsync(() => {
      TestBed.configureTestingModule({
        providers: [provideRouter([], withRouterConfig({urlUpdateStrategy}))],
      });
      const router = TestBed.inject(Router);
      router.onSameUrlNavigation = 'reload';

      const fixture = createRoot(router, RootCmp);

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
      advance(fixture);

      router.navigateByUrl('/throwing').catch(() => null);
      advance(fixture);

      // we do not trigger another navigation to /simple
      expect(events).toEqual(['/simple', '/throwing']);
    }));
  });

  it('should dispatch NavigationCancel after the url has been reset back', fakeAsync(() => {
    const router = TestBed.inject(Router);
    const location = TestBed.inject(Location);

    const fixture = createRoot(router, RootCmp);

    router.resetConfig([
      {path: 'simple', component: SimpleCmp},
      {
        path: 'throwing',
        loadChildren: jasmine.createSpy('doesnotmatter'),
        canLoad: [() => false],
      },
    ]);

    router.navigateByUrl('/simple');
    advance(fixture);

    let routerUrlBeforeEmittingError = '';
    let locationUrlBeforeEmittingError = '';
    router.events.forEach((e) => {
      if (e instanceof NavigationCancel) {
        expect(e.code).toBe(NavigationCancellationCode.GuardRejected);
        routerUrlBeforeEmittingError = router.url;
        locationUrlBeforeEmittingError = location.path();
      }
    });

    location.go('/throwing');
    location.historyGo(0);
    advance(fixture);

    expect(routerUrlBeforeEmittingError).toEqual('/simple');
    expect(locationUrlBeforeEmittingError).toEqual('/simple');
  }));

  it('should recover from malformed uri errors', fakeAsync(() => {
    const router = TestBed.inject(Router);
    const location = TestBed.inject(Location);
    router.resetConfig([{path: 'simple', component: SimpleCmp}]);
    const fixture = createRoot(router, RootCmp);
    router.navigateByUrl('/invalid/url%with%percent');
    advance(fixture);
    expect(location.path()).toEqual('');
  }));

  it('should not swallow errors', fakeAsync(() => {
    const router = TestBed.inject(Router);
    const fixture = createRoot(router, RootCmp);

    router.resetConfig([{path: 'simple', component: SimpleCmp}]);

    router.navigateByUrl('/invalid');
    expect(() => advance(fixture)).toThrow();

    router.navigateByUrl('/invalid2');
    expect(() => advance(fixture)).toThrow();
  }));

  it('should not swallow errors from browser state update', async () => {
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

  it('should throw an error when one of the commands is null/undefined', fakeAsync(() => {
    const router = TestBed.inject(Router);
    createRoot(router, RootCmp);

    router.resetConfig([{path: 'query', component: EmptyQueryParamsCmp}]);

    expect(() => router.navigate([undefined, 'query'])).toThrowError(
      /The requested path contains undefined segment at index 0/,
    );
  }));
}
