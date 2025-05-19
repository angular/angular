/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {By} from '@angular/platform-browser';
import {LocationStrategy, HashLocationStrategy, Location} from '@angular/common';
import {
  inject as coreInject,
  Component,
  NgModule,
  NgModuleRef,
  Injectable,
  ViewChildren,
  QueryList,
} from '@angular/core';
import {fakeAsync, inject, TestBed} from '@angular/core/testing';
import {expect} from '@angular/private/testing/matchers';
import {
  Router,
  Event,
  RouterModule,
  ActivatedRoute,
  RouteConfigLoadStart,
  RouteConfigLoadEnd,
  NavigationStart,
  NavigationError,
  PreloadingStrategy,
  PreloadAllModules,
  RouterPreloader,
  UrlHandlingStrategy,
  UrlTree,
  UrlSegmentGroup,
  PRIMARY_OUTLET,
  RouterEvent,
  RoutesRecognized,
  GuardsCheckStart,
  GuardsCheckEnd,
  ResolveStart,
  ResolveEnd,
  NavigationEnd,
  NavigationSkipped,
  provideRouter,
  withRouterConfig,
  RouterLink,
} from '../../index';
import {getLoadedRoutes} from '../../src/router_devtools';
import {
  createRoot,
  RootCmp,
  BlankCmp,
  advance,
  TeamCmp,
  UserCmp,
  SimpleCmp,
  expectEvents,
} from './integration_helpers';

