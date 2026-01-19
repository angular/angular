/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Route} from '../../../protocol';
import type {Route as AngularRoute} from '@angular/router';
import {legacyParseRoutes} from './legacy-parse-routes';

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

type Router = any;

/**
 * Parses the router configuration and returns a tree structure suitable for devtools visualization.
 * This function uses the debug API published by the Angular Router when available,
 * otherwise falls back to the legacy implementation for older Angular versions.
 *
 * @param router - The Angular Router instance
 * @returns A Route tree representing the router configuration with active route information
 */
export function parseRoutes(router: Router): Route {
  const parseRoutesFn = (window as any).ng?.ɵparseRoutes;
  if (!parseRoutesFn) {
    // Fallback to legacy implementation for older Angular versions
    return legacyParseRoutes(router);
  }
  return parseRoutesFn(router);
}

/**
 * Get the display name for a function or class.
 * @param fn - The function or class to get the name from
 * @param defaultName - Optional name to check against. If the function name matches this value,
 * '[Function]' is returned instead
 * @returns The formatted name: class name, function name with '()', or '[Function]' for anonymous/arrow functions
 */
function getClassOrFunctionName(fn: Function, defaultName?: string): string {
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

/**
 * Find a named callable construct (class or function) by type & name in a source routes tree.
 *
 * @param routes - Source routes tree to search through.
 * @param type - Type of construct to search for (e.g. canActivate, providers, redirectTo, title, etc.).
 * @param constructName - Name of the construct to search for.
 * @returns - The callable construct reference (`Function`) if found; otherwise, `null`.
 */
export function getRouterCallableConstructRef(
  routes: AngularRoute[],
  type: RoutePropertyType,
  constructName: string,
): Function | null {
  for (const route of routes) {
    switch (type) {
      case 'component':
        if (route.component?.name === constructName) {
          return route.component;
        }
        break;

      case 'resolvers':
        if (route.resolve) {
          for (const key of Object.keys(route.resolve)) {
            const functionName = getClassOrFunctionName(route.resolve[key]);
            if (functionName === constructName) {
              return route.resolve[key];
            }
          }
        }
        break;

      case 'title':
      case 'redirectTo':
      case 'matcher':
      case 'runGuardsAndResolvers':
        if (route[type] instanceof Function) {
          const functionName = getClassOrFunctionName(route[type]);
          if (functionName === constructName) {
            return route[type];
          }
        }
        break;

      case 'canActivate':
      case 'canActivateChild':
      case 'canDeactivate':
      case 'canMatch':
      case 'providers':
        if (route[type]) {
          for (const callable of route[type]) {
            if (callable instanceof Function && callable.name === constructName) {
              return callable;
            }
          }
        }
        break;
    }

    // _loadedRoutes is internal, we can't access it with the dot notation
    const loadedRoutes = (route as any)['_loadedRoutes'] as AngularRoute[] | undefined;
    const childrenRoutes = loadedRoutes || route.children;

    if (childrenRoutes) {
      const result = getRouterCallableConstructRef(childrenRoutes, type, constructName);
      if (result !== null) {
        return result;
      }
    }
  }

  return null;
}
