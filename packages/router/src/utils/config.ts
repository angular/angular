/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '@angular/core';

import {EmptyOutletComponent} from '../components/empty_outlet';
import {LoadedRouterConfig, Route, Routes} from '../models';
import {ActivatedRouteSnapshot} from '../router_state';
import {PRIMARY_OUTLET} from '../shared';

export function getLoadedRoutes(route: Route): Route[]|undefined {
  return route._loadedRoutes;
}

export function getLoadedInjector(route: Route): Injector|undefined {
  return route._loadedInjector;
}

export function validateConfig(config: Routes, parentPath: string = ''): void {
  // forEach doesn't iterate undefined values
  for (let i = 0; i < config.length; i++) {
    const route: Route = config[i];
    const fullPath: string = getFullPath(parentPath, route);
    validateNode(route, fullPath);
  }
}

function validateNode(route: Route, fullPath: string): void {
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    if (!route) {
      throw new Error(`
      Invalid configuration of route '${fullPath}': Encountered undefined route.
      The reason might be an extra comma.

      Example:
      const routes: Routes = [
        { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
        { path: 'dashboard',  component: DashboardComponent },, << two commas
        { path: 'detail/:id', component: HeroDetailComponent }
      ];
    `);
    }
    if (Array.isArray(route)) {
      throw new Error(`Invalid configuration of route '${fullPath}': Array cannot be specified`);
    }
    if (!route.component && !route.children && !route.loadChildren &&
        (route.outlet && route.outlet !== PRIMARY_OUTLET)) {
      throw new Error(`Invalid configuration of route '${
          fullPath}': a componentless route without children or loadChildren cannot have a named outlet set`);
    }
    if (route.redirectTo && route.children) {
      throw new Error(`Invalid configuration of route '${
          fullPath}': redirectTo and children cannot be used together`);
    }
    if (route.redirectTo && route.loadChildren) {
      throw new Error(`Invalid configuration of route '${
          fullPath}': redirectTo and loadChildren cannot be used together`);
    }
    if (route.children && route.loadChildren) {
      throw new Error(`Invalid configuration of route '${
          fullPath}': children and loadChildren cannot be used together`);
    }
    if (route.redirectTo && route.component) {
      throw new Error(`Invalid configuration of route '${
          fullPath}': redirectTo and component cannot be used together`);
    }
    if (route.redirectTo && route.canActivate) {
      throw new Error(
          `Invalid configuration of route '${
              fullPath}': redirectTo and canActivate cannot be used together. Redirects happen before activation ` +
          `so canActivate will never be executed.`);
    }
    if (route.path && route.matcher) {
      throw new Error(
          `Invalid configuration of route '${fullPath}': path and matcher cannot be used together`);
    }
    if (route.redirectTo === void 0 && !route.component && !route.children && !route.loadChildren) {
      throw new Error(`Invalid configuration of route '${
          fullPath}'. One of the following must be provided: component, redirectTo, children or loadChildren`);
    }
    if (route.path === void 0 && route.matcher === void 0) {
      throw new Error(`Invalid configuration of route '${
          fullPath}': routes must have either a path or a matcher specified`);
    }
    if (typeof route.path === 'string' && route.path.charAt(0) === '/') {
      throw new Error(
          `Invalid configuration of route '${fullPath}': path cannot start with a slash`);
    }
    if (route.path === '' && route.redirectTo !== void 0 && route.pathMatch === void 0) {
      const exp =
          `The default value of 'pathMatch' is 'prefix', but often the intent is to use 'full'.`;
      throw new Error(`Invalid configuration of route '{path: "${fullPath}", redirectTo: "${
          route.redirectTo}"}': please provide 'pathMatch'. ${exp}`);
    }
  }
  if (route.children) {
    validateConfig(route.children, fullPath);
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

/**
 * Makes a copy of the config and adds any default required properties.
 */
export function standardizeConfig(r: Route): Route {
  const children = r.children && r.children.map(standardizeConfig);
  const c = children ? {...r, children} : {...r};
  if (!c.component && (children || c.loadChildren) && (c.outlet && c.outlet !== PRIMARY_OUTLET)) {
    c.component = EmptyOutletComponent;
  }
  return c;
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
  const sortedConfig = routes.filter(r => getOutlet(r) === outletName);
  sortedConfig.push(...routes.filter(r => getOutlet(r) !== outletName));
  return sortedConfig;
}

/**
 * Gets the first loaded injector in the snapshot's parent tree.
 *
 * Returns `null` if there is no parent lazy loaded injector.
 *
 * Generally used for retrieving the injector to use for getting tokens for guards/resolvers and
 * also used for getting the correct injector to use for creating components.
 */
export function getClosestLoadedInjector(snapshot: ActivatedRouteSnapshot): Injector|null {
  if (!snapshot) return null;

  for (let s = snapshot.parent; s; s = s.parent) {
    const route = s.routeConfig;
    if (route && route._loadedInjector) return route._loadedInjector;
  }

  return null;
}
