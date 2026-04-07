/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '@angular/core';

import {Route, Routes} from './models';
import {
  DetachedRouteHandleInternal,
  ExperimentalRouteReuseStrategy,
  RouteReuseStrategy,
} from './route_reuse_strategy';
import {ActivatedRouteSnapshot, RouterState} from './router_state';

/**
 * @description
 *
 * Cleans up `EnvironmentInjector`s assigned to `Route`s that are no longer in use.
 */
export const ROUTE_INJECTOR_CLEANUP = new InjectionToken<typeof routeInjectorCleanup>(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'RouteInjectorCleanup' : '',
);

export function routeInjectorCleanup(
  routeReuseStrategy: RouteReuseStrategy,
  routerState: RouterState,
  config: Routes,
) {
  const activeRoutes = new Set<Route>();
  // Collect all active routes from the current state tree
  if (routerState.snapshot.root) {
    collectDescendants(routerState.snapshot.root, activeRoutes);
  }

  // For stored routes, collect them and all their parents by iterating pathFromRoot.
  const storedHandles =
    (routeReuseStrategy as ExperimentalRouteReuseStrategy).retrieveStoredRouteHandles?.() || [];
  for (const handle of storedHandles) {
    const internalHandle = handle as DetachedRouteHandleInternal;
    if (internalHandle?.route?.value?.snapshot) {
      for (const snapshot of internalHandle.route.value.snapshot.pathFromRoot) {
        if (snapshot.routeConfig) {
          activeRoutes.add(snapshot.routeConfig);
        }
      }
    }
  }

  destroyUnusedInjectors(config, activeRoutes, routeReuseStrategy, false);
}

function collectDescendants(snapshot: ActivatedRouteSnapshot, activeRoutes: Set<Route>) {
  if (snapshot.routeConfig) {
    activeRoutes.add(snapshot.routeConfig);
  }

  for (const child of snapshot.children) {
    collectDescendants(child, activeRoutes);
  }
}

function destroyUnusedInjectors(
  routes: Routes,
  activeRoutes: Set<Route>,
  strategy: RouteReuseStrategy,
  inheritedForceDestroy: boolean,
) {
  for (const route of routes) {
    const shouldDestroyCurrentRoute =
      inheritedForceDestroy ||
      !!(
        (route._injector || route._loadedInjector) &&
        !activeRoutes.has(route) &&
        ((strategy as ExperimentalRouteReuseStrategy).shouldDestroyInjector?.(route) ?? false)
      );

    if (route.children) {
      destroyUnusedInjectors(route.children, activeRoutes, strategy, shouldDestroyCurrentRoute);
    }
    if (route.loadChildren && route._loadedRoutes) {
      destroyUnusedInjectors(
        route._loadedRoutes,
        activeRoutes,
        strategy,
        shouldDestroyCurrentRoute,
      );
    }

    if (shouldDestroyCurrentRoute) {
      if (route._injector) {
        route._injector.destroy();
        route._injector = undefined;
      }
      if (route._loadedInjector) {
        route._loadedInjector.destroy();
        route._loadedInjector = undefined;
      }
    }
  }
}
