/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef, NgModule, Component, DestroyRef, inject, Injectable} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {
  ActivatedRouteSnapshot,
  BaseRouteReuseStrategy,
  DetachedRouteHandle,
  Route,
  RouteReuseStrategy,
  Router,
  RouterOutlet,
  provideRouter,
  withExperimentalAutoCleanupInjectors,
  RouterModule,
  destroyDetachedRouteHandle,
} from '@angular/router';

describe('Route Injector Destruction', () => {
  @Component({
    template: '<router-outlet></router-outlet>',
    standalone: true,
    imports: [RouterOutlet],
  })
  class AppComponent {}

  @Component({template: 'home', standalone: true})
  class HomeComponent {}

  @Component({template: 'away', standalone: true})
  class AwayComponent {}

  @Component({template: 'child', standalone: true})
  class ChildComponent {}

  @Component({template: 'lazy', standalone: true})
  class LazyComponent {}

  @NgModule({
    imports: [RouterModule.forChild([{path: '', component: LazyComponent}])],
  })
  class LazyModule {}

  @Component({template: 'check', standalone: true})
  class DestroyCheckComponent {
    destroyRefCalled = false;
    destroyRef = inject(DestroyRef);

    constructor() {
      this.destroyRef.onDestroy(() => {
        this.destroyRefCalled = true;
      });
    }
  }

  @Injectable({providedIn: 'root'})
  class CustomReuseStrategy extends BaseRouteReuseStrategy {
    storedHandles = new Map<Route, DetachedRouteHandle>();
    shouldDestroyMap = new Map<Route, boolean>();

    override shouldDetach(route: ActivatedRouteSnapshot): boolean {
      return (
        route.routeConfig?.path === 'home' ||
        route.routeConfig?.path === 'check' ||
        route.routeConfig?.path === 'child'
      );
    }

    override store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
      if (route.routeConfig?.path && handle) {
        this.storedHandles.set(route.routeConfig, handle);
      }
    }

    override shouldAttach(route: ActivatedRouteSnapshot): boolean {
      return !!route.routeConfig?.path && !!this.storedHandles.has(route.routeConfig);
    }

    override retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
      return this.storedHandles.get(route.routeConfig!) || null;
    }

    retrieveStoredRouteHandles(): DetachedRouteHandle[] {
      return Array.from(this.storedHandles.values());
    }

    override shouldDestroyInjector(route: Route): boolean {
      // Default to true if not specified, so we don't block destruction by default
      return this.shouldDestroyMap.has(route) ? this.shouldDestroyMap.get(route)! : true;
    }
  }

  let router: Router;
  let strategy: CustomReuseStrategy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {
              path: 'home',
              component: HomeComponent,
              providers: [],
            },
            {
              path: 'away',
              component: AwayComponent,
              providers: [],
            },
            {path: 'check', component: DestroyCheckComponent},
            {
              path: 'parent',
              component: AppComponent,
              providers: [],
              children: [
                {
                  path: 'child',
                  component: ChildComponent,
                  providers: [],
                },
              ],
            },
            {
              path: 'lazy',
              loadChildren: () => Promise.resolve(LazyModule),
            },
          ],
          withExperimentalAutoCleanupInjectors(),
        ),
        {provide: RouteReuseStrategy, useClass: CustomReuseStrategy},
      ],
    });

    router = TestBed.inject(Router);
    strategy = TestBed.inject(RouteReuseStrategy) as CustomReuseStrategy;
    const fixture = TestBed.createComponent(AppComponent);
  });

  it('should NOT destroy injectors by default (when shouldDestroyInjector returns false)', async () => {
    const homeRoute = router.config.find((r) => r.path === 'home')!;
    strategy.shouldDestroyMap.set(homeRoute, false);

    await router.navigateByUrl('/home');
    await whenStable();
    const homeInjector = (homeRoute as any)._injector;
    expect(homeInjector).toBeDefined();

    await router.navigateByUrl('/away');
    await whenStable();

    expect((homeRoute as any)._injector).toBeDefined();
    // @ts-ignore
    expect(homeInjector?.destroyed).toBe(false);
  });

  it('should destroy injectors when shouldDestroyInjector returns true and route is unused', async () => {
    await router.navigateByUrl('/home');
    await whenStable();
    const homeRoute = router.config.find((r) => r.path === 'home')!;
    const homeInjector = (homeRoute as any)._injector;
    expect(homeInjector).toBeDefined();

    await router.navigateByUrl('/away');
    await whenStable();

    // Home is detached (stored), so it should NOT be destroyed yet because it is stored
    // Wait, my strategy stores 'home'.
    // Let's verify it is stored.
    expect(strategy.storedHandles.get(homeRoute)).toBeDefined();
    expect((homeRoute as any)._injector).toBeDefined();
    // @ts-ignore
    expect(homeInjector?.destroyed).toBe(false);

    // Now clear the storage to simulate it being unused
    strategy.storedHandles.clear();
    // Navigate again to trigger cleanup
    // Actually navigate to somewhere else to trigger cleanup
    await router.navigateByUrl('/away?t=2');
    await whenStable();

    expect((homeRoute as any)._injector).toBeUndefined();
    // @ts-ignore
    expect(homeInjector?.destroyed).toBe(true);
  });

  it('should NOT destroy injectors for active routes', async () => {
    await router.navigateByUrl('/home');
    await whenStable();
    const homeRoute = router.config.find((r) => r.path === 'home')!;
    const homeInjector = (homeRoute as any)._injector;
    expect(homeInjector).toBeDefined();

    // Stay on home, maybe change params
    await router.navigateByUrl('/home?t=1');
    await whenStable();

    expect((homeRoute as any)._injector).toBeDefined();
    // @ts-ignore
    expect(homeInjector?.destroyed).toBe(false);
  });

  it('should NOT destroy injectors for parent of active routes', async () => {
    await router.navigateByUrl('/parent/child');
    await whenStable();
    const parentRoute = router.config.find((r) => r.path === 'parent')!;
    const childRoute = parentRoute.children![0];
    const parentInjector = (parentRoute as any)._injector;

    const childInjector = (childRoute as any)._injector;

    expect(parentInjector).toBeDefined();
    expect(childInjector).toBeDefined();

    await router.navigateByUrl('/parent/child?t=1');
    await whenStable();

    expect((parentRoute as any)._injector).toBeDefined();
    // @ts-ignore
    expect(parentInjector?.destroyed).toBe(false);
  });

  it('should NOT destroy injectors for parent of stored routes', async () => {
    router.navigateByUrl('/parent/child');
    await whenStable();
    const parentRoute = router.config.find((r) => r.path === 'parent')!;
    const childRoute = parentRoute.children![0];
    const parentInjector = (parentRoute as any)._injector;
    const childInjector = (childRoute as any)._injector;

    expect(parentInjector).toBeDefined();
    expect(childInjector).toBeDefined();

    // This navigation will cause the `child` route to be stored
    router.navigateByUrl('/away');
    await whenStable();

    // The parent injector should NOT be destroyed because its child is in the reuse store
    expect((parentRoute as any)._injector).toBeDefined();
    // @ts-ignore
    expect(parentInjector?.destroyed).toBe(false);

    // The child injector should also not be destroyed because it is stored.
    expect((childRoute as any)._injector).toBeDefined();
    // @ts-ignore
    expect(childInjector?.destroyed).toBe(false);
  });

  it('should destroy child injectors when parent is destroyed when no child is stored', async () => {
    await router.navigateByUrl('/parent/child');
    await whenStable();
    const parentRoute = router.config.find((r) => r.path === 'parent')!;
    const childRoute = parentRoute.children![0];
    const parentInjector = (parentRoute as any)._injector;
    const childInjector = (childRoute as any)._injector;

    strategy.shouldDetach = () => false;
    await router.navigateByUrl('/away');
    await whenStable();

    // Parent and child should be destroyed
    expect((parentRoute as any)._injector).toBeUndefined();
    expect((childRoute as any)._injector).toBeUndefined();

    // @ts-ignore
    expect(parentInjector?.destroyed).toBe(true);
    // @ts-ignore
    expect(childInjector?.destroyed).toBe(true);
  });

  it('should destroy child injectors when parent is destroyed, even if child strategy would false', async () => {
    await router.navigateByUrl('/parent/child');
    await whenStable();
    const parentRoute = router.config.find((r) => r.path === 'parent')!;
    const childRoute = parentRoute.children![0];
    const parentInjector = (parentRoute as any)._injector;
    const childInjector = (childRoute as any)._injector;

    expect(parentInjector).toBeDefined();
    expect(childInjector).toBeDefined();

    strategy.shouldDetach = () => false;
    // Set strategy to destroy parent but NOT child
    strategy.shouldDestroyMap.set(parentRoute, true);
    strategy.shouldDestroyMap.set(childRoute, false);

    await router.navigateByUrl('/away');
    await whenStable();

    // Both parent and child should be destroyed due to inheritedForceDestroy
    expect((parentRoute as any)._injector).toBeUndefined();
    expect((childRoute as any)._injector).toBeUndefined();

    // @ts-ignore
    expect(parentInjector?.destroyed).toBe(true);
    // @ts-ignore
    expect(childInjector?.destroyed).toBe(true);
  });

  it('should destroy component when destroyDetachedRouteHandle is called', async () => {
    const checkRoute = router.config.find((r) => r.path === 'check')!;
    strategy.shouldDestroyMap.set(checkRoute, false);
    await router.navigateByUrl('/check');

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const component = fixture.debugElement.query(
      By.directive(DestroyCheckComponent),
    ).componentInstance;

    // 1. Navigate away to detach 'check' route
    await router.navigateByUrl('/away');
    fixture.detectChanges();

    // 2. Verify 'check' route is detached and stored
    expect(strategy.storedHandles.get(checkRoute)).toBeDefined();
    expect(component.destroyRefCalled).toBe(false);

    // 3. Manually destroy the handle
    destroyDetachedRouteHandle(strategy.storedHandles.get(checkRoute)!);

    // 4. Verify component is destroyed
    expect(component.destroyRefCalled).toBe(true);
  });

  it('should NOT destroy injectors when withAutoCleanupInjectors is NOT provided', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter(
          [
            {
              path: 'home',
              component: AppComponent,
              providers: [],
            },
            {
              path: 'away',
              component: AppComponent,
              providers: [],
            },
          ],
          // withAutoCleanupInjectors() is OMITTED
        ),
        {provide: RouteReuseStrategy, useClass: CustomReuseStrategy},
      ],
    });

    router = TestBed.inject(Router);
    strategy = TestBed.inject(RouteReuseStrategy) as CustomReuseStrategy;
    const fixture = TestBed.createComponent(AppComponent);

    await router.navigateByUrl('/home');
    await whenStable();
    const homeRoute = router.config.find((r) => r.path === 'home')!;
    const homeInjector = (homeRoute as any)._injector;
    expect(homeInjector).toBeDefined();

    await router.navigateByUrl('/away');
    await whenStable();

    // Should NOT be destroyed because the feature is not enabled
    expect((homeRoute as any)._injector).toBeDefined();
    // @ts-ignore
    expect(homeInjector?.destroyed).toBe(false);
  });

  it('should destroy and recreate lazy loaded injectors while keeping routes', async () => {
    await router.navigateByUrl('/lazy');
    await whenStable();
    const lazyRoute = router.config.find((r) => r.path === 'lazy')!;
    const loadedInjector = (lazyRoute as any)._loadedInjector;
    const loadedRoutes = (lazyRoute as any)._loadedRoutes;

    expect(loadedInjector).toBeDefined();
    expect(loadedRoutes).toBeDefined();
    expect((lazyRoute as any)._loadedNgModuleFactory).toBeDefined();

    // Navigate away
    await router.navigateByUrl('/home');
    await whenStable();

    // _loadedInjector should be destroyed and undefined
    expect((lazyRoute as any)._loadedInjector).toBeUndefined();
    // @ts-ignore
    expect(loadedInjector.destroyed).toBe(true);

    // _loadedRoutes should STILL be defined
    expect((lazyRoute as any)._loadedRoutes).toBe(loadedRoutes);

    // Navigate back
    await router.navigateByUrl('/lazy');
    await whenStable();

    // _loadedInjector should be recreated (new instance)
    const newLoadedInjector = (lazyRoute as any)._loadedInjector;
    expect(newLoadedInjector).toBeDefined();
    expect(newLoadedInjector).not.toBe(loadedInjector);
    // @ts-ignore
    expect(newLoadedInjector.destroyed).toBe(false);

    // _loadedRoutes should be the same
    expect((lazyRoute as any)._loadedRoutes).toBe(loadedRoutes);
  });
});

function whenStable() {
  return TestBed.inject(ApplicationRef).whenStable();
}
