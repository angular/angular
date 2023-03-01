/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Route} from 'protocol';

// todo(aleksanderbodurri): type these properly
type AngularRoute = any;
type Routes = any;
type Router = any;

export function parseRoutes(router: Router): Route {
  const rootName = (router as any).rootComponentType?.name || 'no-name';
  const rootChildren = router.config;

  const root: Route = {
    handler: rootName,
    name: rootName,
    path: '/',
    children: rootChildren ? assignChildrenToParent(null, rootChildren) : [],
    isAux: false,
    specificity: null,
    data: null,
    hash: null,
  };

  return root;
}

function assignChildrenToParent(parentPath: string|null, children: Routes): Route[] {
  return children.map((child: AngularRoute) => {
    const childName = childRouteName(child);
    const childDescendents: [any] = (child as any)._loadedConfig?.routes || child.children;

    // only found in aux routes, otherwise property will be undefined
    const isAuxRoute = !!child.outlet;

    const pathFragment = child.outlet ? `(${child.outlet}:${child.path})` : child.path;

    const routeConfig: Route = {
      handler: childName,
      data: [],
      hash: null,
      specificity: null,
      name: childName,
      path: `${parentPath ? parentPath : ''}/${pathFragment}`.split('//').join('/'),
      isAux: isAuxRoute,
      children: [],
    };

    if (childDescendents) {
      routeConfig.children = assignChildrenToParent(routeConfig.path, childDescendents);
    }

    if (child.data) {
      for (const el in child.data) {
        if (child.data.hasOwnProperty(el)) {
          routeConfig.data.push({
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
  } else if (child.loadChildren) {
    return `${child.path} [Lazy]`;
  } else if (child.redirectTo) {
    return `${child.path} -> redirecting to -> "${child.redirectTo}"`;
  } else {
    return 'no-name-route';
  }
}
