/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModuleFactory, NgModuleRef, Type} from '@angular/core';
import {Observable} from 'rxjs';

import {EmptyOutletComponent} from './components/empty_outlet';
import {ActivatedRouteSnapshot} from './router_state';
import {PRIMARY_OUTLET} from './shared';
import {UrlSegment, UrlSegmentGroup} from './url_tree';


/**
 * Represents a route configuration for the Router service.
 * An array of `Route` objects, used in `Router.config` and for nested route configurations
 * in `Route.children`.
 *
 * @see `Route`
 * @see `Router`
 * @publicApi
 */
export type Routes = Route[];

/**
 * Represents the result of matching URLs with a custom matching function.
 *
 * * `consumed` is an array of the consumed URL segments.
 * * `posParams` is a map of positional parameters.
 *
 * @see `UrlMatcher()`
 * @publicApi
 */
export type UrlMatchResult = {
  consumed: UrlSegment[]; posParams?: {[name: string]: UrlSegment};
};

/**
 * A function for matching a route against URLs. Implement a custom URL matcher
 * for `Route.matcher` when a combination of `path` and `pathMatch`
 * is not expressive enough.
 *
 * @param segments An array of URL segments.
 * @param group A segment group.
 * @param route The route to match against.
 * @returns The match-result,
 *
 * @usageNotes
 *
 * The following matcher matches HTML files.
 *
 * ```
 * export function htmlFiles(url: UrlSegment[]) {
 *   return url.length === 1 && url[0].path.endsWith('.html') ? ({consumed: url}) : null;
 * }
 *
 * export const routes = [{ matcher: htmlFiles, component: AnyComponent }];
 * ```
 *
 * @publicApi
 */
export type UrlMatcher = (segments: UrlSegment[], group: UrlSegmentGroup, route: Route) =>
    UrlMatchResult;

/**
 *
 * Represents static data associated with a particular route.
 *
 * @see `Route#data`
 *
 * @publicApi
 */
export type Data = {
  [name: string]: any
};

/**
 *
 * Represents the resolved data associated with a particular route.
 *
 * @see `Route#resolve`.
 *
 * @publicApi
 */
export type ResolveData = {
  [name: string]: any
};

/**
 *
 * A function that is called to resolve a collection of lazy-loaded routes.
 *
 * Often this function will be implemented using an ES dynamic `import()` expression. For example:
 *
 * ```
 * [{
 *   path: 'lazy',
 *   loadChildren: () => import('./lazy-route/lazy.module').then(mod => mod.LazyModule),
 * }];
 * ```
 *
 * This function _must_ match the form above: an arrow function of the form
 * `() => import('...').then(mod => mod.MODULE)`.
 *
 * @see `Route#loadChildren`.
 * @publicApi
 */
export type LoadChildrenCallback = () => Type<any>| NgModuleFactory<any>| Observable<Type<any>>|
    Promise<NgModuleFactory<any>|Type<any>|any>;

/**
 *
 * A string of the form `path/to/file#exportName` that acts as a URL for a set of routes to load,
 * or a function that returns such a set.
 *
 * The string form of `LoadChildren` is deprecated (see `DeprecatedLoadChildren`). The function
 * form (`LoadChildrenCallback`) should be used instead.
 *
 * @see `Route#loadChildren`.
 * @publicApi
 */
export type LoadChildren = LoadChildrenCallback | DeprecatedLoadChildren;

/**
 * A string of the form `path/to/file#exportName` that acts as a URL for a set of routes to load.
 *
 * @see `Route#loadChildren`
 * @publicApi
 * @deprecated the `string` form of `loadChildren` is deprecated in favor of the proposed ES dynamic
 * `import()` expression, which offers a more natural and standards-based mechanism to dynamically
 * load an ES module at runtime.
 */
export type DeprecatedLoadChildren = string;

/**
 *
 * How to handle query parameters in a router link.
 * One of:
 * - `merge` : Merge new with current parameters.
 * - `preserve` : Preserve current parameters.
 *
 * @see `NavigationExtras#queryParamsHandling`
 * @see `RouterLink`
 * @publicApi
 */
export type QueryParamsHandling = 'merge' | 'preserve' | '';

