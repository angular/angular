/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Location} from '@angular/common';
import {ɵprovideFakePlatformNavigation} from '@angular/common/testing';
import {
  ChangeDetectionStrategy,
  Component,
  NgModule,
  ɵConsole as Console,
  signal,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {expect} from '@angular/private/testing/matchers';
import {
  ActivationEnd,
  ActivationStart,
  ChildActivationEnd,
  ChildActivationStart,
  Event,
  GuardsCheckEnd,
  GuardsCheckStart,
  NavigationCancel,
  NavigationEnd,
  NavigationStart,
  ResolveEnd,
  ResolveStart,
  Router,
  RouterModule,
  RoutesRecognized,
} from '../../index';

import {provideRouter} from '../../src/provide_router';
import {
  BlankCmp,
  CollectParamsCmp,
  ComponentRecordingRoutePathAndUrl,
  EmptyQueryParamsCmp,
  expectEvents,
  onlyNavigationStartAndEnd,
  OutletInNgIf,
  QueryParamsAndFragmentCmp,
  RootCmp,
  RootCmpWithNamedOutlet,
  RootCmpWithOnInit,
  RootCmpWithTwoOutlets,
  RouteCmp,
  ROUTER_DIRECTIVES,
  SimpleCmp,
  TeamCmp,
  TestModule,
  TwoOutletsCmp,
  UserCmp,
  createRoot,
  advance,
} from './integration_helpers';
import {guardsIntegrationSuite} from './guards.spec';
import {lazyLoadingIntegrationSuite} from './lazy_loading.spec';
import {routeDataIntegrationSuite} from './route_data.spec';
import {routeReuseIntegrationSuite} from './route_reuse_strategy.spec';
import {routerLinkActiveIntegrationSuite} from './router_link_active.spec';
import {routerEventsIntegrationSuite} from './router_events.spec';
import {redirectsIntegrationSuite} from './redirects.spec';
import {routerLinkIntegrationSpec} from './router_links.spec';
import {navigationIntegrationTestSuite} from './navigation.spec';
import {eagerUrlUpdateStrategyIntegrationSuite} from './eager_url_update_strategy.spec';
import {duplicateInFlightNavigationsIntegrationSuite} from './duplicate_in_flight_navigations.spec';
import {navigationErrorsIntegrationSuite} from './navigation_errors.spec';

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

    it('should navigate with a provided config', async () => {
      const router: Router = TestBed.inject(Router);
      const location: Location = TestBed.inject(Location);
      const fixture = await createRoot(router, RootCmp);

      router.navigateByUrl('/simple');
      await advance(fixture);

      expect(location.path()).toEqual('/simple');
    });

    it('should navigate from ngOnInit hook', async () => {
      const router: Router = TestBed.inject(Router);
      const location: Location = TestBed.inject(Location);
      router.resetConfig([
        {path: '', component: SimpleCmp},
        {path: 'one', component: RouteCmp},
      ]);

      const fixture = await createRoot(router, RootCmpWithOnInit);
      expect(location.path()).toEqual('/one');
      expect(fixture.nativeElement).toHaveText('route');
    });

    it('Should work inside ChangeDetectionStrategy.OnPush components', async () => {
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
      const fixture = await createRoot(router, RootCmp);

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

      await advance(fixture);
      router.navigateByUrl('on');
      await advance(fixture);
      router.navigateByUrl('on/push');
      await advance(fixture);

      expect(fixture.nativeElement).toHaveText('it works!');
    });

    it('should not error when no url left and no children are matching', async () => {
      const router: Router = TestBed.inject(Router);
      const location: Location = TestBed.inject(Location);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([
        {
          path: 'team/:id',
          component: TeamCmp,
          children: [{path: 'simple', component: SimpleCmp}],
        },
      ]);

      router.navigateByUrl('/team/33/simple');
      await advance(fixture);

      expect(location.path()).toEqual('/team/33/simple');
      expect(fixture.nativeElement).toHaveText('team 33 [ simple, right:  ]');

      router.navigateByUrl('/team/33');
      await advance(fixture);

      expect(location.path()).toEqual('/team/33');
      expect(fixture.nativeElement).toHaveText('team 33 [ , right:  ]');
    });

    it('should work when an outlet is in an ngIf', async () => {
      const router: Router = TestBed.inject(Router);
      const location: Location = TestBed.inject(Location);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([
        {
          path: 'child',
          component: OutletInNgIf,
          children: [{path: 'simple', component: SimpleCmp}],
        },
      ]);

      router.navigateByUrl('/child/simple');
      await advance(fixture);

      expect(location.path()).toEqual('/child/simple');
    });

    it('should work when an outlet is added/removed', async () => {
      @Component({
        selector: 'someRoot',
        template: `[<div *ngIf="cond()"><router-outlet></router-outlet></div>]`,
        standalone: false,
      })
      class RootCmpWithLink {
        cond = signal(true);
      }
      TestBed.configureTestingModule({declarations: [RootCmpWithLink]});

      const router: Router = TestBed.inject(Router);

      const fixture = await createRoot(router, RootCmpWithLink);

      router.resetConfig([
        {path: 'simple', component: SimpleCmp},
        {path: 'blank', component: BlankCmp},
      ]);

      router.navigateByUrl('/simple');
      await advance(fixture);
      expect(fixture.nativeElement).toHaveText('[simple]');

      fixture.componentInstance.cond.set(false);
      await advance(fixture);
      expect(fixture.nativeElement).toHaveText('[]');

      fixture.componentInstance.cond.set(true);
      await advance(fixture);
      expect(fixture.nativeElement).toHaveText('[simple]');
    });

    it('should update location when navigating', async () => {
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
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([{path: 'record/:id', component: RecordLocationCmp}]);

      router.navigateByUrl('/record/22');
      await advance(fixture);

      const c = fixture.debugElement.children[1].componentInstance;
      expect(location.path()).toEqual('/record/22');
      expect(c.storedPath).toEqual('/record/22');

      router.navigateByUrl('/record/33');
      await advance(fixture);
      expect(location.path()).toEqual('/record/33');
    });

    it('should skip location update when using NavigationExtras.skipLocationChange with navigateByUrl', async () => {
      const router: Router = TestBed.inject(Router);
      const location: Location = TestBed.inject(Location);
      const fixture = TestBed.createComponent(RootCmp);
      await advance(fixture);

      router.resetConfig([{path: 'team/:id', component: TeamCmp}]);

      router.navigateByUrl('/team/22');
      await advance(fixture);
      expect(location.path()).toEqual('/team/22');

      expect(fixture.nativeElement).toHaveText('team 22 [ , right:  ]');

      router.navigateByUrl('/team/33', {skipLocationChange: true});
      await advance(fixture);

      expect(location.path()).toEqual('/team/22');

      expect(fixture.nativeElement).toHaveText('team 33 [ , right:  ]');
    });

    it('should skip location update when using NavigationExtras.skipLocationChange with navigate', async () => {
      const router: Router = TestBed.inject(Router);
      const location: Location = TestBed.inject(Location);
      const fixture = TestBed.createComponent(RootCmp);
      await advance(fixture);

      router.resetConfig([{path: 'team/:id', component: TeamCmp}]);

      router.navigate(['/team/22']);
      await advance(fixture);
      expect(location.path()).toEqual('/team/22');

      expect(fixture.nativeElement).toHaveText('team 22 [ , right:  ]');

      router.navigate(['/team/33'], {skipLocationChange: true});
      await advance(fixture);

      expect(location.path()).toEqual('/team/22');

      expect(fixture.nativeElement).toHaveText('team 33 [ , right:  ]');
    });

    it('should navigate after navigation with skipLocationChange', async () => {
      const router: Router = TestBed.inject(Router);
      const location: Location = TestBed.inject(Location);
      const fixture = TestBed.createComponent(RootCmpWithNamedOutlet);
      await advance(fixture);

      router.resetConfig([{path: 'show', outlet: 'main', component: SimpleCmp}]);

      router.navigate([{outlets: {main: 'show'}}], {skipLocationChange: true});
      await advance(fixture);
      expect(location.path()).toEqual('');

      expect(fixture.nativeElement).toHaveText('main [simple]');

      router.navigate([{outlets: {main: null}}], {skipLocationChange: true});
      await advance(fixture);

      expect(location.path()).toEqual('');

      expect(fixture.nativeElement).toHaveText('main []');
    });

    it('should navigate back and forward', async () => {
      const router: Router = TestBed.inject(Router);
      const location: Location = TestBed.inject(Location);
      const fixture = await createRoot(router, RootCmp);

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
      await advance(fixture);
      expect(location.path()).toEqual('/team/33/simple');
      const simpleNavStart = event!;

      router.navigateByUrl('/team/22/user/victor');
      await advance(fixture);
      const userVictorNavStart = event!;

      location.back();
      await advance(fixture);
      expect(location.path()).toEqual('/team/33/simple');
      expect(event!.navigationTrigger).toEqual('popstate');
      expect(event!.restoredState!.navigationId).toEqual(simpleNavStart.id);

      location.forward();
      await advance(fixture);
      expect(location.path()).toEqual('/team/22/user/victor');
      expect(event!.navigationTrigger).toEqual('popstate');
      expect(event!.restoredState!.navigationId).toEqual(userVictorNavStart.id);
    });

    it('should navigate to the same url when config changes', async () => {
      const router: Router = TestBed.inject(Router);
      const location: Location = TestBed.inject(Location);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([{path: 'a', component: SimpleCmp}]);

      router.navigate(['/a']);
      await advance(fixture);
      expect(location.path()).toEqual('/a');
      expect(fixture.nativeElement).toHaveText('simple');

      router.resetConfig([{path: 'a', component: RouteCmp}]);

      router.navigate(['/a']);
      await advance(fixture);
      expect(location.path()).toEqual('/a');
      expect(fixture.nativeElement).toHaveText('route');
    });

    it('should navigate when locations changes', async () => {
      const router: Router = TestBed.inject(Router);
      const location: Location = TestBed.inject(Location);
      const fixture = await createRoot(router, RootCmp);

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
      await advance(fixture);

      location.go('/team/22/user/fedor');
      location.historyGo(0);
      await advance(fixture);

      location.go('/team/22/user/fedor');
      location.historyGo(0);
      await advance(fixture);

      expect(fixture.nativeElement).toHaveText('team 22 [ user fedor, right:  ]');

      expectEvents(recordedEvents, [
        [NavigationStart, '/team/22/user/victor'],
        [NavigationEnd, '/team/22/user/victor'],
        [NavigationStart, '/team/22/user/fedor'],
        [NavigationEnd, '/team/22/user/fedor'],
      ]);
    });

    it('should update the location when the matched route does not change', async () => {
      const router: Router = TestBed.inject(Router);
      const location: Location = TestBed.inject(Location);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([{path: '**', component: CollectParamsCmp}]);

      router.navigateByUrl('/one/two');
      await advance(fixture);
      const cmp = fixture.debugElement.children[1].componentInstance;
      expect(location.path()).toEqual('/one/two');
      expect(fixture.nativeElement).toHaveText('collect-params');

      expect(cmp.recordedUrls()).toEqual(['one/two']);

      router.navigateByUrl('/three/four');
      await advance(fixture);
      expect(location.path()).toEqual('/three/four');
      expect(fixture.nativeElement).toHaveText('collect-params');
      expect(cmp.recordedUrls()).toEqual(['one/two', 'three/four']);
    });

    it('should support secondary routes', async () => {
      const router: Router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);

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
      await advance(fixture);

      expect(fixture.nativeElement).toHaveText('team 22 [ user victor, right: simple ]');
    });

    it('should support secondary routes in separate commands', async () => {
      const router: Router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);

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
      await advance(fixture);
      router.navigate(['team/22', {outlets: {right: 'simple'}}]);
      await advance(fixture);

      expect(fixture.nativeElement).toHaveText('team 22 [ user victor, right: simple ]');
    });

    it('should support secondary routes as child of empty path parent', async () => {
      const router: Router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([
        {
          path: '',
          component: TeamCmp,
          children: [{path: 'simple', component: SimpleCmp, outlet: 'right'}],
        },
      ]);

      router.navigateByUrl('/(right:simple)');
      await advance(fixture);

      expect(fixture.nativeElement).toHaveText('team  [ , right: simple ]');
    });

    it('should deactivate outlets', async () => {
      const router: Router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);

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
      await advance(fixture);

      router.navigateByUrl('/team/22/user/victor');
      await advance(fixture);

      expect(fixture.nativeElement).toHaveText('team 22 [ user victor, right:  ]');
    });

    it('should deactivate nested outlets', async () => {
      const router: Router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);

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
      await advance(fixture);

      router.navigateByUrl('/');
      await advance(fixture);

      expect(fixture.nativeElement).toHaveText('');
    });

    it('should set query params and fragment', async () => {
      const router: Router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([{path: 'query', component: QueryParamsAndFragmentCmp}]);

      router.navigateByUrl('/query?name=1#fragment1');
      await advance(fixture);
      expect(fixture.nativeElement).toHaveText('query: 1 fragment: fragment1');

      router.navigateByUrl('/query?name=2#fragment2');
      await advance(fixture);
      expect(fixture.nativeElement).toHaveText('query: 2 fragment: fragment2');
    });

    it('should handle empty or missing fragments', async () => {
      const router: Router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([{path: 'query', component: QueryParamsAndFragmentCmp}]);

      router.navigateByUrl('/query#');
      await advance(fixture);
      expect(fixture.nativeElement).toHaveText('query:  fragment: ');

      router.navigateByUrl('/query');
      await advance(fixture);
      expect(fixture.nativeElement).toHaveText('query:  fragment: null');
    });

    it('should ignore null and undefined query params', async () => {
      const router: Router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([{path: 'query', component: EmptyQueryParamsCmp}]);

      router.navigate(['query'], {queryParams: {name: 1, age: null, page: undefined}});
      await advance(fixture);
      const cmp = fixture.debugElement.children[1].componentInstance;
      expect(cmp.recordedParams).toEqual([{name: '1'}]);
    });

    it('should push params only when they change', async () => {
      const router: Router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([
        {
          path: 'team/:id',
          component: TeamCmp,
          children: [{path: 'user/:name', component: UserCmp}],
        },
      ]);

      router.navigateByUrl('/team/22/user/victor');
      await advance(fixture);
      const team = fixture.debugElement.children[1].componentInstance;
      const user = fixture.debugElement.children[1].children[1].componentInstance;

      expect(team.recordedParams).toEqual([{id: '22'}]);
      expect(team.snapshotParams).toEqual([{id: '22'}]);
      expect(user.recordedParams).toEqual([{name: 'victor'}]);
      expect(user.snapshotParams).toEqual([{name: 'victor'}]);

      router.navigateByUrl('/team/22/user/fedor');
      await advance(fixture);

      expect(team.recordedParams).toEqual([{id: '22'}]);
      expect(team.snapshotParams).toEqual([{id: '22'}]);
      expect(user.recordedParams).toEqual([{name: 'victor'}, {name: 'fedor'}]);
      expect(user.snapshotParams).toEqual([{name: 'victor'}, {name: 'fedor'}]);
    });

    it('should work when navigating to /', async () => {
      const router: Router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([
        {path: '', pathMatch: 'full', component: SimpleCmp},
        {path: 'user/:name', component: UserCmp},
      ]);

      router.navigateByUrl('/user/victor');
      await advance(fixture);

      expect(fixture.nativeElement).toHaveText('user victor');

      router.navigateByUrl('/');
      await advance(fixture);

      expect(fixture.nativeElement).toHaveText('simple');
    });

    it('should cancel in-flight navigations', async () => {
      const router: Router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([{path: 'user/:name', component: UserCmp}]);

      const recordedEvents: Event[] = [];
      router.events.forEach((e) => recordedEvents.push(e));

      router.navigateByUrl('/user/init');
      await advance(fixture);

      const user = fixture.debugElement.children[1].componentInstance;

      let r1: any, r2: any;
      router.navigateByUrl('/user/victor').then((_) => (r1 = _));
      router.navigateByUrl('/user/fedor').then((_) => (r2 = _));
      await advance(fixture);

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
    });

    it('should properly set currentNavigation when cancelling in-flight navigations', async () => {
      const router: Router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([{path: 'user/:name', component: UserCmp}]);

      router.navigateByUrl('/user/init');
      await advance(fixture);

      router.navigateByUrl('/user/victor');
      expect(router.getCurrentNavigation()).not.toBe(null);
      router.navigateByUrl('/user/fedor');
      // Due to https://github.com/angular/angular/issues/29389, this would be `false`
      // when running a second navigation.
      expect(router.getCurrentNavigation()).not.toBe(null);
      await advance(fixture);

      expect(router.getCurrentNavigation()).toBe(null);
      expect(fixture.nativeElement).toHaveText('user fedor');
    });

    it('should replace state when path is equal to current path', async () => {
      const router: Router = TestBed.inject(Router);
      const location: Location = TestBed.inject(Location);
      const fixture = await createRoot(router, RootCmp);

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
      await advance(fixture);

      router.navigateByUrl('/team/22/user/victor');
      await advance(fixture);

      router.navigateByUrl('/team/22/user/victor');
      await advance(fixture);

      location.back();
      await advance(fixture);
      expect(location.path()).toEqual('/team/33/simple');
    });

    it('should handle componentless paths', async () => {
      const router: Router = TestBed.inject(Router);
      const location: Location = TestBed.inject(Location);
      const fixture = await createRoot(router, RootCmpWithTwoOutlets);

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
      await advance(fixture);
      expect(location.path()).toEqual('/parent/11/(simple//right:user/victor)');
      expect(fixture.nativeElement).toHaveText('primary [simple] right [user victor]');

      // navigate to the same route with different params (reuse)
      router.navigateByUrl('/parent/22/(simple//right:user/fedor)');
      await advance(fixture);
      expect(location.path()).toEqual('/parent/22/(simple//right:user/fedor)');
      expect(fixture.nativeElement).toHaveText('primary [simple] right [user fedor]');

      // navigate to a normal route (check deactivation)
      router.navigateByUrl('/user/victor');
      await advance(fixture);
      expect(location.path()).toEqual('/user/victor');
      expect(fixture.nativeElement).toHaveText('primary [user victor] right []');

      // navigate back to a componentless route
      router.navigateByUrl('/parent/11/(simple//right:user/victor)');
      await advance(fixture);
      expect(location.path()).toEqual('/parent/11/(simple//right:user/victor)');
      expect(fixture.nativeElement).toHaveText('primary [simple] right [user victor]');
    });

    it('should not deactivate aux routes when navigating from a componentless routes', async () => {
      const router: Router = TestBed.inject(Router);
      const location: Location = TestBed.inject(Location);
      const fixture = await createRoot(router, TwoOutletsCmp);

      router.resetConfig([
        {path: 'simple', component: SimpleCmp},
        {path: 'componentless', children: [{path: 'simple', component: SimpleCmp}]},
        {path: 'user/:name', outlet: 'aux', component: UserCmp},
      ]);

      router.navigateByUrl('/componentless/simple(aux:user/victor)');
      await advance(fixture);
      expect(location.path()).toEqual('/componentless/simple(aux:user/victor)');
      expect(fixture.nativeElement).toHaveText('[ simple, aux: user victor ]');

      router.navigateByUrl('/simple(aux:user/victor)');
      await advance(fixture);
      expect(location.path()).toEqual('/simple(aux:user/victor)');
      expect(fixture.nativeElement).toHaveText('[ simple, aux: user victor ]');
    });

    it('should emit an event when an outlet gets activated', async () => {
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

      const fixture = await createRoot(router, Container);
      const cmp = fixture.componentInstance;

      router.resetConfig([
        {path: 'blank', component: BlankCmp},
        {path: 'simple', component: SimpleCmp},
      ]);

      cmp.activations = [];
      cmp.deactivations = [];

      router.navigateByUrl('/blank');
      await advance(fixture);

      expect(cmp.activations.length).toEqual(1);
      expect(cmp.activations[0] instanceof BlankCmp).toBe(true);

      router.navigateByUrl('/simple');
      await advance(fixture);

      expect(cmp.activations.length).toEqual(2);
      expect(cmp.activations[1] instanceof SimpleCmp).toBe(true);
      expect(cmp.deactivations.length).toEqual(1);
      expect(cmp.deactivations[0] instanceof BlankCmp).toBe(true);
    });

    it('should update url and router state before activating components', async () => {
      const router: Router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([{path: 'cmp', component: ComponentRecordingRoutePathAndUrl}]);

      router.navigateByUrl('/cmp');
      await advance(fixture);

      const cmp: ComponentRecordingRoutePathAndUrl =
        fixture.debugElement.children[1].componentInstance;

      expect(cmp.url).toBe('/cmp');
      expect(cmp.path.length).toEqual(2);
    });

    navigationErrorsIntegrationSuite();
    eagerUrlUpdateStrategyIntegrationSuite();
    duplicateInFlightNavigationsIntegrationSuite();
    navigationIntegrationTestSuite();
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
