/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector} from '@angular/core';
import {Router} from './router';
import {Route as AngularRoute, Routes} from './models';
import {ActivatedRoute} from './router_state';

/**
 * Route representation for devtools.
 * This matches the protocol Route interface used by Angular DevTools.
 */
export interface DebugRoute {
  name?: string;
  hash?: string;
  specificity?: string;
  handler?: string;
  pathMatch?: 'prefix' | 'full';
  canActivateGuards?: string[];
  canActivateChildGuards?: string[];
  canMatchGuards?: string[];
  canDeactivateGuards?: string[];
  providers?: string[];
  title?: string;
  children?: Array<DebugRoute>;
  data?: {[key: string | symbol]: any};
  resolvers?: {[key: string]: string};
  path: string;
  component: string;
  redirectTo?: string;
  isActive: boolean;
  isAux: boolean;
  isLazy: boolean;
  matcher?: string;
  runGuardsAndResolvers?:
    | 'pathParamsChange'
    | 'pathParamsOrQueryParamsChange'
    | 'paramsChange'
    | 'paramsOrQueryParamsChange'
    | 'always'
    | (string & {});
}

type RouteGuard = 'canActivate' | 'canActivateChild' | 'canDeactivate' | 'canMatch';

/**
 * Returns the loaded routes for a given route.
 */
export function getLoadedRoutes(route: AngularRoute): Routes | undefined {
  return route._loadedRoutes;
}

/**
 * Returns the Router instance from the given injector, or null if not available.
 */
export function getRouterInstance(injector: Injector): Router | null {
  return injector.get(Router, null, {optional: true});
}

/**
 * Navigates the given router to the specified URL.
 * Throws if the provided router is not an Angular Router.
 */
export function navigateByUrl(router: Router, url: string): Promise<boolean> {
  if (!(router instanceof Router)) {
    throw new Error('The provided router is not an Angular Router.');
  }
  return router.navigateByUrl(url);
}

/**
 * Recursively traverses the ActivatedRoute tree and collects all routeConfig objects.
 * @param activatedRoute - The ActivatedRoute to start traversal from
 * @param activeRoutes - Set to collect active Route configuration objects
 * @returns Set of active Route configuration objects
 */
function collectActiveRouteConfigs(
  activatedRoute: ActivatedRoute,
  activeRoutes: Set<AngularRoute> = new Set(),
): Set<AngularRoute> {
  // Get the routeConfig for this ActivatedRoute
  const routeConfig = activatedRoute.routeConfig;
  if (routeConfig) {
    activeRoutes.add(routeConfig);
  }

  // Recursively process all children
  const children = activatedRoute.children || [];
  for (const child of children) {
    collectActiveRouteConfigs(child, activeRoutes);
  }

  return activeRoutes;
}

/**
 * Gets the set of currently active Route configuration objects from the router state.
 * This function synchronously reads the current router state without waiting for navigation events.
 *
 * @param router - The Angular Router instance
 * @returns A Set containing all Route configuration objects that are currently active
 *
 * @example
 * ```ts
 * const activeRoutes = getActiveRouteConfigs(router);
 * // activeRoutes is a Set<Route> containing all currently active route configurations
 * ```
 */
export function getActiveRouteConfigs(router: Router): Set<AngularRoute> {
  const rootActivatedRoute = router.routerState?.root;
  if (!rootActivatedRoute) {
    return new Set();
  }

  return collectActiveRouteConfigs(rootActivatedRoute);
}

/**
 * Returns the router configuration (routes) for the given router instance.
 * Throws if the provided router is not an Angular Router.
 *
 * @param router - The Angular Router instance
 * @returns The array of Route configuration objects
 */
export function getRouterConfig(router: Router): Routes {
  if (!(router instanceof Router)) {
    throw new Error('The provided router is not an Angular Router.');
  }
  return router.config;
}

/**
 * Get the display name for a function or class.
 * @param fn - The function or class to get the name from
 * @param defaultName - Optional name to check against. If the function name matches this value,
 * '[Function]' is returned instead
 * @returns The formatted name: class name, function name with '()', or '[Function]' for anonymous/arrow functions
 */
function getClassOrFunctionName(fn: Function, defaultName?: string) {
  const isArrow = !fn.hasOwnProperty('prototype');
  const isEmptyName = fn.name === '';

  if ((isArrow && isEmptyName) || isEmptyName) {
    return '[Function]';
  }

  const hasDefaultName = fn.name === defaultName;
  if (hasDefaultName) {
    return '[Function]';
  }

  return fn.name;
}

