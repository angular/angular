/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EnvironmentInjector, EnvironmentProviders, NgModuleFactory, Provider, ProviderToken, Type} from '@angular/core';
import {Observable} from 'rxjs';

import {ActivatedRouteSnapshot, RouterStateSnapshot} from './router_state';
import {UrlSegment, UrlSegmentGroup, UrlTree} from './url_tree';

/**
 * How to handle a navigation request to the current URL. One of:
 *
 * - `'ignore'` :  The router ignores the request it is the same as the current state.
 * - `'reload'` : The router processes the URL even if it is not different from the current state.
 * One example of when you might want this option is if a `canMatch` guard depends on
 * application state and initially rejects navigation to a route. After fixing the state, you want
 * to re-navigate to the same URL so the route with the `canMatch` guard can activate.
 *
 * Note that this only configures whether the Route reprocesses the URL and triggers related
 * action and events like redirects, guards, and resolvers. By default, the router re-uses a
 * component instance when it re-navigates to the same component type without visiting a different
 * component first. This behavior is configured by the `RouteReuseStrategy`. In order to reload
 * routed components on same url navigation, you need to set `onSameUrlNavigation` to `'reload'`
 * _and_ provide a `RouteReuseStrategy` which returns `false` for `shouldReuseRoute`. Additionally,
 * resolvers and most guards for routes do not run unless the path or path params changed
 * (configured by `runGuardsAndResolvers`).
 *
 * @publicApi
 * @see `RouteReuseStrategy`
 * @see `RunGuardsAndResolvers`
 * @see `NavigationBehaviorOptions`
 * @see `RouterConfigOptions`
 */
export type OnSameUrlNavigation = 'reload'|'ignore';

/**
 * The `InjectionToken` and `@Injectable` classes for guards and resolvers are deprecated in favor
 * of plain JavaScript functions instead.. Dependency injection can still be achieved using the
 * `inject` function from `@angular/core` and an injectable class can be used as a functional guard
 * using `inject`: `canActivate: [() => inject(myGuard).canActivate()]`.
 *
 * @deprecated
 * @see `CanMatchFn`
 * @see `CanLoadFn`
 * @see `CanActivateFn`
 * @see `CanActivateChildFn`
 * @see `CanDeactivateFn`
 * @see `ResolveFn`
 * @see `inject`
 * @publicApi
 */
export type DeprecatedGuard = ProviderToken<any>|any;

/**
 * Represents a route configuration for the Router service.
 * An array of `Route` objects, used in `Router.config` and for nested route configurations
 * in `Route.children`.
 *
 * @see `Route`
 * @see `Router`
 * @see [Router configuration guide](guide/router-reference#configuration)
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
  consumed: UrlSegment[];
  posParams?: {[name: string]: UrlSegment};
};

/**
 * A function for matching a route against URLs. Implement a custom URL matcher
 * for `Route.matcher` when a combination of `path` and `pathMatch`
 * is not expressive enough. Cannot be used together with `path` and `pathMatch`.
 *
 * The function takes the following arguments and returns a `UrlMatchResult` object.
 * * *segments* : An array of URL segments.
 * * *group* : A segment group.
 * * *route* : The route to match against.
 *
 * The following example implementation matches HTML files.
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
    UrlMatchResult|null;

/**
 *
 * Represents static data associated with a particular route.
 *
 * @see `Route#data`
 *
 * @publicApi
 */
export type Data = {
  [key: string|symbol]: any
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
  [key: string|symbol]: ResolveFn<unknown>|DeprecatedGuard
};

/**
 * An ES Module object with a default export of the given type.
 *
 * @see `Route#loadComponent`
 * @see `LoadChildrenCallback`
 *
 * @publicApi
 */
export interface DefaultExport<T> {
  /**
   * Default exports are bound under the name `"default"`, per the ES Module spec:
   * https://tc39.es/ecma262/#table-export-forms-mapping-to-exportentry-records
   */
  default: T;
}

