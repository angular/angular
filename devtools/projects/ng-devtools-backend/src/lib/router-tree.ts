/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Route} from '../../../protocol';

export type RoutePropertyType =
  | 'canActivate'
  | 'canActivateChild'
  | 'canDeactivate'
  | 'canMatch'
  | 'providers'
  | 'component';

// todo(sumitarora): type these properly in another PR
type AngularRoute = {
  title?: string;
  path?: string;
  pathMatch?: 'prefix' | 'full' | undefined;
  component?: any;
  redirectTo?: any;
  outlet?: string | undefined;
  canActivate?: any[];
  canMatch?: any[];
  canActivateChild?: any[];
  canDeactivate?: any[];
  providers?: any[];
  data?: any;
  children?: Routes;
  loadChildren?: any;
  loadComponent?: any;
  _loadedRoutes?: any;
};
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

function getGuardNames(child: AngularRoute, type: RoutePropertyType): string[] {
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
    const isActive = currentUrl?.startsWith(pathWithoutParams);

    const routeConfig: Route = {
      title: child.title,
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
    if (element[type]) {
      for (const guard of element[type]) {
        if (guard.name === name) {
          return guard;
        }
      }
    }

    if (element?._loadedRoutes) {
      const result = getElementRefByName(type, element._loadedRoutes, name);
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

    if (element?._loadedRoutes) {
      const result = getComponentRefByName(element._loadedRoutes, name);
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
