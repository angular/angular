/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Route} from '../../../protocol';
import type {Route as AngularRoute, ActivatedRoute} from '@angular/router';

export type RoutePropertyType =
  | RouteGuard
  | 'providers'
  | 'component'
  | 'redirectTo'
  | 'title'
  | 'resolvers'
  | 'matcher'
  | 'runGuardsAndResolvers';

export type RouteGuard = 'canActivate' | 'canActivateChild' | 'canDeactivate' | 'canMatch';

const routeGuards = ['canActivate', 'canActivateChild', 'canDeactivate', 'canMatch'];

type Routes = any;
type Router = any;

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

export function parseRoutes(router: Router): Route {
  const rootName = 'App Root';
  const rootChildren = router.config;

  // Get the set of active Route configuration objects from the router state
  const activeRouteConfigs = getActiveRouteConfigs(router);

  const root: Route = {
    component: rootName,
    path: rootName,
    children: rootChildren ? assignChildrenToParent(null, rootChildren, activeRouteConfigs) : [],
    isAux: false,
    isLazy: false,
    isActive: true, // Root is always active.
    data: [],
  };

  return root;
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

function assignChildrenToParent(
  parentPath: string | null,
  children: Routes,
  activeRouteConfigs: Set<AngularRoute>,
): Route[] {
  return children.map((child: AngularRoute) => {
    const childName = childRouteName(child);
    const loadedRoutes = (window as any).ng?.ɵgetLoadedRoutes?.(child as any);
    const childDescendents: [AngularRoute] = loadedRoutes || child.children;

    const pathFragment = child.outlet ? `(${child.outlet}:${child.path})` : child.path;
    const routePath = `${parentPath ?? ''}/${pathFragment}`.split('//').join('/');

    // only found in aux routes, otherwise property will be undefined
    const isAux = Boolean(child.outlet);
    const isLazy = Boolean(child.loadChildren || child.loadComponent);

    // Check if this route configuration object is in the active routes set
    // This is the direct reference to the Route object from router.config
    const isActive = activeRouteConfigs.has(child);

    const routeConfig: Route = {
      pathMatch: child.pathMatch,
      component: childName,
      canActivateGuards: getGuardNames(child, 'canActivate'),
      canActivateChildGuards: getGuardNames(child, 'canActivateChild'),
      canMatchGuards: getGuardNames(child, 'canMatch'),
      canDeactivateGuards: getGuardNames(child, 'canDeactivate'),
      providers: getProviderName(child),
      path: routePath,
      data: [],
      resolvers: [],
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
      for (const el in child.resolve) {
        if (child.resolve.hasOwnProperty(el)) {
          routeConfig?.resolvers?.push({
            key: el,
            value: getClassOrFunctionName(child.resolve[el]),
          });
        }
      }
    }

    if (child.data) {
      for (const el in child.data) {
        if (child.data.hasOwnProperty(el)) {
          routeConfig?.data?.push({
            key: el,
            value: child.data[el],
          });
        }
      }
    }

    return routeConfig;
  });
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

  // Check if it's a class by examining the function's string representation
  const isClass = /^class\s/.test(fn.toString());

  // Return class name without parentheses, function name with parentheses
  return isClass ? fn.name : `${fn.name}()`;
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

/**
 *  Get the element reference by type & name from the routes array. Called recursively to search through all children.
 * @param type - type of element to search for (canActivate, canActivateChild, canDeactivate, canLoad, providers, redirectTo , title)
 * @param routes - array of routes to search through
 * @param name - name of the element to search for refers to the name of the guard or provider
 * @returns - the element reference if found, otherwise null
 */
export function getElementRefByName(
  type: RoutePropertyType,
  routes: AngularRoute[],
  name: string,
): any | null {
  for (const element of routes) {
    if (type === 'resolvers' && element.resolve) {
      for (const key in element.resolve) {
        if (element.resolve.hasOwnProperty(key)) {
          const functionName = getClassOrFunctionName(element.resolve[key]);
          //TODO: improve this, not every ResolverFn has a name property
          if (functionName === name) {
            return element.resolve[key];
          }
        }
      }
    }

    const functionProperties: Exclude<RoutePropertyType, 'resolvers'>[] = [
      'title',
      'redirectTo',
      'matcher',
      'runGuardsAndResolvers',
    ];

    for (const property of functionProperties) {
      if (type === property && element[property] instanceof Function) {
        const functionName = getClassOrFunctionName(element[property]);
        // TODO: improve this, not every function has a name property
        if (functionName === name) {
          return element[property];
        }
      }
    }

    if (routeGuards.includes(type)) {
      const routeGuard = type as RouteGuard;
      if (element[routeGuard]) {
        for (const guard of element[routeGuard]) {
          // TODO: improve this, not every guard has a name property
          if ((guard as any).name === name) {
            return guard;
          }
        }
      }
    }

    // _loadedRoutes is internal, we can't acess it with the dot notation
    const loadedRoutes = (element as any)?.['_loadedRoutes'] as AngularRoute[] | undefined;
    if (loadedRoutes) {
      const result = getElementRefByName(type, loadedRoutes, name);
      if (result !== null) {
        return result;
      }
    }

    if (element?.children) {
      const result = getElementRefByName(type, element.children, name);
      if (result !== null) {
        return result;
      }
    }
  }
}

/**
 *  Get the componet reference by name from the routes array. Called recursively to search through all children.
 * @param routes - array of routes to search through
 * @param name - name of the component to search for
 * @returns - the element reference if found, otherwise null
 */
export function getComponentRefByName(routes: AngularRoute[], name: string): any | null {
  for (const element of routes) {
    if (element?.component?.name === name) {
      return element.component;
    }

    // _loadedRoutes is internal, we can't acess it with the dot notation
    const loadedRoutes = (element as any)?.['_loadedRoutes'] as AngularRoute[] | undefined;
    if (loadedRoutes) {
      const result = getComponentRefByName(loadedRoutes, name);
      if (result !== null) {
        return result;
      }
    }

    if (element?.children) {
      const result = getComponentRefByName(element.children, name);
      if (result !== null) {
        return result;
      }
    }
  }
  return null;
}
