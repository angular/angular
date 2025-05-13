/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  createEnvironmentInjector,
  EnvironmentInjector,
  isStandalone,
  Type,
  ɵisNgModule as isNgModule,
  ɵRuntimeError as RuntimeError,
} from '@angular/core';

import {RuntimeErrorCode} from '../errors';
import {Route, Routes} from '../models';
import {ActivatedRouteSnapshot} from '../router_state';
import {PRIMARY_OUTLET} from '../shared';

/**
 * Creates an `EnvironmentInjector` if the `Route` has providers and one does not already exist
 * and returns the injector. Otherwise, if the `Route` does not have `providers`, returns the
 * `currentInjector`.
 *
 * @param route The route that might have providers
 * @param currentInjector The parent injector of the `Route`
 */
export function getOrCreateRouteInjectorIfNeeded(
  route: Route,
  currentInjector: EnvironmentInjector,
): EnvironmentInjector {
  if (route.providers && !route._injector) {
    route._injector = createEnvironmentInjector(
      route.providers,
      currentInjector,
      `Route: ${route.path}`,
    );
  }
  return route._injector ?? currentInjector;
}

export function getLoadedRoutes(route: Route): Route[] | undefined {
  return route._loadedRoutes;
}

export function getLoadedInjector(route: Route): EnvironmentInjector | undefined {
  return route._loadedInjector;
}
export function getLoadedComponent(route: Route): Type<unknown> | undefined {
  return route._loadedComponent;
}

export function getProvidersInjector(route: Route): EnvironmentInjector | undefined {
  return route._injector;
}

export function validateConfig(
  config: Routes,
  parentPath: string = '',
  requireStandaloneComponents = false,
): void {
  // forEach doesn't iterate undefined values
  for (let i = 0; i < config.length; i++) {
    const route: Route = config[i];
    const fullPath: string = getFullPath(parentPath, route);
    validateNode(route, fullPath, requireStandaloneComponents);
  }
}

export function assertStandalone(fullPath: string, component: Type<unknown> | undefined): void {
  if (component && isNgModule(component)) {
    throw new RuntimeError(
      RuntimeErrorCode.INVALID_ROUTE_CONFIG,
      `Invalid configuration of route '${fullPath}'. You are using 'loadComponent' with a module, ` +
        `but it must be used with standalone components. Use 'loadChildren' instead.`,
    );
  } else if (component && !isStandalone(component)) {
    throw new RuntimeError(
      RuntimeErrorCode.INVALID_ROUTE_CONFIG,
      `Invalid configuration of route '${fullPath}'. The component must be standalone.`,
    );
  }
}

