/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Component, inject, NgModule, Injectable} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {Location} from '@angular/common';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  ActivatedRoute,
  Router,
  RouterEvent,
  NavigationStart,
  RoutesRecognized,
  GuardsCheckStart,
  GuardsCheckEnd,
  ResolveStart,
  NavigationError,
  NavigationCancel,
  NavigationCancellationCode,
  RouterModule,
  ResolveFn,
} from '../../src';
import {map} from 'rxjs/operators';
import {EMPTY, Observer, Observable, of} from 'rxjs';
import {By} from '@angular/platform-browser';
import {
  RootCmp,
  BlankCmp,
  RootCmpWithTwoOutlets,
  RouteCmp,
  SimpleCmp,
  expectEvents,
  CollectParamsCmp,
  WrapperCmp,
  createRoot,
  advance,
} from './integration_helpers';

export function routeDataIntegrationSuite() {
  describe('data', () => {
    class ResolveSix {
      resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): number {
        return 6;
      }
    }

    @Component({
      selector: 'nested-cmp',
      template: 'nested-cmp',
      standalone: false,
    })
    class NestedComponentWithData {
      data: any = [];
      constructor(private route: ActivatedRoute) {
        route.data.forEach((d) => this.data.push(d));
      }
    }

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          {provide: 'resolveTwo', useValue: (a: any, b: any) => 2},
          {provide: 'resolveFour', useValue: (a: any, b: any) => 4},
          {provide: 'resolveSix', useClass: ResolveSix},
          {provide: 'resolveError', useValue: (a: any, b: any) => Promise.reject('error')},
          {provide: 'resolveNullError', useValue: (a: any, b: any) => Promise.reject(null)},
          {provide: 'resolveEmpty', useValue: (a: any, b: any) => EMPTY},
          {provide: 'numberOfUrlSegments', useValue: (a: any, b: any) => a.url.length},
        ],
      });
    });

    it('should provide resolved data', async () => {
      const router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmpWithTwoOutlets);

      router.resetConfig([
        {
          path: 'parent/:id',
          data: {one: 1},
          resolve: {two: 'resolveTwo'},
          children: [
            {path: '', data: {three: 3}, resolve: {four: 'resolveFour'}, component: RouteCmp},
            {
              path: '',
              data: {five: 5},
              resolve: {six: 'resolveSix'},
              component: RouteCmp,
              outlet: 'right',
            },
          ],
        },
      ]);

      router.navigateByUrl('/parent/1');
      await advance(fixture);

      const primaryCmp = fixture.debugElement.children[1].componentInstance;
      const rightCmp = fixture.debugElement.children[3].componentInstance;

      expect(primaryCmp.route.snapshot.data).toEqual({one: 1, two: 2, three: 3, four: 4});
      expect(rightCmp.route.snapshot.data).toEqual({one: 1, two: 2, five: 5, six: 6});

      const primaryRecorded: any[] = [];
      primaryCmp.route.data.forEach((rec: any) => primaryRecorded.push(rec));

      const rightRecorded: any[] = [];
      rightCmp.route.data.forEach((rec: any) => rightRecorded.push(rec));

      router.navigateByUrl('/parent/2');
      await advance(fixture);

      expect(primaryRecorded).toEqual([{one: 1, three: 3, two: 2, four: 4}]);
      expect(rightRecorded).toEqual([{one: 1, five: 5, two: 2, six: 6}]);
    });

    it('should handle errors', async () => {
      const router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([
        {path: 'simple', component: SimpleCmp, resolve: {error: 'resolveError'}},
      ]);

      const recordedEvents: any[] = [];
      router.events.subscribe((e) => e instanceof RouterEvent && recordedEvents.push(e));

      let e: any = null;
      router.navigateByUrl('/simple')!.catch((error) => (e = error));
      await advance(fixture);

      expectEvents(recordedEvents, [
        [NavigationStart, '/simple'],
        [RoutesRecognized, '/simple'],
        [GuardsCheckStart, '/simple'],
        [GuardsCheckEnd, '/simple'],
        [ResolveStart, '/simple'],
        [NavigationError, '/simple'],
      ]);

      expect(e).toEqual('error');
    });

    it('should handle empty errors', async () => {
      const router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([
        {path: 'simple', component: SimpleCmp, resolve: {error: 'resolveNullError'}},
      ]);

      const recordedEvents: any[] = [];
      router.events.subscribe((e) => e instanceof RouterEvent && recordedEvents.push(e));

      let e: any = 'some value';
      router.navigateByUrl('/simple').catch((error) => (e = error));
      await advance(fixture);

      expect(e).toEqual(null);
    });

    it('should not navigate when all resolvers return empty result', async () => {
      const router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([
        {
          path: 'simple',
          component: SimpleCmp,
          resolve: {e1: 'resolveEmpty', e2: 'resolveEmpty'},
        },
      ]);

      const recordedEvents: any[] = [];
      router.events.subscribe((e) => e instanceof RouterEvent && recordedEvents.push(e));

      let e: any = null;
      router.navigateByUrl('/simple').catch((error) => (e = error));
      await advance(fixture);

      expectEvents(recordedEvents, [
        [NavigationStart, '/simple'],
        [RoutesRecognized, '/simple'],
        [GuardsCheckStart, '/simple'],
        [GuardsCheckEnd, '/simple'],
        [ResolveStart, '/simple'],
        [NavigationCancel, '/simple'],
      ]);

      expect((recordedEvents[recordedEvents.length - 1] as NavigationCancel).code).toBe(
        NavigationCancellationCode.NoDataFromResolver,
      );

      expect(e).toEqual(null);
    });

    it('should not navigate when at least one resolver returns empty result', async () => {
      const router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([
        {path: 'simple', component: SimpleCmp, resolve: {e1: 'resolveTwo', e2: 'resolveEmpty'}},
      ]);

      const recordedEvents: any[] = [];
      router.events.subscribe((e) => e instanceof RouterEvent && recordedEvents.push(e));

      let e: any = null;
      router.navigateByUrl('/simple').catch((error) => (e = error));
      await advance(fixture);

      expectEvents(recordedEvents, [
        [NavigationStart, '/simple'],
        [RoutesRecognized, '/simple'],
        [GuardsCheckStart, '/simple'],
        [GuardsCheckEnd, '/simple'],
        [ResolveStart, '/simple'],
        [NavigationCancel, '/simple'],
      ]);

      expect(e).toEqual(null);
    });

    it('should not navigate when all resolvers for a child route from forChild() returns empty result', async () => {
      const router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);

      @Component({
        selector: 'lazy-cmp',
        template: 'lazy-loaded-1',
        standalone: false,
      })
      class LazyComponent1 {}

      @NgModule({
        declarations: [LazyComponent1],
        imports: [
          RouterModule.forChild([
            {
              path: 'loaded',
              component: LazyComponent1,
              resolve: {e1: 'resolveEmpty', e2: 'resolveEmpty'},
            },
          ]),
        ],
      })
      class LoadedModule {}

      router.resetConfig([{path: 'lazy', loadChildren: () => LoadedModule}]);

      const recordedEvents: any[] = [];
      router.events.subscribe((e) => e instanceof RouterEvent && recordedEvents.push(e));

      let e: any = null;
      router.navigateByUrl('lazy/loaded').catch((error) => (e = error));
      await advance(fixture);

      expectEvents(recordedEvents, [
        [NavigationStart, '/lazy/loaded'],
        [RoutesRecognized, '/lazy/loaded'],
        [GuardsCheckStart, '/lazy/loaded'],
        [GuardsCheckEnd, '/lazy/loaded'],
        [ResolveStart, '/lazy/loaded'],
        [NavigationCancel, '/lazy/loaded'],
      ]);

      expect(e).toEqual(null);
    });

    it('should not navigate when at least one resolver for a child route from forChild() returns empty result', async () => {
      const router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);

      @Component({
        selector: 'lazy-cmp',
        template: 'lazy-loaded-1',
        standalone: false,
      })
      class LazyComponent1 {}

      @NgModule({
        declarations: [LazyComponent1],
        imports: [
          RouterModule.forChild([
            {
              path: 'loaded',
              component: LazyComponent1,
              resolve: {e1: 'resolveTwo', e2: 'resolveEmpty'},
            },
          ]),
        ],
      })
      class LoadedModule {}

      router.resetConfig([{path: 'lazy', loadChildren: () => LoadedModule}]);

      const recordedEvents: any[] = [];
      router.events.subscribe((e) => e instanceof RouterEvent && recordedEvents.push(e));

      let e: any = null;
      router.navigateByUrl('lazy/loaded').catch((error) => (e = error));
      await advance(fixture);

      expectEvents(recordedEvents, [
        [NavigationStart, '/lazy/loaded'],
        [RoutesRecognized, '/lazy/loaded'],
        [GuardsCheckStart, '/lazy/loaded'],
        [GuardsCheckEnd, '/lazy/loaded'],
        [ResolveStart, '/lazy/loaded'],
        [NavigationCancel, '/lazy/loaded'],
      ]);

      expect(e).toEqual(null);
    });

    it('should include target snapshot in NavigationError when resolver throws', async () => {
      const router = TestBed.inject(Router);
      const errorMessage = 'throwing resolver';
      @Injectable({providedIn: 'root'})
      class ThrowingResolver {
        resolve() {
          throw new Error(errorMessage);
        }
      }

      let caughtError: NavigationError | undefined;
      router.events.subscribe((e) => {
        if (e instanceof NavigationError) {
          caughtError = e;
        }
      });
      router.resetConfig([
        {path: 'throwing', resolve: {thrower: ThrowingResolver}, component: BlankCmp},
      ]);
      try {
        await router.navigateByUrl('/throwing');
        fail('navigation should throw');
      } catch (e: unknown) {
        expect((e as Error).message).toEqual(errorMessage);
      }

      expect(caughtError).toBeDefined();
      expect(caughtError?.target).toBeDefined();
    });

    it('should preserve resolved data', async () => {
      const router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([
        {
          path: 'parent',
          resolve: {two: 'resolveTwo'},
          children: [
            {path: 'child1', component: CollectParamsCmp},
            {path: 'child2', component: CollectParamsCmp},
          ],
        },
      ]);

      router.navigateByUrl('/parent/child1');
      await advance(fixture);

      router.navigateByUrl('/parent/child2');
      await advance(fixture);

      const cmp: CollectParamsCmp = fixture.debugElement.children[1].componentInstance;
      expect(cmp.route.snapshot.data).toEqual({two: 2});
    });

    it('should override route static data with resolved data', async () => {
      const router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([
        {
          path: '',
          component: NestedComponentWithData,
          resolve: {prop: 'resolveTwo'},
          data: {prop: 'static'},
        },
      ]);

      router.navigateByUrl('/');
      await advance(fixture);
      const cmp = fixture.debugElement.children[1].componentInstance;

      expect(cmp.data).toEqual([{prop: 2}]);
    });

    it('should correctly override inherited route static data with resolved data', async () => {
      const router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([
        {
          path: 'a',
          component: WrapperCmp,
          resolve: {prop2: 'resolveTwo'},
          data: {prop: 'wrapper-a'},
          children: [
            // will inherit data from this child route because it has `path` and its parent has
            // component
            {
              path: 'b',
              data: {prop: 'nested-b'},
              resolve: {prop3: 'resolveFour'},
              children: [
                {
                  path: 'c',
                  children: [
                    {path: '', component: NestedComponentWithData, data: {prop3: 'nested'}},
                  ],
                },
              ],
            },
          ],
        },
      ]);

      router.navigateByUrl('/a/b/c');
      await advance(fixture);

      const pInj = fixture.debugElement.queryAll(By.directive(NestedComponentWithData))[0]
        .injector!;
      const cmp = pInj.get(NestedComponentWithData);
      expect(cmp.data).toEqual([{prop: 'nested-b', prop3: 'nested'}]);
    });

    it('should not override inherited resolved data with inherited static data', async () => {
      const router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([
        {
          path: 'a',
          component: WrapperCmp,
          resolve: {prop2: 'resolveTwo'},
          data: {prop: 'wrapper-a'},
          children: [
            // will inherit data from this child route because it has `path` and its parent has
            // component
            {
              path: 'b',
              data: {prop2: 'parent-b', prop: 'parent-b'},
              children: [
                {
                  path: 'c',
                  resolve: {prop2: 'resolveFour'},
                  children: [
                    {
                      path: '',
                      component: NestedComponentWithData,
                      data: {prop: 'nested-d'},
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]);

      router.navigateByUrl('/a/b/c');
      await advance(fixture);

      const pInj = fixture.debugElement.queryAll(By.directive(NestedComponentWithData))[0]
        .injector!;
      const cmp = pInj.get(NestedComponentWithData);
      expect(cmp.data).toEqual([{prop: 'nested-d', prop2: 4}]);
    });

    it('should not override nested route static data when both are using resolvers', async () => {
      const router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([
        {
          path: 'child',
          component: WrapperCmp,
          resolve: {prop: 'resolveTwo'},
          children: [
            {
              path: '',
              pathMatch: 'full',
              component: NestedComponentWithData,
              resolve: {prop: 'resolveFour'},
            },
          ],
        },
      ]);

      router.navigateByUrl('/child');
      await advance(fixture);

      const pInj = fixture.debugElement.query(By.directive(NestedComponentWithData)).injector!;
      const cmp = pInj.get(NestedComponentWithData);
      expect(cmp.data).toEqual([{prop: 4}]);
    });

    it("should not override child route's static data when both are using static data", async () => {
      const router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([
        {
          path: 'child',
          component: WrapperCmp,
          data: {prop: 'wrapper'},
          children: [
            {
              path: '',
              pathMatch: 'full',
              component: NestedComponentWithData,
              data: {prop: 'inner'},
            },
          ],
        },
      ]);

      router.navigateByUrl('/child');
      await advance(fixture);

      const pInj = fixture.debugElement.query(By.directive(NestedComponentWithData)).injector!;
      const cmp = pInj.get(NestedComponentWithData);
      expect(cmp.data).toEqual([{prop: 'inner'}]);
    });

    it("should not override child route's static data when wrapper is using resolved data and the child route static data", async () => {
      const router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([
        {
          path: 'nested',
          component: WrapperCmp,
          resolve: {prop: 'resolveTwo', prop2: 'resolveSix'},
          data: {prop3: 'wrapper-static', prop4: 'another-static'},
          children: [
            {
              path: '',
              pathMatch: 'full',
              component: NestedComponentWithData,
              data: {prop: 'nested', prop4: 'nested-static'},
            },
          ],
        },
      ]);

      router.navigateByUrl('/nested');
      await advance(fixture);

      const pInj = fixture.debugElement.query(By.directive(NestedComponentWithData)).injector!;
      const cmp = pInj.get(NestedComponentWithData);
      // Issue 34361 - `prop` should contain value defined in `data` object from the nested
      // route.
      expect(cmp.data).toEqual([
        {prop: 'nested', prop2: 6, prop3: 'wrapper-static', prop4: 'nested-static'},
      ]);
    });

    it('should allow guards alter data resolved by routes', async () => {
      const router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([
        {
          path: 'route',
          component: NestedComponentWithData,
          canActivate: [
            (route: ActivatedRouteSnapshot) => {
              route.data = {prop: 10};
              return true;
            },
          ],
        },
      ]);

      router.navigateByUrl('/route');
      await advance(fixture);

      const pInj = fixture.debugElement.query(By.directive(NestedComponentWithData)).injector!;
      const cmp = pInj.get(NestedComponentWithData);
      expect(cmp.data).toEqual([{prop: 10}]);
    });

    it('should rerun resolvers when the urls segments of a wildcard route change', async () => {
      const router = TestBed.inject(Router);
      const location = TestBed.inject(Location);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([
        {
          path: '**',
          component: CollectParamsCmp,
          resolve: {numberOfUrlSegments: 'numberOfUrlSegments'},
        },
      ]);

      router.navigateByUrl('/one/two');
      await advance(fixture);
      const cmp = fixture.debugElement.children[1].componentInstance;

      expect(cmp.route.snapshot.data).toEqual({numberOfUrlSegments: 2});

      router.navigateByUrl('/one/two/three');
      await advance(fixture);

      expect(cmp.route.snapshot.data).toEqual({numberOfUrlSegments: 3});
    });

    describe('should run resolvers for the same route concurrently', () => {
      let log: string[];
      let observer: Observer<unknown>;

      beforeEach(() => {
        log = [];
        TestBed.configureTestingModule({
          providers: [
            {
              provide: 'resolver1',
              useValue: () => {
                const obs$ = new Observable((obs) => {
                  observer = obs;
                  return () => {};
                });
                return obs$.pipe(map(() => log.push('resolver1')));
              },
            },
            {
              provide: 'resolver2',
              useValue: () => {
                return of(null).pipe(
                  map(() => {
                    log.push('resolver2');
                    observer.next(null);
                    observer.complete();
                  }),
                );
              },
            },
          ],
        });
      });

      it('works', async () => {
        const router = TestBed.inject(Router);
        const fixture = await createRoot(router, RootCmp);

        router.resetConfig([
          {
            path: 'a',
            resolve: {
              one: 'resolver1',
              two: 'resolver2',
            },
            component: SimpleCmp,
          },
        ]);

        router.navigateByUrl('/a');
        await advance(fixture);

        expect(log).toEqual(['resolver2', 'resolver1']);
      });
    });

    it('can resolve symbol keys', async () => {
      const router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);
      const symbolKey = Symbol('key');

      router.resetConfig([
        {path: 'simple', component: SimpleCmp, resolve: {[symbolKey]: 'resolveFour'}},
      ]);

      router.navigateByUrl('/simple');
      await advance(fixture);

      expect(router.routerState.root.snapshot.firstChild!.data[symbolKey]).toEqual(4);
    });

    it('should allow resolvers as pure functions', async () => {
      const router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);
      const user = Symbol('user');

      const userResolver: ResolveFn<string> = (route: ActivatedRouteSnapshot) =>
        route.params['user'];
      router.resetConfig([{path: ':user', component: SimpleCmp, resolve: {[user]: userResolver}}]);

      router.navigateByUrl('/atscott');
      await advance(fixture);

      expect(router.routerState.root.snapshot.firstChild!.data[user]).toEqual('atscott');
    });

    it('should allow DI in resolvers as pure functions', async () => {
      const router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);
      const user = Symbol('user');

      @Injectable({providedIn: 'root'})
      class LoginState {
        user = 'atscott';
      }

      router.resetConfig([
        {
          path: '**',
          component: SimpleCmp,
          resolve: {
            [user]: () => inject(LoginState).user,
          },
        },
      ]);

      router.navigateByUrl('/');
      await advance(fixture);

      expect(router.routerState.root.snapshot.firstChild!.data[user]).toEqual('atscott');
    });
  });
}