/**
 *
 * A policy for when to run guards and resolvers on a route.
 *
 * @see `Route#runGuardsAndResolvers`
 * @publicApi
 */
export type RunGuardsAndResolvers = 'pathParamsChange' | 'pathParamsOrQueryParamsChange' |
    'paramsChange' | 'paramsOrQueryParamsChange' | 'always' |
    ((from: ActivatedRouteSnapshot, to: ActivatedRouteSnapshot) => boolean);

/**
 * A configuration object that defines a single route.
 * A set of routes are collected in a `Routes` array to define a `Router` configuration.
 * The router attempts to match segments of a given URL against each route,
 * using the configuration options defined in this object.
 *
 * Supports static, parameterized, redirect, and wildcard routes, as well as
 * custom route data and resolve methods.
 *
 * For detailed usage information, see the [Routing Guide](guide/router).
 *
 * @usageNotes
 *
 * ### Simple Configuration
 *
 * The following route specifies that when navigating to, for example,
 * `/team/11/user/bob`, the router creates the 'Team' component
 * with the 'User' child component in it.
 *
 * ```
 * [{
 *   path: 'team/:id',
  *  component: Team,
 *   children: [{
 *     path: 'user/:name',
 *     component: User
 *   }]
 * }]
 * ```
 *
 * ### Multiple Outlets
 *
 * The following route creates sibling components with multiple outlets.
 * When navigating to `/team/11(aux:chat/jim)`, the router creates the 'Team' component next to
 * the 'Chat' component. The 'Chat' component is placed into the 'aux' outlet.
 *
 * ```
 * [{
 *   path: 'team/:id',
 *   component: Team
 * }, {
 *   path: 'chat/:user',
 *   component: Chat
 *   outlet: 'aux'
 * }]
 * ```
 *
 * ### Wild Cards
 *
 * The following route uses wild-card notation to specify a component
 * that is always instantiated regardless of where you navigate to.
 *
 * ```
 * [{
 *   path: '**',
 *   component: WildcardComponent
 * }]
 * ```
 *
 * ### Redirects
 *
 * The following route uses the `redirectTo` property to ignore a segment of
 * a given URL when looking for a child path.
 *
 * When navigating to '/team/11/legacy/user/jim', the router changes the URL segment
 * '/team/11/legacy/user/jim' to '/team/11/user/jim', and then instantiates
 * the Team component with the User child component in it.
 *
 * ```
 * [{
 *   path: 'team/:id',
 *   component: Team,
 *   children: [{
 *     path: 'legacy/user/:name',
 *     redirectTo: 'user/:name'
 *   }, {
 *     path: 'user/:name',
 *     component: User
 *   }]
 * }]
 * ```
 *
 * The redirect path can be relative, as shown in this example, or absolute.
 * If we change the `redirectTo` value in the example to the absolute URL segment '/user/:name',
 * the result URL is also absolute, '/user/jim'.

 * ### Empty Path
 *
 * Empty-path route configurations can be used to instantiate components that do not 'consume'
 * any URL segments.
 *
 * In the following configuration, when navigating to
 * `/team/11`, the router instantiates the 'AllUsers' component.
 *
 * ```
 * [{
 *   path: 'team/:id',
 *   component: Team,
 *   children: [{
 *     path: '',
 *     component: AllUsers
 *   }, {
 *     path: 'user/:name',
 *     component: User
 *   }]
 * }]
 * ```
 *
 * Empty-path routes can have children. In the following example, when navigating
 * to `/team/11/user/jim`, the router instantiates the wrapper component with
 * the user component in it.
 *
 * Note that an empty path route inherits its parent's parameters and data.
 *
 * ```
 * [{
 *   path: 'team/:id',
 *   component: Team,
 *   children: [{
 *     path: '',
 *     component: WrapperCmp,
 *     children: [{
 *       path: 'user/:name',
 *       component: User
 *     }]
 *   }]
 * }]
 * ```
 *
 * ### Matching Strategy
 *
 * The default path-match strategy is 'prefix', which means that the router
 * checks URL elements from the left to see if the URL matches a specified path.
 * For example, '/team/11/user' matches 'team/:id'.
 *
 * ```
 * [{
 *   path: '',
 *   pathMatch: 'prefix', //default
 *   redirectTo: 'main'
 * }, {
 *   path: 'main',
 *   component: Main
 * }]
 * ```
 *
 * You can specify the path-match strategy 'full' to make sure that the path
 * covers the whole unconsumed URL. It is important to do this when redirecting
 * empty-path routes. Otherwise, because an empty path is a prefix of any URL,
 * the router would apply the redirect even when navigating to the redirect destination,
 * creating an endless loop.
 *
 * In the following example, supplying the 'full' `patchMatch` strategy ensures
 * that the router applies the redirect if and only if navigating to '/'.
 *
 * ```
 * [{
 *   path: '',
 *   pathMatch: 'full',
 *   redirectTo: 'main'
 * }, {
 *   path: 'main',
 *   component: Main
 * }]
 * ```
 *
 * ### Componentless Routes
 *
 * You can share parameters between sibling components.
 * For example, suppose that two sibling components should go next to each other,
 * and both of them require an ID parameter. You can accomplish this using a route
 * that does not specify a component at the top level.
 *
 * In the following example, 'ChildCmp' and 'AuxCmp' are siblings.
 * When navigating to 'parent/10/(a//aux:b)', the route instantiates
 * the main child and aux child components next to each other.
 * For this to work, the application component must have the primary and aux outlets defined.
 *
 * ```
 * [{
 *    path: 'parent/:id',
 *    children: [
 *      { path: 'a', component: MainChild },
 *      { path: 'b', component: AuxChild, outlet: 'aux' }
 *    ]
 * }]
 * ```
 *
 * The router merges the parameters, data, and resolve of the componentless
 * parent into the parameters, data, and resolve of the children.
 *
 * This is especially useful when child components are defined
 * with an empty path string, as in the following example.
 * With this configuration, navigating to '/parent/10' creates
 * the main child and aux components.
 *
 * ```
 * [{
 *    path: 'parent/:id',
 *    children: [
 *      { path: '', component: MainChild },
 *      { path: '', component: AuxChild, outlet: 'aux' }
 *    ]
 * }]
 * ```
 *
 * ### Lazy Loading
 *
 * Lazy loading speeds up application load time by splitting the application
 * into multiple bundles and loading them on demand.
 * To use lazy loading, provide the `loadChildren` property  instead of the `children` property.
 *
 * Given the following example route, the router uses the registered
 * `NgModuleFactoryLoader` to fetch an NgModule associated with 'team'.
 * It then extracts the set of routes defined in that NgModule,
 * and transparently adds those routes to the main configuration.
 *
 * ```
 * [{
 *   path: 'team/:id',
 *   component: Team,
 *   loadChildren: 'team'
 * }]
 * ```
 *
 * @publicApi
 */
