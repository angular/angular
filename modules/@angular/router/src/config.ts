/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '@angular/core';
import {Observable} from 'rxjs/Observable';


/**
 * @whatItDoes Represents router configuration.
 *
 * @description
 * `Routes` is an array of route configurations. Each one has the following properties:
 *
 * - `path` is a string that uses the route matcher DSL.
 * - `pathMatch` is a string that specifies the matching strategy.
 * - `component` is a component type.
 * - `redirectTo` is the url fragment which will replace the current matched segment.
 * - `outlet` is the name of the outlet the component should be placed into.
 * - `canActivate` is an array of DI tokens used to look up CanActivate handlers. See {@link
 * CanActivate} for more info.
 * - `canActivateChild` is an array of DI tokens used to look up CanActivateChild handlers. See
 * {@link
 * CanActivateChild} for more info.
 * - `canDeactivate` is an array of DI tokens used to look up CanDeactivate handlers. See {@link
 * CanDeactivate} for more info.
 * - `data` is additional data provided to the component via `ActivatedRoute`.
 * - `resolve` is a map of DI tokens used to look up data resolvers. See {@link Resolve} for more
 * info.
 * - `children` is an array of child route definitions.
 *
 * ### Simple Configuration
 *
 * ```
 * [{
 *   path: 'team/:id',
 *   component: Team,
 *   children: [
 *     {
 *       path: 'user/:name',
 *       component: User
 *     }
 *   ]
 * }]
 * ```
 *
 * When navigating to `/team/11/user/bob`, the router will create the team component with the user
 * component in it.
 *
 * ### Multiple Outlets
 *
 * ```
 * [{
 *   path: 'team/:id',
 *   component: Team
 * },
 * {
 *   path: 'chat/:user',
 *   component: Chat
 *   outlet: 'aux'
 * }]
 * ```
 *
 * When navigating to `/team/11(aux:chat/jim)`, the router will create the team component next to
 * the chat component. The chat component will be placed into the aux outlet.
 *
 * ### Wild Cards
 *
 * ```
 * [{
 *   path: '**',
 *   component: Sink
 * }]
 * ```
 *
 * Regardless of where you navigate to, the router will instantiate the sink component.
 *
 * ### Redirects
 *
 * ```
 * [{
 *   path: 'team/:id',
 *   component: Team,
 *   children: [
 *     {
 *       path: 'legacy/user/:name',
 *       redirectTo: 'user/:name'
 *     },
 *     {
 *       path: 'user/:name',
 *       component: User
 *     }
 *   ]
 * }]
 * ```
 *
 * When navigating to '/team/11/legacy/user/jim', the router will change the url to
 * '/team/11/user/jim', and then will instantiate the team component with the user component
 * in it.
 *
 * If the `redirectTo` value starts with a '/', then it is an absolute redirect. E.g., if in the
 * example above we change the `redirectTo` to `/user/:name`, the result url will be '/user/jim'.
 *
 * ### Empty Path
 *
 * Empty-path route configurations can be used to instantiate components that do not 'consume'
 * any url segments. Let's look at the following configuration:
 *
 * ```
 * [{
 *   path: 'team/:id',
 *   component: Team,
 *   children: [
 *     {
 *       path: '',
 *       component: AllUsers
 *     },
 *     {
 *       path: 'user/:name',
 *       component: User
 *     }
 *   ]
 * }]
 * ```
 *
 * When navigating to `/team/11`, the router will instantiate the AllUsers component.
 *
 * Empty-path routes can have children.
 *
 * ```
 * [{
 *   path: 'team/:id',
 *   component: Team,
 *   children: [
 *     {
 *       path: '',
 *       component: WrapperCmp,
 *       children: [
 *         {
 *           path: 'user/:name',
 *           component: User
 *         }
 *       ]
 *     }
 *   ]
 * }]
 * ```
 *
 * When navigating to `/team/11/user/jim`, the router will instantiate the wrapper component with
 * the user component in it.
 *
 * ### Matching Strategy
 *
 * By default the router will look at what is left in the url, and check if it starts with
 * the specified path (e.g., `/team/11/user` starts with `team/:id`).
 *
 * We can change the matching strategy to make sure that the path covers the whole unconsumed url,
 * which is akin to `unconsumedUrl === path` or `$` regular expressions.
 *
 * This is particularly important when redirecting empty-path routes.
 *
 * ```
 * [{
 *   path: '',
 *   pathMatch: 'prefix', //default
 *   redirectTo: 'main'
 * },
 * {
 *   path: 'main',
 *   component: Main
 * }]
 * ```
 *
 * Since an empty path is a prefix of any url, even when navigating to '/main', the router will
 * still apply the redirect.
 *
 * If `pathMatch: full` is provided, the router will apply the redirect if and only if navigating to
 * '/'.
 *
 * ```
 * [{
 *   path: '',
 *   pathMatch: 'full',
 *   redirectTo: 'main'
 * },
 * {
 *   path: 'main',
 *   component: Main
 * }]
 * ```
 *
 * ### Componentless Routes
 *
 * It is useful at times to have the ability to share parameters between sibling components.
 *
 * Say we have two components--ChildCmp and AuxCmp--that we want to put next to each other and both
 * of them require some id parameter.
 *
 * One way to do that would be to have a bogus parent component, so both the siblings can get the id
 * parameter from it. This is not ideal. Instead, you can use a componentless route.
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
 * So when navigating to `parent/10/(a//aux:b)`, the route will instantiate the main child and aux
 * child components next to each other. In this example, the application component
 * has to have the primary and aux outlets defined.
 *
 * The router will also merge the `params`, `data`, and `resolve` of the componentless parent into
 * the `params`, `data`, and `resolve` of the children.
 *
 * This is especially useful when child components are defined as follows:
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
 * With this configuration in place, navigating to '/parent/10' will create the main child and aux
 * components.
 *
 * ### Lazy Loading
 *
 * Lazy loading speeds up our application load time by splitting it into multiple bundles, and
 * loading them on demand. The router is designed to make lazy loading simple and easy. Instead of
 * providing the children property, you can provide
 * the loadChildren property, as follows:
 *
 * ```
 * [{
 *   path: 'team/:id',
 *   component: Team,
 *   loadChildren: 'team'
 * }]
 * ```
 *
 * The router will use registered NgModuleFactoryLoader to fetch an NgModule associated with 'team'.
 * Then it will
 * extract the set of routes defined in that NgModule, and will transparently add those routes to
 * the main configuration.
 *
 * @stable use Routes
 */
