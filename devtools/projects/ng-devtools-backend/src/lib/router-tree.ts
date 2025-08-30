/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Route} from '../../../protocol';
import type {Route as AngularRoute} from '@angular/router';

export type RoutePropertyType = RouteGuard | 'providers' | 'component';

export type RouteGuard = 'canActivate' | 'canActivateChild' | 'canDeactivate' | 'canMatch';

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
    const isLazy = Boolean(child.loadChildren || child.loadComponent);

    const pathWithoutParams = routePath.split('/:')[0];
    const isActive =
      routePath === '/' ? currentUrl === '/' : currentUrl?.startsWith(pathWithoutParams);

    const routeConfig: Route = {
      title: typeof child.title === 'string' ? child.title : '[Function]',
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
    };

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

function childRouteName(child: AngularRoute): string {
  if (child.component) {
    return child.component.name;
  } else if (child.loadChildren || child.loadComponent) {
    return `${child.path} [Lazy]`;
  } else if (child.redirectTo) {
    return `${child.path} -> redirecting to -> "${child.redirectTo}"`;
  } else {
    return 'no-name-route';
  }
}

/**
 *  Get the element reference by type & name from the routes array. Called recursively to search through all children.
 * @param type - type of element to search for (canActivate, canActivateChild, canDeactivate, canLoad, providers)
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
    const routeGuard = type as RouteGuard;
    if (element[routeGuard]) {
      for (const guard of element[routeGuard]) {
        // TODO: improve this, not every guard has a name property
        if ((guard as any).name === name) {
          return guard;
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