function validateNode(route: Route, fullPath: string, requireStandaloneComponents: boolean): void {
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    if (!route) {
      throw new RuntimeError(
        RuntimeErrorCode.INVALID_ROUTE_CONFIG,
        `
      Invalid configuration of route '${fullPath}': Encountered undefined route.
      The reason might be an extra comma.

      Example:
      const routes: Routes = [
        { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
        { path: 'dashboard',  component: DashboardComponent },, << two commas
        { path: 'detail/:id', component: HeroDetailComponent }
      ];
    `,
      );
    }
    if (Array.isArray(route)) {
      throw new RuntimeError(
        RuntimeErrorCode.INVALID_ROUTE_CONFIG,
        `Invalid configuration of route '${fullPath}': Array cannot be specified`,
      );
    }
    if (
      !route.redirectTo &&
      !route.component &&
      !route.loadComponent &&
      !route.children &&
      !route.loadChildren &&
      route.outlet &&
      route.outlet !== PRIMARY_OUTLET
    ) {
      throw new RuntimeError(
        RuntimeErrorCode.INVALID_ROUTE_CONFIG,
        `Invalid configuration of route '${fullPath}': a componentless route without children or loadChildren cannot have a named outlet set`,
      );
    }
    if (route.redirectTo && route.children) {
      throw new RuntimeError(
        RuntimeErrorCode.INVALID_ROUTE_CONFIG,
        `Invalid configuration of route '${fullPath}': redirectTo and children cannot be used together`,
      );
    }
    if (route.redirectTo && route.loadChildren) {
      throw new RuntimeError(
        RuntimeErrorCode.INVALID_ROUTE_CONFIG,
        `Invalid configuration of route '${fullPath}': redirectTo and loadChildren cannot be used together`,
      );
    }
    if (route.children && route.loadChildren) {
      throw new RuntimeError(
        RuntimeErrorCode.INVALID_ROUTE_CONFIG,
        `Invalid configuration of route '${fullPath}': children and loadChildren cannot be used together`,
      );
    }
    if (route.component && route.loadComponent) {
      throw new RuntimeError(
        RuntimeErrorCode.INVALID_ROUTE_CONFIG,
        `Invalid configuration of route '${fullPath}': component and loadComponent cannot be used together`,
      );
    }

    if (route.redirectTo) {
      if (route.component || route.loadComponent) {
        throw new RuntimeError(
          RuntimeErrorCode.INVALID_ROUTE_CONFIG,
          `Invalid configuration of route '${fullPath}': redirectTo and component/loadComponent cannot be used together`,
        );
      }
      if (route.canMatch || route.canActivate) {
        throw new RuntimeError(
          RuntimeErrorCode.INVALID_ROUTE_CONFIG,
          `Invalid configuration of route '${fullPath}': redirectTo and ${route.canMatch ? 'canMatch' : 'canActivate'} cannot be used together.` +
            `Redirects happen before guards are executed.`,
        );
      }
    }

    if (route.path && route.matcher) {
      throw new RuntimeError(
        RuntimeErrorCode.INVALID_ROUTE_CONFIG,
        `Invalid configuration of route '${fullPath}': path and matcher cannot be used together`,
      );
    }
    if (
      route.redirectTo === void 0 &&
      !route.component &&
      !route.loadComponent &&
      !route.children &&
      !route.loadChildren
    ) {
      throw new RuntimeError(
        RuntimeErrorCode.INVALID_ROUTE_CONFIG,
        `Invalid configuration of route '${fullPath}'. One of the following must be provided: component, loadComponent, redirectTo, children or loadChildren`,
      );
    }
    if (route.path === void 0 && route.matcher === void 0) {
      throw new RuntimeError(
        RuntimeErrorCode.INVALID_ROUTE_CONFIG,
        `Invalid configuration of route '${fullPath}': routes must have either a path or a matcher specified`,
      );
    }
    if (typeof route.path === 'string' && route.path.charAt(0) === '/') {
      throw new RuntimeError(
        RuntimeErrorCode.INVALID_ROUTE_CONFIG,
        `Invalid configuration of route '${fullPath}': path cannot start with a slash`,
      );
    }
    if (route.path === '' && route.redirectTo !== void 0 && route.pathMatch === void 0) {
      const exp = `The default value of 'pathMatch' is 'prefix', but often the intent is to use 'full'.`;
      throw new RuntimeError(
        RuntimeErrorCode.INVALID_ROUTE_CONFIG,
        `Invalid configuration of route '{path: "${fullPath}", redirectTo: "${route.redirectTo}"}': please provide 'pathMatch'. ${exp}`,
      );
    }
    if (requireStandaloneComponents) {
      assertStandalone(fullPath, route.component);
    }
  }
  if (route.children) {
    validateConfig(route.children, fullPath, requireStandaloneComponents);
  }
}

function getFullPath(parentPath: string, currentRoute: Route): string {
  if (!currentRoute) {
    return parentPath;
  }
  if (!parentPath && !currentRoute.path) {
    return '';
  } else if (parentPath && !currentRoute.path) {
    return `${parentPath}/`;
  } else if (!parentPath && currentRoute.path) {
    return currentRoute.path;
  } else {
    return `${parentPath}/${currentRoute.path}`;
  }
}

/** Returns the `route.outlet` or PRIMARY_OUTLET if none exists. */
export function getOutlet(route: Route): string {
  return route.outlet || PRIMARY_OUTLET;
}

/**
 * Sorts the `routes` such that the ones with an outlet matching `outletName` come first.
 * The order of the configs is otherwise preserved.
 */
export function sortByMatchingOutlets(routes: Routes, outletName: string): Routes {
  const sortedConfig = routes.filter((r) => getOutlet(r) === outletName);
  sortedConfig.push(...routes.filter((r) => getOutlet(r) !== outletName));
  return sortedConfig;
}

/**
 * Gets the first injector in the snapshot's parent tree.
 *
 * If the `Route` has a static list of providers, the returned injector will be the one created from
 * those. If it does not exist, the returned injector may come from the parents, which may be from a
 * loaded config or their static providers.
 *
 * Returns `null` if there is neither this nor any parents have a stored injector.
 *
 * Generally used for retrieving the injector to use for getting tokens for guards/resolvers and
 * also used for getting the correct injector to use for creating components.
 */
export function getClosestRouteInjector(
  snapshot: ActivatedRouteSnapshot | undefined,
): EnvironmentInjector | null {
  if (!snapshot) return null;

  // If the current route has its own injector, which is created from the static providers on the
  // route itself, we should use that. Otherwise, we start at the parent since we do not want to
  // include the lazy loaded injector from this route.
  if (snapshot.routeConfig?._injector) {
    return snapshot.routeConfig._injector;
  }

  for (let s = snapshot.parent; s; s = s.parent) {
    const route = s.routeConfig;
    // Note that the order here is important. `_loadedInjector` stored on the route with
    // `loadChildren: () => NgModule` so it applies to child routes with priority. The `_injector`
    // is created from the static providers on that parent route, so it applies to the children as
    // well, but only if there is no lazy loaded NgModuleRef injector.
    if (route?._loadedInjector) return route._loadedInjector;
    if (route?._injector) return route._injector;
  }

  return null;
}