export function lazyLoadingIntegrationSuite() {
  describe('lazy loading', () => {
    it('works', fakeAsync(
      inject([Router, Location], (router: Router, location: Location) => {
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

        @NgModule({
          declarations: [ParentLazyLoadedComponent, ChildLazyLoadedComponent],
          imports: [
            RouterModule.forChild([
              {
                path: 'loaded',
                component: ParentLazyLoadedComponent,
                children: [{path: 'child', component: ChildLazyLoadedComponent}],
              },
            ]),
          ],
        })
        class LoadedModule {}

        const fixture = createRoot(router, RootCmp);

        router.resetConfig([{path: 'lazy', loadChildren: () => LoadedModule}]);

        router.navigateByUrl('/lazy/loaded/child');
        advance(fixture);

        expect(location.path()).toEqual('/lazy/loaded/child');
        expect(fixture.nativeElement).toHaveText('lazy-loaded-parent [lazy-loaded-child]');
      }),
    ));

    it('should have 2 injector trees: module and element', fakeAsync(
      inject([Router, Location], (router: Router, location: Location) => {
        @Component({
          selector: 'lazy',
          template: 'parent[<router-outlet></router-outlet>]',
          viewProviders: [{provide: 'shadow', useValue: 'from parent component'}],
          standalone: false,
        })
        class Parent {}

        @Component({
          selector: 'lazy',
          template: 'child',
          standalone: false,
        })
        class Child {}

        @NgModule({
          declarations: [Parent],
          imports: [
            RouterModule.forChild([
              {
                path: 'parent',
                component: Parent,
                children: [{path: 'child', loadChildren: () => ChildModule}],
              },
            ]),
          ],
          providers: [
            {provide: 'moduleName', useValue: 'parent'},
            {provide: 'fromParent', useValue: 'from parent'},
          ],
        })
        class ParentModule {}

        @NgModule({
          declarations: [Child],
          imports: [RouterModule.forChild([{path: '', component: Child}])],
          providers: [
            {provide: 'moduleName', useValue: 'child'},
            {provide: 'fromChild', useValue: 'from child'},
            {provide: 'shadow', useValue: 'from child module'},
          ],
        })
        class ChildModule {}

        const fixture = createRoot(router, RootCmp);
        router.resetConfig([{path: 'lazy', loadChildren: () => ParentModule}]);
        router.navigateByUrl('/lazy/parent/child');
        advance(fixture);
        expect(location.path()).toEqual('/lazy/parent/child');
        expect(fixture.nativeElement).toHaveText('parent[child]');

        const pInj = fixture.debugElement.query(By.directive(Parent)).injector!;
        const cInj = fixture.debugElement.query(By.directive(Child)).injector!;

        expect(pInj.get('moduleName')).toEqual('parent');
        expect(pInj.get('fromParent')).toEqual('from parent');
        expect(pInj.get(Parent)).toBeInstanceOf(Parent);
        expect(pInj.get('fromChild', null)).toEqual(null);
        expect(pInj.get(Child, null)).toEqual(null);

        expect(cInj.get('moduleName')).toEqual('child');
        expect(cInj.get('fromParent')).toEqual('from parent');
        expect(cInj.get('fromChild')).toEqual('from child');
        expect(cInj.get(Parent)).toBeInstanceOf(Parent);
        expect(cInj.get(Child)).toBeInstanceOf(Child);
        // The child module can not shadow the parent component
        expect(cInj.get('shadow')).toEqual('from parent component');

        const pmInj = pInj.get(NgModuleRef).injector;
        const cmInj = cInj.get(NgModuleRef).injector;

        expect(pmInj.get('moduleName')).toEqual('parent');
        expect(cmInj.get('moduleName')).toEqual('child');

        expect(pmInj.get(Parent, '-')).toEqual('-');
        expect(cmInj.get(Parent, '-')).toEqual('-');
        expect(pmInj.get(Child, '-')).toEqual('-');
        expect(cmInj.get(Child, '-')).toEqual('-');
      }),
    ));

    // https://github.com/angular/angular/issues/12889
    it('should create a single instance of lazy-loaded modules', fakeAsync(
      inject([Router, Location], (router: Router, location: Location) => {
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

        @NgModule({
          declarations: [ParentLazyLoadedComponent, ChildLazyLoadedComponent],
          imports: [
            RouterModule.forChild([
              {
                path: 'loaded',
                component: ParentLazyLoadedComponent,
                children: [{path: 'child', component: ChildLazyLoadedComponent}],
              },
            ]),
          ],
        })
        class LoadedModule {
          static instances = 0;
          constructor() {
            LoadedModule.instances++;
          }
        }

        const fixture = createRoot(router, RootCmp);
        router.resetConfig([{path: 'lazy', loadChildren: () => LoadedModule}]);
        router.navigateByUrl('/lazy/loaded/child');
        advance(fixture);
        expect(fixture.nativeElement).toHaveText('lazy-loaded-parent [lazy-loaded-child]');
        expect(LoadedModule.instances).toEqual(1);
      }),
    ));

    // https://github.com/angular/angular/issues/13870
    it('should create a single instance of guards for lazy-loaded modules', fakeAsync(
      inject([Router, Location], (router: Router, location: Location) => {
        @Injectable()
        class Service {}

        @Injectable()
        class Resolver {
          constructor(public service: Service) {}
          resolve() {
            return this.service;
          }
        }

        @Component({
          selector: 'lazy',
          template: 'lazy',
          standalone: false,
        })
        class LazyLoadedComponent {
          resolvedService: Service;
          constructor(
            public injectedService: Service,
            route: ActivatedRoute,
          ) {
            this.resolvedService = route.snapshot.data['service'];
          }
        }

        @NgModule({
          declarations: [LazyLoadedComponent],
          providers: [Service, Resolver],
          imports: [
            RouterModule.forChild([
              {
                path: 'loaded',
                component: LazyLoadedComponent,
                resolve: {'service': () => coreInject(Resolver).resolve()},
              },
            ]),
          ],
        })
        class LoadedModule {}

        const fixture = createRoot(router, RootCmp);
        router.resetConfig([{path: 'lazy', loadChildren: () => LoadedModule}]);
        router.navigateByUrl('/lazy/loaded');
        advance(fixture);

        expect(fixture.nativeElement).toHaveText('lazy');
        const lzc = fixture.debugElement.query(By.directive(LazyLoadedComponent)).componentInstance;
        expect(lzc.injectedService).toBe(lzc.resolvedService);
      }),
    ));

    it('should emit RouteConfigLoadStart and RouteConfigLoadEnd event when route is lazy loaded', fakeAsync(
      inject([Router, Location], (router: Router, location: Location) => {
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

        @NgModule({
          declarations: [ParentLazyLoadedComponent, ChildLazyLoadedComponent],
          imports: [
            RouterModule.forChild([
              {
                path: 'loaded',
                component: ParentLazyLoadedComponent,
                children: [{path: 'child', component: ChildLazyLoadedComponent}],
              },
            ]),
          ],
        })
        class LoadedModule {}

        const events: Array<RouteConfigLoadStart | RouteConfigLoadEnd> = [];

        router.events.subscribe((e) => {
          if (e instanceof RouteConfigLoadStart || e instanceof RouteConfigLoadEnd) {
            events.push(e);
          }
        });

        const fixture = createRoot(router, RootCmp);
        router.resetConfig([{path: 'lazy', loadChildren: () => LoadedModule}]);

        router.navigateByUrl('/lazy/loaded/child');
        advance(fixture);

        expect(events.length).toEqual(2);
        expect(events[0].toString()).toEqual('RouteConfigLoadStart(path: lazy)');
        expect(events[1].toString()).toEqual('RouteConfigLoadEnd(path: lazy)');
      }),
    ));

    it('throws an error when forRoot() is used in a lazy context', fakeAsync(
      inject([Router, Location], (router: Router, location: Location) => {
        @Component({
          selector: 'lazy',
          template: 'should not show',
          standalone: false,
        })
        class LazyLoadedComponent {}

        @NgModule({
          declarations: [LazyLoadedComponent],
          imports: [RouterModule.forRoot([{path: 'loaded', component: LazyLoadedComponent}])],
        })
        class LoadedModule {}

        const fixture = createRoot(router, RootCmp);

        router.resetConfig([{path: 'lazy', loadChildren: () => LoadedModule}]);

        let recordedError: any = null;
        router.navigateByUrl('/lazy/loaded')!.catch((err) => (recordedError = err));
        advance(fixture);
        expect(recordedError.message).toContain(`NG04007`);
      }),
    ));

    it('should combine routes from multiple modules into a single configuration', fakeAsync(
      inject([Router, Location], (router: Router, location: Location) => {
        @Component({
          selector: 'lazy',
          template: 'lazy-loaded-2',
          standalone: false,
        })
        class LazyComponent2 {}

        @NgModule({
          declarations: [LazyComponent2],
          imports: [RouterModule.forChild([{path: 'loaded', component: LazyComponent2}])],
        })
        class SiblingOfLoadedModule {}

        @Component({
          selector: 'lazy',
          template: 'lazy-loaded-1',
          standalone: false,
        })
        class LazyComponent1 {}

        @NgModule({
          declarations: [LazyComponent1],
          imports: [
            RouterModule.forChild([{path: 'loaded', component: LazyComponent1}]),
            SiblingOfLoadedModule,
          ],
        })
        class LoadedModule {}

        const fixture = createRoot(router, RootCmp);

        router.resetConfig([
          {path: 'lazy1', loadChildren: () => LoadedModule},
          {path: 'lazy2', loadChildren: () => SiblingOfLoadedModule},
        ]);

        router.navigateByUrl('/lazy1/loaded');
        advance(fixture);
        expect(location.path()).toEqual('/lazy1/loaded');

        router.navigateByUrl('/lazy2/loaded');
        advance(fixture);
        expect(location.path()).toEqual('/lazy2/loaded');
      }),
    ));

    it('should allow lazy loaded module in named outlet', fakeAsync(
      inject([Router], (router: Router) => {
        @Component({
          selector: 'lazy',
          template: 'lazy-loaded',
          standalone: false,
        })
        class LazyComponent {}

        @NgModule({
          declarations: [LazyComponent],
          imports: [RouterModule.forChild([{path: '', component: LazyComponent}])],
        })
        class LazyLoadedModule {}

        const fixture = createRoot(router, RootCmp);

        router.resetConfig([
          {
            path: 'team/:id',
            component: TeamCmp,
            children: [
              {path: 'user/:name', component: UserCmp},
              {path: 'lazy', loadChildren: () => LazyLoadedModule, outlet: 'right'},
            ],
          },
        ]);

        router.navigateByUrl('/team/22/user/john');
        advance(fixture);

        expect(fixture.nativeElement).toHaveText('team 22 [ user john, right:  ]');

        router.navigateByUrl('/team/22/(user/john//right:lazy)');
        advance(fixture);

        expect(fixture.nativeElement).toHaveText('team 22 [ user john, right: lazy-loaded ]');
      }),
    ));

    it('should allow componentless named outlet to render children', fakeAsync(
      inject([Router], (router: Router) => {
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([
          {
            path: 'team/:id',
            component: TeamCmp,
            children: [
              {path: 'user/:name', component: UserCmp},
              {path: 'simple', outlet: 'right', children: [{path: '', component: SimpleCmp}]},
            ],
          },
        ]);

        router.navigateByUrl('/team/22/user/john');
        advance(fixture);

        expect(fixture.nativeElement).toHaveText('team 22 [ user john, right:  ]');

        router.navigateByUrl('/team/22/(user/john//right:simple)');
        advance(fixture);

        expect(fixture.nativeElement).toHaveText('team 22 [ user john, right: simple ]');
      }),
    ));

    it('should render loadComponent named outlet with children', fakeAsync(() => {
      const router = TestBed.inject(Router);
      const fixture = createRoot(router, RootCmp);

      @Component({
        imports: [RouterModule],
        template: '[right outlet component: <router-outlet></router-outlet>]',
      })
      class RightComponent {
        constructor(readonly route: ActivatedRoute) {}
      }

      const loadSpy = jasmine.createSpy();
      loadSpy.and.returnValue(RightComponent);

      router.resetConfig([
        {
          path: 'team/:id',
          component: TeamCmp,
          children: [
            {path: 'user/:name', component: UserCmp},
            {
              path: 'simple',
              loadComponent: loadSpy,
              outlet: 'right',
              children: [{path: '', component: SimpleCmp}],
            },
          ],
        },
        {path: '', component: SimpleCmp},
      ]);

      router.navigateByUrl('/team/22/(user/john//right:simple)');
      advance(fixture);

      expect(fixture.nativeElement).toHaveText(
        'team 22 [ user john, right: [right outlet component: simple] ]',
      );
      const rightCmp: RightComponent = fixture.debugElement.query(
        By.directive(RightComponent),
      ).componentInstance;
      // Ensure we don't accidentally add `EmptyOutletComponent` via `standardizeConfig`
      expect(rightCmp.route.routeConfig?.component).not.toBeDefined();

      // Ensure we can navigate away and come back
      router.navigateByUrl('/');
      advance(fixture);
      router.navigateByUrl('/team/22/(user/john//right:simple)');
      advance(fixture);
      expect(fixture.nativeElement).toHaveText(
        'team 22 [ user john, right: [right outlet component: simple] ]',
      );
      expect(loadSpy.calls.count()).toEqual(1);
    }));

    describe('should use the injector of the lazily-loaded configuration', () => {
      class LazyLoadedServiceDefinedInModule {}

      @Component({
        selector: 'eager-parent',
        template: 'eager-parent <router-outlet></router-outlet>',
        standalone: false,
      })
      class EagerParentComponent {}

      @Component({
        selector: 'lazy-parent',
        template: 'lazy-parent <router-outlet></router-outlet>',
        standalone: false,
      })
      class LazyParentComponent {}

      @Component({
        selector: 'lazy-child',
        template: 'lazy-child',
        standalone: false,
      })
      class LazyChildComponent {
        constructor(
          lazy: LazyParentComponent, // should be able to inject lazy/direct parent
          lazyService: LazyLoadedServiceDefinedInModule, // should be able to inject lazy service
          eager: EagerParentComponent, // should use the injector of the location to create a
          // parent
        ) {}
      }

      @NgModule({
        declarations: [LazyParentComponent, LazyChildComponent],
        imports: [
          RouterModule.forChild([
            {
              path: '',
              children: [
                {
                  path: 'lazy-parent',
                  component: LazyParentComponent,
                  children: [{path: 'lazy-child', component: LazyChildComponent}],
                },
              ],
            },
          ]),
        ],
        providers: [LazyLoadedServiceDefinedInModule],
      })
      class LoadedModule {}

      @NgModule({declarations: [EagerParentComponent], imports: [RouterModule.forRoot([])]})
      class TestModule {}

      beforeEach(() => {
        TestBed.configureTestingModule({
          imports: [TestModule],
        });
      });

      it('should use the injector of the lazily-loaded configuration', fakeAsync(
        inject([Router, Location], (router: Router, location: Location) => {
          const fixture = createRoot(router, RootCmp);

          router.resetConfig([
            {
              path: 'eager-parent',
              component: EagerParentComponent,
              children: [{path: 'lazy', loadChildren: () => LoadedModule}],
            },
          ]);

          router.navigateByUrl('/eager-parent/lazy/lazy-parent/lazy-child');
          advance(fixture);

          expect(location.path()).toEqual('/eager-parent/lazy/lazy-parent/lazy-child');
          expect(fixture.nativeElement).toHaveText('eager-parent lazy-parent lazy-child');
        }),
      ));
    });

    it('works when given a callback', fakeAsync(
      inject([Router, Location], (router: Router, location: Location) => {
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

        const fixture = createRoot(router, RootCmp);

        router.resetConfig([{path: 'lazy', loadChildren: () => LoadedModule}]);

        router.navigateByUrl('/lazy/loaded');
        advance(fixture);

        expect(location.path()).toEqual('/lazy/loaded');
        expect(fixture.nativeElement).toHaveText('lazy-loaded');
      }),
    ));

    it('error emit an error when cannot load a config', fakeAsync(
      inject([Router, Location], (router: Router, location: Location) => {
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([
          {
            path: 'lazy',
            loadChildren: () => {
              throw new Error('invalid');
            },
          },
        ]);

        const recordedEvents: Event[] = [];
        router.events.forEach((e) => recordedEvents.push(e));

        router.navigateByUrl('/lazy/loaded')!.catch((s) => {});
        advance(fixture);

        expect(location.path()).toEqual('');

        expectEvents(recordedEvents, [
          [NavigationStart, '/lazy/loaded'],
          [RouteConfigLoadStart],
          [NavigationError, '/lazy/loaded'],
        ]);
      }),
    ));

    it('should emit an error when the lazily-loaded config is not valid', fakeAsync(() => {
      const router = TestBed.inject(Router);
      @NgModule({imports: [RouterModule.forChild([{path: 'loaded'}])]})
      class LoadedModule {}

      const fixture = createRoot(router, RootCmp);
      router.resetConfig([{path: 'lazy', loadChildren: () => LoadedModule}]);

      let recordedError: any = null;
      router.navigateByUrl('/lazy/loaded').catch((err) => (recordedError = err));
      advance(fixture);

      expect(recordedError.message).toContain(
        `Invalid configuration of route 'lazy/loaded'. One of the following must be provided: component, loadComponent, redirectTo, children or loadChildren`,
      );
    }));

    it('should work with complex redirect rules', fakeAsync(
      inject([Router, Location], (router: Router, location: Location) => {
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

        const fixture = createRoot(router, RootCmp);

        router.resetConfig([
          {path: 'lazy', loadChildren: () => LoadedModule},
          {path: '**', redirectTo: 'lazy'},
        ]);

        router.navigateByUrl('/lazy/loaded');
        advance(fixture);

        expect(location.path()).toEqual('/lazy/loaded');
      }),
    ));

    it('should work with wildcard route', fakeAsync(
      inject([Router, Location], (router: Router, location: Location) => {
        @Component({
          selector: 'lazy',
          template: 'lazy-loaded',
          standalone: false,
        })
        class LazyLoadedComponent {}

        @NgModule({
          declarations: [LazyLoadedComponent],
          imports: [RouterModule.forChild([{path: '', component: LazyLoadedComponent}])],
        })
        class LazyLoadedModule {}

        const fixture = createRoot(router, RootCmp);

        router.resetConfig([{path: '**', loadChildren: () => LazyLoadedModule}]);

        router.navigateByUrl('/lazy');
        advance(fixture);

        expect(location.path()).toEqual('/lazy');
        expect(fixture.nativeElement).toHaveText('lazy-loaded');
      }),
    ));

    describe('preloading', () => {
      let log: string[] = [];
      @Component({
        selector: 'lazy',
        template: 'should not show',
        standalone: false,
      })
      class LazyLoadedComponent {}

      @NgModule({
        declarations: [LazyLoadedComponent],
        imports: [RouterModule.forChild([{path: 'LoadedModule2', component: LazyLoadedComponent}])],
      })
      class LoadedModule2 {}

      @NgModule({
        imports: [
          RouterModule.forChild([{path: 'LoadedModule1', loadChildren: () => LoadedModule2}]),
        ],
      })
      class LoadedModule1 {}

      @NgModule({})
      class EmptyModule {}

      beforeEach(() => {
        log.length = 0;
        TestBed.configureTestingModule({
          providers: [
            {provide: PreloadingStrategy, useExisting: PreloadAllModules},
            {
              provide: 'loggingReturnsTrue',
              useValue: () => {
                log.push('loggingReturnsTrue');
                return true;
              },
            },
          ],
        });
        const preloader = TestBed.inject(RouterPreloader);
        preloader.setUpPreloading();
      });

      it('should work', fakeAsync(() => {
        const router = TestBed.inject(Router);
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([
          {path: 'blank', component: BlankCmp},
          {path: 'lazy', loadChildren: () => LoadedModule1},
        ]);

        router.navigateByUrl('/blank');
        advance(fixture);

        const config = router.config;
        const firstRoutes = getLoadedRoutes(config[1])!;

        expect(firstRoutes).toBeDefined();
        expect(firstRoutes[0].path).toEqual('LoadedModule1');

        const secondRoutes = getLoadedRoutes(firstRoutes[0])!;
        expect(secondRoutes).toBeDefined();
        expect(secondRoutes[0].path).toEqual('LoadedModule2');
      }));

      it('should not preload when canLoad is present and does not execute guard', fakeAsync(() => {
        const router = TestBed.inject(Router);
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([
          {path: 'blank', component: BlankCmp},
          {path: 'lazy', loadChildren: () => LoadedModule1, canLoad: ['loggingReturnsTrue']},
        ]);

        router.navigateByUrl('/blank');
        advance(fixture);

        const config = router.config;
        const firstRoutes = getLoadedRoutes(config[1])!;

        expect(firstRoutes).toBeUndefined();
        expect(log.length).toBe(0);
      }));

      it('should allow navigation to modules with no routes', fakeAsync(() => {
        const router = TestBed.inject(Router);
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([{path: 'lazy', loadChildren: () => EmptyModule}]);

        router.navigateByUrl('/lazy');
        advance(fixture);
      }));
    });

    describe('custom url handling strategies', () => {
      class CustomUrlHandlingStrategy implements UrlHandlingStrategy {
        shouldProcessUrl(url: UrlTree): boolean {
          return url.toString().startsWith('/include') || url.toString() === '/';
        }

        extract(url: UrlTree): UrlTree {
          const oldRoot = url.root;
          const children: Record<string, UrlSegmentGroup> = {};
          if (oldRoot.children[PRIMARY_OUTLET]) {
            children[PRIMARY_OUTLET] = oldRoot.children[PRIMARY_OUTLET];
          }
          const root = new UrlSegmentGroup(oldRoot.segments, children);
          return new UrlTree(root, url.queryParams, url.fragment);
        }

        merge(newUrlPart: UrlTree, wholeUrl: UrlTree): UrlTree {
          const oldRoot = newUrlPart.root;

          const children: Record<string, UrlSegmentGroup> = {};
          if (oldRoot.children[PRIMARY_OUTLET]) {
            children[PRIMARY_OUTLET] = oldRoot.children[PRIMARY_OUTLET];
          }

          Object.entries(wholeUrl.root.children).forEach(([k, v]: [string, any]) => {
            if (k !== PRIMARY_OUTLET) {
              children[k] = v;
            }
            v.parent = this;
          });
          const root = new UrlSegmentGroup(oldRoot.segments, children);
          return new UrlTree(root, newUrlPart.queryParams, newUrlPart.fragment);
        }
      }

      beforeEach(() => {
        TestBed.configureTestingModule({
          providers: [
            {provide: UrlHandlingStrategy, useClass: CustomUrlHandlingStrategy},
            {provide: LocationStrategy, useClass: HashLocationStrategy},
          ],
        });
      });

      it('should work', fakeAsync(
        inject([Router, Location], (router: Router, location: Location) => {
          const fixture = createRoot(router, RootCmp);

          router.resetConfig([
            {
              path: 'include',
              component: TeamCmp,
              children: [
                {path: 'user/:name', component: UserCmp},
                {path: 'simple', component: SimpleCmp},
              ],
            },
          ]);

          const events: Event[] = [];
          router.events.subscribe((e) => e instanceof RouterEvent && events.push(e));

          // supported URL
          router.navigateByUrl('/include/user/kate');
          advance(fixture);

          expect(location.path()).toEqual('/include/user/kate');
          expectEvents(events, [
            [NavigationStart, '/include/user/kate'],
            [RoutesRecognized, '/include/user/kate'],
            [GuardsCheckStart, '/include/user/kate'],
            [GuardsCheckEnd, '/include/user/kate'],
            [ResolveStart, '/include/user/kate'],
            [ResolveEnd, '/include/user/kate'],
            [NavigationEnd, '/include/user/kate'],
          ]);
          expect(fixture.nativeElement).toHaveText('team  [ user kate, right:  ]');
          events.splice(0);

          // unsupported URL
          router.navigateByUrl('/exclude/one');
          advance(fixture);

          expect(location.path()).toEqual('/exclude/one');
          expect(Object.keys(router.routerState.root.children).length).toEqual(0);
          expect(fixture.nativeElement).toHaveText('');
          expectEvents(events, [
            [NavigationStart, '/exclude/one'],
            [GuardsCheckStart, '/exclude/one'],
            [GuardsCheckEnd, '/exclude/one'],
            [NavigationEnd, '/exclude/one'],
          ]);
          events.splice(0);

          // another unsupported URL
          location.go('/exclude/two');
          location.historyGo(0);
          advance(fixture);

          expect(location.path()).toEqual('/exclude/two');
          expectEvents(events, [[NavigationSkipped, '/exclude/two']]);
          events.splice(0);

          // back to a supported URL
          location.go('/include/simple');
          location.historyGo(0);
          advance(fixture);

          expect(location.path()).toEqual('/include/simple');
          expect(fixture.nativeElement).toHaveText('team  [ simple, right:  ]');

          expectEvents(events, [
            [NavigationStart, '/include/simple'],
            [RoutesRecognized, '/include/simple'],
            [GuardsCheckStart, '/include/simple'],
            [GuardsCheckEnd, '/include/simple'],
            [ResolveStart, '/include/simple'],
            [ResolveEnd, '/include/simple'],
            [NavigationEnd, '/include/simple'],
          ]);
        }),
      ));

      it('should handle the case when the router takes only the primary url', fakeAsync(
        inject([Router, Location], (router: Router, location: Location) => {
          const fixture = createRoot(router, RootCmp);

          router.resetConfig([
            {
              path: 'include',
              component: TeamCmp,
              children: [
                {path: 'user/:name', component: UserCmp},
                {path: 'simple', component: SimpleCmp},
              ],
            },
          ]);

          const events: Event[] = [];
          router.events.subscribe((e) => e instanceof RouterEvent && events.push(e));

          location.go('/include/user/kate(aux:excluded)');
          location.historyGo(0);
          advance(fixture);

          expect(location.path()).toEqual('/include/user/kate(aux:excluded)');
          expectEvents(events, [
            [NavigationStart, '/include/user/kate'],
            [RoutesRecognized, '/include/user/kate'],
            [GuardsCheckStart, '/include/user/kate'],
            [GuardsCheckEnd, '/include/user/kate'],
            [ResolveStart, '/include/user/kate'],
            [ResolveEnd, '/include/user/kate'],
            [NavigationEnd, '/include/user/kate'],
          ]);
          events.splice(0);

          location.go('/include/user/kate(aux:excluded2)');
          location.historyGo(0);
          advance(fixture);
          expectEvents(events, [[NavigationSkipped, '/include/user/kate(aux:excluded2)']]);
          events.splice(0);

          router.navigateByUrl('/include/simple');
          advance(fixture);

          expect(location.path()).toEqual('/include/simple(aux:excluded2)');
          expectEvents(events, [
            [NavigationStart, '/include/simple'],
            [RoutesRecognized, '/include/simple'],
            [GuardsCheckStart, '/include/simple'],
            [GuardsCheckEnd, '/include/simple'],
            [ResolveStart, '/include/simple'],
            [ResolveEnd, '/include/simple'],
            [NavigationEnd, '/include/simple'],
          ]);
        }),
      ));

      it('should not remove parts of the URL that are not handled by the router when "eager"', fakeAsync(() => {
        TestBed.configureTestingModule({
          providers: [provideRouter([], withRouterConfig({urlUpdateStrategy: 'eager'}))],
        });
        const router = TestBed.inject(Router);
        const location = TestBed.inject(Location);
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([
          {
            path: 'include',
            component: TeamCmp,
            children: [{path: 'user/:name', component: UserCmp}],
          },
        ]);

        location.go('/include/user/kate(aux:excluded)');
        location.historyGo(0);
        advance(fixture);

        expect(location.path()).toEqual('/include/user/kate(aux:excluded)');
      }));
    });

    it('can use `relativeTo` `route.parent` in `routerLink` to close secondary outlet', fakeAsync(() => {
      // Given
      @Component({
        template: '<router-outlet name="secondary"></router-outlet>',
        standalone: false,
      })
      class ChildRootCmp {}

      @Component({
        selector: 'link-cmp',
        template: `<a [relativeTo]="route.parent" [routerLink]="[{outlets: {'secondary': null}}]">link</a>
            <button [relativeTo]="route.parent" [routerLink]="[{outlets: {'secondary': null}}]">link</button>
            `,
        standalone: false,
      })
      class RelativeLinkCmp {
        @ViewChildren(RouterLink) links!: QueryList<RouterLink>;

        constructor(readonly route: ActivatedRoute) {}
      }
      @NgModule({
        declarations: [RelativeLinkCmp, ChildRootCmp],
        imports: [
          RouterModule.forChild([
            {
              path: 'childRoot',
              component: ChildRootCmp,
              children: [{path: 'popup', outlet: 'secondary', component: RelativeLinkCmp}],
            },
          ]),
        ],
      })
      class LazyLoadedModule {}
      const router = TestBed.inject(Router);
      router.resetConfig([{path: 'root', loadChildren: () => LazyLoadedModule}]);

      // When
      router.navigateByUrl('/root/childRoot/(secondary:popup)');
      const fixture = createRoot(router, RootCmp);
      advance(fixture);

      // Then
      const relativeLinkCmp = fixture.debugElement.query(
        By.directive(RelativeLinkCmp),
      ).componentInstance;
      expect(relativeLinkCmp.links.first.urlTree.toString()).toEqual('/root/childRoot');
      expect(relativeLinkCmp.links.last.urlTree.toString()).toEqual('/root/childRoot');
    }));

    it('should ignore empty path for relative links', fakeAsync(
      inject([Router], (router: Router) => {
        @Component({
          selector: 'link-cmp',
          template: `<a [routerLink]="['../simple']">link</a>`,
          standalone: false,
        })
        class RelativeLinkCmp {}

        @NgModule({
          declarations: [RelativeLinkCmp],
          imports: [
            RouterModule.forChild([
              {path: 'foo/bar', children: [{path: '', component: RelativeLinkCmp}]},
            ]),
          ],
        })
        class LazyLoadedModule {}

        const fixture = createRoot(router, RootCmp);

        router.resetConfig([{path: 'lazy', loadChildren: () => LazyLoadedModule}]);

        router.navigateByUrl('/lazy/foo/bar');
        advance(fixture);

        const link = fixture.nativeElement.querySelector('a');
        expect(link.getAttribute('href')).toEqual('/lazy/foo/simple');
      }),
    ));
  });
}