/**
 *
 * A function that is called to resolve a collection of lazy-loaded routes.
 * Must be an arrow function of the following form:
 * `() => import('...').then(mod => mod.MODULE)`
 * or
 * `() => import('...').then(mod => mod.ROUTES)`
 *
 * For example:
 *
 * ```
 * [{
 *   path: 'lazy',
 *   loadChildren: () => import('./lazy-route/lazy.module').then(mod => mod.LazyModule),
 * }];
 * ```
 * or
 * ```
 * [{
 *   path: 'lazy',
 *   loadChildren: () => import('./lazy-route/lazy.routes').then(mod => mod.ROUTES),
 * }];
 * ```
 *
 * If the lazy-loaded routes are exported via a `default` export, the `.then` can be omitted:
 * ```
 * [{
 *   path: 'lazy',
 *   loadChildren: () => import('./lazy-route/lazy.routes'),
 * }];
 * ```
 *
 * @see [Route.loadChildren](api/router/Route#loadChildren)
 * @publicApi
 */
export type LoadChildrenCallback = () => Type<any>|NgModuleFactory<any>|Routes|
    Observable<Type<any>|Routes|DefaultExport<Type<any>>|DefaultExport<Routes>>|
    Promise<NgModuleFactory<any>|Type<any>|Routes|DefaultExport<Type<any>>|DefaultExport<Routes>>;

/**
 *
 * A function that returns a set of routes to load.
 *
 * @see `LoadChildrenCallback`
 * @publicApi
 */
export type LoadChildren = LoadChildrenCallback;

/**
 *
 * How to handle query parameters in a router link.
 * One of:
 * - `"merge"` : Merge new parameters with current parameters.
 * - `"preserve"` : Preserve current parameters.
 * - `""` : Replace current parameters with new parameters. This is the default behavior.
 *
 * @see `UrlCreationOptions#queryParamsHandling`
 * @see `RouterLink`
 * @publicApi
 */
export type QueryParamsHandling = 'merge'|'preserve'|'';

/**
 * A policy for when to run guards and resolvers on a route.
 *
 * Guards and/or resolvers will always run when a route is activated or deactivated. When a route is
 * unchanged, the default behavior is the same as `paramsChange`.
 *
 * `paramsChange` : Rerun the guards and resolvers when path or
 * path param changes. This does not include query parameters. This option is the default.
 * - `always` : Run on every execution.
 * - `pathParamsChange` : Rerun guards and resolvers when the path params
 * change. This does not compare matrix or query parameters.
 * - `paramsOrQueryParamsChange` : Run when path, matrix, or query parameters change.
 * - `pathParamsOrQueryParamsChange` : Rerun guards and resolvers when the path params
 * change or query params have changed. This does not include matrix parameters.
 *
 * @see [Route.runGuardsAndResolvers](api/router/Route#runGuardsAndResolvers)
 * @publicApi
 */
export type RunGuardsAndResolvers =
    'pathParamsChange'|'pathParamsOrQueryParamsChange'|'paramsChange'|'paramsOrQueryParamsChange'|
    'always'|((from: ActivatedRouteSnapshot, to: ActivatedRouteSnapshot) => boolean);

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
 * In the following example, supplying the 'full' `pathMatch` strategy ensures
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
 * In the following example, 'MainChild' and 'AuxChild' are siblings.
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
 * To use lazy loading, provide the `loadChildren` property in the `Route` object,
 * instead of the `children` property.
 *
 * Given the following example route, the router will lazy load
 * the associated module on demand using the browser native import system.
 *
 * ```
 * [{
 *   path: 'lazy',
 *   loadChildren: () => import('./lazy-route/lazy.module').then(mod => mod.LazyModule),
 * }];
 * ```
 *
 * @publicApi
 */
export interface Route {
  /**
   * Used to define a page title for the route. This can be a static string or an `Injectable` that
   * implements `Resolve`.
   *
   * @see `PageTitleStrategy`
   */
  title?: string|Type<Resolve<string>>|ResolveFn<string>;

