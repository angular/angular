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
import {TestBed, fakeAsync} from '@angular/core/testing';
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
  createRoot,
  BlankCmp,
  RootCmp,
  SimpleCmp,
  advance,
  TeamCmp,
  UserCmp,
  ROUTER_DIRECTIVES,
} from './integration_helpers';

export function routeReuseIntegrationSuite() {
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

    it('should emit an event when an outlet gets attached/detached', fakeAsync(() => {
      @Component({
        selector: 'container',
        template: `<router-outlet (attach)="recordAttached($event)" (detach)="recordDetached($event)"></router-outlet>`,
        standalone: false,
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
        declarations: [Container],
        providers: [{provide: RouteReuseStrategy, useClass: AttachDetachReuseStrategy}],
      });

      const router = TestBed.inject(Router);
      const fixture = createRoot(router, Container);
      const cmp = fixture.componentInstance;

      router.resetConfig([
        {path: 'a', component: BlankCmp},
        {path: 'b', component: SimpleCmp},
      ]);

      cmp.attachedComponents = [];
      cmp.detachedComponents = [];

      router.navigateByUrl('/a');
      advance(fixture);
      expect(cmp.attachedComponents.length).toEqual(0);
      expect(cmp.detachedComponents.length).toEqual(0);

      router.navigateByUrl('/b');
      advance(fixture);
      expect(cmp.attachedComponents.length).toEqual(0);
      expect(cmp.detachedComponents.length).toEqual(1);
      expect(cmp.detachedComponents[0] instanceof BlankCmp).toBe(true);

      // the route will be reused by the `RouteReuseStrategy`
      router.navigateByUrl('/a');
      advance(fixture);
      expect(cmp.attachedComponents.length).toEqual(1);
      expect(cmp.attachedComponents[0] instanceof BlankCmp).toBe(true);
      expect(cmp.detachedComponents.length).toEqual(1);
      expect(cmp.detachedComponents[0] instanceof BlankCmp).toBe(true);
    }));

    it('should support attaching & detaching fragments', fakeAsync(() => {
      const router = TestBed.inject(Router);
      const location = TestBed.inject(Location);
      const fixture = createRoot(router, RootCmp);

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
      advance(fixture);
      const teamCmp = fixture.debugElement.children[1].componentInstance;
      const simpleCmp = fixture.debugElement.children[1].children[1].componentInstance;
      expect(location.path()).toEqual('/a/b');
      expect(teamCmp).toBeDefined();
      expect(simpleCmp).toBeDefined();
      expect(router.routeReuseStrategy.retrieve).not.toHaveBeenCalled();

      router.navigateByUrl('/c');
      advance(fixture);
      expect(location.path()).toEqual('/c');
      expect(fixture.debugElement.children[1].componentInstance).toBeInstanceOf(UserCmp);
      // We have still not encountered a route that should be reattached
      expect(router.routeReuseStrategy.retrieve).not.toHaveBeenCalled();

      router.navigateByUrl('/a;p=1/b;p=2');
      advance(fixture);
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
    }));

    it('should support shorter lifecycles', fakeAsync(() => {
      const router = TestBed.inject(Router);
      const location = TestBed.inject(Location);
      const fixture = createRoot(router, RootCmp);
      router.routeReuseStrategy = new ShortLifecycle();

      router.resetConfig([{path: 'a', component: SimpleCmp}]);

      router.navigateByUrl('/a');
      advance(fixture);
      const simpleCmp1 = fixture.debugElement.children[1].componentInstance;
      expect(location.path()).toEqual('/a');

      router.navigateByUrl('/a;p=1');
      advance(fixture);
      expect(location.path()).toEqual('/a;p=1');
      const simpleCmp2 = fixture.debugElement.children[1].componentInstance;
      expect(simpleCmp1).not.toBe(simpleCmp2);
    }));

    it('should not mount the component of the previously reused route when the outlet was not instantiated at the time of route activation', fakeAsync(() => {
      @Component({
        selector: 'root-cmp',
        template:
          '<div *ngIf="isToolpanelShowing()"><router-outlet name="toolpanel"></router-outlet></div>',
        standalone: false,
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
        selector: 'tool-1-cmp',
        template: 'Tool 1 showing',
        standalone: false,
      })
      class Tool1Component {}

      @Component({
        selector: 'tool-2-cmp',
        template: 'Tool 2 showing',
        standalone: false,
      })
      class Tool2Component {}

      @NgModule({
        declarations: [RootCmpWithCondOutlet, Tool1Component, Tool2Component],
        imports: [CommonModule, ...ROUTER_DIRECTIVES],
        providers: [
          provideRouter([
            {path: 'a', outlet: 'toolpanel', component: Tool1Component},
            {path: 'b', outlet: 'toolpanel', component: Tool2Component},
          ]),
        ],
      })
      class TestModule {}

      TestBed.configureTestingModule({imports: [TestModule]});

      const router: Router = TestBed.inject(Router);
      router.routeReuseStrategy = new AttachDetachReuseStrategy();

      const fixture = createRoot(router, RootCmpWithCondOutlet);

      // Activate 'tool-1'
      router.navigate([{outlets: {toolpanel: 'a'}}]);
      advance(fixture);
      expect(fixture).toContainComponent(Tool1Component, '(a)');

      // Deactivate 'tool-1'
      router.navigate([{outlets: {toolpanel: null}}]);
      advance(fixture);
      expect(fixture).not.toContainComponent(Tool1Component, '(b)');

      // Activate 'tool-1'
      router.navigate([{outlets: {toolpanel: 'a'}}]);
      advance(fixture);
      expect(fixture).toContainComponent(Tool1Component, '(c)');

      // Deactivate 'tool-1'
      router.navigate([{outlets: {toolpanel: null}}]);
      advance(fixture);
      expect(fixture).not.toContainComponent(Tool1Component, '(d)');

      // Activate 'tool-2'
      router.navigate([{outlets: {toolpanel: 'b'}}]);
      advance(fixture);
      expect(fixture).toContainComponent(Tool2Component, '(e)');
    }));

    it('should not remount a destroyed component', fakeAsync(() => {
      @Component({
        selector: 'root-cmp',
        template: '<div *ngIf="showRouterOutlet()"><router-outlet></router-outlet></div>',
        standalone: false,
      })
      class RootCmpWithCondOutlet {
        public showRouterOutlet = signal(true);
      }

      @NgModule({
        declarations: [RootCmpWithCondOutlet],
        imports: [CommonModule, ...ROUTER_DIRECTIVES],
        providers: [
          {provide: RouteReuseStrategy, useClass: AttachDetachReuseStrategy},
          provideRouter([
            {path: 'a', component: SimpleCmp},
            {path: 'b', component: BlankCmp},
          ]),
        ],
      })
      class TestModule {}
      TestBed.configureTestingModule({imports: [TestModule]});

      const router: Router = TestBed.inject(Router);
      const fixture = createRoot(router, RootCmpWithCondOutlet);

      // Activate 'a'
      router.navigate(['a']);
      advance(fixture);
      expect(fixture.debugElement.query(By.directive(SimpleCmp))).toBeTruthy();

      // Deactivate 'a' and detach the route
      router.navigate(['b']);
      advance(fixture);
      expect(fixture.debugElement.query(By.directive(SimpleCmp))).toBeNull();

      // Activate 'a' again, the route should be re-attached
      router.navigate(['a']);
      advance(fixture);
      expect(fixture.debugElement.query(By.directive(SimpleCmp))).toBeTruthy();

      // Hide the router-outlet, SimpleCmp should be destroyed
      fixture.componentInstance.showRouterOutlet.set(false);
      advance(fixture);
      expect(fixture.debugElement.query(By.directive(SimpleCmp))).toBeNull();

      // Show the router-outlet, SimpleCmp should be re-created
      fixture.componentInstance.showRouterOutlet.set(true);
      advance(fixture);
      expect(fixture.debugElement.query(By.directive(SimpleCmp))).toBeTruthy();
    }));

    it('should allow to attach parent route with fresh child route', fakeAsync(() => {
      const CREATED_COMPS = new InjectionToken<string[]>('CREATED_COMPS');

      @Component({
        selector: 'root',
        template: `<router-outlet></router-outlet>`,
        standalone: false,
      })
      class Root {}

      @Component({
        selector: 'parent',
        template: `<router-outlet></router-outlet>`,
        standalone: false,
      })
      class Parent {
        constructor(@Inject(CREATED_COMPS) createdComps: string[]) {
          createdComps.push('parent');
        }
      }

      @Component({
        selector: 'child',
        template: `child`,
        standalone: false,
      })
      class Child {
        constructor(@Inject(CREATED_COMPS) createdComps: string[]) {
          createdComps.push('child');
        }
      }

      @NgModule({
        declarations: [Root, Parent, Child],
        imports: [CommonModule, ...ROUTER_DIRECTIVES],
        providers: [
          {provide: RouteReuseStrategy, useClass: AttachDetachReuseStrategy},
          {provide: CREATED_COMPS, useValue: []},
          provideRouter([
            {path: 'a', component: Parent, children: [{path: 'b', component: Child}]},
            {path: 'c', component: SimpleCmp},
          ]),
        ],
      })
      class TestModule {}
      TestBed.configureTestingModule({imports: [TestModule]});

      const router = TestBed.inject(Router);
      const fixture = createRoot(router, Root);
      const createdComps = TestBed.inject(CREATED_COMPS);

      expect(createdComps).toEqual([]);

      router.navigateByUrl('/a/b');
      advance(fixture);
      expect(createdComps).toEqual(['parent', 'child']);

      router.navigateByUrl('/c');
      advance(fixture);
      expect(createdComps).toEqual(['parent', 'child']);

      // 'a' parent route will be reused by the `RouteReuseStrategy`, child 'b' should be
      // recreated
      router.navigateByUrl('/a/b');
      advance(fixture);
      expect(createdComps).toEqual(['parent', 'child', 'child']);
    }));

    it('should not try to detach the outlet of a route that does not get to attach a component', fakeAsync(() => {
      @Component({
        selector: 'root',
        template: `<router-outlet></router-outlet>`,
        standalone: false,
      })
      class Root {}

      @Component({
        selector: 'component-a',
        template: 'Component A',
        standalone: false,
      })
      class ComponentA {}

      @Component({
        selector: 'component-b',
        template: 'Component B',
        standalone: false,
      })
      class ComponentB {}

      @NgModule({
        declarations: [ComponentA],
        imports: [RouterModule.forChild([{path: '', component: ComponentA}])],
      })
      class LoadedModule {}

      @NgModule({
        declarations: [Root, ComponentB],
        imports: [ROUTER_DIRECTIVES],
        providers: [
          {provide: RouteReuseStrategy, useClass: AttachDetachReuseStrategy},
          provideRouter([
            {path: 'a', loadChildren: () => LoadedModule},
            {path: 'b', component: ComponentB},
          ]),
        ],
      })
      class TestModule {}

      TestBed.configureTestingModule({imports: [TestModule]});

      const router = TestBed.inject(Router);
      const strategy = TestBed.inject(RouteReuseStrategy);
      const fixture = createRoot(router, Root);

      spyOn(strategy, 'shouldDetach').and.callThrough();

      router.navigateByUrl('/a');
      advance(fixture);

      // Deactivate 'a'
      // 'shouldDetach' should not be called for the componentless route
      router.navigateByUrl('/b');
      advance(fixture);
      expect(strategy.shouldDetach).toHaveBeenCalledTimes(1);
    }));
  });
}
