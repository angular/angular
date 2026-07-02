/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, DestroyRef, Injectable} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  BaseRouteReuseStrategy,
  DetachedRouteHandle,
  Route,
  RouteReuseStrategy,
  Router,
  destroyDetachedRouteHandle,
  provideRouter,
  ɵwithActivatedRouteInjectors,
} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';

describe('ActivatedRoute local injector', () => {
  @Component({
    template: 'home',
  })
  class HomeComponent {}

  @Component({
    template: 'away',
  })
  class AwayComponent {}

  @Injectable({providedIn: 'root'})
  class CustomReuseStrategy extends BaseRouteReuseStrategy {
    storedHandles = new Map<Route, DetachedRouteHandle>();
    shouldDetachVal = false;
    shouldAttachVal = false;

    override shouldDetach(route: ActivatedRouteSnapshot): boolean {
      return this.shouldDetachVal;
    }

    override store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
      if (route.routeConfig && handle) {
        this.storedHandles.set(route.routeConfig, handle);
      }
    }

    override shouldAttach(route: ActivatedRouteSnapshot): boolean {
      return (
        this.shouldAttachVal && !!route.routeConfig && this.storedHandles.has(route.routeConfig)
      );
    }

    override retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
      return (route.routeConfig && this.storedHandles.get(route.routeConfig)) || null;
    }
  }

  let router: Router;
  let strategy: CustomReuseStrategy;

  async function setUpRouter(routes: Route[]): Promise<RouterTestingHarness> {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, ɵwithActivatedRouteInjectors()),
        {provide: RouteReuseStrategy, useClass: CustomReuseStrategy},
      ],
    });

    router = TestBed.inject(Router);
    strategy = TestBed.inject(RouteReuseStrategy) as CustomReuseStrategy;
    return await RouterTestingHarness.create();
  }

  it('should create and destroy local injector for routes with ɵUseActivatedRouteInjector', async () => {
    const harness = await setUpRouter([
      {
        path: 'home',
        component: HomeComponent,
        'ɵUseActivatedRouteInjector': true,
      } as any,
      {
        path: 'away',
        component: AwayComponent,
      },
    ]);

    await harness.navigateByUrl('/home');

    const homeRoute = router.routerState.root.firstChild!;
    expect(homeRoute).not.toBeNull();
    const localInjector = (homeRoute as any)._localInjector;
    expect(localInjector).toBeDefined();

    let destroyed = false;
    localInjector!.get(DestroyRef).onDestroy(() => {
      destroyed = true;
    });

    // Navigate away to trigger deactivation/cleanup
    await harness.navigateByUrl('/away');

    expect(destroyed).toBe(true);
  });

  it('should NOT create local injector for routes without ɵUseActivatedRouteInjector', async () => {
    const harness = await setUpRouter([
      {
        path: 'home',
        component: HomeComponent,
      },
    ]);

    await harness.navigateByUrl('/home');

    const homeRoute = router.routerState.root.firstChild!;
    expect(homeRoute).not.toBeNull();
    expect((homeRoute as any)._localInjector).toBeUndefined();
  });

  it('should keep local injector alive when route is detached and destroy it when handle is destroyed', async () => {
    const harness = await setUpRouter([
      {
        path: 'home',
        component: HomeComponent,
        'ɵUseActivatedRouteInjector': true,
      } as any,
      {
        path: 'away',
        component: AwayComponent,
      },
    ]);

    strategy.shouldDetachVal = true;

    await harness.navigateByUrl('/home');

    const homeRoute = router.routerState.root.firstChild!;
    const localInjector = (homeRoute as any)._localInjector;
    expect(localInjector).toBeDefined();

    let destroyed = false;
    localInjector!.get(DestroyRef).onDestroy(() => {
      destroyed = true;
    });

    // Navigate away to detach 'home'
    await harness.navigateByUrl('/away');

    // Verify it is detached and stored
    const handle = strategy.storedHandles.get(router.config[0]);
    expect(handle).toBeDefined();
    // The injector must NOT be destroyed yet
    expect(destroyed).toBe(false);

    // Manually destroy the detached handle
    destroyDetachedRouteHandle(handle!);

    expect(destroyed).toBe(true);
  });

  it('should destroy local injectors if navigation fails during activation', async () => {
    let throwingRoute: ActivatedRoute | null = null;
    let localInjectorInConstructor: any = null;
    let throwingRouteDestroyed = false;

    @Component({
      template: '',
    })
    class ThrowingComponent {
      constructor(route: ActivatedRoute) {
        throwingRoute = route;
        localInjectorInConstructor = (route as any)._localInjector;
        localInjectorInConstructor.get(DestroyRef).onDestroy(() => {
          throwingRouteDestroyed = true;
        });
        throw new Error('Component instantiation error');
      }
    }

    const harness = await setUpRouter([
      {
        path: 'home',
        component: HomeComponent,
        'ɵUseActivatedRouteInjector': true,
      } as any,
      {
        path: 'throwing',
        component: ThrowingComponent,
        'ɵUseActivatedRouteInjector': true,
      } as any,
    ]);

    await harness.navigateByUrl('/home');

    const homeRoute = router.routerState.root.firstChild!;
    const homeLocalInjector = (homeRoute as any)._localInjector;
    expect(homeLocalInjector).toBeDefined();

    let homeDestroyed = false;
    homeLocalInjector!.get(DestroyRef).onDestroy(() => {
      homeDestroyed = true;
    });

    // Attempt to navigate to /throwing. This will throw an error during activation.
    let threw = false;
    try {
      await harness.navigateByUrl('/throwing');
    } catch (e) {
      threw = true;
    }

    expect(threw).toBe(true);

    // Since the navigation failed, we should clean up:
    // 1. Home was deactivated, so its injector should be destroyed.
    expect(homeDestroyed).toBe(true);

    // 2. The throwing route's injector was created during the transition but failed,
    // so it should have been cleaned up (destroyed).
    expect(localInjectorInConstructor).toBeDefined();
    expect(throwingRouteDestroyed).toBe(true);
  });
});
