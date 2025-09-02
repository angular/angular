/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {LocationStrategy, HashLocationStrategy, Location} from '@angular/common';
import {
  Injectable,
  DestroyRef,
  inject,
  Component,
  NgModule,
  InjectionToken,
  EnvironmentInjector,
} from '@angular/core';
import {TestBed, ComponentFixture} from '@angular/core/testing';
import {Subject, Observable, of, concat, EMPTY} from 'rxjs';
import {tap, mapTo, first, takeWhile, last, switchMap} from 'rxjs/operators';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Event,
  Router,
  NavigationStart,
  RoutesRecognized,
  GuardsCheckStart,
  ChildActivationStart,
  ActivationStart,
  GuardsCheckEnd,
  NavigationCancel,
  ResolveStart,
  ResolveEnd,
  ActivationEnd,
  ChildActivationEnd,
  NavigationEnd,
  provideRouter,
  withRouterConfig,
  RedirectCommand,
  RunGuardsAndResolvers,
  Data,
  RouterModule,
  NavigationCancellationCode,
  RouteConfigLoadStart,
  RouteConfigLoadEnd,
  UrlTree,
  CanMatchFn,
  CanActivateFn,
  CanActivateChildFn,
  CanDeactivateFn,
} from '../../src';
import {wrapIntoObservable} from '../../src/utils/collection';
import {RouterTestingHarness} from '../../testing';
import {expect} from '@angular/private/testing/matchers';
import {
  TeamCmp,
  RootCmp,
  BlankCmp,
  expectEvents,
  RouteCmp,
  RootCmpWithTwoOutlets,
  WrapperCmp,
  ThrowingCmp,
  SimpleCmp,
  TwoOutletsCmp,
  UserCmp,
  ModuleWithBlankCmpAsRoute,
  createRoot,
  advance,
} from './integration_helpers';
import {timeout} from '../helpers';

