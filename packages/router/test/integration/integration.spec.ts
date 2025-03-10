/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HashLocationStrategy, Location, LocationStrategy} from '@angular/common';
import {ɵprovideFakePlatformNavigation} from '@angular/common/testing';
import {
  ChangeDetectionStrategy,
  Component,
  inject as coreInject,
  Injectable,
  NgModule,
  ɵConsole as Console,
} from '@angular/core';
import {ComponentFixture, fakeAsync, inject, TestBed, tick} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  ActivationEnd,
  ActivationStart,
  ChildActivationEnd,
  ChildActivationStart,
  DefaultUrlSerializer,
  Event,
  GuardsCheckEnd,
  GuardsCheckStart,
  Navigation,
  NavigationCancel,
  NavigationCancellationCode,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Params,
  ResolveEnd,
  ResolveStart,
  Router,
  RouterLink,
  RouterModule,
  RouterStateSnapshot,
  RoutesRecognized,
} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';
import {of} from 'rxjs';
import {delay, mapTo} from 'rxjs/operators';

import {RedirectCommand} from '../../src/models';
import {
  provideRouter,
  withNavigationErrorHandler,
  withRouterConfig,
} from '../../src/provide_router';
import {
  AbsoluteLinkCmp,
  AbsoluteSimpleLinkCmp,
  advance,
  BlankCmp,
  CollectParamsCmp,
  ComponentRecordingRoutePathAndUrl,
  ConditionalThrowingCmp,
  createRoot,
  DivLinkWithState,
  EmptyQueryParamsCmp,
  expectEvents,
  LinkWithQueryParamsAndFragment,
  LinkWithState,
  onlyNavigationStartAndEnd,
  OutletInNgIf,
  QueryParamsAndFragmentCmp,
  RelativeLinkCmp,
  RelativeLinkInIfCmp,
  RootCmp,
  RootCmpWithNamedOutlet,
  RootCmpWithOnInit,
  RootCmpWithTwoOutlets,
  RouteCmp,
  ROUTER_DIRECTIVES,
  SimpleCmp,
  StringLinkButtonCmp,
  StringLinkCmp,
  TeamCmp,
  TestModule,
  ThrowingCmp,
  TwoOutletsCmp,
  UserCmp,
} from './integration_helpers';
import {guardsIntegrationSuite} from './guards.spec';
import {lazyLoadingIntegrationSuite} from './lazy_loading.spec';
import {routeDataIntegrationSuite} from './route_data.spec';
import {routeReuseIntegrationSuite} from './route_reuse_strategy.spec';
import {routerLinkActiveIntegrationSuite} from './router_link_active.spec';
import {routerEventsIntegrationSuite} from './router_events.spec';
import {redirectsIntegrationSuite} from './redirects.spec';
import {routerLinkIntegrationSpec} from './router_links.spec';