  /**
   * The path to match against. Cannot be used together with a custom `matcher` function.
   * A URL string that uses router matching notation.
   * Can be a wild card (`**`) that matches any URL (see Usage Notes below).
   * Default is "/" (the root path).
   *
   */
  path?: string;
  /**
   * The path-matching strategy, one of 'prefix' or 'full'.
   * Default is 'prefix'.
   *
   * By default, the router checks URL elements from the left to see if the URL
   * matches a given path and stops when there is a config match. Importantly there must still be a
   * config match for each segment of the URL. For example, '/team/11/user' matches the prefix
   * 'team/:id' if one of the route's children matches the segment 'user'. That is, the URL
   * '/team/11/user' matches the config
   * `{path: 'team/:id', children: [{path: ':user', component: User}]}`
   * but does not match when there are no children as in `{path: 'team/:id', component: Team}`.
   *
   * The path-match strategy 'full' matches against the entire URL.
   * It is important to do this when redirecting empty-path routes.
   * Otherwise, because an empty path is a prefix of any URL,
   * the router would apply the redirect even when navigating
   * to the redirect destination, creating an endless loop.
   *
   */
  pathMatch?: 'prefix'|'full';
  /**
   * A custom URL-matching function. Cannot be used together with `path`.
   */
  matcher?: UrlMatcher;
  /**
   * The component to instantiate when the path matches.
   * Can be empty if child routes specify components.
   */
  component?: Type<any>;

  /**
   * An object specifying a lazy-loaded component.
   */
  loadComponent?: () => Type<unknown>| Observable<Type<unknown>|DefaultExport<Type<unknown>>>|
      Promise<Type<unknown>|DefaultExport<Type<unknown>>>;
  /**
   * Filled for routes `loadComponent` once the component is loaded.
   * @internal
   */
  _loadedComponent?: Type<unknown>;

  /**
   * A URL to redirect to when the path matches.
   *
   * Absolute if the URL begins with a slash (/), otherwise relative to the path URL.
   * Note that no further redirects are evaluated after an absolute redirect.
   *
   * When not present, router does not redirect.
   */
  redirectTo?: string;
  /**
   * Name of a `RouterOutlet` object where the component can be placed
   * when the path matches.
   */
  outlet?: string;
  /**
   * An array of `CanActivateFn` or DI tokens used to look up `CanActivate()`
   * handlers, in order to determine if the current user is allowed to
   * activate the component. By default, any user can activate.
   *
   * When using a function rather than DI tokens, the function can call `inject` to get any required
   * dependencies. This `inject` call must be done in a synchronous context.
   */
  canActivate?: Array<CanActivateFn|DeprecatedGuard>;
  /**
   * An array of `CanMatchFn` or DI tokens used to look up `CanMatch()`
   * handlers, in order to determine if the current user is allowed to
   * match the `Route`. By default, any route can match.
   *
   * When using a function rather than DI tokens, the function can call `inject` to get any required
   * dependencies. This `inject` call must be done in a synchronous context.
   */
  canMatch?: Array<CanMatchFn|DeprecatedGuard>;
  /**
   * An array of `CanActivateChildFn` or DI tokens used to look up `CanActivateChild()` handlers,
   * in order to determine if the current user is allowed to activate
   * a child of the component. By default, any user can activate a child.
   *
   * When using a function rather than DI tokens, the function can call `inject` to get any required
   * dependencies. This `inject` call must be done in a synchronous context.
   */
  canActivateChild?: Array<CanActivateChildFn|DeprecatedGuard>;
  /**
   * An array of `CanDeactivateFn` or DI tokens used to look up `CanDeactivate()`
   * handlers, in order to determine if the current user is allowed to
   * deactivate the component. By default, any user can deactivate.
   *
   * When using a function rather than DI tokens, the function can call `inject` to get any required
   * dependencies. This `inject` call must be done in a synchronous context.
   */
  canDeactivate?: Array<CanDeactivateFn<any>|DeprecatedGuard>;
  /**
   * An array of `CanLoadFn` or DI tokens used to look up `CanLoad()`
   * handlers, in order to determine if the current user is allowed to
   * load the component. By default, any user can load.
   *
   * When using a function rather than DI tokens, the function can call `inject` to get any required
   * dependencies. This `inject` call must be done in a synchronous context.
   * @deprecated Use `canMatch` instead
   */
  canLoad?: Array<CanLoadFn|DeprecatedGuard>;
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
   * An object specifying lazy-loaded child routes.
   */
  loadChildren?: LoadChildren;

  /**
   * A policy for when to run guards and resolvers on a route.
   *
   * Guards and/or resolvers will always run when a route is activated or deactivated. When a route
   * is unchanged, the default behavior is the same as `paramsChange`.
   *
   * `paramsChange` : Rerun the guards and resolvers when path or
   * path param changes. This does not include query parameters. This option is the default.
   * - `always` : Run on every execution.
   * - `pathParamsChange` : Rerun guards and resolvers when the path params
   * change. This does not compare matrix or query parameters.
   * - `paramsOrQueryParamsChange` : Run when path, matrix, or query parameters change.
   * - `pathParamsOrQueryParamsChange` : Rerun guards and resolvers when the path params
   * change or query params have changed. This does not include matrix parameters.
   *
   * @see `RunGuardsAndResolvers`
   */
  runGuardsAndResolvers?: RunGuardsAndResolvers;