export function guardsIntegrationSuite() {
  describe('guards', () => {
    describe('CanActivate', () => {
      describe('guard completes before emitting a value', () => {
        @Injectable({providedIn: 'root'})
        class CompletesBeforeEmitting {
          private subject$ = new Subject<boolean>();

          constructor(destroyRef: DestroyRef) {
            destroyRef.onDestroy(() => this.subject$.complete());
          }

          // Note that this is a simple illustrative case of when an observable
          // completes without emitting a value. In a real-world scenario, this
          // might represent an HTTP request that never emits before the app is
          // destroyed and then completes when the app is destroyed.
          canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
            return this.subject$;
          }
        }

        it('should not thrown an unhandled promise rejection', async () => {
          const router = TestBed.inject(Router);
          const fixture = await createRoot(router, RootCmp);

          const onUnhandledrejection = jasmine.createSpy();
          window.addEventListener('unhandledrejection', onUnhandledrejection);

          router.resetConfig([
            {path: 'team/:id', component: TeamCmp, canActivate: [CompletesBeforeEmitting]},
          ]);

          router.navigateByUrl('/team/22');

          // This was previously throwing an error `NG0205: Injector has already been destroyed`.
          fixture.destroy();

          // Wait until the event task is dispatched.
          await new Promise((resolve) => setTimeout(resolve, 10));
          window.removeEventListener('unhandledrejection', onUnhandledrejection);

          expect(onUnhandledrejection).not.toHaveBeenCalled();
        });
      });

      describe('should not activate a route when CanActivate returns false', () => {
        it('works', async () => {
          const router = TestBed.inject(Router);
          const location = TestBed.inject(Location);
          const fixture = await createRoot(router, RootCmp);

          const recordedEvents: Event[] = [];
          router.events.forEach((e) => recordedEvents.push(e));

          router.resetConfig([{path: 'team/:id', component: TeamCmp, canActivate: [() => false]}]);

          router.navigateByUrl('/team/22');
          await advance(fixture);

          expect(location.path()).toEqual('');
          expectEvents(recordedEvents, [
            [NavigationStart, '/team/22'],
            [RoutesRecognized, '/team/22'],
            [GuardsCheckStart, '/team/22'],
            [ChildActivationStart],
            [ActivationStart],
            [GuardsCheckEnd, '/team/22'],
            [NavigationCancel, '/team/22'],
          ]);
          expect((recordedEvents[5] as GuardsCheckEnd).shouldActivate).toBe(false);
        });
      });

      describe('should not activate a route when CanActivate returns false (componentless route)', () => {
        it('works', async () => {
          const router = TestBed.inject(Router);
          const location = TestBed.inject(Location);
          const fixture = await createRoot(router, RootCmp);

          router.resetConfig([
            {
              path: 'parent',
              canActivate: [() => false],
              children: [{path: 'team/:id', component: TeamCmp}],
            },
          ]);

          router.navigateByUrl('parent/team/22');
          await advance(fixture);

          expect(location.path()).toEqual('');
        });
      });

      describe('should activate a route when CanActivate returns true', () => {
        it('works', async () => {
          const router = TestBed.inject(Router);
          const location = TestBed.inject(Location);
          const fixture = await createRoot(router, RootCmp);

          router.resetConfig([{path: 'team/:id', component: TeamCmp, canActivate: [() => true]}]);

          router.navigateByUrl('/team/22');
          await advance(fixture);
          expect(location.path()).toEqual('/team/22');
        });
      });

      describe('should work when given a class', () => {
        class AlwaysTrue {
          canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
            return true;
          }
        }

        beforeEach(() => {
          TestBed.configureTestingModule({providers: [AlwaysTrue]});
        });

        it('works', async () => {
          const router = TestBed.inject(Router);
          const location = TestBed.inject(Location);
          const fixture = await createRoot(router, RootCmp);

          router.resetConfig([{path: 'team/:id', component: TeamCmp, canActivate: [AlwaysTrue]}]);

          router.navigateByUrl('/team/22');
          await advance(fixture);

          expect(location.path()).toEqual('/team/22');
        });
      });

      describe('should work when returns an observable', () => {
        it('works', async () => {
          const router = TestBed.inject(Router);
          const location = TestBed.inject(Location);
          const fixture = await createRoot(router, RootCmp);

          router.resetConfig([
            {
              path: 'team/:id',
              component: TeamCmp,
              canActivate: [
                () =>
                  new Observable<boolean>((observer) => {
                    observer.next(false);
                  }),
              ],
            },
          ]);

          router.navigateByUrl('/team/22');
          await advance(fixture);
          expect(location.path()).toEqual('');
        });
      });

      describe('should work when returns a promise', () => {
        it('works', async () => {
          const router = TestBed.inject(Router);
          const location = TestBed.inject(Location);
          const fixture = await createRoot(router, RootCmp);

          router.resetConfig([
            {
              path: 'team/:id',
              component: TeamCmp,
              canActivate: [
                (a) => {
                  if (a.params['id'] === '22') {
                    return Promise.resolve(true);
                  } else {
                    return Promise.resolve(false);
                  }
                },
              ],
            },
          ]);

          router.navigateByUrl('/team/22');
          await advance(fixture);
          expect(location.path()).toEqual('/team/22');

          router.navigateByUrl('/team/33');
          await advance(fixture);
          expect(location.path()).toEqual('/team/22');
        });
      });

      describe('should reset the location when cancelling a navigation', () => {
        beforeEach(() => {
          TestBed.configureTestingModule({
            providers: [{provide: LocationStrategy, useClass: HashLocationStrategy}],
          });
        });

        it('works', async () => {
          const router = TestBed.inject(Router);
          const location = TestBed.inject(Location);
          const fixture = await createRoot(router, RootCmp);

          router.resetConfig([
            {path: 'one', component: SimpleCmp},
            {path: 'two', component: SimpleCmp, canActivate: [() => false]},
          ]);

          router.navigateByUrl('/one');
          await advance(fixture);
          expect(location.path()).toEqual('/one');

          location.go('/two');
          location.historyGo(0);
          await advance(fixture);
          expect(location.path()).toEqual('/one');
        });
      });

      describe('should redirect to / when guard returns false', () => {
        it('works', async () => {
          const router = TestBed.inject(Router);
          const location = TestBed.inject(Location);
          router.resetConfig([
            {
              path: '',
              component: SimpleCmp,
            },
            {
              path: 'one',
              component: RouteCmp,
              canActivate: [
                () => {
                  inject(Router).navigate(['/']);
                  return false;
                },
              ],
            },
          ]);

          const fixture = TestBed.createComponent(RootCmp);
          router.navigateByUrl('/one');
          await advance(fixture);
          expect(location.path()).toEqual('');
          expect(fixture.nativeElement).toHaveText('simple');
        });
      });

      describe('should redirect when guard returns UrlTree', () => {
        it('works', async () => {
          const router = TestBed.inject(Router);
          const location = TestBed.inject(Location);
          const recordedEvents: Event[] = [];
          let cancelEvent: NavigationCancel = null!;
          router.events.forEach((e) => {
            recordedEvents.push(e);
            if (e instanceof NavigationCancel) cancelEvent = e;
          });
          router.resetConfig([
            {path: '', component: SimpleCmp},
            {
              path: 'one',
              component: RouteCmp,
              canActivate: [() => inject(Router).parseUrl('/redirected')],
            },
            {path: 'redirected', component: SimpleCmp},
          ]);

          const fixture = TestBed.createComponent(RootCmp);
          router.navigateByUrl('/one');

          await advance(fixture);

          expect(location.path()).toEqual('/redirected');
          expect(fixture.nativeElement).toHaveText('simple');
          expect(cancelEvent && cancelEvent.reason).toBe(
            'NavigationCancelingError: Redirecting to "/redirected"',
          );
          expectEvents(recordedEvents, [
            [NavigationStart, '/one'],
            [RoutesRecognized, '/one'],
            [GuardsCheckStart, '/one'],
            [ChildActivationStart, undefined],
            [ActivationStart, undefined],
            [NavigationCancel, '/one'],
            [NavigationStart, '/redirected'],
            [RoutesRecognized, '/redirected'],
            [GuardsCheckStart, '/redirected'],
            [ChildActivationStart, undefined],
            [ActivationStart, undefined],
            [GuardsCheckEnd, '/redirected'],
            [ResolveStart, '/redirected'],
            [ResolveEnd, '/redirected'],
            [ActivationEnd, undefined],
            [ChildActivationEnd, undefined],
            [NavigationEnd, '/redirected'],
          ]);
        });

        it('works with root url', async () => {
          const router = TestBed.inject(Router);
          const location = TestBed.inject(Location);
          const recordedEvents: Event[] = [];
          let cancelEvent: NavigationCancel = null!;
          router.events.forEach((e: any) => {
            recordedEvents.push(e);
            if (e instanceof NavigationCancel) cancelEvent = e;
          });
          router.resetConfig([
            {path: '', component: SimpleCmp},
            {
              path: 'one',
              component: RouteCmp,
              canActivate: [() => inject(Router).parseUrl('/')],
            },
          ]);

          const fixture = TestBed.createComponent(RootCmp);
          router.navigateByUrl('/one');

          await advance(fixture);

          expect(location.path()).toEqual('');
          expect(fixture.nativeElement).toHaveText('simple');
          expect(cancelEvent && cancelEvent.reason).toBe(
            'NavigationCancelingError: Redirecting to "/"',
          );
          expectEvents(recordedEvents, [
            [NavigationStart, '/one'],
            [RoutesRecognized, '/one'],
            [GuardsCheckStart, '/one'],
            [ChildActivationStart, undefined],
            [ActivationStart, undefined],
            [NavigationCancel, '/one'],
            [NavigationStart, '/'],
            [RoutesRecognized, '/'],
            [GuardsCheckStart, '/'],
            [ChildActivationStart, undefined],
            [ActivationStart, undefined],
            [GuardsCheckEnd, '/'],
            [ResolveStart, '/'],
            [ResolveEnd, '/'],
            [ActivationEnd, undefined],
            [ChildActivationEnd, undefined],
            [NavigationEnd, '/'],
          ]);
        });

        it('replaces URL when URL is updated eagerly so back button can still work', async () => {
          TestBed.configureTestingModule({
            providers: [provideRouter([], withRouterConfig({urlUpdateStrategy: 'eager'}))],
          });
          const router = TestBed.inject(Router);
          const location = TestBed.inject(Location);
          router.resetConfig([
            {path: '', component: SimpleCmp},
            {
              path: 'one',
              component: RouteCmp,
              canActivate: [() => inject(Router).parseUrl('/redirected')],
            },
            {path: 'redirected', component: SimpleCmp},
          ]);
          await createRoot(router, RootCmp);
          router.navigateByUrl('/one');
          const urlChanges: string[] = [];
          location.onUrlChange((change) => {
            urlChanges.push(change);
          });

          await timeout();

          expect(location.path()).toEqual('/redirected');
          expect(urlChanges).toEqual(['/one', '/redirected']);
          location.back();
          await timeout();
          expect(location.path()).toEqual('');
        });

        it('should resolve navigateByUrl promise after redirect finishes', async () => {
          TestBed.configureTestingModule({
            providers: [provideRouter([], withRouterConfig({urlUpdateStrategy: 'eager'}))],
          });
          const router = TestBed.inject(Router);
          const location = TestBed.inject(Location);
          let resolvedPath = '';
          router.resetConfig([
            {path: '', component: SimpleCmp},
            {
              path: 'one',
              component: RouteCmp,
              canActivate: [() => inject(Router).parseUrl('/redirected')],
            },
            {path: 'redirected', component: SimpleCmp},
          ]);
          const fixture = await createRoot(router, RootCmp);
          router.navigateByUrl('/one').then((v) => {
            resolvedPath = location.path();
          });

          await timeout();
          expect(resolvedPath).toBe('/redirected');
        });

        it('can redirect to 404 without changing the URL', async () => {
          TestBed.configureTestingModule({
            providers: [provideRouter([], withRouterConfig({urlUpdateStrategy: 'eager'}))],
          });
          const router = TestBed.inject(Router);
          const location = TestBed.inject(Location);
          router.resetConfig([
            {path: '', component: SimpleCmp},
            {
              path: 'one',
              component: RouteCmp,
              canActivate: [
                () => new RedirectCommand(router.parseUrl('/404'), {skipLocationChange: true}),
              ],
            },
            {path: '404', component: SimpleCmp},
          ]);
          const fixture = await createRoot(router, RootCmp);
          router.navigateByUrl('/one');

          await advance(fixture);

          expect(location.path()).toEqual('/one');
          expect(router.url.toString()).toEqual('/404');
        });

        it('can redirect while changing state object', async () => {
          TestBed.configureTestingModule({
            providers: [provideRouter([], withRouterConfig({urlUpdateStrategy: 'eager'}))],
          });
          const router = TestBed.inject(Router);
          const location = TestBed.inject(Location);
          router.resetConfig([
            {path: '', component: SimpleCmp},
            {
              path: 'one',
              component: RouteCmp,
              canActivate: [
                () => new RedirectCommand(router.parseUrl('/redirected'), {state: {test: 1}}),
              ],
            },
            {path: 'redirected', component: SimpleCmp},
          ]);
          const fixture = await createRoot(router, RootCmp);
          router.navigateByUrl('/one');

          await advance(fixture);

          expect(location.path()).toEqual('/redirected');
          expect(location.getState()).toEqual(jasmine.objectContaining({test: 1}));
        });
      });

      it('can redirect to 404 without changing the URL', async () => {
        TestBed.configureTestingModule({
          providers: [
            provideRouter([
              {
                path: 'one',
                component: RouteCmp,
                canActivate: [
                  () => {
                    const router = inject(Router);
                    router.navigateByUrl('/404', {
                      browserUrl: router.getCurrentNavigation()?.finalUrl,
                    });
                    return false;
                  },
                ],
              },
              {path: '404', component: SimpleCmp},
            ]),
          ],
        });
        const location = TestBed.inject(Location);
        await RouterTestingHarness.create('/one');

        expect(location.path()).toEqual('/one');
        expect(TestBed.inject(Router).url.toString()).toEqual('/404');
      });

      it('can navigate to same internal route with different browser url', async () => {
        TestBed.configureTestingModule({
          providers: [provideRouter([{path: 'one', component: RouteCmp}])],
        });
        const location = TestBed.inject(Location);
        const router = TestBed.inject(Router);
        await RouterTestingHarness.create('/one');
        await router.navigateByUrl('/one', {browserUrl: '/two'});

        expect(location.path()).toEqual('/two');
        expect(router.url.toString()).toEqual('/one');
      });

      it('retains browserUrl through UrlTree redirects', async () => {
        TestBed.configureTestingModule({
          providers: [
            provideRouter([
              {
                path: 'one',
                component: RouteCmp,
                canActivate: [() => inject(Router).parseUrl('/404')],
              },
              {path: '404', component: SimpleCmp},
            ]),
          ],
        });
        const router = TestBed.inject(Router);
        const location = TestBed.inject(Location);
        await RouterTestingHarness.create();
        await router.navigateByUrl('/one', {browserUrl: router.parseUrl('abc123')});

        expect(location.path()).toEqual('/abc123');
        expect(TestBed.inject(Router).url.toString()).toEqual('/404');
      });

      describe('runGuardsAndResolvers', () => {
        let guardRunCount = 0;
        let resolverRunCount = 0;

        beforeEach(() => {
          guardRunCount = 0;
          resolverRunCount = 0;
          TestBed.configureTestingModule({
            providers: [{provide: 'resolver', useValue: () => resolverRunCount++}],
          });
        });

        async function configureRouter(
          router: Router,
          runGuardsAndResolvers: RunGuardsAndResolvers,
        ): Promise<ComponentFixture<RootCmpWithTwoOutlets>> {
          const fixture = await createRoot(router, RootCmpWithTwoOutlets);

          router.resetConfig([
            {
              path: 'a',
              runGuardsAndResolvers,
              component: RouteCmp,
              canActivate: [
                () => {
                  guardRunCount++;
                  return true;
                },
              ],
              resolve: {data: 'resolver'},
            },
            {path: 'b', component: SimpleCmp, outlet: 'right'},
            {
              path: 'c/:param',
              runGuardsAndResolvers,
              component: RouteCmp,
              canActivate: [
                () => {
                  guardRunCount++;
                  return true;
                },
              ],
              resolve: {data: 'resolver'},
            },
            {
              path: 'd/:param',
              component: WrapperCmp,
              runGuardsAndResolvers,
              children: [
                {
                  path: 'e/:param',
                  component: SimpleCmp,
                  canActivate: [
                    () => {
                      guardRunCount++;
                      return true;
                    },
                  ],
                  resolve: {data: 'resolver'},
                },
              ],
            },
            {
              path: 'throwing',
              runGuardsAndResolvers,
              component: ThrowingCmp,
              canActivate: [
                () => {
                  guardRunCount++;
                  return true;
                },
              ],
              resolve: {data: 'resolver'},
            },
          ]);

          router.navigateByUrl('/a');
          await advance(fixture);
          return fixture;
        }

        it('should rerun guards and resolvers when params change', async () => {
          const router = TestBed.inject(Router);
          const fixture = await configureRouter(router, 'paramsChange');

          const cmp: RouteCmp = fixture.debugElement.children[1].componentInstance;
          const recordedData: Data[] = [];
          cmp.route.data.subscribe((data) => recordedData.push(data));

          expect(guardRunCount).toEqual(1);
          expect(recordedData).toEqual([{data: 0}]);

          router.navigateByUrl('/a;p=1');
          await advance(fixture);
          expect(guardRunCount).toEqual(2);
          expect(recordedData).toEqual([{data: 0}, {data: 1}]);

          router.navigateByUrl('/a;p=2');
          await advance(fixture);
          expect(guardRunCount).toEqual(3);
          expect(recordedData).toEqual([{data: 0}, {data: 1}, {data: 2}]);

          router.navigateByUrl('/a;p=2?q=1');
          await advance(fixture);
          expect(guardRunCount).toEqual(3);
          expect(recordedData).toEqual([{data: 0}, {data: 1}, {data: 2}]);
        });

        it('should rerun guards and resolvers when query params change', async () => {
          const router = TestBed.inject(Router);
          const fixture = await configureRouter(router, 'paramsOrQueryParamsChange');

          const cmp: RouteCmp = fixture.debugElement.children[1].componentInstance;
          const recordedData: Data[] = [];
          cmp.route.data.subscribe((data) => recordedData.push(data));

          expect(guardRunCount).toEqual(1);
          expect(recordedData).toEqual([{data: 0}]);

          router.navigateByUrl('/a;p=1');
          await advance(fixture);
          expect(guardRunCount).toEqual(2);
          expect(recordedData).toEqual([{data: 0}, {data: 1}]);

          router.navigateByUrl('/a;p=2');
          await advance(fixture);
          expect(guardRunCount).toEqual(3);
          expect(recordedData).toEqual([{data: 0}, {data: 1}, {data: 2}]);

          router.navigateByUrl('/a;p=2?q=1');
          await advance(fixture);
          expect(guardRunCount).toEqual(4);
          expect(recordedData).toEqual([{data: 0}, {data: 1}, {data: 2}, {data: 3}]);

          router.navigateByUrl('/a;p=2(right:b)?q=1');
          await advance(fixture);
          expect(guardRunCount).toEqual(4);
          expect(recordedData).toEqual([{data: 0}, {data: 1}, {data: 2}, {data: 3}]);
        });

        it('should always rerun guards and resolvers', async () => {
          const router = TestBed.inject(Router);
          const fixture = await configureRouter(router, 'always');

          const cmp: RouteCmp = fixture.debugElement.children[1].componentInstance;
          const recordedData: Data[] = [];
          cmp.route.data.subscribe((data) => recordedData.push(data));

          expect(guardRunCount).toEqual(1);
          expect(recordedData).toEqual([{data: 0}]);

          router.navigateByUrl('/a;p=1');
          await advance(fixture);
          expect(guardRunCount).toEqual(2);
          expect(recordedData).toEqual([{data: 0}, {data: 1}]);

          router.navigateByUrl('/a;p=2');
          await advance(fixture);
          expect(guardRunCount).toEqual(3);
          expect(recordedData).toEqual([{data: 0}, {data: 1}, {data: 2}]);

          router.navigateByUrl('/a;p=2?q=1');
          await advance(fixture);
          expect(guardRunCount).toEqual(4);
          expect(recordedData).toEqual([{data: 0}, {data: 1}, {data: 2}, {data: 3}]);

          router.navigateByUrl('/a;p=2(right:b)?q=1');
          await advance(fixture);
          expect(guardRunCount).toEqual(5);
          expect(recordedData).toEqual([{data: 0}, {data: 1}, {data: 2}, {data: 3}, {data: 4}]);

          // Issue #39030, always running guards and resolvers should not throw
          // when navigating away from a component with a throwing constructor.
          await expectAsync(
            (async () => {
              router.navigateByUrl('/throwing').catch(() => {});
              await advance(fixture);
              router.navigateByUrl('/a;p=1');
              await advance(fixture);
            })(),
          ).not.toBeRejected();
        });

        it('should rerun rerun guards and resolvers when path params change', async () => {
          const router = TestBed.inject(Router);
          const fixture = await configureRouter(router, 'pathParamsChange');

          const cmp: RouteCmp = fixture.debugElement.children[1].componentInstance;
          const recordedData: Data[] = [];
          cmp.route.data.subscribe((data) => recordedData.push(data));

          // First navigation has already run
          expect(guardRunCount).toEqual(1);
          expect(recordedData).toEqual([{data: 0}]);

          // Changing any optional params will not result in running guards or resolvers
          router.navigateByUrl('/a;p=1');
          await advance(fixture);
          expect(guardRunCount).toEqual(1);
          expect(recordedData).toEqual([{data: 0}]);

          router.navigateByUrl('/a;p=2');
          await advance(fixture);
          expect(guardRunCount).toEqual(1);
          expect(recordedData).toEqual([{data: 0}]);

          router.navigateByUrl('/a;p=2?q=1');
          await advance(fixture);
          expect(guardRunCount).toEqual(1);
          expect(recordedData).toEqual([{data: 0}]);

          router.navigateByUrl('/a;p=2(right:b)?q=1');
          await advance(fixture);
          expect(guardRunCount).toEqual(1);
          expect(recordedData).toEqual([{data: 0}]);

          // Change to new route with path param should run guards and resolvers
          router.navigateByUrl('/c/paramValue');
          await advance(fixture);

          expect(guardRunCount).toEqual(2);

          // Modifying a path param should run guards and resolvers
          router.navigateByUrl('/c/paramValueChanged');
          await advance(fixture);
          expect(guardRunCount).toEqual(3);

          // Adding optional params should not cause guards/resolvers to run
          router.navigateByUrl('/c/paramValueChanged;p=1?q=2');
          await advance(fixture);
          expect(guardRunCount).toEqual(3);
        });

        it('should rerun when a parent segment changes', async () => {
          const router = TestBed.inject(Router);
          const fixture = await configureRouter(router, 'pathParamsChange');

          const cmp: RouteCmp = fixture.debugElement.children[1].componentInstance;

          // Land on an initial page
          router.navigateByUrl('/d/1;dd=11/e/2;dd=22');
          await advance(fixture);

          expect(guardRunCount).toEqual(2);

          // Changes cause re-run on the config with the guard
          router.navigateByUrl('/d/1;dd=11/e/3;ee=22');
          await advance(fixture);

          expect(guardRunCount).toEqual(3);

          // Changes to the parent also cause re-run
          router.navigateByUrl('/d/2;dd=11/e/3;ee=22');
          await advance(fixture);

          expect(guardRunCount).toEqual(4);
        });

        it('should rerun rerun guards and resolvers when path or query params change', async () => {
          const router = TestBed.inject(Router);
          const fixture = await configureRouter(router, 'pathParamsOrQueryParamsChange');

          const cmp: RouteCmp = fixture.debugElement.children[1].componentInstance;
          const recordedData: Data[] = [];
          cmp.route.data.subscribe((data) => recordedData.push(data));

          // First navigation has already run
          expect(guardRunCount).toEqual(1);
          expect(recordedData).toEqual([{data: 0}]);

          // Changing matrix params will not result in running guards or resolvers
          router.navigateByUrl('/a;p=1');
          await advance(fixture);
          expect(guardRunCount).toEqual(1);
          expect(recordedData).toEqual([{data: 0}]);

          router.navigateByUrl('/a;p=2');
          await advance(fixture);
          expect(guardRunCount).toEqual(1);
          expect(recordedData).toEqual([{data: 0}]);

          // Adding query params will re-run guards/resolvers
          router.navigateByUrl('/a;p=2?q=1');
          await advance(fixture);
          expect(guardRunCount).toEqual(2);
          expect(recordedData).toEqual([{data: 0}, {data: 1}]);

          // Changing query params will re-run guards/resolvers
          router.navigateByUrl('/a;p=2?q=2');
          await advance(fixture);
          expect(guardRunCount).toEqual(3);
          expect(recordedData).toEqual([{data: 0}, {data: 1}, {data: 2}]);
        });

        it('should allow a predicate function to determine when to run guards and resolvers', async () => {
          const router = TestBed.inject(Router);
          const fixture = await configureRouter(router, (from, to) => to.paramMap.get('p') === '2');

          const cmp: RouteCmp = fixture.debugElement.children[1].componentInstance;
          const recordedData: Data[] = [];
          cmp.route.data.subscribe((data) => recordedData.push(data));

          // First navigation has already run
          expect(guardRunCount).toEqual(1);
          expect(recordedData).toEqual([{data: 0}]);

          // Adding `p` param shouldn't cause re-run
          router.navigateByUrl('/a;p=1');
          await advance(fixture);
          expect(guardRunCount).toEqual(1);
          expect(recordedData).toEqual([{data: 0}]);

          // Re-run should trigger on p=2
          router.navigateByUrl('/a;p=2');
          await advance(fixture);
          expect(guardRunCount).toEqual(2);
          expect(recordedData).toEqual([{data: 0}, {data: 1}]);

          // Any other changes don't pass the predicate
          router.navigateByUrl('/a;p=3?q=1');
          await advance(fixture);
          expect(guardRunCount).toEqual(2);
          expect(recordedData).toEqual([{data: 0}, {data: 1}]);

          // Changing query params will re-run guards/resolvers
          router.navigateByUrl('/a;p=3?q=2');
          await advance(fixture);
          expect(guardRunCount).toEqual(2);
          expect(recordedData).toEqual([{data: 0}, {data: 1}]);
        });
      });

      describe('should wait for parent to complete', () => {
        let log: string[];

        beforeEach(() => {
          log = [];
        });

        function delayPromise(delay: number): Promise<boolean> {
          let resolve: (val: boolean) => void;
          const promise = new Promise<boolean>((res) => (resolve = res));
          setTimeout(() => resolve(true), delay);
          return promise;
        }

        it('works', async () => {
          const router = TestBed.inject(Router);
          const fixture = await createRoot(router, RootCmp);

          router.resetConfig([
            {
              path: 'parent',
              canActivate: [
                () =>
                  delayPromise(10).then(() => {
                    log.push('parent');
                    return true;
                  }),
              ],
              children: [
                {
                  path: 'child',
                  component: SimpleCmp,
                  canActivate: [
                    () => {
                      return delayPromise(5).then(() => {
                        log.push('child');
                        return true;
                      });
                    },
                  ],
                },
              ],
            },
          ]);

          await router.navigateByUrl('/parent/child');
          expect(log).toEqual(['parent', 'child']);
        });
      });
    });

    describe('CanDeactivate', () => {
      let log: any;
      const recordingDeactivate: CanDeactivateFn<any> = (c, a) => {
        log.push({path: a.routeConfig!.path, component: c});
        return true;
      };

      beforeEach(() => {
        log = [];
      });

      describe('should not deactivate a route when CanDeactivate returns false', () => {
        it('works', async () => {
          const router: Router = TestBed.inject(Router);
          const location: Location = TestBed.inject(Location);
          const fixture = await createRoot(router, RootCmp);

          router.resetConfig([
            {
              path: 'team/:id',
              component: TeamCmp,
              canDeactivate: [
                (c, a) => {
                  return a.params['id'] === '22';
                },
              ],
            },
          ]);

          router.navigateByUrl('/team/22');
          await advance(fixture);
          expect(location.path()).toEqual('/team/22');

          let successStatus: boolean = false;
          router.navigateByUrl('/team/33')!.then((res) => (successStatus = res));
          await advance(fixture);
          expect(location.path()).toEqual('/team/33');
          expect(successStatus).toEqual(true);

          let canceledStatus: boolean = false;
          router.navigateByUrl('/team/44')!.then((res) => (canceledStatus = res));
          await advance(fixture);
          expect(location.path()).toEqual('/team/33');
          expect(canceledStatus).toEqual(false);
        });

        it('works with componentless routes', async () => {
          const router: Router = TestBed.inject(Router);
          const location: Location = TestBed.inject(Location);
          const fixture = await createRoot(router, RootCmp);

          router.resetConfig([
            {
              path: 'grandparent',
              canDeactivate: [recordingDeactivate],
              children: [
                {
                  path: 'parent',
                  canDeactivate: [recordingDeactivate],
                  children: [
                    {
                      path: 'child',
                      canDeactivate: [recordingDeactivate],
                      children: [
                        {
                          path: 'simple',
                          component: SimpleCmp,
                          canDeactivate: [recordingDeactivate],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {path: 'simple', component: SimpleCmp},
          ]);

          router.navigateByUrl('/grandparent/parent/child/simple');
          await advance(fixture);
          expect(location.path()).toEqual('/grandparent/parent/child/simple');

          router.navigateByUrl('/simple');
          await advance(fixture);

          const child = fixture.debugElement.children[1].componentInstance;

          expect(log.map((a: any) => a.path)).toEqual(['simple', 'child', 'parent', 'grandparent']);
          expect(log[0].component instanceof SimpleCmp).toBeTruthy();
          [1, 2, 3].forEach((i) => expect(log[i].component).toBeNull());
          expect(child instanceof SimpleCmp).toBeTruthy();
          expect(child).not.toBe(log[0].component);
        });

        it('works with aux routes', async () => {
          const router: Router = TestBed.inject(Router);
          const location: Location = TestBed.inject(Location);
          const fixture = await createRoot(router, RootCmp);

          router.resetConfig([
            {
              path: 'two-outlets',
              component: TwoOutletsCmp,
              children: [
                {path: 'a', component: BlankCmp},
                {
                  path: 'b',
                  canDeactivate: [recordingDeactivate],
                  component: SimpleCmp,
                  outlet: 'aux',
                },
              ],
            },
          ]);

          router.navigateByUrl('/two-outlets/(a//aux:b)');
          await advance(fixture);
          expect(location.path()).toEqual('/two-outlets/(a//aux:b)');

          router.navigate(['two-outlets', {outlets: {aux: null}}]);
          await advance(fixture);

          expect(log.map((a: any) => a.path)).toEqual(['b']);
          expect(location.path()).toEqual('/two-outlets/a');
        });

        it('works with a nested route', async () => {
          const router: Router = TestBed.inject(Router);
          const location: Location = TestBed.inject(Location);
          const fixture = await createRoot(router, RootCmp);

          router.resetConfig([
            {
              path: 'team/:id',
              component: TeamCmp,
              children: [
                {path: '', pathMatch: 'full', component: SimpleCmp},
                {
                  path: 'user/:name',
                  component: UserCmp,
                  canDeactivate: [
                    (c: any, a: ActivatedRouteSnapshot, b: RouterStateSnapshot) => {
                      return a.params['name'] === 'victor';
                    },
                  ],
                },
              ],
            },
          ]);

          router.navigateByUrl('/team/22/user/victor');
          await advance(fixture);

          // this works because we can deactivate victor
          router.navigateByUrl('/team/33');
          await advance(fixture);
          expect(location.path()).toEqual('/team/33');

          router.navigateByUrl('/team/33/user/fedor');
          await advance(fixture);

          // this doesn't work cause we cannot deactivate fedor
          router.navigateByUrl('/team/44');
          await advance(fixture);
          expect(location.path()).toEqual('/team/33/user/fedor');
        });
      });

      it('should use correct component to deactivate forChild route', async () => {
        const router: Router = TestBed.inject(Router);
        @Component({
          selector: 'admin',
          template: '',
          standalone: false,
        })
        class AdminComponent {}

        @NgModule({
          declarations: [AdminComponent],
          imports: [
            RouterModule.forChild([
              {
                path: '',
                component: AdminComponent,
                canDeactivate: [recordingDeactivate],
              },
            ]),
          ],
        })
        class LazyLoadedModule {}

        const fixture = await createRoot(router, RootCmp);

        router.resetConfig([
          {
            path: 'a',
            component: WrapperCmp,
            children: [{path: '', pathMatch: 'full', loadChildren: () => LazyLoadedModule}],
          },
          {path: 'b', component: SimpleCmp},
        ]);

        router.navigateByUrl('/a');
        await advance(fixture);
        router.navigateByUrl('/b');
        await advance(fixture);

        expect(log[0].component).toBeInstanceOf(AdminComponent);
      });

      it('should not create a route state if navigation is canceled', async () => {
        const router: Router = TestBed.inject(Router);
        const location: Location = TestBed.inject(Location);
        const fixture = await createRoot(router, RootCmp);

        router.resetConfig([
          {
            path: 'main',
            component: TeamCmp,
            children: [
              {path: 'component1', component: SimpleCmp, canDeactivate: [() => false]},
              {path: 'component2', component: SimpleCmp},
            ],
          },
        ]);

        router.navigateByUrl('/main/component1');
        await advance(fixture);

        router.navigateByUrl('/main/component2');
        await advance(fixture);

        const teamCmp = fixture.debugElement.children[1].componentInstance;
        expect(teamCmp.route.firstChild.url.value[0].path).toEqual('component1');
        expect(location.path()).toEqual('/main/component1');
      });

      it('should not run CanActivate when CanDeactivate returns false', async () => {
        const router: Router = TestBed.inject(Router);
        const location: Location = TestBed.inject(Location);
        const fixture = await createRoot(router, RootCmp);

        router.resetConfig([
          {
            path: 'main',
            component: TeamCmp,
            children: [
              {
                path: 'component1',
                component: SimpleCmp,
                canDeactivate: [
                  () => {
                    log.push('called');
                    let resolve: (result: boolean) => void;
                    const promise = new Promise((res) => (resolve = res));
                    setTimeout(() => resolve(false), 0);
                    return promise;
                  },
                ],
              },
              {
                path: 'component2',
                component: SimpleCmp,
                canActivate: [
                  () => {
                    log.push('canActivate called');
                    return true;
                  },
                ],
              },
            ],
          },
        ]);

        router.navigateByUrl('/main/component1');
        await advance(fixture);
        expect(location.path()).toEqual('/main/component1');

        router.navigateByUrl('/main/component2');
        await advance(fixture);
        expect(location.path()).toEqual('/main/component1');
        expect(log).toEqual(['called']);
      });

      it('should call guards every time when navigating to the same url over and over again', async () => {
        const router: Router = TestBed.inject(Router);
        const location: Location = TestBed.inject(Location);
        const fixture = await createRoot(router, RootCmp);

        router.resetConfig([
          {
            path: 'simple',
            component: SimpleCmp,
            canDeactivate: [
              () => {
                log.push('called');
                return false;
              },
            ],
          },
          {path: 'blank', component: BlankCmp},
        ]);

        router.navigateByUrl('/simple');
        await advance(fixture);

        router.navigateByUrl('/blank');
        await advance(fixture);
        expect(log).toEqual(['called']);
        expect(location.path()).toEqual('/simple');

        router.navigateByUrl('/blank');
        await advance(fixture);
        expect(log).toEqual(['called', 'called']);
        expect(location.path()).toEqual('/simple');
      });

      describe('next state', () => {
        let log: string[];

        class ClassWithNextState {
          canDeactivate(
            component: TeamCmp,
            currentRoute: ActivatedRouteSnapshot,
            currentState: RouterStateSnapshot,
            nextState: RouterStateSnapshot,
          ): boolean {
            log.push(currentState.url, nextState.url);
            return true;
          }
        }

        beforeEach(() => {
          log = [];
          TestBed.configureTestingModule({
            providers: [ClassWithNextState],
          });
        });

        it('should pass next state as the 4 argument when guard is a class', async () => {
          const router: Router = TestBed.inject(Router);
          const location: Location = TestBed.inject(Location);
          const fixture = await createRoot(router, RootCmp);

          router.resetConfig([
            {
              path: 'team/:id',
              component: TeamCmp,
              canDeactivate: [
                (
                  component: TeamCmp,
                  currentRoute: ActivatedRouteSnapshot,
                  currentState: RouterStateSnapshot,
                  nextState: RouterStateSnapshot,
                ) =>
                  inject(ClassWithNextState).canDeactivate(
                    component,
                    currentRoute,
                    currentState,
                    nextState,
                  ),
              ],
            },
          ]);

          router.navigateByUrl('/team/22');
          await advance(fixture);
          expect(location.path()).toEqual('/team/22');

          router.navigateByUrl('/team/33');
          await advance(fixture);
          expect(location.path()).toEqual('/team/33');
          expect(log).toEqual(['/team/22', '/team/33']);
        });

        it('should pass next state as the 4 argument when guard is a function', async () => {
          const router: Router = TestBed.inject(Router);
          const location: Location = TestBed.inject(Location);
          const fixture = await createRoot(router, RootCmp);

          router.resetConfig([
            {
              path: 'team/:id',
              component: TeamCmp,
              canDeactivate: [
                (cmp, currentRoute, currentState, nextState) => {
                  log.push(currentState.url, nextState.url);
                  return true;
                },
              ],
            },
          ]);

          router.navigateByUrl('/team/22');
          await advance(fixture);
          expect(location.path()).toEqual('/team/22');

          router.navigateByUrl('/team/33');
          await advance(fixture);
          expect(location.path()).toEqual('/team/33');
          expect(log).toEqual(['/team/22', '/team/33']);
        });
      });

      describe('should work when given a class', () => {
        class AlwaysTrue {
          canDeactivate(): boolean {
            return true;
          }
        }

        beforeEach(() => {
          TestBed.configureTestingModule({providers: [AlwaysTrue]});
        });

        it('works', async () => {
          const router: Router = TestBed.inject(Router);
          const location: Location = TestBed.inject(Location);
          const fixture = await createRoot(router, RootCmp);

          router.resetConfig([
            {
              path: 'team/:id',
              component: TeamCmp,
              canDeactivate: [() => inject(AlwaysTrue).canDeactivate()],
            },
          ]);

          router.navigateByUrl('/team/22');
          await advance(fixture);
          expect(location.path()).toEqual('/team/22');

          router.navigateByUrl('/team/33');
          await advance(fixture);
          expect(location.path()).toEqual('/team/33');
        });
      });

      describe('should work when returns an observable', () => {
        it('works', async () => {
          const router: Router = TestBed.inject(Router);
          const location: Location = TestBed.inject(Location);
          const fixture = await createRoot(router, RootCmp);

          router.resetConfig([
            {
              path: 'team/:id',
              component: TeamCmp,
              canDeactivate: [
                () => {
                  return new Observable<boolean>((observer) => {
                    observer.next(false);
                  });
                },
              ],
            },
          ]);

          router.navigateByUrl('/team/22');
          await advance(fixture);
          expect(location.path()).toEqual('/team/22');

          router.navigateByUrl('/team/33');
          await advance(fixture);
          expect(location.path()).toEqual('/team/22');
        });
      });
    });

    describe('CanActivateChild', () => {
      describe('should be invoked when activating a child', () => {
        it('works', async () => {
          const router: Router = TestBed.inject(Router);
          const location: Location = TestBed.inject(Location);
          const fixture = await createRoot(router, RootCmp);

          router.resetConfig([
            {
              path: '',
              canActivateChild: [(a: any) => a.paramMap.get('id') === '22'],
              children: [{path: 'team/:id', component: TeamCmp}],
            },
          ]);

          router.navigateByUrl('/team/22');
          await advance(fixture);

          expect(location.path()).toEqual('/team/22');

          router.navigateByUrl('/team/33')!.catch(() => {});
          await advance(fixture);

          expect(location.path()).toEqual('/team/22');
        });
      });

      it('should find the guard provided in lazy loaded module', async () => {
        const router: Router = TestBed.inject(Router);
        const location: Location = TestBed.inject(Location);
        @Component({
          selector: 'admin',
          template: '<router-outlet></router-outlet>',
          standalone: false,
        })
        class AdminComponent {}

        @Component({
          selector: 'lazy',
          template: 'lazy-loaded',
          standalone: false,
        })
        class LazyLoadedComponent {}

        @NgModule({
          declarations: [AdminComponent, LazyLoadedComponent],
          imports: [
            RouterModule.forChild([
              {
                path: '',
                component: AdminComponent,
                children: [
                  {
                    path: '',
                    canActivateChild: [() => true],
                    children: [{path: '', component: LazyLoadedComponent}],
                  },
                ],
              },
            ]),
          ],
        })
        class LazyLoadedModule {}

        const fixture = await createRoot(router, RootCmp);

        router.resetConfig([{path: 'admin', loadChildren: () => LazyLoadedModule}]);

        router.navigateByUrl('/admin');
        await advance(fixture);

        expect(location.path()).toEqual('/admin');
        expect(fixture.nativeElement).toHaveText('lazy-loaded');
      });
    });

    describe('CanLoad', () => {
      let canLoadRunCount = 0;
      beforeEach(() => {
        canLoadRunCount = 0;
        TestBed.configureTestingModule({
          providers: [
            {
              provide: () => true,
              useValue: () => {
                canLoadRunCount++;
                return true;
              },
            },
          ],
        });
      });

      it('should not load children when CanLoad returns false', async () => {
        const router = TestBed.inject(Router);
        const location = TestBed.inject(Location);

        @Component({
          selector: 'lazy',
          template: 'lazy-loaded',
          standalone: false,
        })
        class LazyLoadedComponent {}

        @NgModule({
          declarations: [LazyLoadedComponent],
          imports: [RouterModule.forChild([{path: 'loaded', component: LazyLoadedComponent}])],
        })
        class LoadedModule {}

        const fixture = await createRoot(router, RootCmp);

        router.resetConfig([
          {path: 'lazyFalse', canLoad: [() => false], loadChildren: () => LoadedModule},
          {path: 'lazyTrue', canLoad: [() => true], loadChildren: () => LoadedModule},
        ]);

        const recordedEvents: Event[] = [];
        router.events.forEach((e) => recordedEvents.push(e));

        // failed navigation
        router.navigateByUrl('/lazyFalse/loaded');
        await advance(fixture);

        expect(location.path()).toEqual('');

        expectEvents(recordedEvents, [
          [NavigationStart, '/lazyFalse/loaded'],
          //  [GuardsCheckStart, '/lazyFalse/loaded'],
          [NavigationCancel, '/lazyFalse/loaded'],
        ]);

        expect((recordedEvents[1] as NavigationCancel).code).toBe(
          NavigationCancellationCode.GuardRejected,
        );

        recordedEvents.splice(0);

        // successful navigation
        router.navigateByUrl('/lazyTrue/loaded');
        await advance(fixture);

        expect(location.path()).toEqual('/lazyTrue/loaded');

        expectEvents(recordedEvents, [
          [NavigationStart, '/lazyTrue/loaded'],
          [RouteConfigLoadStart],
          [RouteConfigLoadEnd],
          [RoutesRecognized, '/lazyTrue/loaded'],
          [GuardsCheckStart, '/lazyTrue/loaded'],
          [ChildActivationStart],
          [ActivationStart],
          [ChildActivationStart],
          [ActivationStart],
          [GuardsCheckEnd, '/lazyTrue/loaded'],
          [ResolveStart, '/lazyTrue/loaded'],
          [ResolveEnd, '/lazyTrue/loaded'],
          [ActivationEnd],
          [ChildActivationEnd],
          [ActivationEnd],
          [ChildActivationEnd],
          [NavigationEnd, '/lazyTrue/loaded'],
        ]);
      });

      it('should support navigating from within the guard', async () => {
        const router = TestBed.inject(Router);
        const location = TestBed.inject(Location);
        const fixture = await createRoot(router, RootCmp);

        router.resetConfig([
          {
            path: 'lazyFalse',
            canLoad: [
              () => {
                router.navigate(['blank']);
                return false;
              },
            ],
            loadChildren: jasmine.createSpy('lazyFalse'),
          },
          {path: 'blank', component: BlankCmp},
        ]);

        const recordedEvents: Event[] = [];
        router.events.forEach((e) => recordedEvents.push(e));

        router.navigateByUrl('/lazyFalse/loaded');
        await advance(fixture);

        expect(location.path()).toEqual('/blank');

        expectEvents(recordedEvents, [
          [NavigationStart, '/lazyFalse/loaded'],
          // No GuardCheck events as `canLoad` is a special guard that's not actually part of
          // the guard lifecycle.
          [NavigationCancel, '/lazyFalse/loaded'],

          [NavigationStart, '/blank'],
          [RoutesRecognized, '/blank'],
          [GuardsCheckStart, '/blank'],
          [ChildActivationStart],
          [ActivationStart],
          [GuardsCheckEnd, '/blank'],
          [ResolveStart, '/blank'],
          [ResolveEnd, '/blank'],
          [ActivationEnd],
          [ChildActivationEnd],
          [NavigationEnd, '/blank'],
        ]);

        expect((recordedEvents[1] as NavigationCancel).code).toBe(
          NavigationCancellationCode.SupersededByNewNavigation,
        );
      });

      it('should support returning UrlTree from within the guard', async () => {
        const router = TestBed.inject(Router);
        const location = TestBed.inject(Location);
        const fixture = await createRoot(router, RootCmp);

        router.resetConfig([
          {
            path: 'lazyFalse',
            canLoad: [() => inject(Router).createUrlTree(['blank'])],
            loadChildren: jasmine.createSpy('lazyFalse'),
          },
          {path: 'blank', component: BlankCmp},
        ]);

        const recordedEvents: Event[] = [];
        router.events.forEach((e) => recordedEvents.push(e));

        router.navigateByUrl('/lazyFalse/loaded');
        await advance(fixture);

        expect(location.path()).toEqual('/blank');

        expectEvents(recordedEvents, [
          [NavigationStart, '/lazyFalse/loaded'],
          // No GuardCheck events as `canLoad` is a special guard that's not actually part of
          // the guard lifecycle.
          [NavigationCancel, '/lazyFalse/loaded'],

          [NavigationStart, '/blank'],
          [RoutesRecognized, '/blank'],
          [GuardsCheckStart, '/blank'],
          [ChildActivationStart],
          [ActivationStart],
          [GuardsCheckEnd, '/blank'],
          [ResolveStart, '/blank'],
          [ResolveEnd, '/blank'],
          [ActivationEnd],
          [ChildActivationEnd],
          [NavigationEnd, '/blank'],
        ]);

        expect((recordedEvents[1] as NavigationCancel).code).toBe(
          NavigationCancellationCode.Redirect,
        );
      });

      // Regression where navigateByUrl with false CanLoad no longer resolved `false` value on
      // navigateByUrl promise: https://github.com/angular/angular/issues/26284
      it('should resolve navigateByUrl promise after CanLoad executes', async () => {
        const router = TestBed.inject(Router);

        @Component({
          selector: 'lazy',
          template: 'lazy-loaded',
          standalone: false,
        })
        class LazyLoadedComponent {}

        @NgModule({
          declarations: [LazyLoadedComponent],
          imports: [RouterModule.forChild([{path: 'loaded', component: LazyLoadedComponent}])],
        })
        class LazyLoadedModule {}

        const fixture = await createRoot(router, RootCmp);

        router.resetConfig([
          {path: 'lazy-false', canLoad: [() => false], loadChildren: () => LazyLoadedModule},
          {path: 'lazy-true', canLoad: [() => true], loadChildren: () => LazyLoadedModule},
        ]);

        let navFalseResult = true;
        let navTrueResult = false;
        router.navigateByUrl('/lazy-false').then((v) => {
          navFalseResult = v;
        });
        await advance(fixture);
        router.navigateByUrl('/lazy-true').then((v) => {
          navTrueResult = v;
        });
        await advance(fixture);

        expect(navFalseResult).toBe(false);
        expect(navTrueResult).toBe(true);
      });

      it('should execute CanLoad only once', async () => {
        const router = TestBed.inject(Router);
        const location = TestBed.inject(Location);
        @Component({
          selector: 'lazy',
          template: 'lazy-loaded',
          standalone: false,
        })
        class LazyLoadedComponent {}

        @NgModule({
          declarations: [LazyLoadedComponent],
          imports: [RouterModule.forChild([{path: 'loaded', component: LazyLoadedComponent}])],
        })
        class LazyLoadedModule {}

        const fixture = await createRoot(router, RootCmp);

        router.resetConfig([
          {
            path: 'lazy',
            canLoad: [
              () => {
                canLoadRunCount++;
                return true;
              },
            ],
            loadChildren: () => LazyLoadedModule,
          },
        ]);

        router.navigateByUrl('/lazy/loaded');
        await advance(fixture);
        expect(location.path()).toEqual('/lazy/loaded');
        expect(canLoadRunCount).toEqual(1);

        router.navigateByUrl('/');
        await advance(fixture);
        expect(location.path()).toEqual('');

        router.navigateByUrl('/lazy/loaded');
        await advance(fixture);
        expect(location.path()).toEqual('/lazy/loaded');
        expect(canLoadRunCount).toEqual(1);
      });

      it('cancels guard execution when a new navigation happens', async () => {
        @Injectable({providedIn: 'root'})
        class DelayedGuard {
          static delayedExecutions = 0;
          static canLoadCalls = 0;
          canLoad() {
            DelayedGuard.canLoadCalls++;
            return of(true).pipe(
              switchMap((v) => new Promise((r) => setTimeout(r, 10)).then(() => v)),
              tap(() => {
                DelayedGuard.delayedExecutions++;
              }),
            );
          }
        }
        const router = TestBed.inject(Router);
        router.resetConfig([
          {path: 'a', canLoad: [DelayedGuard], loadChildren: () => [], component: SimpleCmp},
          {path: 'team/:id', component: TeamCmp},
        ]);
        const fixture = await createRoot(router, RootCmp);

        router.navigateByUrl('/a');
        await timeout(1);
        // The delayed guard should have started
        expect(DelayedGuard.canLoadCalls).toEqual(1);
        await router.navigateByUrl('/team/1');
        expect(fixture.nativeElement.innerHTML).toContain('team');
        // The delayed guard should not execute the delayed condition because a new navigation
        // cancels the current one and unsubscribes from intermediate results.
        expect(DelayedGuard.delayedExecutions).toEqual(0);
      });
    });

    describe('should run CanLoad guards concurrently', () => {
      function delayObservable(delayMs: number): Observable<boolean> {
        return of(delayMs).pipe(
          switchMap((v) => new Promise((r) => setTimeout(r, delayMs)).then(() => v)),
          mapTo(true),
        );
      }

      let log: string[];
      const guard1 = () => {
        return delayObservable(15).pipe(tap({next: () => log.push('guard1')}));
      };
      const guard2 = () => {
        return delayObservable(0).pipe(tap({next: () => log.push('guard2')}));
      };
      const returnFalseAndNavigate = () => {
        log.push('returnFalseAndNavigate');
        inject(Router).navigateByUrl('/redirected');
        return false;
      };
      const returnUrlTree = () => {
        const router = inject(Router);
        return delayObservable(30).pipe(
          mapTo(router.parseUrl('/redirected')),
          tap({next: () => log.push('returnUrlTree')}),
        );
      };

      beforeEach(() => {
        log = [];
      });

      it('should only execute canLoad guards of routes being activated', async () => {
        const router = TestBed.inject(Router);

        router.resetConfig([
          {
            path: 'lazy',
            canLoad: [guard1],
            loadChildren: () => of(ModuleWithBlankCmpAsRoute),
          },
          {path: 'redirected', component: SimpleCmp},
          // canLoad should not run for this route because 'lazy' activates first
          {
            path: '',
            canLoad: [returnFalseAndNavigate],
            loadChildren: () => of(ModuleWithBlankCmpAsRoute),
          },
        ]);

        await router.navigateByUrl('/lazy');
        expect(log.length).toEqual(1);
        expect(log).toEqual(['guard1']);
      });

      it('should execute canLoad guards', async () => {
        const router = TestBed.inject(Router);

        router.resetConfig([
          {
            path: 'lazy',
            canLoad: [guard1, guard2],
            loadChildren: () => ModuleWithBlankCmpAsRoute,
          },
        ]);

        await router.navigateByUrl('/lazy');

        expect(log.length).toEqual(2);
        expect(log).toEqual(['guard2', 'guard1']);
      });

      it('should redirect with UrlTree if higher priority guards have resolved', async () => {
        const router = TestBed.inject(Router);
        const location = TestBed.inject(Location);

        router.resetConfig([
          {
            path: 'lazy',
            canLoad: [returnUrlTree, guard1, guard2],
            loadChildren: () => ModuleWithBlankCmpAsRoute,
          },
          {path: 'redirected', component: SimpleCmp},
        ]);

        await router.navigateByUrl('/lazy');

        expect(log.length).toEqual(3);
        expect(log).toEqual(['guard2', 'guard1', 'returnUrlTree']);
        expect(location.path()).toEqual('/redirected');
      });

      it('should redirect with UrlTree if UrlTree is lower priority', async () => {
        const router = TestBed.inject(Router);
        const location = TestBed.inject(Location);

        router.resetConfig([
          {
            path: 'lazy',
            canLoad: [guard1, returnUrlTree],
            loadChildren: () => ModuleWithBlankCmpAsRoute,
          },
          {path: 'redirected', component: SimpleCmp},
        ]);

        await router.navigateByUrl('/lazy');

        expect(log.length).toEqual(2);
        expect(log).toEqual(['guard1', 'returnUrlTree']);
        expect(location.path()).toEqual('/redirected');
      });
    });

    describe('order', () => {
      class Logger {
        logs: string[] = [];
        add(thing: string) {
          this.logs.push(thing);
        }
      }
      beforeEach(() => {
        TestBed.configureTestingModule({
          providers: [Logger],
        });
      });

      it('should call guards in the right order', async () => {
        const router = TestBed.inject(Router);
        const logger = TestBed.inject(Logger);
        const fixture = await createRoot(router, RootCmp);

        router.resetConfig([
          {
            path: '',
            canActivateChild: [() => (logger.add('canActivateChild_parent'), true)],
            children: [
              {
                path: 'team/:id',
                canActivate: [() => (logger.add('canActivate_team'), true)],
                canDeactivate: [() => (logger.add('canDeactivate_team'), true)],
                component: TeamCmp,
              },
            ],
          },
        ]);

        router.navigateByUrl('/team/22');
        await advance(fixture);

        router.navigateByUrl('/team/33');
        await advance(fixture);

        expect(logger.logs).toEqual([
          'canActivateChild_parent',
          'canActivate_team',

          'canDeactivate_team',
          'canActivateChild_parent',
          'canActivate_team',
        ]);
      });

      it('should call deactivate guards from bottom to top', async () => {
        const router = TestBed.inject(Router);
        const logger = TestBed.inject(Logger);
        const fixture = await createRoot(router, RootCmp);

        router.resetConfig([
          {
            path: '',
            children: [
              {
                path: 'team/:id',
                canDeactivate: [() => (logger.add('canDeactivate_team'), true)],
                children: [
                  {
                    path: '',
                    component: SimpleCmp,
                    canDeactivate: [() => (logger.add('canDeactivate_simple'), true)],
                  },
                ],
                component: TeamCmp,
              },
            ],
          },
        ]);

        router.navigateByUrl('/team/22');
        await advance(fixture);

        router.navigateByUrl('/team/33');
        await advance(fixture);

        expect(logger.logs).toEqual(['canDeactivate_simple', 'canDeactivate_team']);
      });
    });

    describe('canMatch', () => {
      @Injectable({providedIn: 'root'})
      class ConfigurableGuard {
        result: Promise<boolean | UrlTree> | Observable<boolean | UrlTree> | boolean | UrlTree =
          false;
        canMatch() {
          return this.result;
        }
      }

      it('falls back to second route when canMatch returns false', async () => {
        const router = TestBed.inject(Router);
        router.resetConfig([
          {
            path: 'a',
            canMatch: [() => inject(ConfigurableGuard).canMatch()],
            component: BlankCmp,
          },
          {path: 'a', component: SimpleCmp},
        ]);
        const fixture = await createRoot(router, RootCmp);

        router.navigateByUrl('/a');
        await advance(fixture);
        expect(fixture.nativeElement.innerHTML).toContain('simple');
      });
      it('falls back to second route when canMatch returns EMPTY', async () => {
        const router = TestBed.inject(Router);
        router.resetConfig([
          {
            path: 'a',
            canMatch: [() => EMPTY],
            component: BlankCmp,
          },
          {path: 'a', component: SimpleCmp},
        ]);
        const fixture = await createRoot(router, RootCmp);

        router.navigateByUrl('/a');
        await advance(fixture);
        expect(fixture.nativeElement.innerHTML).toContain('simple');
      });

      it('uses route when canMatch returns true', async () => {
        const router = TestBed.inject(Router);
        TestBed.inject(ConfigurableGuard).result = Promise.resolve(true);
        router.resetConfig([
          {
            path: 'a',
            canMatch: [() => inject(ConfigurableGuard).canMatch()],
            component: SimpleCmp,
          },
          {path: 'a', component: BlankCmp},
        ]);
        const fixture = await createRoot(router, RootCmp);

        router.navigateByUrl('/a');
        await advance(fixture);
        expect(fixture.nativeElement.innerHTML).toContain('simple');
      });

      it('can return UrlTree from canMatch guard', async () => {
        const router = TestBed.inject(Router);
        TestBed.inject(ConfigurableGuard).result = Promise.resolve(
          router.createUrlTree(['/team/1']),
        );
        router.resetConfig([
          {
            path: 'a',
            canMatch: [() => inject(ConfigurableGuard).canMatch()],
            component: SimpleCmp,
          },
          {path: 'team/:id', component: TeamCmp},
        ]);
        const fixture = await createRoot(router, RootCmp);

        router.navigateByUrl('/a');
        await advance(fixture);
        expect(fixture.nativeElement.innerHTML).toContain('team');
      });

      it('can return UrlTree from CanMatchFn guard', async () => {
        const canMatchTeamSection = new InjectionToken('CanMatchTeamSection');
        const canMatchFactory: (router: Router) => CanMatchFn = (router: Router) => () =>
          router.createUrlTree(['/team/1']);

        TestBed.overrideProvider(canMatchTeamSection, {
          useFactory: canMatchFactory,
          deps: [Router],
        });

        const router = TestBed.inject(Router);

        router.resetConfig([
          {path: 'a', canMatch: [canMatchTeamSection], component: SimpleCmp},
          {path: 'team/:id', component: TeamCmp},
        ]);
        const fixture = await createRoot(router, RootCmp);

        router.navigateByUrl('/a');
        await advance(fixture);
        expect(fixture.nativeElement.innerHTML).toContain('team');
      });

      it('runs canMatch guards provided in lazy module', async () => {
        const router = TestBed.inject(Router);
        @Component({
          selector: 'lazy',
          template: 'lazy-loaded-parent [<router-outlet></router-outlet>]',
          standalone: false,
        })
        class ParentLazyLoadedComponent {}

        @Component({
          selector: 'lazy',
          template: 'lazy-loaded-child',
          standalone: false,
        })
        class ChildLazyLoadedComponent {}
        @Injectable()
        class LazyCanMatchFalse {
          canMatch() {
            return false;
          }
        }
        @Component({
          template: 'restricted',
          standalone: false,
        })
        class Restricted {}
        @NgModule({
          declarations: [ParentLazyLoadedComponent, ChildLazyLoadedComponent, Restricted],
          providers: [LazyCanMatchFalse],
          imports: [
            RouterModule.forChild([
              {
                path: 'loaded',
                canMatch: [LazyCanMatchFalse],
                component: Restricted,
                children: [{path: 'child', component: Restricted}],
              },
              {
                path: 'loaded',
                component: ParentLazyLoadedComponent,
                children: [{path: 'child', component: ChildLazyLoadedComponent}],
              },
            ]),
          ],
        })
        class LoadedModule {}

        const fixture = await createRoot(router, RootCmp);

        router.resetConfig([{path: 'lazy', loadChildren: () => LoadedModule}]);
        router.navigateByUrl('/lazy/loaded/child');
        await advance(fixture);

        expect(TestBed.inject(Location).path()).toEqual('/lazy/loaded/child');
        expect(fixture.nativeElement).toHaveText('lazy-loaded-parent [lazy-loaded-child]');
      });

      it('cancels guard execution when a new navigation happens', async () => {
        @Injectable({providedIn: 'root'})
        class DelayedGuard {
          static delayedExecutions = 0;
          canMatch() {
            return of(true).pipe(
              switchMap((v) => new Promise((r) => setTimeout(r, 10)).then(() => v)),
              tap(() => {
                DelayedGuard.delayedExecutions++;
              }),
            );
          }
        }
        const router = TestBed.inject(Router);
        const delayedGuardSpy = spyOn(TestBed.inject(DelayedGuard), 'canMatch');
        delayedGuardSpy.and.callThrough();
        const configurableMatchSpy = spyOn(TestBed.inject(ConfigurableGuard), 'canMatch');
        configurableMatchSpy.and.callFake(() => {
          router.navigateByUrl('/team/1');
          return false;
        });
        router.resetConfig([
          {path: 'a', canMatch: [ConfigurableGuard, DelayedGuard], component: SimpleCmp},
          {path: 'a', canMatch: [ConfigurableGuard, DelayedGuard], component: SimpleCmp},
          {path: 'a', canMatch: [ConfigurableGuard, DelayedGuard], component: SimpleCmp},
          {path: 'team/:id', component: TeamCmp},
        ]);
        const fixture = await createRoot(router, RootCmp);

        router.navigateByUrl('/a');
        await advance(fixture);
        expect(fixture.nativeElement.innerHTML).toContain('team');

        expect(configurableMatchSpy.calls.count()).toEqual(1);

        // The delayed guard should not execute the delayed condition because the other guard
        // initiates a new navigation, which cancels the current one and unsubscribes from
        // intermediate results.
        expect(DelayedGuard.delayedExecutions).toEqual(0);
        // The delayed guard should still have executed once because guards are executed at the
        // same time
        expect(delayedGuardSpy.calls.count()).toEqual(1);
      });
    });

    it('should allow guards as functions', async () => {
      @Component({
        template: '',
      })
      class BlankCmp {}
      const router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);
      const guards = {
        canActivate() {
          return true;
        },
        canDeactivate() {
          return true;
        },
        canActivateChild() {
          return true;
        },
        canMatch() {
          return true;
        },
        canLoad() {
          return true;
        },
      };
      spyOn(guards, 'canActivate').and.callThrough();
      spyOn(guards, 'canActivateChild').and.callThrough();
      spyOn(guards, 'canDeactivate').and.callThrough();
      spyOn(guards, 'canLoad').and.callThrough();
      spyOn(guards, 'canMatch').and.callThrough();
      router.resetConfig([
        {
          path: '',
          component: BlankCmp,
          loadChildren: () => [{path: '', component: BlankCmp}],
          canActivate: [guards.canActivate],
          canActivateChild: [guards.canActivateChild],
          canLoad: [guards.canLoad],
          canDeactivate: [guards.canDeactivate],
          canMatch: [guards.canMatch],
        },
        {
          path: 'other',
          component: BlankCmp,
        },
      ]);

      router.navigateByUrl('/');
      await advance(fixture);
      expect(guards.canMatch).toHaveBeenCalled();
      expect(guards.canLoad).toHaveBeenCalled();
      expect(guards.canActivate).toHaveBeenCalled();
      expect(guards.canActivateChild).toHaveBeenCalled();

      router.navigateByUrl('/other');
      await advance(fixture);
      expect(guards.canDeactivate).toHaveBeenCalled();
    });

    it('should allow DI in plain function guards', async () => {
      @Component({
        template: '',
      })
      class BlankCmp {}

      @Injectable({providedIn: 'root'})
      class State {
        value = true;
      }
      const router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);
      const guards = {
        canActivate() {
          return inject(State).value;
        },
        canDeactivate() {
          return inject(State).value;
        },
        canActivateChild() {
          return inject(State).value;
        },
        canMatch() {
          return inject(State).value;
        },
        canLoad() {
          return inject(State).value;
        },
      };
      spyOn(guards, 'canActivate').and.callThrough();
      spyOn(guards, 'canActivateChild').and.callThrough();
      spyOn(guards, 'canDeactivate').and.callThrough();
      spyOn(guards, 'canLoad').and.callThrough();
      spyOn(guards, 'canMatch').and.callThrough();
      router.resetConfig([
        {
          path: '',
          component: BlankCmp,
          loadChildren: () => [{path: '', component: BlankCmp}],
          canActivate: [guards.canActivate],
          canActivateChild: [guards.canActivateChild],
          canLoad: [guards.canLoad],
          canDeactivate: [guards.canDeactivate],
          canMatch: [guards.canMatch],
        },
        {
          path: 'other',
          component: BlankCmp,
        },
      ]);

      router.navigateByUrl('/');
      await advance(fixture);
      expect(guards.canMatch).toHaveBeenCalled();
      expect(guards.canLoad).toHaveBeenCalled();
      expect(guards.canActivate).toHaveBeenCalled();
      expect(guards.canActivateChild).toHaveBeenCalled();

      router.navigateByUrl('/other');
      await advance(fixture);
      expect(guards.canDeactivate).toHaveBeenCalled();
    });

    it('can run functional guards serially', async () => {
      function runSerially(
        guards: CanActivateFn[] | CanActivateChildFn[],
      ): CanActivateFn | CanActivateChildFn {
        return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
          const injector = inject(EnvironmentInjector);
          const observables = guards.map((guard) => {
            const guardResult = injector.runInContext(() => guard(route, state));
            return wrapIntoObservable(guardResult).pipe(first());
          });
          return concat(...observables).pipe(
            takeWhile((v) => v === true),
            last(),
          );
        };
      }

      const guardDone: string[] = [];

      const guard1: CanActivateFn = () =>
        of(true).pipe(
          switchMap((v) => new Promise((r) => setTimeout(r, 4)).then(() => v)),
          tap(() => guardDone.push('guard1')),
        );
      const guard2: CanActivateFn = () => of(true).pipe(tap(() => guardDone.push('guard2')));
      const guard3: CanActivateFn = () =>
        of(true).pipe(
          switchMap((v) => new Promise((r) => setTimeout(r, 2)).then(() => v)),
          tap(() => guardDone.push('guard3')),
        );
      const guard4: CanActivateFn = () =>
        of(true).pipe(
          switchMap((v) => new Promise((r) => setTimeout(r, 6)).then(() => v)),
          tap(() => guardDone.push('guard4')),
        );
      const router = TestBed.inject(Router);
      router.resetConfig([
        {
          path: '**',
          component: BlankCmp,
          canActivate: [runSerially([guard1, guard2, guard3, guard4])],
        },
      ]);
      await router.navigateByUrl('');
      expect(guardDone).toEqual(['guard1', 'guard2', 'guard3', 'guard4']);
    });
  });
}
