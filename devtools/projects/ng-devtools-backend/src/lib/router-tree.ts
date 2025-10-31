/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Route} from '../../../protocol';
import type {Route as AngularRoute} from '@angular/router';

export type RoutePropertyType = RouteGuard | 'providers' | 'component' | 'redirectTo' | 'title';

export type RouteGuard = 'canActivate' | 'canActivateChild' | 'canDeactivate' | 'canMatch';

const routeGuards = ['canActivate', 'canActivateChild', 'canDeactivate', 'canMatch'];

type Routes = any;
type Router = any;

export function parseRoutes(router: Router): Route {
  const currentUrl = router.stateManager?.routerState?.snapshot?.url;
  const rootName = (router as any).rootComponentType?.name || 'no-name';
  const rootChildren = router.config;

  const root: Route = {
    component: rootName,
    path: '/',
    children: rootChildren ? assignChildrenToParent(null, rootChildren, currentUrl) : [],
    isAux: false,
    isLazy: false,
    isRedirect: false,
    data: [],
    isActive: currentUrl === '/',
  };

  return root;
}

function getGuardNames(child: AngularRoute, type: RouteGuard): string[] {
  const guards = child?.[type] || [];

  const names = guards.map((g: any) => g.name);
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
  currentUrl: string,
): Route[] {
  return children.map((child: AngularRoute) => {
    const childName = childRouteName(child);
    const loadedRoutes = (window as any).ng?.ɵgetLoadedRoutes?.(child as any);
    const childDescendents: [AngularRoute] = loadedRoutes || child.children;

    const pathFragment = child.outlet ? `(${child.outlet}:${child.path})` : child.path;
    const routePath = `${parentPath ?? ''}/${pathFragment}`.split('//').join('/');

    // only found in aux routes, otherwise property will be undefined
    const isAux = Boolean(child.outlet);
    const isRedirect = Boolean(child.redirectTo);
    const isLazy = Boolean(child.loadChildren || child.loadComponent);

    const pathWithoutParams = routePath.split('/:')[0];
    const isActive = currentUrl?.startsWith(pathWithoutParams);

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
      isAux,
      isLazy,
      isActive,
      isRedirect,
    };

    if (child.title) {
      routeConfig.title = getPropertyName(child, 'title');
    }

    if (child.redirectTo) {
      routeConfig.redirectTo = getPropertyName(child, 'redirectTo');
    }

    if (childDescendents) {
      routeConfig.children = assignChildrenToParent(routeConfig.path, childDescendents, currentUrl);
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
  const isArrowWithNoName = !fn.hasOwnProperty('prototype') && fn.name === '';

  if (isArrowWithNoName) {
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

function getPropertyName(child: AngularRoute, property: 'title' | 'redirectTo') {
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
    if (type === 'title' && element.title instanceof Function) {
      const functionName = getClassOrFunctionName(element.title);
      //TODO: improve this, not every titleFn has a name property
      if (functionName === name) {
        return element.title;
      }
    }

    if (type === 'redirectTo' && element.redirectTo instanceof Function) {
      const functionName = getClassOrFunctionName(element.redirectTo);
      //TODO: improve this, not every redirectToFn has a name property
      if (functionName === name) {
        return element.redirectTo;
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