  /**
   * A `Provider` array to use for this `Route` and its `children`.
   *
   * The `Router` will create a new `EnvironmentInjector` for this
   * `Route` and use it for this `Route` and its `children`. If this
   * route also has a `loadChildren` function which returns an `NgModuleRef`, this injector will be
   * used as the parent of the lazy loaded module.
   */
  providers?: Array<Provider|EnvironmentProviders>;

  /**
   * Injector created from the static route providers
   * @internal
   */
  _injector?: EnvironmentInjector;

  /**
   * Filled for routes with `loadChildren` once the routes are loaded.
   * @internal
   */
  _loadedRoutes?: Route[];

  /**
   * Filled for routes with `loadChildren` once the routes are loaded
   * @internal
   */
  _loadedInjector?: EnvironmentInjector;
}

export interface LoadedRouterConfig {
  routes: Route[];
  injector: EnvironmentInjector|undefined;
}

/**
 * @description
 *
 * Interface that a class can implement to be a guard deciding if a route can be activated.
 * If all guards return `true`, navigation continues. If any guard returns `false`,
 * navigation is cancelled. If any guard returns a `UrlTree`, the current navigation
 * is cancelled and a new navigation begins to the `UrlTree` returned from the guard.
 *
 * The following example implements a `CanActivate` function that checks whether the
 * current user has permission to activate the requested route.
 *
 * ```
 * class UserToken {}
 * class Permissions {
 *   canActivate(): boolean {
 *     return true;
 *   }
 * }
 *
 * @Injectable()
 * class CanActivateTeam implements CanActivate {
 *   constructor(private permissions: Permissions, private currentUser: UserToken) {}
 *
 *   canActivate(
 *     route: ActivatedRouteSnapshot,
 *     state: RouterStateSnapshot
 *   ): Observable<boolean|UrlTree>|Promise<boolean|UrlTree>|boolean|UrlTree {
 *     return this.permissions.canActivate(this.currentUser, route.params.id);
 *   }
 * }
 * ```
 *
 * Here, the defined guard function is provided as part of the `Route` object
 * in the router configuration:
 *
 * ```
 * @NgModule({
 *   imports: [
 *     RouterModule.forRoot([
 *       {
 *         path: 'team/:id',
 *         component: TeamComponent,
 *         canActivate: [CanActivateTeam]
 *       }
 *     ])
 *   ],
 *   providers: [CanActivateTeam, UserToken, Permissions]
 * })
 * class AppModule {}
 * ```
 *
 * @publicApi
 * @deprecated Class-based `Route` guards are deprecated in favor of functional guards. An
 *     injectable class can be used as a functional guard using the `inject` function:
 *     `canActivate: [() => inject(myGuard).canActivate()]`.
 * @see `CanActivateFn`
 */
export interface CanActivate {
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
      Observable<boolean|UrlTree>|Promise<boolean|UrlTree>|boolean|UrlTree;
}

/**
 * The signature of a function used as a `canActivate` guard on a `Route`.
 *
 * If all guards return `true`, navigation continues. If any guard returns `false`,
 * navigation is cancelled. If any guard returns a `UrlTree`, the current navigation
 * is cancelled and a new navigation begins to the `UrlTree` returned from the guard.
 *
 * The following example implements and uses a `CanActivateChildFn` that checks whether the
 * current user has permission to activate the requested route.
 *
 * {@example router/route_functional_guards.ts region="CanActivateFn"}

 * Here, the defined guard function is provided as part of the `Route` object
 * in the router configuration:

 * {@example router/route_functional_guards.ts region="CanActivateFnInRoute"}
 *
 * @publicApi
 * @see `Route`
 */
export type CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
    Observable<boolean|UrlTree>|Promise<boolean|UrlTree>|boolean|UrlTree;