export interface Route {
  /**
   * The path to match against, a URL string that uses router matching notation.
   * Can be a wild card (`**`) that matches any URL (see Usage Notes below).
   * Default is "/" (the root path).
   */
  path?: string;
  /**
   * The path-matching strategy, one of 'prefix' or 'full'.
   * Default is 'prefix'.
   *
   * By default, the router checks URL elements from the left to see if the URL
   * matches a given  path, and stops when there is a match. For example,
   * '/team/11/user' matches 'team/:id'.
   *
   * The path-match strategy 'full' matches against the entire URL.
   * It is important to do this when redirecting empty-path routes.
   * Otherwise, because an empty path is a prefix of any URL,
   * the router would apply the redirect even when navigating
   * to the redirect destination, creating an endless loop.
   *
   */
  pathMatch?: string;
  /**
   * A URL-matching function to use as a custom strategy for path matching.
   * If present, supersedes `path` and `pathMatch`.
   */
  matcher?: UrlMatcher;
  /**
   * The component to instantiate when the path matches.
   * Can be empty if child routes specify components.
   */
  component?: Type<any>;
  /**
   * A URL to which to redirect when a the path matches.
   * Absolute if the URL begins with a slash (/), otherwise relative to the path URL.
   * When not present, router does not redirect.
   */
  redirectTo?: string;
  /**
   * Name of a `RouterOutlet` object where the component can be placed
   * when the path matches.
   */
  outlet?: string;
  /**
   * An array of dependency-injection tokens used to look up `CanActivate()`
   * handlers, in order to determine if the current user is allowed to
   * activate the component. By default, any user can activate.
   */
  canActivate?: any[];
  /**
   * An array of DI tokens used to look up `CanActivateChild()` handlers,
   * in order to determine if the current user is allowed to activate
   * a child of the component. By default, any user can activate a child.
   */
  canActivateChild?: any[];
  /**
   * An array of DI tokens used to look up `CanDeactivate()`
   * handlers, in order to determine if the current user is allowed to
   * deactivate the component. By default, any user can deactivate.
   *
   */
  canDeactivate?: any[];
  /**
   * An array of DI tokens used to look up `CanLoad()`
   * handlers, in order to determine if the current user is allowed to
   * load the component. By default, any user can load.
   */
  canLoad?: any[];
  /**
   * Additional developer-defined data provided to the component via
   * `ActivatedRoute`. By default, no additional data is passed.
   */
  data?: Data;
  /**
   * A map of DI tokens used to look up data resolvers. See `Resolve`.
   */
  resolve?: ResolveData;
  /**
   * An array of child `Route` objects that specifies a nested route
   * configuration.
   */
  children?: Routes;
  /**
   * A `LoadChildren` object specifying lazy-loaded child routes.
   */
  loadChildren?: LoadChildren;
  /**
   * Defines when guards and resolvers will be run. One of
   * - `paramsOrQueryParamsChange` : Run when query parameters change.
   * - `always` : Run on every execution.
   * By default, guards and resolvers run only when the matrix
   * parameters of the route change.
   */
  runGuardsAndResolvers?: RunGuardsAndResolvers;
  /**
   * Filled for routes with `loadChildren` once the module has been loaded
   * @internal
   */
  _loadedConfig?: LoadedRouterConfig;
}