export type Routes = Route[];

/**
 * @whatItDoes Represents the static data associated with a particular route.
 * See {@link Routes} for more details.
 * @stable
 */
export type Data = {
  [name: string]: any
};

/**
 *  @whatItDoes Represents the resolved data associated with a particular route.
 * See {@link Routes} for more details.
 * @stable
 */
export type ResolveData = {
  [name: string]: any
};

/**
 * @whatItDoes The type of `loadChildren`.
 * See {@link Routes} for more details.
 * @stable
 */
export type LoadChildrenCallback = () => Type<any>| Promise<Type<any>>| Observable<Type<any>>;

/**
 * @whatItDoes The type of `loadChildren`.
 *
 * See {@link Routes} for more details.
 * @stable
 */
export type LoadChildren = string | LoadChildrenCallback;

/**
 * See {@link Routes} for more details.
 * @stable
 */
export interface Route {
  path?: string;
  pathMatch?: string;
  component?: Type<any>;
  redirectTo?: string;
  outlet?: string;
  canActivate?: any[];
  canActivateChild?: any[];
  canDeactivate?: any[];
  canLoad?: any[];
  data?: Data;
  resolve?: ResolveData;
  children?: Route[];
  loadChildren?: LoadChildren;
}

export function validateConfig(config: Routes): void {
  config.forEach(validateNode);
}

function validateNode(route: Route): void {
  if (Array.isArray(route)) {
    throw new Error(`Invalid route configuration: Array cannot be specified`);
  }
  if (!!route.redirectTo && !!route.children) {
    throw new Error(
        `Invalid configuration of route '${route.path}': redirectTo and children cannot be used together`);
  }
  if (!!route.redirectTo && !!route.loadChildren) {
    throw new Error(
        `Invalid configuration of route '${route.path}': redirectTo and loadChildren cannot be used together`);
  }
  if (!!route.children && !!route.loadChildren) {
    throw new Error(
        `Invalid configuration of route '${route.path}': children and loadChildren cannot be used together`);
  }
  if (!!route.redirectTo && !!route.component) {
    throw new Error(
        `Invalid configuration of route '${route.path}': redirectTo and component cannot be used together`);
  }
  if (route.redirectTo === undefined && !route.component && !route.children &&
      !route.loadChildren) {
    throw new Error(
        `Invalid configuration of route '${route.path}': one of the following must be provided (component or redirectTo or children or loadChildren)`);
  }
  if (route.path === undefined) {
    throw new Error(`Invalid route configuration: routes must have path specified`);
  }
  if (route.path.startsWith('/')) {
    throw new Error(
        `Invalid route configuration of route '${route.path}': path cannot start with a slash`);
  }
  if (route.path === '' && route.redirectTo !== undefined && route.pathMatch === undefined) {
    const exp =
        `The default value of 'pathMatch' is 'prefix', but often the intent is to use 'full'.`;
    throw new Error(
        `Invalid route configuration of route '{path: "${route.path}", redirectTo: "${route.redirectTo}"}': please provide 'pathMatch'. ${exp}`);
  }
  if (route.pathMatch !== undefined && route.pathMatch !== 'full' && route.pathMatch !== 'prefix') {
    throw new Error(
        `Invalid configuration of route '${route.path}': pathMatch can only be set to 'prefix' or 'full'`);
  }
}