/**
 * @description
 *
 * Interface that a class can implement to be a guard deciding if a child route can be activated.
 * If all guards return `true`, navigation continues. If any guard returns `false`,
 * navigation is cancelled. If any guard returns a `UrlTree`, current navigation
 * is cancelled and a new navigation begins to the `UrlTree` returned from the guard.
 *
 * The following example implements a `CanActivateChild` function that checks whether the
 * current user has permission to activate the requested child route.
 *
 * ```
 * class UserToken {}
 * class Permissions {
 *   canActivate(user: UserToken, id: string): boolean {
 *     return true;
 *   }
 * }
 *
 * @Injectable()
 * class CanActivateTeam implements CanActivateChild {
 *   constructor(private permissions: Permissions, private currentUser: UserToken) {}
 *
 *   canActivateChild(
 *     route: ActivatedRouteSnapshot,
 *     state: RouterStateSnapshot
 *   ): Observable<boolean|UrlTree>|Promise<boolean|UrlTree>|boolean|UrlTree {
 *     return this.permissions.canActivate(this.currentUser, route.params.id);
 *   }
 * }
 * ```
 *
 * Here, the defined guard function is provided as part of the `Route` object
 * in the router configuration:
 *
 * ```
 * @NgModule({
 *   imports: [
 *     RouterModule.forRoot([
 *       {
 *         path: 'root',
 *         canActivateChild: [CanActivateTeam],
 *         children: [
 *           {
 *              path: 'team/:id',
 *              component: TeamComponent
 *           }
 *         ]
 *       }
 *     ])
 *   ],
 *   providers: [CanActivateTeam, UserToken, Permissions]
 * })
 * class AppModule {}
 * ```
 *
 * @publicApi
 * @deprecated Class-based `Route` guards are deprecated in favor of functional guards. An
 *     injectable class can be used as a functional guard using the `inject` function:
 *     `canActivateChild: [() => inject(myGuard).canActivateChild()]`.
 * @see `CanActivateChildFn`
 */
export interface CanActivateChild {
  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot):
      Observable<boolean|UrlTree>|Promise<boolean|UrlTree>|boolean|UrlTree;
}

/**
 * The signature of a function used as a `canActivateChild` guard on a `Route`.
 *
 * If all guards return `true`, navigation continues. If any guard returns `false`,
 * navigation is cancelled. If any guard returns a `UrlTree`, the current navigation
 * is cancelled and a new navigation begins to the `UrlTree` returned from the guard.
 *
 * The following example implements a `canActivate` function that checks whether the
 * current user has permission to activate the requested route.
 *
 * {@example router/route_functional_guards.ts region="CanActivateChildFn"}
 *
 * @publicApi
 * @see `Route`
 */