for (const browserAPI of ['navigation', 'history'] as const) {
  describe(`${browserAPI}-based routing`, () => {
    const noopConsole: Console = {log() {}, warn() {}};

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [...ROUTER_DIRECTIVES, TestModule],
        providers: [
          {provide: Console, useValue: noopConsole},
          provideRouter([{path: 'simple', component: SimpleCmp}]),
          browserAPI === 'navigation' ? ɵprovideFakePlatformNavigation() : [],
        ],
      });
    });

    it('should navigate with a provided config', fakeAsync(
      inject([Router, Location], (router: Router, location: Location) => {
        const fixture = createRoot(router, RootCmp);

        router.navigateByUrl('/simple');
        advance(fixture);

        expect(location.path()).toEqual('/simple');
      }),
    ));

    it('should navigate from ngOnInit hook', fakeAsync(
      inject([Router, Location], (router: Router, location: Location) => {
        router.resetConfig([
          {path: '', component: SimpleCmp},
          {path: 'one', component: RouteCmp},
        ]);

        const fixture = createRoot(router, RootCmpWithOnInit);
        expect(location.path()).toEqual('/one');
        expect(fixture.nativeElement).toHaveText('route');
      }),
    ));

    describe('navigation', function () {
      it('should navigate to the current URL', fakeAsync(() => {
        TestBed.configureTestingModule({
          providers: [provideRouter([], withRouterConfig({onSameUrlNavigation: 'reload'}))],
        });
        const router = TestBed.inject(Router);
        router.resetConfig([
          {path: '', component: SimpleCmp},
          {path: 'simple', component: SimpleCmp},
        ]);

        const events: (NavigationStart | NavigationEnd)[] = [];
        router.events.subscribe((e) => onlyNavigationStartAndEnd(e) && events.push(e));

        router.navigateByUrl('/simple');
        tick();

        router.navigateByUrl('/simple');
        tick();

        expectEvents(events, [
          [NavigationStart, '/simple'],
          [NavigationEnd, '/simple'],
          [NavigationStart, '/simple'],
          [NavigationEnd, '/simple'],
        ]);
      }));

      it('should override default onSameUrlNavigation with extras', async () => {
        TestBed.configureTestingModule({
          providers: [provideRouter([], withRouterConfig({onSameUrlNavigation: 'ignore'}))],
        });
        const router = TestBed.inject(Router);
        router.resetConfig([
          {path: '', component: SimpleCmp},
          {path: 'simple', component: SimpleCmp},
        ]);

        const events: (NavigationStart | NavigationEnd)[] = [];
        router.events.subscribe((e) => onlyNavigationStartAndEnd(e) && events.push(e));

        await router.navigateByUrl('/simple');
        await router.navigateByUrl('/simple');
        // By default, the second navigation is ignored
        expectEvents(events, [
          [NavigationStart, '/simple'],
          [NavigationEnd, '/simple'],
        ]);
        await router.navigateByUrl('/simple', {onSameUrlNavigation: 'reload'});
        // We overrode the `onSameUrlNavigation` value. This navigation should be processed.
        expectEvents(events, [
          [NavigationStart, '/simple'],
          [NavigationEnd, '/simple'],
          [NavigationStart, '/simple'],
          [NavigationEnd, '/simple'],
        ]);
      });

      it('should override default onSameUrlNavigation with extras', async () => {
        TestBed.configureTestingModule({
          providers: [provideRouter([], withRouterConfig({onSameUrlNavigation: 'reload'}))],
        });
        const router = TestBed.inject(Router);
        router.resetConfig([
          {path: '', component: SimpleCmp},
          {path: 'simple', component: SimpleCmp},
        ]);

        const events: (NavigationStart | NavigationEnd)[] = [];
        router.events.subscribe((e) => onlyNavigationStartAndEnd(e) && events.push(e));

        await router.navigateByUrl('/simple');
        await router.navigateByUrl('/simple');
        expectEvents(events, [
          [NavigationStart, '/simple'],
          [NavigationEnd, '/simple'],
          [NavigationStart, '/simple'],
          [NavigationEnd, '/simple'],
        ]);

        events.length = 0;
        await router.navigateByUrl('/simple', {onSameUrlNavigation: 'ignore'});
        expectEvents(events, []);
      });

      it('should set transient navigation info', async () => {
        let observedInfo: unknown;
        const router = TestBed.inject(Router);
        router.resetConfig([
          {
            path: 'simple',
            component: SimpleCmp,
            canActivate: [
              () => {
                observedInfo = coreInject(Router).getCurrentNavigation()?.extras?.info;
                return true;
              },
            ],
          },
        ]);

        await router.navigateByUrl('/simple', {info: 'navigation info'});
        expect(observedInfo).toEqual('navigation info');
      });

      it('should set transient navigation info for routerlink', async () => {
        let observedInfo: unknown;
        const router = TestBed.inject(Router);
        router.resetConfig([
          {
            path: 'simple',
            component: SimpleCmp,
            canActivate: [
              () => {
                observedInfo = coreInject(Router).getCurrentNavigation()?.extras?.info;
                return true;
              },
            ],
          },
        ]);
        @Component({
          imports: [RouterLink],
          template: `<a #simpleLink [routerLink]="'/simple'" [info]="simpleLink"></a>`,
        })
        class App {}

        const fixture = TestBed.createComponent(App);
        fixture.autoDetectChanges();
        const anchor = fixture.nativeElement.querySelector('a');
        anchor.click();
        await fixture.whenStable();

        // An example use-case might be to pass the clicked link along with the navigation
        // information
        expect(observedInfo).toBeInstanceOf(HTMLAnchorElement);
      });

      it('should make transient navigation info available in redirect', async () => {
        let observedInfo: unknown;
        const router = TestBed.inject(Router);
        router.resetConfig([
          {
            path: 'redirect',
            component: SimpleCmp,
            canActivate: [() => coreInject(Router).parseUrl('/simple')],
          },
          {
            path: 'simple',
            component: SimpleCmp,
            canActivate: [
              () => {
                observedInfo = coreInject(Router).getCurrentNavigation()?.extras?.info;
                return true;
              },
            ],
          },
        ]);

        await router.navigateByUrl('/redirect', {info: 'navigation info'});
        expect(observedInfo).toBe('navigation info');
        expect(router.url).toEqual('/simple');
      });

      it('should ignore empty paths in relative links', fakeAsync(
        inject([Router], (router: Router) => {
          router.resetConfig([
            {
              path: 'foo',
              children: [{path: 'bar', children: [{path: '', component: RelativeLinkCmp}]}],
            },
          ]);

          const fixture = createRoot(router, RootCmp);

          router.navigateByUrl('/foo/bar');
          advance(fixture);

          const link = fixture.nativeElement.querySelector('a');
          expect(link.getAttribute('href')).toEqual('/foo/simple');
        }),
      ));

      it('should set the restoredState to null when executing imperative navigations', fakeAsync(
        inject([Router], (router: Router) => {
          router.resetConfig([
            {path: '', component: SimpleCmp},
            {path: 'simple', component: SimpleCmp},
          ]);

          const fixture = createRoot(router, RootCmp);
          let event: NavigationStart;
          router.events.subscribe((e) => {
            if (e instanceof NavigationStart) {
              event = e;
            }
          });

          router.navigateByUrl('/simple');
          tick();

          expect(event!.navigationTrigger).toEqual('imperative');
          expect(event!.restoredState).toEqual(null);
        }),
      ));

      it('should set history.state if passed using imperative navigation', fakeAsync(
        inject([Router, Location], (router: Router, location: Location) => {
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
          expect(state.foo).toBe('bar');
          expect(state).toEqual({foo: 'bar', navigationId: 2});
          expect(navigation.extras.state).toBeDefined();
          expect(navigation.extras.state).toEqual({foo: 'bar'});
        }),
      ));

      it('should set history.state when navigation with browser back and forward', fakeAsync(
        inject([Router, Location], (router: Router, location: Location) => {
          router.resetConfig([
            {path: '', component: SimpleCmp},
            {path: 'simple', component: SimpleCmp},
          ]);

          const fixture = createRoot(router, RootCmp);
          let navigation: Navigation = null!;
          router.events.subscribe((e) => {
            if (e instanceof NavigationStart) {
              navigation = <Navigation>router.getCurrentNavigation()!;
            }
          });

          let state: Record<string, string> = {foo: 'bar'};
          router.navigateByUrl('/simple', {state});
          tick();
          location.back();
          tick();
          location.forward();
          tick();

          expect(navigation.extras.state).toBeDefined();
          expect(navigation.extras.state).toEqual(state);

          // Manually set state rather than using navigate()
          state = {bar: 'foo'};
          location.replaceState(location.path(), '', state);
          location.back();
          tick();
          location.forward();
          tick();

          expect(navigation.extras.state).toBeDefined();
          expect(navigation.extras.state).toEqual(state);
        }),
      ));

      it('should navigate correctly when using `Location#historyGo', fakeAsync(
        inject([Router, Location], (router: Router, location: Location) => {
          router.resetConfig([
            {path: 'first', component: SimpleCmp},
            {path: 'second', component: SimpleCmp},
          ]);

          createRoot(router, RootCmp);

          router.navigateByUrl('/first');
          tick();
          router.navigateByUrl('/second');
          tick();
          expect(router.url).toEqual('/second');

          location.historyGo(-1);
          tick();
          expect(router.url).toEqual('/first');

          location.historyGo(1);
          tick();
          expect(router.url).toEqual('/second');

          location.historyGo(-100);
          tick();
          expect(router.url).toEqual('/second');

          location.historyGo(100);
          tick();
          expect(router.url).toEqual('/second');

          location.historyGo(0);
          tick();
          expect(router.url).toEqual('/second');

          location.historyGo();
          tick();
          expect(router.url).toEqual('/second');
        }),
      ));

      it('should not error if state is not {[key: string]: any}', fakeAsync(
        inject([Router, Location], (router: Router, location: Location) => {
          router.resetConfig([
            {path: '', component: SimpleCmp},
            {path: 'simple', component: SimpleCmp},
          ]);

          const fixture = createRoot(router, RootCmp);
          let navigation: Navigation = null!;
          router.events.subscribe((e) => {
            if (e instanceof NavigationStart) {
              navigation = <Navigation>router.getCurrentNavigation()!;
            }
          });

          location.replaceState('', '', 42);
          router.navigateByUrl('/simple');
          tick();
          location.back();
          advance(fixture);

          // Angular does not support restoring state to the primitive.
          expect(navigation.extras.state).toEqual(undefined);
          expect(location.getState()).toEqual({navigationId: 3});
        }),
      ));

      it('should not pollute browser history when replaceUrl is set to true', fakeAsync(
        inject([Router, Location], (router: Router, location: Location) => {
          router.resetConfig([
            {path: '', component: SimpleCmp},
            {path: 'a', component: SimpleCmp},
            {path: 'b', component: SimpleCmp},
          ]);

          createRoot(router, RootCmp);

          const replaceSpy = spyOn(location, 'replaceState');
          router.navigateByUrl('/a', {replaceUrl: true});
          router.navigateByUrl('/b', {replaceUrl: true});
          tick();

          expect(replaceSpy.calls.count()).toEqual(1);
        }),
      ));

      it('should skip navigation if another navigation is already scheduled', fakeAsync(
        inject([Router, Location], (router: Router, location: Location) => {
          router.resetConfig([
            {path: '', component: SimpleCmp},
            {path: 'a', component: SimpleCmp},
            {path: 'b', component: SimpleCmp},
          ]);

          const fixture = createRoot(router, RootCmp);

          router.navigate(['/a'], {
            queryParams: {a: true},
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
          router.navigate(['/b'], {
            queryParams: {b: true},
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
          tick();

          /**
           * Why do we have '/b?b=true' and not '/b?a=true&b=true'?
           *
           * This is because the router has the right to stop a navigation mid-flight if another
           * navigation has been already scheduled. This is why we can use a top-level guard
           * to perform redirects. Calling `navigate` in such a guard will stop the navigation, and
           * the components won't be instantiated.
           *
           * This is a fundamental property of the router: it only cares about its latest state.
           *
           * This means that components should only map params to something else, not reduce them.
           * In other words, the following component is asking for trouble:
           *
           * ```
           * class MyComponent {
           *  constructor(a: ActivatedRoute) {
           *    a.params.scan(...)
           *  }
           * }
           * ```
           *
           * This also means "queryParamsHandling: 'merge'" should only be used to merge with
           * long-living query parameters (e.g., debug).
           */
          expect(router.url).toEqual('/b?b=true');
        }),
      ));
    });

    describe('should execute navigations serially', () => {
      let log: Array<string | Params> = [];

      beforeEach(() => {
        log = [];

        TestBed.configureTestingModule({
          providers: [
            {
              provide: 'trueRightAway',
              useValue: () => {
                log.push('trueRightAway');
                return true;
              },
            },
            {
              provide: 'trueIn2Seconds',
              useValue: () => {
                log.push('trueIn2Seconds-start');
                let res: (value: boolean) => void;
                const p = new Promise<boolean>((r) => (res = r));
                setTimeout(() => {
                  log.push('trueIn2Seconds-end');
                  res(true);
                }, 2000);
                return p;
              },
            },
          ],
        });
      });

      describe('route activation', () => {
        @Component({
          template: '<router-outlet></router-outlet>',
          standalone: false,
        })
        class Parent {
          constructor(route: ActivatedRoute) {
            route.params.subscribe((s: Params) => {
              log.push(s);
            });
          }
        }

        @Component({
          template: `
         <router-outlet (deactivate)="logDeactivate('primary')"></router-outlet>
         <router-outlet name="first" (deactivate)="logDeactivate('first')"></router-outlet>
         <router-outlet name="second" (deactivate)="logDeactivate('second')"></router-outlet>
         `,
          standalone: false,
        })
        class NamedOutletHost {
          logDeactivate(route: string) {
            log.push(route + ' deactivate');
          }
        }

        @Component({
          template: 'child1',
          standalone: false,
        })
        class Child1 {
          constructor() {
            log.push('child1 constructor');
          }
          ngOnDestroy() {
            log.push('child1 destroy');
          }
        }

        @Component({
          template: 'child2',
          standalone: false,
        })
        class Child2 {
          constructor() {
            log.push('child2 constructor');
          }
          ngOnDestroy() {
            log.push('child2 destroy');
          }
        }

        @Component({
          template: 'child3',
          standalone: false,
        })
        class Child3 {
          constructor() {
            log.push('child3 constructor');
          }
          ngOnDestroy() {
            log.push('child3 destroy');
          }
        }

        @NgModule({
          declarations: [Parent, NamedOutletHost, Child1, Child2, Child3],
          imports: [RouterModule.forRoot([])],
        })
        class TestModule {}

        it('should advance the parent route after deactivating its children', fakeAsync(() => {
          TestBed.configureTestingModule({imports: [TestModule]});
          const router = TestBed.inject(Router);
          const location = TestBed.inject(Location);
          const fixture = createRoot(router, RootCmp);

          router.resetConfig([
            {
              path: 'parent/:id',
              component: Parent,
              children: [
                {path: 'child1', component: Child1},
                {path: 'child2', component: Child2},
              ],
            },
          ]);

          router.navigateByUrl('/parent/1/child1');
          advance(fixture);

          router.navigateByUrl('/parent/2/child2');
          advance(fixture);

          expect(location.path()).toEqual('/parent/2/child2');
          expect(log).toEqual([
            {id: '1'},
            'child1 constructor',
            'child1 destroy',
            {id: '2'},
            'child2 constructor',
          ]);
        }));

        it('should deactivate outlet children with componentless parent', fakeAsync(() => {
          TestBed.configureTestingModule({imports: [TestModule]});
          const router = TestBed.inject(Router);
          const fixture = createRoot(router, RootCmp);

          router.resetConfig([
            {
              path: 'named-outlets',
              component: NamedOutletHost,
              children: [
                {
                  path: 'home',
                  children: [
                    {path: '', component: Child1, outlet: 'first'},
                    {path: '', component: Child2, outlet: 'second'},
                    {path: 'primary', component: Child3},
                  ],
                },
                {
                  path: 'about',
                  children: [
                    {path: '', component: Child1, outlet: 'first'},
                    {path: '', component: Child2, outlet: 'second'},
                  ],
                },
              ],
            },
            {
              path: 'other',
              component: Parent,
            },
          ]);

          router.navigateByUrl('/named-outlets/home/primary');
          advance(fixture);
          expect(log).toEqual([
            'child3 constructor', // primary outlet always first
            'child1 constructor',
            'child2 constructor',
          ]);
          log.length = 0;

          router.navigateByUrl('/named-outlets/about');
          advance(fixture);
          expect(log).toEqual([
            'child3 destroy',
            'primary deactivate',
            'child1 destroy',
            'first deactivate',
            'child2 destroy',
            'second deactivate',
            'child1 constructor',
            'child2 constructor',
          ]);
          log.length = 0;

          router.navigateByUrl('/other');
          advance(fixture);
          expect(log).toEqual([
            'child1 destroy',
            'first deactivate',
            'child2 destroy',
            'second deactivate',
            // route param subscription from 'Parent' component
            {},
          ]);
        }));

        it('should work between aux outlets under two levels of empty path parents', fakeAsync(() => {
          TestBed.configureTestingModule({imports: [TestModule]});
          const router = TestBed.inject(Router);
          router.resetConfig([
            {
              path: '',
              children: [
                {
                  path: '',
                  component: NamedOutletHost,
                  children: [
                    {path: 'one', component: Child1, outlet: 'first'},
                    {path: 'two', component: Child2, outlet: 'first'},
                  ],
                },
              ],
            },
          ]);

          const fixture = createRoot(router, RootCmp);

          router.navigateByUrl('/(first:one)');
          advance(fixture);
          expect(log).toEqual(['child1 constructor']);

          log.length = 0;
          router.navigateByUrl('/(first:two)');
          advance(fixture);
          expect(log).toEqual(['child1 destroy', 'first deactivate', 'child2 constructor']);
        }));
      });

      it('should not wait for prior navigations to start a new navigation', fakeAsync(
        inject([Router, Location], (router: Router) => {
          const fixture = createRoot(router, RootCmp);

          router.resetConfig([
            {path: 'a', component: SimpleCmp, canActivate: ['trueRightAway', 'trueIn2Seconds']},
            {path: 'b', component: SimpleCmp, canActivate: ['trueRightAway', 'trueIn2Seconds']},
          ]);

          router.navigateByUrl('/a');
          tick(100);
          fixture.detectChanges();

          router.navigateByUrl('/b');
          tick(100); // 200
          fixture.detectChanges();

          expect(log).toEqual([
            'trueRightAway',
            'trueIn2Seconds-start',
            'trueRightAway',
            'trueIn2Seconds-start',
          ]);

          tick(2000); // 2200
          fixture.detectChanges();

          expect(log).toEqual([
            'trueRightAway',
            'trueIn2Seconds-start',
            'trueRightAway',
            'trueIn2Seconds-start',
            'trueIn2Seconds-end',
            'trueIn2Seconds-end',
          ]);
        }),
      ));
    });

    it('Should work inside ChangeDetectionStrategy.OnPush components', fakeAsync(() => {
      @Component({
        selector: 'root-cmp',
        template: `<router-outlet></router-outlet>`,
        changeDetection: ChangeDetectionStrategy.OnPush,
        standalone: false,
      })
      class OnPushOutlet {}

      @Component({
        selector: 'need-cd',
        template: `{{'it works!'}}`,
        standalone: false,
      })
      class NeedCdCmp {}

      @NgModule({
        declarations: [OnPushOutlet, NeedCdCmp],
        imports: [RouterModule.forRoot([])],
      })
      class TestModule {}

      TestBed.configureTestingModule({imports: [TestModule]});

      const router: Router = TestBed.inject(Router);
      const fixture = createRoot(router, RootCmp);

      router.resetConfig([
        {
          path: 'on',
          component: OnPushOutlet,
          children: [
            {
              path: 'push',
              component: NeedCdCmp,
            },
          ],
        },
      ]);

      advance(fixture);
      router.navigateByUrl('on');
      advance(fixture);
      router.navigateByUrl('on/push');
      advance(fixture);

      expect(fixture.nativeElement).toHaveText('it works!');
    }));

    it('should not error when no url left and no children are matching', fakeAsync(
      inject([Router, Location], (router: Router, location: Location) => {
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([
          {
            path: 'team/:id',
            component: TeamCmp,
            children: [{path: 'simple', component: SimpleCmp}],
          },
        ]);

        router.navigateByUrl('/team/33/simple');
        advance(fixture);

        expect(location.path()).toEqual('/team/33/simple');
        expect(fixture.nativeElement).toHaveText('team 33 [ simple, right:  ]');

        router.navigateByUrl('/team/33');
        advance(fixture);

        expect(location.path()).toEqual('/team/33');
        expect(fixture.nativeElement).toHaveText('team 33 [ , right:  ]');
      }),
    ));

    it('should work when an outlet is in an ngIf', fakeAsync(
      inject([Router, Location], (router: Router, location: Location) => {
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([
          {
            path: 'child',
            component: OutletInNgIf,
            children: [{path: 'simple', component: SimpleCmp}],
          },
        ]);

        router.navigateByUrl('/child/simple');
        advance(fixture);

        expect(location.path()).toEqual('/child/simple');
      }),
    ));

    it('should work when an outlet is added/removed', fakeAsync(() => {
      @Component({
        selector: 'someRoot',
        template: `[<div *ngIf="cond"><router-outlet></router-outlet></div>]`,
        standalone: false,
      })
      class RootCmpWithLink {
        cond: boolean = true;
      }
      TestBed.configureTestingModule({declarations: [RootCmpWithLink]});

      const router: Router = TestBed.inject(Router);

      const fixture = createRoot(router, RootCmpWithLink);

      router.resetConfig([
        {path: 'simple', component: SimpleCmp},
        {path: 'blank', component: BlankCmp},
      ]);

      router.navigateByUrl('/simple');
      advance(fixture);
      expect(fixture.nativeElement).toHaveText('[simple]');

      fixture.componentInstance.cond = false;
      advance(fixture);
      expect(fixture.nativeElement).toHaveText('[]');

      fixture.componentInstance.cond = true;
      advance(fixture);
      expect(fixture.nativeElement).toHaveText('[simple]');
    }));

    it('should update location when navigating', fakeAsync(() => {
      @Component({
        template: `record`,
        standalone: false,
      })
      class RecordLocationCmp {
        private storedPath: string;
        constructor(loc: Location) {
          this.storedPath = loc.path();
        }
      }

      @NgModule({declarations: [RecordLocationCmp]})
      class TestModule {}

      TestBed.configureTestingModule({imports: [TestModule]});

      const router = TestBed.inject(Router);
      const location = TestBed.inject(Location);
      const fixture = createRoot(router, RootCmp);

      router.resetConfig([{path: 'record/:id', component: RecordLocationCmp}]);

      router.navigateByUrl('/record/22');
      advance(fixture);

      const c = fixture.debugElement.children[1].componentInstance;
      expect(location.path()).toEqual('/record/22');
      expect(c.storedPath).toEqual('/record/22');

      router.navigateByUrl('/record/33');
      advance(fixture);
      expect(location.path()).toEqual('/record/33');
    }));

    it('should skip location update when using NavigationExtras.skipLocationChange with navigateByUrl', fakeAsync(
      inject([Router, Location], (router: Router, location: Location) => {
        const fixture = TestBed.createComponent(RootCmp);
        advance(fixture);

        router.resetConfig([{path: 'team/:id', component: TeamCmp}]);

        router.navigateByUrl('/team/22');
        advance(fixture);
        expect(location.path()).toEqual('/team/22');

        expect(fixture.nativeElement).toHaveText('team 22 [ , right:  ]');

        router.navigateByUrl('/team/33', {skipLocationChange: true});
        advance(fixture);

        expect(location.path()).toEqual('/team/22');

        expect(fixture.nativeElement).toHaveText('team 33 [ , right:  ]');
      }),
    ));

    it('should skip location update when using NavigationExtras.skipLocationChange with navigate', fakeAsync(
      inject([Router, Location], (router: Router, location: Location) => {
        const fixture = TestBed.createComponent(RootCmp);
        advance(fixture);

        router.resetConfig([{path: 'team/:id', component: TeamCmp}]);

        router.navigate(['/team/22']);
        advance(fixture);
        expect(location.path()).toEqual('/team/22');

        expect(fixture.nativeElement).toHaveText('team 22 [ , right:  ]');

        router.navigate(['/team/33'], {skipLocationChange: true});
        advance(fixture);

        expect(location.path()).toEqual('/team/22');

        expect(fixture.nativeElement).toHaveText('team 33 [ , right:  ]');
      }),
    ));

    it('should navigate after navigation with skipLocationChange', fakeAsync(
      inject([Router, Location], (router: Router, location: Location) => {
        const fixture = TestBed.createComponent(RootCmpWithNamedOutlet);
        advance(fixture);

        router.resetConfig([{path: 'show', outlet: 'main', component: SimpleCmp}]);

        router.navigate([{outlets: {main: 'show'}}], {skipLocationChange: true});
        advance(fixture);
        expect(location.path()).toEqual('');

        expect(fixture.nativeElement).toHaveText('main [simple]');

        router.navigate([{outlets: {main: null}}], {skipLocationChange: true});
        advance(fixture);

        expect(location.path()).toEqual('');

        expect(fixture.nativeElement).toHaveText('main []');
      }),
    ));

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
            {
              provide: 'authGuardFail',
              useValue: (a: any, b: any) => {
                return new Promise((res) => {
                  setTimeout(() => res(serializer.parse('/login')), 1);
                });
              },
            },
            AuthGuard,
            DelayedGuard,
          ],
        });
      });

      describe('urlUpdateStrategy: eager', () => {
        beforeEach(() => {
          TestBed.configureTestingModule({
            providers: [provideRouter([], withRouterConfig({urlUpdateStrategy: 'eager'}))],
          });
        });
        it('should eagerly update the URL', fakeAsync(
          inject([Router, Location], (router: Router, location: Location) => {
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
          }),
        ));

        it('should eagerly update the URL', fakeAsync(
          inject([Router, Location], (router: Router, location: Location) => {
            const fixture = TestBed.createComponent(RootCmp);
            advance(fixture);

            router.resetConfig([
              {path: 'team/:id', component: SimpleCmp, canActivate: ['authGuardFail']},
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
          }),
        ));

        it('should eagerly update URL after redirects are applied', fakeAsync(
          inject([Router, Location], (router: Router, location: Location) => {
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
          }),
        ));

        it('should set `state`', fakeAsync(
          inject([Router, Location], (router: Router, location: Location) => {
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
          }),
        ));

        it('can renavigate to rejected URL', fakeAsync(() => {
          const router = TestBed.inject(Router);
          const canActivate = TestBed.inject(AuthGuard);
          const location = TestBed.inject(Location);
          router.resetConfig([
            {path: '', component: BlankCmp},
            {
              path: 'simple',
              component: SimpleCmp,
              canActivate: [() => coreInject(AuthGuard).canActivate()],
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

        it('can renavigate to same URL during in-flight navigation', fakeAsync(() => {
          const router = TestBed.inject(Router);
          const location = TestBed.inject(Location);
          router.resetConfig([
            {path: '', component: BlankCmp},
            {
              path: 'simple',
              component: SimpleCmp,
              canActivate: [() => coreInject(DelayedGuard).canActivate()],
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
    });

    it('should navigate back and forward', fakeAsync(
      inject([Router, Location], (router: Router, location: Location) => {
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([
          {
            path: 'team/:id',
            component: TeamCmp,
            children: [
              {path: 'simple', component: SimpleCmp},
              {path: 'user/:name', component: UserCmp},
            ],
          },
        ]);

        let event: NavigationStart;
        router.events.subscribe((e) => {
          if (e instanceof NavigationStart) {
            event = e;
          }
        });

        router.navigateByUrl('/team/33/simple');
        advance(fixture);
        expect(location.path()).toEqual('/team/33/simple');
        const simpleNavStart = event!;

        router.navigateByUrl('/team/22/user/victor');
        advance(fixture);
        const userVictorNavStart = event!;

        location.back();
        advance(fixture);
        expect(location.path()).toEqual('/team/33/simple');
        expect(event!.navigationTrigger).toEqual('popstate');
        expect(event!.restoredState!.navigationId).toEqual(simpleNavStart.id);

        location.forward();
        advance(fixture);
        expect(location.path()).toEqual('/team/22/user/victor');
        expect(event!.navigationTrigger).toEqual('popstate');
        expect(event!.restoredState!.navigationId).toEqual(userVictorNavStart.id);
      }),
    ));

    it('should navigate to the same url when config changes', fakeAsync(
      inject([Router, Location], (router: Router, location: Location) => {
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([{path: 'a', component: SimpleCmp}]);

        router.navigate(['/a']);
        advance(fixture);
        expect(location.path()).toEqual('/a');
        expect(fixture.nativeElement).toHaveText('simple');

        router.resetConfig([{path: 'a', component: RouteCmp}]);

        router.navigate(['/a']);
        advance(fixture);
        expect(location.path()).toEqual('/a');
        expect(fixture.nativeElement).toHaveText('route');
      }),
    ));

    it('should navigate when locations changes', fakeAsync(
      inject([Router, Location], (router: Router, location: Location) => {
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([
          {
            path: 'team/:id',
            component: TeamCmp,
            children: [{path: 'user/:name', component: UserCmp}],
          },
        ]);

        const recordedEvents: (NavigationStart | NavigationEnd)[] = [];
        router.events.forEach((e) => onlyNavigationStartAndEnd(e) && recordedEvents.push(e));

        router.navigateByUrl('/team/22/user/victor');
        advance(fixture);

        location.go('/team/22/user/fedor');
        location.historyGo(0);
        advance(fixture);

        location.go('/team/22/user/fedor');
        location.historyGo(0);
        advance(fixture);

        expect(fixture.nativeElement).toHaveText('team 22 [ user fedor, right:  ]');

        expectEvents(recordedEvents, [
          [NavigationStart, '/team/22/user/victor'],
          [NavigationEnd, '/team/22/user/victor'],
          [NavigationStart, '/team/22/user/fedor'],
          [NavigationEnd, '/team/22/user/fedor'],
        ]);
      }),
    ));

    it('should update the location when the matched route does not change', fakeAsync(
      inject([Router, Location], (router: Router, location: Location) => {
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([{path: '**', component: CollectParamsCmp}]);

        router.navigateByUrl('/one/two');
        advance(fixture);
        const cmp = fixture.debugElement.children[1].componentInstance;
        expect(location.path()).toEqual('/one/two');
        expect(fixture.nativeElement).toHaveText('collect-params');

        expect(cmp.recordedUrls()).toEqual(['one/two']);

        router.navigateByUrl('/three/four');
        advance(fixture);
        expect(location.path()).toEqual('/three/four');
        expect(fixture.nativeElement).toHaveText('collect-params');
        expect(cmp.recordedUrls()).toEqual(['one/two', 'three/four']);
      }),
    ));

    describe('duplicate in-flight navigations', () => {
      @Injectable()
      class RedirectingGuard {
        skipLocationChange = false;
        constructor(private router: Router) {}
        canActivate() {
          this.router.navigate(['/simple'], {skipLocationChange: this.skipLocationChange});
          return false;
        }
      }

      beforeEach(() => {
        TestBed.configureTestingModule({
          providers: [
            {
              provide: 'in1Second',
              useValue: (c: any, a: ActivatedRouteSnapshot, b: RouterStateSnapshot) => {
                let res: any = null;
                const p = new Promise((_) => (res = _));
                setTimeout(() => res(true), 1000);
                return p;
              },
            },
            RedirectingGuard,
          ],
        });
      });

      it('should reset location if a navigation by location is successful', fakeAsync(() => {
        const router = TestBed.inject(Router);
        const location = TestBed.inject(Location);
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([{path: 'simple', component: SimpleCmp, canActivate: ['in1Second']}]);

        // Trigger two location changes to the same URL.
        // Because of the guard the order will look as follows:
        // - location change 'simple'
        // - start processing the change, start a guard
        // - location change 'simple'
        // - the first location change gets canceled, the URL gets reset to '/'
        // - the second location change gets finished, the URL should be reset to '/simple'
        location.go('/simple');
        location.historyGo(0);
        location.historyGo(0);

        tick(2000);
        advance(fixture);

        expect(location.path()).toEqual('/simple');
      }));

      it('should skip duplicate location events', fakeAsync(() => {
        const router = TestBed.inject(Router);
        const location = TestBed.inject(Location);
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([
          {
            path: 'blocked',
            component: BlankCmp,
            canActivate: [() => coreInject(RedirectingGuard).canActivate()],
          },
          {path: 'simple', component: SimpleCmp},
        ]);
        router.navigateByUrl('/simple');
        advance(fixture);

        location.go('/blocked');
        location.historyGo(0);

        advance(fixture);
        expect(fixture.nativeElement.innerHTML).toContain('simple');
      }));

      it('should not cause URL thrashing', async () => {
        TestBed.configureTestingModule({
          providers: [provideRouter([], withRouterConfig({urlUpdateStrategy: 'eager'}))],
        });

        const router = TestBed.inject(Router);
        const location = TestBed.inject(Location);
        const fixture = TestBed.createComponent(RootCmp);
        fixture.detectChanges();

        router.resetConfig([
          {path: 'home', component: SimpleCmp},
          {
            path: 'blocked',
            component: BlankCmp,
            canActivate: [() => coreInject(RedirectingGuard).canActivate()],
          },
          {path: 'simple', component: SimpleCmp},
        ]);

        await router.navigateByUrl('/home');
        const urlChanges: string[] = [];
        location.onUrlChange((change) => {
          urlChanges.push(change);
        });

        await router.navigateByUrl('/blocked');
        await fixture.whenStable();

        expect(fixture.nativeElement.innerHTML).toContain('simple');
        // We do not want the URL to flicker to `/home` between the /blocked and /simple routes
        expect(urlChanges).toEqual(['/blocked', '/simple']);
      });

      it('can render a 404 page without changing the URL', fakeAsync(() => {
        TestBed.configureTestingModule({
          providers: [provideRouter([], withRouterConfig({urlUpdateStrategy: 'eager'}))],
        });
        const router = TestBed.inject(Router);
        TestBed.inject(RedirectingGuard).skipLocationChange = true;
        const location = TestBed.inject(Location);
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([
          {path: 'home', component: SimpleCmp},
          {
            path: 'blocked',
            component: BlankCmp,
            canActivate: [() => coreInject(RedirectingGuard).canActivate()],
          },
          {path: 'simple', redirectTo: '404'},
          {path: '404', component: SimpleCmp},
        ]);
        router.navigateByUrl('/home');
        advance(fixture);

        location.go('/blocked');
        location.historyGo(0);
        advance(fixture);
        expect(location.path()).toEqual('/blocked');
        expect(fixture.nativeElement.innerHTML).toContain('simple');
      }));

      it('should accurately track currentNavigation', fakeAsync(() => {
        const router = TestBed.inject(Router);
        router.resetConfig([
          {path: 'one', component: SimpleCmp, canActivate: ['in1Second']},
          {path: 'two', component: BlankCmp, canActivate: ['in1Second']},
        ]);

        router.events.subscribe((e) => {
          if (e instanceof NavigationStart) {
            if (e.url === '/one') {
              router.navigateByUrl('two');
            }
            router.events.subscribe((e) => {
              if (e instanceof GuardsCheckEnd) {
                expect(router.getCurrentNavigation()?.extractedUrl.toString()).toEqual('/two');
                expect(router.getCurrentNavigation()?.extras).toBeDefined();
              }
            });
          }
        });

        router.navigateByUrl('one');
        tick(1000);
      }));
    });

    it('should support secondary routes', fakeAsync(
      inject([Router], (router: Router) => {
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([
          {
            path: 'team/:id',
            component: TeamCmp,
            children: [
              {path: 'user/:name', component: UserCmp},
              {path: 'simple', component: SimpleCmp, outlet: 'right'},
            ],
          },
        ]);

        router.navigateByUrl('/team/22/(user/victor//right:simple)');
        advance(fixture);

        expect(fixture.nativeElement).toHaveText('team 22 [ user victor, right: simple ]');
      }),
    ));

    it('should support secondary routes in separate commands', fakeAsync(
      inject([Router], (router: Router) => {
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([
          {
            path: 'team/:id',
            component: TeamCmp,
            children: [
              {path: 'user/:name', component: UserCmp},
              {path: 'simple', component: SimpleCmp, outlet: 'right'},
            ],
          },
        ]);

        router.navigateByUrl('/team/22/user/victor');
        advance(fixture);
        router.navigate(['team/22', {outlets: {right: 'simple'}}]);
        advance(fixture);

        expect(fixture.nativeElement).toHaveText('team 22 [ user victor, right: simple ]');
      }),
    ));

    it('should support secondary routes as child of empty path parent', fakeAsync(
      inject([Router], (router: Router) => {
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([
          {
            path: '',
            component: TeamCmp,
            children: [{path: 'simple', component: SimpleCmp, outlet: 'right'}],
          },
        ]);

        router.navigateByUrl('/(right:simple)');
        advance(fixture);

        expect(fixture.nativeElement).toHaveText('team  [ , right: simple ]');
      }),
    ));

    it('should deactivate outlets', fakeAsync(
      inject([Router], (router: Router) => {
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([
          {
            path: 'team/:id',
            component: TeamCmp,
            children: [
              {path: 'user/:name', component: UserCmp},
              {path: 'simple', component: SimpleCmp, outlet: 'right'},
            ],
          },
        ]);

        router.navigateByUrl('/team/22/(user/victor//right:simple)');
        advance(fixture);

        router.navigateByUrl('/team/22/user/victor');
        advance(fixture);

        expect(fixture.nativeElement).toHaveText('team 22 [ user victor, right:  ]');
      }),
    ));

    it('should deactivate nested outlets', fakeAsync(
      inject([Router], (router: Router) => {
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([
          {
            path: 'team/:id',
            component: TeamCmp,
            children: [
              {path: 'user/:name', component: UserCmp},
              {path: 'simple', component: SimpleCmp, outlet: 'right'},
            ],
          },
          {path: '', component: BlankCmp},
        ]);

        router.navigateByUrl('/team/22/(user/victor//right:simple)');
        advance(fixture);

        router.navigateByUrl('/');
        advance(fixture);

        expect(fixture.nativeElement).toHaveText('');
      }),
    ));

    it('should set query params and fragment', fakeAsync(
      inject([Router], (router: Router) => {
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([{path: 'query', component: QueryParamsAndFragmentCmp}]);

        router.navigateByUrl('/query?name=1#fragment1');
        advance(fixture);
        expect(fixture.nativeElement).toHaveText('query: 1 fragment: fragment1');

        router.navigateByUrl('/query?name=2#fragment2');
        advance(fixture);
        expect(fixture.nativeElement).toHaveText('query: 2 fragment: fragment2');
      }),
    ));

    it('should handle empty or missing fragments', fakeAsync(
      inject([Router], (router: Router) => {
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([{path: 'query', component: QueryParamsAndFragmentCmp}]);

        router.navigateByUrl('/query#');
        advance(fixture);
        expect(fixture.nativeElement).toHaveText('query:  fragment: ');

        router.navigateByUrl('/query');
        advance(fixture);
        expect(fixture.nativeElement).toHaveText('query:  fragment: null');
      }),
    ));

    it('should ignore null and undefined query params', fakeAsync(
      inject([Router], (router: Router) => {
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([{path: 'query', component: EmptyQueryParamsCmp}]);

        router.navigate(['query'], {queryParams: {name: 1, age: null, page: undefined}});
        advance(fixture);
        const cmp = fixture.debugElement.children[1].componentInstance;
        expect(cmp.recordedParams).toEqual([{name: '1'}]);
      }),
    ));

    it('should throw an error when one of the commands is null/undefined', fakeAsync(
      inject([Router], (router: Router) => {
        createRoot(router, RootCmp);

        router.resetConfig([{path: 'query', component: EmptyQueryParamsCmp}]);

        expect(() => router.navigate([undefined, 'query'])).toThrowError(
          /The requested path contains undefined segment at index 0/,
        );
      }),
    ));

    it('should push params only when they change', fakeAsync(
      inject([Router], (router: Router) => {
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([
          {
            path: 'team/:id',
            component: TeamCmp,
            children: [{path: 'user/:name', component: UserCmp}],
          },
        ]);

        router.navigateByUrl('/team/22/user/victor');
        advance(fixture);
        const team = fixture.debugElement.children[1].componentInstance;
        const user = fixture.debugElement.children[1].children[1].componentInstance;

        expect(team.recordedParams).toEqual([{id: '22'}]);
        expect(team.snapshotParams).toEqual([{id: '22'}]);
        expect(user.recordedParams).toEqual([{name: 'victor'}]);
        expect(user.snapshotParams).toEqual([{name: 'victor'}]);

        router.navigateByUrl('/team/22/user/fedor');
        advance(fixture);

        expect(team.recordedParams).toEqual([{id: '22'}]);
        expect(team.snapshotParams).toEqual([{id: '22'}]);
        expect(user.recordedParams).toEqual([{name: 'victor'}, {name: 'fedor'}]);
        expect(user.snapshotParams).toEqual([{name: 'victor'}, {name: 'fedor'}]);
      }),
    ));

    it('should work when navigating to /', fakeAsync(
      inject([Router], (router: Router) => {
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([
          {path: '', pathMatch: 'full', component: SimpleCmp},
          {path: 'user/:name', component: UserCmp},
        ]);

        router.navigateByUrl('/user/victor');
        advance(fixture);

        expect(fixture.nativeElement).toHaveText('user victor');

        router.navigateByUrl('/');
        advance(fixture);

        expect(fixture.nativeElement).toHaveText('simple');
      }),
    ));

    it('should cancel in-flight navigations', fakeAsync(
      inject([Router], (router: Router) => {
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([{path: 'user/:name', component: UserCmp}]);

        const recordedEvents: Event[] = [];
        router.events.forEach((e) => recordedEvents.push(e));

        router.navigateByUrl('/user/init');
        advance(fixture);

        const user = fixture.debugElement.children[1].componentInstance;

        let r1: any, r2: any;
        router.navigateByUrl('/user/victor').then((_) => (r1 = _));
        router.navigateByUrl('/user/fedor').then((_) => (r2 = _));
        advance(fixture);

        expect(r1).toEqual(false); // returns false because it was canceled
        expect(r2).toEqual(true); // returns true because it was successful

        expect(fixture.nativeElement).toHaveText('user fedor');
        expect(user.recordedParams).toEqual([{name: 'init'}, {name: 'fedor'}]);

        expectEvents(recordedEvents, [
          [NavigationStart, '/user/init'],
          [RoutesRecognized, '/user/init'],
          [GuardsCheckStart, '/user/init'],
          [ChildActivationStart],
          [ActivationStart],
          [GuardsCheckEnd, '/user/init'],
          [ResolveStart, '/user/init'],
          [ResolveEnd, '/user/init'],
          [ActivationEnd],
          [ChildActivationEnd],
          [NavigationEnd, '/user/init'],

          [NavigationStart, '/user/victor'],
          [NavigationCancel, '/user/victor'],

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
      }),
    ));

    it('should properly set currentNavigation when cancelling in-flight navigations', fakeAsync(
      inject([Router], (router: Router) => {
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([{path: 'user/:name', component: UserCmp}]);

        router.navigateByUrl('/user/init');
        advance(fixture);

        router.navigateByUrl('/user/victor');
        expect(router.getCurrentNavigation()).not.toBe(null);
        router.navigateByUrl('/user/fedor');
        // Due to https://github.com/angular/angular/issues/29389, this would be `false`
        // when running a second navigation.
        expect(router.getCurrentNavigation()).not.toBe(null);
        advance(fixture);

        expect(router.getCurrentNavigation()).toBe(null);
        expect(fixture.nativeElement).toHaveText('user fedor');
      }),
    ));

    it('should handle failed navigations gracefully', fakeAsync(
      inject([Router], (router: Router) => {
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
      }),
    ));

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
            withNavigationErrorHandler(() => (coreInject(Handler).handlerCalled = true)),
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
              errorHandler: () => new RedirectCommand(coreInject(Router).parseUrl('/error')),
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
            withNavigationErrorHandler(
              () => new RedirectCommand(coreInject(Router).parseUrl('/error')),
            ),
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
        const router: Router = TestBed.inject(Router);
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
        const router: Router = TestBed.inject(Router);
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
      TestBed.configureTestingModule({
        providers: [{provide: 'returnsFalse', useValue: () => false}],
      });

      const router: Router = TestBed.inject(Router);
      const location = TestBed.inject(Location);

      const fixture = createRoot(router, RootCmp);

      router.resetConfig([
        {path: 'simple', component: SimpleCmp},
        {
          path: 'throwing',
          loadChildren: jasmine.createSpy('doesnotmatter'),
          canLoad: ['returnsFalse'],
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

    it('should recover from malformed uri errors', fakeAsync(
      inject([Router, Location], (router: Router, location: Location) => {
        router.resetConfig([{path: 'simple', component: SimpleCmp}]);
        const fixture = createRoot(router, RootCmp);
        router.navigateByUrl('/invalid/url%with%percent');
        advance(fixture);
        expect(location.path()).toEqual('');
      }),
    ));

    it('should not swallow errors', fakeAsync(
      inject([Router], (router: Router) => {
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([{path: 'simple', component: SimpleCmp}]);

        router.navigateByUrl('/invalid');
        expect(() => advance(fixture)).toThrow();

        router.navigateByUrl('/invalid2');
        expect(() => advance(fixture)).toThrow();
      }),
    ));

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

    it('should replace state when path is equal to current path', fakeAsync(
      inject([Router, Location], (router: Router, location: Location) => {
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([
          {
            path: 'team/:id',
            component: TeamCmp,
            children: [
              {path: 'simple', component: SimpleCmp},
              {path: 'user/:name', component: UserCmp},
            ],
          },
        ]);

        router.navigateByUrl('/team/33/simple');
        advance(fixture);

        router.navigateByUrl('/team/22/user/victor');
        advance(fixture);

        router.navigateByUrl('/team/22/user/victor');
        advance(fixture);

        location.back();
        advance(fixture);
        expect(location.path()).toEqual('/team/33/simple');
      }),
    ));

    it('should handle componentless paths', fakeAsync(
      inject([Router, Location], (router: Router, location: Location) => {
        const fixture = createRoot(router, RootCmpWithTwoOutlets);

        router.resetConfig([
          {
            path: 'parent/:id',
            children: [
              {path: 'simple', component: SimpleCmp},
              {path: 'user/:name', component: UserCmp, outlet: 'right'},
            ],
          },
          {path: 'user/:name', component: UserCmp},
        ]);

        // navigate to a componentless route
        router.navigateByUrl('/parent/11/(simple//right:user/victor)');
        advance(fixture);
        expect(location.path()).toEqual('/parent/11/(simple//right:user/victor)');
        expect(fixture.nativeElement).toHaveText('primary [simple] right [user victor]');

        // navigate to the same route with different params (reuse)
        router.navigateByUrl('/parent/22/(simple//right:user/fedor)');
        advance(fixture);
        expect(location.path()).toEqual('/parent/22/(simple//right:user/fedor)');
        expect(fixture.nativeElement).toHaveText('primary [simple] right [user fedor]');

        // navigate to a normal route (check deactivation)
        router.navigateByUrl('/user/victor');
        advance(fixture);
        expect(location.path()).toEqual('/user/victor');
        expect(fixture.nativeElement).toHaveText('primary [user victor] right []');

        // navigate back to a componentless route
        router.navigateByUrl('/parent/11/(simple//right:user/victor)');
        advance(fixture);
        expect(location.path()).toEqual('/parent/11/(simple//right:user/victor)');
        expect(fixture.nativeElement).toHaveText('primary [simple] right [user victor]');
      }),
    ));

    it('should not deactivate aux routes when navigating from a componentless routes', fakeAsync(
      inject([Router, Location], (router: Router, location: Location) => {
        const fixture = createRoot(router, TwoOutletsCmp);

        router.resetConfig([
          {path: 'simple', component: SimpleCmp},
          {path: 'componentless', children: [{path: 'simple', component: SimpleCmp}]},
          {path: 'user/:name', outlet: 'aux', component: UserCmp},
        ]);

        router.navigateByUrl('/componentless/simple(aux:user/victor)');
        advance(fixture);
        expect(location.path()).toEqual('/componentless/simple(aux:user/victor)');
        expect(fixture.nativeElement).toHaveText('[ simple, aux: user victor ]');

        router.navigateByUrl('/simple(aux:user/victor)');
        advance(fixture);
        expect(location.path()).toEqual('/simple(aux:user/victor)');
        expect(fixture.nativeElement).toHaveText('[ simple, aux: user victor ]');
      }),
    ));

    it('should emit an event when an outlet gets activated', fakeAsync(() => {
      @Component({
        selector: 'container',
        template: `<router-outlet (activate)="recordActivate($event)" (deactivate)="recordDeactivate($event)"></router-outlet>`,
        standalone: false,
      })
      class Container {
        activations: any[] = [];
        deactivations: any[] = [];

        recordActivate(component: any): void {
          this.activations.push(component);
        }

        recordDeactivate(component: any): void {
          this.deactivations.push(component);
        }
      }

      TestBed.configureTestingModule({declarations: [Container]});

      const router: Router = TestBed.inject(Router);

      const fixture = createRoot(router, Container);
      const cmp = fixture.componentInstance;

      router.resetConfig([
        {path: 'blank', component: BlankCmp},
        {path: 'simple', component: SimpleCmp},
      ]);

      cmp.activations = [];
      cmp.deactivations = [];

      router.navigateByUrl('/blank');
      advance(fixture);

      expect(cmp.activations.length).toEqual(1);
      expect(cmp.activations[0] instanceof BlankCmp).toBe(true);

      router.navigateByUrl('/simple');
      advance(fixture);

      expect(cmp.activations.length).toEqual(2);
      expect(cmp.activations[1] instanceof SimpleCmp).toBe(true);
      expect(cmp.deactivations.length).toEqual(1);
      expect(cmp.deactivations[0] instanceof BlankCmp).toBe(true);
    }));

    it('should update url and router state before activating components', fakeAsync(
      inject([Router], (router: Router) => {
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([{path: 'cmp', component: ComponentRecordingRoutePathAndUrl}]);

        router.navigateByUrl('/cmp');
        advance(fixture);

        const cmp: ComponentRecordingRoutePathAndUrl =
          fixture.debugElement.children[1].componentInstance;

        expect(cmp.url).toBe('/cmp');
        expect(cmp.path.length).toEqual(2);
      }),
    ));

    routeDataIntegrationSuite();
    routerLinkIntegrationSpec();
    redirectsIntegrationSuite();
    guardsIntegrationSuite();
    routerEventsIntegrationSuite();
    routerLinkActiveIntegrationSuite();
    lazyLoadingIntegrationSuite();
    routeReuseIntegrationSuite();
  });
}