function getGuardNames(child: AngularRoute, type: RouteGuard): string[] {
  const guards = child?.[type] || [];
  const names = guards.map((g: any) => getClassOrFunctionName(g));
  return names || [];
}

function getProviderName(child: any): string[] {
  const providers = child?.providers || [];
  const names = providers.map((p: any) => p.name);
  return names || [];
}

function getPropertyName(
  child: AngularRoute,
  property: 'title' | 'redirectTo' | 'matcher' | 'runGuardsAndResolvers',
) {
  if (child[property] instanceof Function) {
    return getClassOrFunctionName(child[property], property);
  }
  return child[property];
}

function childRouteName(child: AngularRoute): string {
  if (child.component) {
    return child.component.name;
  } else if (child.loadChildren || child.loadComponent) {
    return `${child.path} [Lazy]`;
  } else {
    return 'no-name-route';
  }
}

function assignChildrenToParent(
  parentPath: string | null,
  children: Routes,
  activeRouteConfigs: Set<AngularRoute>,
): DebugRoute[] {
  return children.map((child: AngularRoute) => {
    const childName = childRouteName(child);
    const loadedRoutes = (window as any).ng?.ɵgetLoadedRoutes?.(child as any);
    const childDescendents: Routes = loadedRoutes || child.children;

    const pathFragment = child.outlet ? `(${child.outlet}:${child.path})` : child.path;
    const routePath = `${parentPath ?? ''}/${pathFragment}`.split('//').join('/');

    // only found in aux routes, otherwise property will be undefined
    const isAux = Boolean(child.outlet);
    const isLazy = Boolean(child.loadChildren || child.loadComponent);

    // Check if this route configuration object is in the active routes set
    // This is the direct reference to the Route object from router.config
    const isActive = activeRouteConfigs.has(child);

    const routeConfig: DebugRoute = {
      pathMatch: child.pathMatch,
      component: childName,
      canActivateGuards: getGuardNames(child, 'canActivate'),
      canActivateChildGuards: getGuardNames(child, 'canActivateChild'),
      canMatchGuards: getGuardNames(child, 'canMatch'),
      canDeactivateGuards: getGuardNames(child, 'canDeactivate'),
      providers: getProviderName(child),
      path: routePath,
      isAux,
      isLazy,
      isActive,
    };

    if (child.title) {
      routeConfig.title = getPropertyName(child, 'title');
    }

    if (child.redirectTo) {
      routeConfig.redirectTo = getPropertyName(child, 'redirectTo');
    }

    if (child.matcher) {
      routeConfig.matcher = getPropertyName(child, 'matcher');
      // For custom matchers, override the path to indicate it's a matcher
      // Since the path be undefined when using a matcher, because the matcher defines the path matching
      routeConfig.path = '[Matcher]';
    }

    if (child.runGuardsAndResolvers) {
      routeConfig.runGuardsAndResolvers = getPropertyName(child, 'runGuardsAndResolvers');
    }

    if (childDescendents) {
      routeConfig.children = assignChildrenToParent(
        routeConfig.path,
        childDescendents,
        activeRouteConfigs,
      );
    }

    if (child.resolve) {
      routeConfig.resolvers = {};

      for (const [name, resolver] of Object.entries(child.resolve)) {
        routeConfig.resolvers[name] = getClassOrFunctionName(resolver);
      }
    }

    if (child.data) {
      routeConfig.data = child.data;
    }

    return routeConfig;
  });
}

/**
 * Parses the router configuration and returns a tree structure suitable for devtools visualization.
 * This function analyzes the router's configuration and current state to determine which routes are active.
 *
 * @param router - The Angular Router instance
 * @returns A DebugRoute tree representing the router configuration with active route information
 */
export function parseRoutes(router: Router): DebugRoute {
  const rootName = 'App Root';
  const rootChildren = router.config;

  // Get the set of active Route configuration objects from the router state
  const activeRouteConfigs = getActiveRouteConfigs(router);

  const root: DebugRoute = {
    component: rootName,
    path: rootName,
    children: rootChildren ? assignChildrenToParent(null, rootChildren, activeRouteConfigs) : [],
    isAux: false,
    isLazy: false,
    isActive: true, // Root is always active.
  };

  return root;
}