export class LoadedRouterConfig {
  constructor(public routes: Route[], public module: NgModuleRef<any>) {}
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
    throw new Error(
        `Invalid configuration of route '${fullPath}': a componentless route without children or loadChildren cannot have a named outlet set`);
  }
  if (route.redirectTo && route.children) {
    throw new Error(
        `Invalid configuration of route '${fullPath}': redirectTo and children cannot be used together`);
  }
  if (route.redirectTo && route.loadChildren) {
    throw new Error(
        `Invalid configuration of route '${fullPath}': redirectTo and loadChildren cannot be used together`);
  }
  if (route.children && route.loadChildren) {
    throw new Error(
        `Invalid configuration of route '${fullPath}': children and loadChildren cannot be used together`);
  }
  if (route.redirectTo && route.component) {
    throw new Error(
        `Invalid configuration of route '${fullPath}': redirectTo and component cannot be used together`);
  }
  if (route.path && route.matcher) {
    throw new Error(
        `Invalid configuration of route '${fullPath}': path and matcher cannot be used together`);
  }
  if (route.redirectTo === void 0 && !route.component && !route.children && !route.loadChildren) {
    throw new Error(
        `Invalid configuration of route '${fullPath}'. One of the following must be provided: component, redirectTo, children or loadChildren`);
  }
  if (route.path === void 0 && route.matcher === void 0) {
    throw new Error(
        `Invalid configuration of route '${fullPath}': routes must have either a path or a matcher specified`);
  }
  if (typeof route.path === 'string' && route.path.charAt(0) === '/') {
    throw new Error(`Invalid configuration of route '${fullPath}': path cannot start with a slash`);
  }
  if (route.path === '' && route.redirectTo !== void 0 && route.pathMatch === void 0) {
    const exp =
        `The default value of 'pathMatch' is 'prefix', but often the intent is to use 'full'.`;
    throw new Error(
        `Invalid configuration of route '{path: "${fullPath}", redirectTo: "${route.redirectTo}"}': please provide 'pathMatch'. ${exp}`);
  }
  if (route.pathMatch !== void 0 && route.pathMatch !== 'full' && route.pathMatch !== 'prefix') {
    throw new Error(
        `Invalid configuration of route '${fullPath}': pathMatch can only be set to 'prefix' or 'full'`);
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
