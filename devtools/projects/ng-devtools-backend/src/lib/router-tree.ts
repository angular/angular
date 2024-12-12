/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Route} from '../../../protocol';

// todo(aleksanderbodurri): type these properly
type AngularRoute = any;
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

function getGuardNames(child: AngularRoute, type: string): string[] | null {
  const guards = child?.[type] || [];
  const names = guards.map((g: any) => g.name);
  return names || null;
}

function getProviderName(child: any): string[] | null {
  const providers = child?.providers || [];
  const names = providers.map((p: any) => p.name);
  return names || null;
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
      canDeActivateGuards: getGuardNames(child, 'canDeactivate'),
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

export function getElementRefByName(ref: string, routes: any[], name: string): any | null {
  for (const element of routes) {
    if (element[ref]) {
      for (const guard of element[ref]) {
        if (guard.name === name) {
          return guard;
        }
      }
    }

    if (element?._loadedRoutes) {
      const result = getElementRefByName(ref, element._loadedRoutes, name);
      if (result !== null) {
        return result;
      }
    }

    if (element?.children) {
      const result = getElementRefByName(ref, element.children, name);
      if (result !== null) {
        return result;
      }
    }
  }
}

export function getComponentRefByName(routes: any[], name: string): any | null {
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