export type CanActivateChildFn = (childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
    Observable<boolean|UrlTree>|Promise<boolean|UrlTree>|boolean|UrlTree;

/**
 * @description
 *
 * Interface that a class can implement to be a guard deciding if a route can be deactivated.
 * If all guards return `true`, navigation continues. If any guard returns `false`,
 * navigation is cancelled. If any guard returns a `UrlTree`, current navigation
 * is cancelled and a new navigation begins to the `UrlTree` returned from the guard.
 *
 * The following example implements a `CanDeactivate` function that checks whether the
 * current user has permission to deactivate the requested route.
 *
 * ```
 * class UserToken {}
 * class Permissions {
 *   canDeactivate(user: UserToken, id: string): boolean {
 *     return true;
 *   }
 * }
 * ```
 *
 * Here, the defined guard function is provided as part of the `Route` object
 * in the router configuration:
 *
 * ```
 *
 * @Injectable()
 * class CanDeactivateTeam implements CanDeactivate<TeamComponent> {
 *   constructor(private permissions: Permissions, private currentUser: UserToken) {}
 *
 *   canDeactivate(
 *     component: TeamComponent,
 *     currentRoute: ActivatedRouteSnapshot,
 *     currentState: RouterStateSnapshot,
 *     nextState: RouterStateSnapshot
 *   ): Observable<boolean|UrlTree>|Promise<boolean|UrlTree>|boolean|UrlTree {
 *     return this.permissions.canDeactivate(this.currentUser, route.params.id);
 *   }
 * }
 *
 * @NgModule({
 *   imports: [
 *     RouterModule.forRoot([
 *       {
 *         path: 'team/:id',
 *         component: TeamComponent,
 *         canDeactivate: [CanDeactivateTeam]
 *       }
 *     ])
 *   ],
 *   providers: [CanDeactivateTeam, UserToken, Permissions]
 * })
 * class AppModule {}
 * ```
 *
 * @publicApi
 * @deprecated Class-based `Route` guards are deprecated in favor of functional guards. An
 *     injectable class can be used as a functional guard using the `inject` function:
 *     `canDeactivate: [() => inject(myGuard).canDeactivate()]`.
 * @see `CanDeactivateFn`
 */
export interface CanDeactivate<T> {
  canDeactivate(
      component: T, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot,
      nextState: RouterStateSnapshot): Observable<boolean|UrlTree>|Promise<boolean|UrlTree>|boolean
      |UrlTree;
}

/**
 * The signature of a function used as a `canDeactivate` guard on a `Route`.
 *
 * If all guards return `true`, navigation continues. If any guard returns `false`,
 * navigation is cancelled. If any guard returns a `UrlTree`, the current navigation
 * is cancelled and a new navigation begins to the `UrlTree` returned from the guard.
 *
 * The following example implements and uses a `CanDeactivateFn` that checks whether the
 * user component has unsaved changes before navigating away from the route.
 *
 * {@example router/route_functional_guards.ts region="CanDeactivateFn"}
 *
 * @publicApi
 * @see `Route`
 */
export type CanDeactivateFn<T> =
    (component: T, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot,
     nextState: RouterStateSnapshot) =>
        Observable<boolean|UrlTree>|Promise<boolean|UrlTree>|boolean|UrlTree;

/**
 * @description
 *
 * Interface that a class can implement to be a guard deciding if a `Route` can be matched.
 * If all guards return `true`, navigation continues and the `Router` will use the `Route` during
 * activation. If any guard returns `false`, the `Route` is skipped for matching and other `Route`
 * configurations are processed instead.
 *
 * The following example implements a `CanMatch` function that decides whether the
 * current user has permission to access the users page.
 *
 *
 * ```
 * class UserToken {}
 * class Permissions {
 *   canAccess(user: UserToken, route: Route, segments: UrlSegment[]): boolean {
 *     return true;
 *   }
 * }
 *
 * @Injectable()
 * class CanMatchTeamSection implements CanMatch {
 *   constructor(private permissions: Permissions, private currentUser: UserToken) {}
 *
 *   canMatch(route: Route, segments: UrlSegment[]): Observable<boolean>|Promise<boolean>|boolean {
 *     return this.permissions.canAccess(this.currentUser, route, segments);
 *   }
 * }
 * ```
 *
 * Here, the defined guard function is provided as part of the `Route` object
 * in the router configuration:
 *
 * ```
 *
 * @NgModule({
 *   imports: [
 *     RouterModule.forRoot([
 *       {
 *         path: 'team/:id',
 *         component: TeamComponent,
 *         loadChildren: () => import('./team').then(mod => mod.TeamModule),
 *         canMatch: [CanMatchTeamSection]
 *       },
 *       {
 *         path: '**',
 *         component: NotFoundComponent
 *       }
 *     ])
 *   ],
 *   providers: [CanMatchTeamSection, UserToken, Permissions]
 * })
 * class AppModule {}
 * ```
 *
 * If the `CanMatchTeamSection` were to return `false`, the router would continue navigating to the
 * `team/:id` URL, but would load the `NotFoundComponent` because the `Route` for `'team/:id'`
 * could not be used for a URL match but the catch-all `**` `Route` did instead.
 *
 * @publicApi
 * @deprecated Class-based `Route` guards are deprecated in favor of functional guards. An
 *     injectable class can be used as a functional guard using the `inject` function:
 *     `canMatch: [() => inject(myGuard).canMatch()]`.
 * @see `CanMatchFn`
 */
export interface CanMatch {
  canMatch(route: Route, segments: UrlSegment[]):
      Observable<boolean|UrlTree>|Promise<boolean|UrlTree>|boolean|UrlTree;
}

/**
 * The signature of a function used as a `canMatch` guard on a `Route`.
 *
 * If all guards return `true`, navigation continues and the `Router` will use the `Route` during
 * activation. If any guard returns `false`, the `Route` is skipped for matching and other `Route`
 * configurations are processed instead.
 *
 * The following example implements and uses a `CanMatchFn` that checks whether the
 * current user has permission to access the team page.
 *
 * {@example router/route_functional_guards.ts region="CanMatchFn"}
 *
 * @publicApi
 * @see `Route`
 */
export type CanMatchFn = (route: Route, segments: UrlSegment[]) =>
    Observable<boolean|UrlTree>|Promise<boolean|UrlTree>|boolean|UrlTree;

/**
 * @description
 *
 * Interface that classes can implement to be a data provider.
 * A data provider class can be used with the router to resolve data during navigation.
 * The interface defines a `resolve()` method that is invoked right after the `ResolveStart`
 * router event. The router waits for the data to be resolved before the route is finally activated.
 *
 * The following example implements a `resolve()` method that retrieves the data
 * needed to activate the requested route.
 *
 * ```
 * @Injectable({ providedIn: 'root' })
 * export class HeroResolver implements Resolve<Hero> {
 *   constructor(private service: HeroService) {}
 *
 *   resolve(
 *     route: ActivatedRouteSnapshot,
 *     state: RouterStateSnapshot
 *   ): Observable<Hero>|Promise<Hero>|Hero {
 *     return this.service.getHero(route.paramMap.get('id'));
 *   }
 * }
 * ```
 *
 * Here, the defined `resolve()` function is provided as part of the `Route` object
 * in the router configuration:
 *
 * ```

 * @NgModule({
 *   imports: [
 *     RouterModule.forRoot([
 *       {
 *         path: 'detail/:id',
 *         component: HeroDetailComponent,
 *         resolve: {
 *           hero: HeroResolver
 *         }
 *       }
 *     ])
 *   ],
 *   exports: [RouterModule]
 * })
 * export class AppRoutingModule {}
 * ```
 *
 * And you can access to your resolved data from `HeroComponent`:
 *
 * ```
 * @Component({
 *  selector: "app-hero",
 *  templateUrl: "hero.component.html",
 * })
 * export class HeroComponent {
 *
 *  constructor(private activatedRoute: ActivatedRoute) {}
 *
 *  ngOnInit() {
 *    this.activatedRoute.data.subscribe(({ hero }) => {
 *      // do something with your resolved data ...
 *    })
 *  }
 *
 * }
 * ```
 *
 * @usageNotes
 *
 * When both guard and resolvers are specified, the resolvers are not executed until
 * all guards have run and succeeded.
 * For example, consider the following route configuration:
 *
 * ```
 * {
 *  path: 'base'
 *  canActivate: [BaseGuard],
 *  resolve: {data: BaseDataResolver}
 *  children: [
 *   {
 *     path: 'child',
 *     guards: [ChildGuard],
 *     component: ChildComponent,
 *     resolve: {childData: ChildDataResolver}
 *    }
 *  ]
 * }
 * ```
 * The order of execution is: BaseGuard, ChildGuard, BaseDataResolver, ChildDataResolver.
 *
 * @publicApi
 * @deprecated Class-based `Route` resolvers are deprecated in favor of functional resolvers. An
 * injectable class can be used as a functional guard using the `inject` function: `resolve:
 * {'user': () => inject(UserResolver).resolve()}`.
 * @see `ResolveFn`
 */
export interface Resolve<T> {
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<T>|Promise<T>|T;
}

/**
 * Function type definition for a data provider.

 * A data provider can be used with the router to resolve data during navigation.
 * The router waits for the data to be resolved before the route is finally activated.
 *
 * The following example implements a function that retrieves the data
 * needed to activate the requested route.
 *
 * {@example router/route_functional_guards.ts region="ResolveFn"}
 *
 * And you can access to your resolved data from `HeroComponent`:
 *
 * {@example router/route_functional_guards.ts region="ResolveDataUse"}
 *
 * @usageNotes
 *
 * When both guard and resolvers are specified, the resolvers are not executed until
 * all guards have run and succeeded.
 * For example, consider the following route configuration:
 *
 * ```
 * {
 *  path: 'base'
 *  canActivate: [baseGuard],
 *  resolve: {data: baseDataResolver}
 *  children: [
 *   {
 *     path: 'child',
 *     canActivate: [childGuard],
 *     component: ChildComponent,
 *     resolve: {childData: childDataResolver}
 *    }
 *  ]
 * }
 * ```
 * The order of execution is: baseGuard, childGuard, baseDataResolver, childDataResolver.
 *
 * @publicApi
 * @see `Route`
 */
export type ResolveFn<T> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
    Observable<T>|Promise<T>|T;

/**
 * @description
 *
 * Interface that a class can implement to be a guard deciding if children can be loaded.
 * If all guards return `true`, navigation continues. If any guard returns `false`,
 * navigation is cancelled. If any guard returns a `UrlTree`, current navigation
 * is cancelled and a new navigation starts to the `UrlTree` returned from the guard.
 *
 * The following example implements a `CanLoad` function that decides whether the
 * current user has permission to load requested child routes.
 *
 *
 * ```
 * class UserToken {}
 * class Permissions {
 *   canLoadChildren(user: UserToken, id: string, segments: UrlSegment[]): boolean {
 *     return true;
 *   }
 * }
 *
 * @Injectable()
 * class CanLoadTeamSection implements CanLoad {
 *   constructor(private permissions: Permissions, private currentUser: UserToken) {}
 *
 *   canLoad(route: Route, segments: UrlSegment[]): Observable<boolean>|Promise<boolean>|boolean {
 *     return this.permissions.canLoadChildren(this.currentUser, route, segments);
 *   }
 * }
 * ```
 *
 * Here, the defined guard function is provided as part of the `Route` object
 * in the router configuration:
 *
 * ```
 *
 * @NgModule({
 *   imports: [
 *     RouterModule.forRoot([
 *       {
 *         path: 'team/:id',
 *         component: TeamComponent,
 *         loadChildren: () => import('./team').then(mod => mod.TeamModule),
 *         canLoad: [CanLoadTeamSection]
 *       }
 *     ])
 *   ],
 *   providers: [CanLoadTeamSection, UserToken, Permissions]
 * })
 * class AppModule {}
 * ```
 *
 * @publicApi
 * @deprecated Use {@link CanMatchFn} instead
 */
export interface CanLoad {
  canLoad(route: Route, segments: UrlSegment[]):
      Observable<boolean|UrlTree>|Promise<boolean|UrlTree>|boolean|UrlTree;
}

/**
 * The signature of a function used as a `canLoad` guard on a `Route`.
 *
 * @publicApi
 * @see `CanLoad`
 * @see `Route`
 * @see `CanMatchFn`
 * @deprecated Use `Route.canMatch` and `CanMatchFn` instead
 */
export type CanLoadFn = (route: Route, segments: UrlSegment[]) =>
    Observable<boolean|UrlTree>|Promise<boolean|UrlTree>|boolean|UrlTree;


/**
 * @description
 *
 * Options that modify the `Router` navigation strategy.
 * Supply an object containing any of these properties to a `Router` navigation function to
 * control how the navigation should be handled.
 *
 * @see [Router.navigate() method](api/router/Router#navigate)
 * @see [Router.navigateByUrl() method](api/router/Router#navigatebyurl)
 * @see [Routing and Navigation guide](guide/router)
 *
 * @publicApi
 */
export interface NavigationBehaviorOptions {
  /**
   * How to handle a navigation request to the current URL.
   *
   * This value is a subset of the options available in `OnSameUrlNavigation` and
   * will take precedence over the default value set for the `Router`.
   *
   * @see `OnSameUrlNavigation`
   * @see `RouterConfigOptions`
   */
  onSameUrlNavigation?: Extract<OnSameUrlNavigation, 'reload'>;

  /**
   * When true, navigates without pushing a new state into history.
   *
   * ```
   * // Navigate silently to /view
   * this.router.navigate(['/view'], { skipLocationChange: true });
   * ```
   */
  skipLocationChange?: boolean;

  /**
   * When true, navigates while replacing the current state in history.
   *
   * ```
   * // Navigate to /view
   * this.router.navigate(['/view'], { replaceUrl: true });
   * ```
   */
  replaceUrl?: boolean;

  /**
   * Developer-defined state that can be passed to any navigation.
   * Access this value through the `Navigation.extras` object
   * returned from the [Router.getCurrentNavigation()
   * method](api/router/Router#getcurrentnavigation) while a navigation is executing.
   *
   * After a navigation completes, the router writes an object containing this
   * value together with a `navigationId` to `history.state`.
   * The value is written when `location.go()` or `location.replaceState()`
   * is called before activating this route.
   *
   * Note that `history.state` does not pass an object equality test because
   * the router adds the `navigationId` on each navigation.
   *
   */
  state?: {[k: string]: any};
}
