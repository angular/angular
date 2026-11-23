/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {expect} from '@angular/private/testing/matchers';
import {CommonModule, Location} from '@angular/common';
import {Component, OnDestroy, NgModule, InjectionToken, Inject, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {
  RouteReuseStrategy,
  DetachedRouteHandle,
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  NavigationEnd,
  RouterModule,
} from '../../src';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {By} from '@angular/platform-browser';
import {
  BlankCmp,
  RootCmp,
  SimpleCmp,
  TeamCmp,
  UserCmp,
  ROUTER_DIRECTIVES,
  createRoot,
  advance,
} from './integration_helpers';

export async function routeReuseIntegrationSuite() {
  describe('Custom Route Reuse Strategy', () => {
    class AttachDetachReuseStrategy implements RouteReuseStrategy {
      stored: {[k: string]: DetachedRouteHandle} = {};
      pathsToDetach = ['a'];

      shouldDetach(route: ActivatedRouteSnapshot): boolean {
        return (
          typeof route.routeConfig!.path !== 'undefined' &&
          this.pathsToDetach.includes(route.routeConfig!.path)
        );
      }

      store(route: ActivatedRouteSnapshot, detachedTree: DetachedRouteHandle): void {
        this.stored[route.routeConfig!.path!] = detachedTree;
      }

      shouldAttach(route: ActivatedRouteSnapshot): boolean {
        return !!this.stored[route.routeConfig!.path!];
      }

      retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
        return this.stored[route.routeConfig!.path!];
      }

      shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        return future.routeConfig === curr.routeConfig;
      }
    }

    class ShortLifecycle implements RouteReuseStrategy {
      shouldDetach(route: ActivatedRouteSnapshot): boolean {
        return false;
      }
      store(route: ActivatedRouteSnapshot, detachedTree: DetachedRouteHandle): void {}
      shouldAttach(route: ActivatedRouteSnapshot): boolean {
        return false;
      }
      retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
        return null;
      }
      shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        if (future.routeConfig !== curr.routeConfig) {
          return false;
        }

        if (Object.keys(future.params).length !== Object.keys(curr.params).length) {
          return false;
        }

        return Object.keys(future.params).every((k) => future.params[k] === curr.params[k]);
      }
    }

    it('should be injectable', () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: RouteReuseStrategy, useClass: AttachDetachReuseStrategy},
          provideRouter([]),
        ],
      });

      const router = TestBed.inject(Router);

      expect(router.routeReuseStrategy).toBeInstanceOf(AttachDetachReuseStrategy);
    });

    it('should emit an event when an outlet gets attached/detached', async () => {
      @Component({
        template: `<router-outlet
          (attach)="recordAttached($event)"
          (detach)="recordDetached($event)"
        ></router-outlet>`,
        imports: [ROUTER_DIRECTIVES],
      })
      class Container {
        attachedComponents: unknown[] = [];
        detachedComponents: unknown[] = [];

        recordAttached(component: unknown): void {
          this.attachedComponents.push(component);
        }

        recordDetached(component: unknown): void {
          this.detachedComponents.push(component);
        }
      }

      TestBed.configureTestingModule({
        providers: [{provide: RouteReuseStrategy, useClass: AttachDetachReuseStrategy}],
      });

      const router = TestBed.inject(Router);
      const fixture = await createRoot(router, Container);
      const cmp = fixture.componentInstance;

      router.resetConfig([
        {path: 'a', component: BlankCmp},
        {path: 'b', component: SimpleCmp},
      ]);

      cmp.attachedComponents = [];
      cmp.detachedComponents = [];

      router.navigateByUrl('/a');
      await advance(fixture);
      expect(cmp.attachedComponents.length).toEqual(0);
      expect(cmp.detachedComponents.length).toEqual(0);

      router.navigateByUrl('/b');
      await advance(fixture);
      expect(cmp.attachedComponents.length).toEqual(0);
      expect(cmp.detachedComponents.length).toEqual(1);
      expect(cmp.detachedComponents[0] instanceof BlankCmp).toBe(true);

      // the route will be reused by the `RouteReuseStrategy`
      router.navigateByUrl('/a');
      await advance(fixture);
      expect(cmp.attachedComponents.length).toEqual(1);
      expect(cmp.attachedComponents[0] instanceof BlankCmp).toBe(true);
      expect(cmp.detachedComponents.length).toEqual(1);
      expect(cmp.detachedComponents[0] instanceof BlankCmp).toBe(true);
    });

    it('should support attaching & detaching fragments', async () => {
      const router = TestBed.inject(Router);
      const location = TestBed.inject(Location);
      const fixture = await createRoot(router, RootCmp);

      router.routeReuseStrategy = new AttachDetachReuseStrategy();
      (router.routeReuseStrategy as AttachDetachReuseStrategy).pathsToDetach = ['a', 'b'];
      spyOn(router.routeReuseStrategy, 'retrieve').and.callThrough();

      router.resetConfig([
        {
          path: 'a',
          component: TeamCmp,
          children: [{path: 'b', component: SimpleCmp}],
        },
        {path: 'c', component: UserCmp},
      ]);

      router.navigateByUrl('/a/b');
      await advance(fixture);
      const teamCmp = fixture.debugElement.children[1].componentInstance;
      const simpleCmp = fixture.debugElement.children[1].children[1].componentInstance;
      expect(location.path()).toEqual('/a/b');
      expect(teamCmp).toBeDefined();
      expect(simpleCmp).toBeDefined();
      expect(router.routeReuseStrategy.retrieve).not.toHaveBeenCalled();

      router.navigateByUrl('/c');
      await advance(fixture);
      expect(location.path()).toEqual('/c');
      expect(fixture.debugElement.children[1].componentInstance).toBeInstanceOf(UserCmp);
      // We have still not encountered a route that should be reattached
      expect(router.routeReuseStrategy.retrieve).not.toHaveBeenCalled();

      router.navigateByUrl('/a;p=1/b;p=2');
      await advance(fixture);
      // We retrieve both the stored route snapshots
      expect(router.routeReuseStrategy.retrieve).toHaveBeenCalledTimes(4);
      const teamCmp2 = fixture.debugElement.children[1].componentInstance;
      const simpleCmp2 = fixture.debugElement.children[1].children[1].componentInstance;
      expect(location.path()).toEqual('/a;p=1/b;p=2');
      expect(teamCmp2).toBe(teamCmp);
      expect(simpleCmp2).toBe(simpleCmp);

      expect(teamCmp.route).toBe(router.routerState.root.firstChild);
      expect(teamCmp.route.snapshot).toBe(router.routerState.snapshot.root.firstChild);
      expect(teamCmp.route.snapshot.params).toEqual({p: '1'});
      expect(teamCmp.route.firstChild.snapshot.params).toEqual({p: '2'});
      expect(teamCmp.recordedParams).toEqual([{}, {p: '1'}]);
    });

    it('should support shorter lifecycles', async () => {
      const router = TestBed.inject(Router);
      const location = TestBed.inject(Location);
      const fixture = await createRoot(router, RootCmp);
      router.routeReuseStrategy = new ShortLifecycle();

      router.resetConfig([{path: 'a', component: SimpleCmp}]);

      router.navigateByUrl('/a');
      await advance(fixture);
      const simpleCmp1 = fixture.debugElement.children[1].componentInstance;
      expect(location.path()).toEqual('/a');

      router.navigateByUrl('/a;p=1');
      await advance(fixture);
      expect(location.path()).toEqual('/a;p=1');
      const simpleCmp2 = fixture.debugElement.children[1].componentInstance;
      expect(simpleCmp1).not.toBe(simpleCmp2);
    });

    it('should not mount the component of the previously reused route when the outlet was not instantiated at the time of route activation', async () => {
      @Component({
        template:
          '<div *ngIf="isToolpanelShowing()"><router-outlet name="toolpanel"></router-outlet></div>',
        imports: [CommonModule, ROUTER_DIRECTIVES],
      })
      class RootCmpWithCondOutlet implements OnDestroy {
        private subscription: Subscription;
        public isToolpanelShowing = signal(false);

        constructor(router: Router) {
          this.subscription = router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe(() =>
              this.isToolpanelShowing.set(!!router.parseUrl(router.url).root.children['toolpanel']),
            );
        }

        public ngOnDestroy(): void {
          this.subscription.unsubscribe();
        }
      }

      @Component({
        template: 'Tool 1 showing',
      })
      class Tool1Component {}

      @Component({
        template: 'Tool 2 showing',
      })
      class Tool2Component {}

      TestBed.configureTestingModule({
        providers: [
          provideRouter([
            {path: 'a', outlet: 'toolpanel', component: Tool1Component},
            {path: 'b', outlet: 'toolpanel', component: Tool2Component},
          ]),
        ],
      });

      const router: Router = TestBed.inject(Router);
      router.routeReuseStrategy = new AttachDetachReuseStrategy();

      const fixture = await createRoot(router, RootCmpWithCondOutlet);

      // Activate 'tool-1'
      router.navigate([{outlets: {toolpanel: 'a'}}]);
      await advance(fixture);
      expect(fixture).toContainComponent(Tool1Component, '(a)');

      // Deactivate 'tool-1'
      router.navigate([{outlets: {toolpanel: null}}]);
      await advance(fixture);
      expect(fixture).not.toContainComponent(Tool1Component, '(b)');

      // Activate 'tool-1'
      router.navigate([{outlets: {toolpanel: 'a'}}]);
      await advance(fixture);
      expect(fixture).toContainComponent(Tool1Component, '(c)');

      // Deactivate 'tool-1'
      router.navigate([{outlets: {toolpanel: null}}]);
      await advance(fixture);
      expect(fixture).not.toContainComponent(Tool1Component, '(d)');

      // Activate 'tool-2'
      router.navigate([{outlets: {toolpanel: 'b'}}]);
      await advance(fixture);
      expect(fixture).toContainComponent(Tool2Component, '(e)');
    });

    it('should not remount a destroyed component', async () => {
      @Component({
        template: '<div *ngIf="showRouterOutlet()"><router-outlet></router-outlet></div>',
        imports: [CommonModule, ROUTER_DIRECTIVES],
      })
      class RootCmpWithCondOutlet {
        public showRouterOutlet = signal(true);
      }

      TestBed.configureTestingModule({
        providers: [
          {provide: RouteReuseStrategy, useClass: AttachDetachReuseStrategy},
          provideRouter([
            {path: 'a', component: SimpleCmp},
            {path: 'b', component: BlankCmp},
          ]),
        ],
      });

      const router: Router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmpWithCondOutlet);

      // Activate 'a'
      router.navigate(['a']);
      await advance(fixture);
      expect(fixture.debugElement.query(By.directive(SimpleCmp))).toBeTruthy();

      // Deactivate 'a' and detach the route
      router.navigate(['b']);
      await advance(fixture);
      expect(fixture.debugElement.query(By.directive(SimpleCmp))).toBeNull();

      // Activate 'a' again, the route should be re-attached
      router.navigate(['a']);
      await advance(fixture);
      expect(fixture.debugElement.query(By.directive(SimpleCmp))).toBeTruthy();

      // Hide the router-outlet, SimpleCmp should be destroyed
      fixture.componentInstance.showRouterOutlet.set(false);
      await advance(fixture);
      expect(fixture.debugElement.query(By.directive(SimpleCmp))).toBeNull();

      // Show the router-outlet, SimpleCmp should be re-created
      fixture.componentInstance.showRouterOutlet.set(true);
      await advance(fixture);
      expect(fixture.debugElement.query(By.directive(SimpleCmp))).toBeTruthy();
    });

    it('should allow to attach parent route with fresh child route', async () => {
      const CREATED_COMPS = new InjectionToken<string[]>('CREATED_COMPS');

      @Component({
        template: `<router-outlet></router-outlet>`,
        imports: [ROUTER_DIRECTIVES],
      })
      class Root {}

      @Component({
        template: `<router-outlet></router-outlet>`,
        imports: [ROUTER_DIRECTIVES],
      })
      class Parent {
        constructor(@Inject(CREATED_COMPS) createdComps: string[]) {
          createdComps.push('parent');
        }
      }

      @Component({
        template: `child`,
      })
      class Child {
        constructor(@Inject(CREATED_COMPS) createdComps: string[]) {
          createdComps.push('child');
        }
      }

      TestBed.configureTestingModule({
        providers: [
          {provide: RouteReuseStrategy, useClass: AttachDetachReuseStrategy},
          {provide: CREATED_COMPS, useValue: []},
          provideRouter([
            {path: 'a', component: Parent, children: [{path: 'b', component: Child}]},
            {path: 'c', component: SimpleCmp},
          ]),
        ],
      });

      const router = TestBed.inject(Router);
      const fixture = await createRoot(router, Root);
      const createdComps = TestBed.inject(CREATED_COMPS);

      expect(createdComps).toEqual([]);

      router.navigateByUrl('/a/b');
      await advance(fixture);
      expect(createdComps).toEqual(['parent', 'child']);

      router.navigateByUrl('/c');
      await advance(fixture);
      expect(createdComps).toEqual(['parent', 'child']);

      // 'a' parent route will be reused by the `RouteReuseStrategy`, child 'b' should be
      // recreated
      router.navigateByUrl('/a/b');
      await advance(fixture);
      expect(createdComps).toEqual(['parent', 'child', 'child']);
    });

    it('should render child routes on reused list when outer shell is destroyed and recreated', async () => {
      // https://github.com/angular/angular/issues/57285

      @Component({template: '<router-outlet></router-outlet>', imports: [ROUTER_DIRECTIVES]})
      class Root {}

      @Component({
        template: '<router-outlet></router-outlet>',
        imports: [ROUTER_DIRECTIVES],
      })
      class EventsShellCmp {}

      @Component({
        template: '<router-outlet></router-outlet>',
        imports: [ROUTER_DIRECTIVES],
      })
      class EventListCmp {}

      @Component({
        template: '<router-outlet></router-outlet>',
        imports: [ROUTER_DIRECTIVES],
      })
      class EventDetailCmp {}

      @Component({template: 'edit'})
      class EventEditCmp {}

      @Component({template: 'chats'})
      class ChatsCmp {}

      class ReusableStrategy implements RouteReuseStrategy {
        private handles = new Map<object, DetachedRouteHandle>();

        shouldDetach(route: ActivatedRouteSnapshot): boolean {
          return !!route.routeConfig?.data?.['reusable'];
        }
        store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
          if (route.routeConfig && handle) {
            this.handles.set(route.routeConfig, handle);
          } else if (route.routeConfig) {
            this.handles.delete(route.routeConfig);
          }
        }
        shouldAttach(route: ActivatedRouteSnapshot): boolean {
          return !!(route.routeConfig && this.handles.has(route.routeConfig));
        }
        retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
          return (route.routeConfig && this.handles.get(route.routeConfig)) ?? null;
        }
        shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
          return future.routeConfig === curr.routeConfig;
        }
      }

      TestBed.configureTestingModule({
        providers: [
          {provide: RouteReuseStrategy, useClass: ReusableStrategy},
          provideRouter([
            {
              path: 'events',
              component: EventsShellCmp,
              children: [
                {
                  path: '',
                  data: {reusable: true},
                  component: EventListCmp,
                  children: [
                    {
                      path: ':id',
                      data: {reusable: true},
                      component: EventDetailCmp,
                      children: [{path: 'edit', component: EventEditCmp}],
                    },
                  ],
                },
              ],
            },
            {path: 'chats', component: ChatsCmp},
          ]),
        ],
      });
      const router = TestBed.inject(Router);
      const fixture = await createRoot(router, Root);

      router.navigateByUrl('/chats');
      await advance(fixture);

      router.navigateByUrl('/events');
      await advance(fixture);
      expect(fixture.debugElement.query(By.directive(EventListCmp))).toBeTruthy();

      router.navigateByUrl('/chats');
      await advance(fixture);

      // Shell is recreated and the stored list is re-attached into it.
      router.navigateByUrl('/events');
      await advance(fixture);
      expect(fixture.debugElement.query(By.directive(EventListCmp))).toBeTruthy();

      router.navigateByUrl('/events/1/edit');
      await advance(fixture);
      expect(fixture.debugElement.query(By.directive(EventEditCmp))).toBeTruthy();
    });

    it('should render child routes of a reused tab after a sibling tab was shown in the same outlet', async () => {
      // https://github.com/angular/angular/issues/57285 (sibling outlet case)

      @Component({template: '<router-outlet></router-outlet>', imports: [ROUTER_DIRECTIVES]})
      class Root {}

      @Component({
        template: '<router-outlet></router-outlet>',
        imports: [ROUTER_DIRECTIVES],
      })
      class TabsShellCmp {}

      @Component({
        template: '<router-outlet></router-outlet>',
        imports: [ROUTER_DIRECTIVES],
      })
      class Tab1Cmp {}

      @Component({template: 'tab1-inner'})
      class Tab1InnerCmp {}

      @Component({
        template: '<router-outlet></router-outlet>',
        imports: [ROUTER_DIRECTIVES],
      })
      class Tab2Cmp {}

      @Component({template: 'tab2-inner'})
      class Tab2InnerCmp {}

      class ReusableStrategy implements RouteReuseStrategy {
        private handles = new Map<object, DetachedRouteHandle>();

        shouldDetach(route: ActivatedRouteSnapshot): boolean {
          return !!route.routeConfig?.data?.['reusable'];
        }
        store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
          if (route.routeConfig && handle) {
            this.handles.set(route.routeConfig, handle);
          } else if (route.routeConfig) {
            this.handles.delete(route.routeConfig);
          }
        }
        shouldAttach(route: ActivatedRouteSnapshot): boolean {
          return !!(route.routeConfig && this.handles.has(route.routeConfig));
        }
        retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
          return (route.routeConfig && this.handles.get(route.routeConfig)) ?? null;
        }
        shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
          return future.routeConfig === curr.routeConfig;
        }
      }

      TestBed.configureTestingModule({
        providers: [
          {provide: RouteReuseStrategy, useClass: ReusableStrategy},
          provideRouter([
            {
              path: 'tabs',
              component: TabsShellCmp,
              children: [
                {
                  path: 'tab1',
                  data: {reusable: true},
                  component: Tab1Cmp,
                  children: [{path: 'inner', component: Tab1InnerCmp}],
                },
                {
                  path: 'tab2',
                  component: Tab2Cmp,
                  children: [{path: 'inner', component: Tab2InnerCmp}],
                },
              ],
            },
          ]),
        ],
      });

      const router = TestBed.inject(Router);
      const fixture = await createRoot(router, Root);

      router.navigateByUrl('/tabs/tab1/inner');
      await advance(fixture);
      expect(fixture.debugElement.query(By.directive(Tab1InnerCmp))).toBeTruthy();

      router.navigateByUrl('/tabs/tab2/inner');
      await advance(fixture);
      expect(fixture.debugElement.query(By.directive(Tab2InnerCmp))).toBeTruthy();
      expect(fixture.debugElement.query(By.directive(Tab1InnerCmp))).toBeNull();

      router.navigateByUrl('/tabs/tab1/inner');
      await advance(fixture);
      expect(router.url).toEqual('/tabs/tab1/inner');
      expect(fixture.debugElement.query(By.directive(Tab1InnerCmp))).toBeTruthy();
    });

    it('should not try to detach the outlet of a route that does not get to attach a component', async () => {
      @Component({
        template: `<router-outlet></router-outlet>`,
        imports: [ROUTER_DIRECTIVES],
      })
      class Root {}

      @Component({
        template: 'Component A',
        standalone: false,
      })
      class ComponentA {}

      @Component({
        template: 'Component B',
      })
      class ComponentB {}

      @NgModule({
        declarations: [ComponentA],
        imports: [RouterModule.forChild([{path: '', component: ComponentA}])],
      })
      class LoadedModule {}

      TestBed.configureTestingModule({
        providers: [
          {provide: RouteReuseStrategy, useClass: AttachDetachReuseStrategy},
          provideRouter([
            {path: 'a', loadChildren: () => LoadedModule},
            {path: 'b', component: ComponentB},
          ]),
        ],
      });

      const router = TestBed.inject(Router);
      const strategy = TestBed.inject(RouteReuseStrategy);
      const fixture = await createRoot(router, Root);

      spyOn(strategy, 'shouldDetach').and.callThrough();

      router.navigateByUrl('/a');
      await advance(fixture);

      // Deactivate 'a'
      // 'shouldDetach' should not be called for the componentless route
      router.navigateByUrl('/b');
      await advance(fixture);
      expect(strategy.shouldDetach).toHaveBeenCalledTimes(1);
    });
  });
}
