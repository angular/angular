/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Type } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Data, ResolveData, Route } from './models';
import { ParamMap, Params } from './shared';
import { UrlSegment } from './url_tree';
import { Tree, TreeNode } from './utils/tree';
/**
 * Represents the state of the router as a tree of activated routes.
 *
 * @usageNotes
 *
 * Every node in the route tree is an `ActivatedRoute` instance
 * that knows about the "consumed" URL segments, the extracted parameters,
 * and the resolved data.
 * Use the `ActivatedRoute` properties to traverse the tree from any node.
 *
 * The following fragment shows how a component gets the root node
 * of the current state to establish its own route tree:
 *
 * ```ts
 * @Component({templateUrl:'template.html'})
 * class MyComponent {
 *   constructor(router: Router) {
 *     const state: RouterState = router.routerState;
 *     const root: ActivatedRoute = state.root;
 *     const child = root.firstChild;
 *     const id: Observable<string> = child.params.map(p => p.id);
 *     //...
 *   }
 * }
 * ```
 *
 * @see {@link ActivatedRoute}
 * @see [Getting route information](guide/routing/common-router-tasks#getting-route-information)
 *
 * @publicApi
 */
export declare class RouterState extends Tree<ActivatedRoute> {
    /** The current snapshot of the router state */
    snapshot: RouterStateSnapshot;
    /** @internal */
    constructor(root: TreeNode<ActivatedRoute>, 
    /** The current snapshot of the router state */
    snapshot: RouterStateSnapshot);
    toString(): string;
}
export declare function createEmptyState(rootComponent: Type<any> | null): RouterState;
export declare function createEmptyStateSnapshot(rootComponent: Type<any> | null): RouterStateSnapshot;
/**
 * Provides access to information about a route associated with a component
 * that is loaded in an outlet.
 * Use to traverse the `RouterState` tree and extract information from nodes.
 *
 * The following example shows how to construct a component using information from a
 * currently activated route.
 *
 * Note: the observables in this class only emit when the current and previous values differ based
 * on shallow equality. For example, changing deeply nested properties in resolved `data` will not
 * cause the `ActivatedRoute.data` `Observable` to emit a new value.
 *
 * {@example router/activated-route/module.ts region="activated-route"}
 *
 * @see [Getting route information](guide/routing/common-router-tasks#getting-route-information)
 *
 * @publicApi
 */
export declare class ActivatedRoute {
    /** @internal */
    urlSubject: BehaviorSubject<UrlSegment[]>;
    /** @internal */
    paramsSubject: BehaviorSubject<Params>;
    /** @internal */
    queryParamsSubject: BehaviorSubject<Params>;
    /** @internal */
    fragmentSubject: BehaviorSubject<string | null>;
    /** @internal */
    dataSubject: BehaviorSubject<Data>;
    /** The outlet name of the route, a constant. */
    outlet: string;
    /** The component of the route, a constant. */
    component: Type<any> | null;
    /** The current snapshot of this route */
    snapshot: ActivatedRouteSnapshot;
    /** @internal */
    _futureSnapshot: ActivatedRouteSnapshot;
    /** @internal */
    _routerState: RouterState;
    /** @internal */
    _paramMap?: Observable<ParamMap>;
    /** @internal */
    _queryParamMap?: Observable<ParamMap>;
    /** An Observable of the resolved route title */
    readonly title: Observable<string | undefined>;
    /** An observable of the URL segments matched by this route. */
    url: Observable<UrlSegment[]>;
    /** An observable of the matrix parameters scoped to this route. */
    params: Observable<Params>;
    /** An observable of the query parameters shared by all the routes. */
    queryParams: Observable<Params>;
    /** An observable of the URL fragment shared by all the routes. */
    fragment: Observable<string | null>;
    /** An observable of the static and resolved data of this route. */
    data: Observable<Data>;
    /** @internal */
    constructor(
    /** @internal */
    urlSubject: BehaviorSubject<UrlSegment[]>, 
    /** @internal */
    paramsSubject: BehaviorSubject<Params>, 
    /** @internal */
    queryParamsSubject: BehaviorSubject<Params>, 
    /** @internal */
    fragmentSubject: BehaviorSubject<string | null>, 
    /** @internal */
    dataSubject: BehaviorSubject<Data>, 
    /** The outlet name of the route, a constant. */
    outlet: string, 
    /** The component of the route, a constant. */
    component: Type<any> | null, futureSnapshot: ActivatedRouteSnapshot);
    /** The configuration used to match this route. */
    get routeConfig(): Route | null;
    /** The root of the router state. */
    get root(): ActivatedRoute;
    /** The parent of this route in the router state tree. */
    get parent(): ActivatedRoute | null;
    /** The first child of this route in the router state tree. */
    get firstChild(): ActivatedRoute | null;
    /** The children of this route in the router state tree. */
    get children(): ActivatedRoute[];
    /** The path from the root of the router state tree to this route. */
    get pathFromRoot(): ActivatedRoute[];
    /**
     * An Observable that contains a map of the required and optional parameters
     * specific to the route.
     * The map supports retrieving single and multiple values from the same parameter.
     */
    get paramMap(): Observable<ParamMap>;
    /**
     * An Observable that contains a map of the query parameters available to all routes.
     * The map supports retrieving single and multiple values from the query parameter.
     */
    get queryParamMap(): Observable<ParamMap>;
    toString(): string;
}
export type ParamsInheritanceStrategy = 'emptyOnly' | 'always';
/** @internal */
export type Inherited = {
    params: Params;
    data: Data;
    resolve: Data;
};
/**
 * Returns the inherited params, data, and resolve for a given route.
 *
 * By default, we do not inherit parent data unless the current route is path-less or the parent
 * route is component-less.
 */
export declare function getInherited(route: ActivatedRouteSnapshot, parent: ActivatedRouteSnapshot | null, paramsInheritanceStrategy?: ParamsInheritanceStrategy): Inherited;
/**
 * @description
 *
 * Contains the information about a route associated with a component loaded in an
 * outlet at a particular moment in time. ActivatedRouteSnapshot can also be used to
 * traverse the router state tree.
 *
 * The following example initializes a component with route information extracted
 * from the snapshot of the root node at the time of creation.
 *
 * ```ts
 * @Component({templateUrl:'./my-component.html'})
 * class MyComponent {
 *   constructor(route: ActivatedRoute) {
 *     const id: string = route.snapshot.params.id;
 *     const url: string = route.snapshot.url.join('');
 *     const user = route.snapshot.data.user;
 *   }
 * }
 * ```
 *
 * @publicApi
 */
export declare class ActivatedRouteSnapshot {
    /** The URL segments matched by this route */
    url: UrlSegment[];
    /**
     *  The matrix parameters scoped to this route.
     *
     *  You can compute all params (or data) in the router state or to get params outside
     *  of an activated component by traversing the `RouterState` tree as in the following
     *  example:
     *  ```ts
     *  collectRouteParams(router: Router) {
     *    let params = {};
     *    let stack: ActivatedRouteSnapshot[] = [router.routerState.snapshot.root];
     *    while (stack.length > 0) {
     *      const route = stack.pop()!;
     *      params = {...params, ...route.params};
     *      stack.push(...route.children);
     *    }
     *    return params;
     *  }
     *  ```
     */
    params: Params;
    /** The query parameters shared by all the routes */
    queryParams: Params;
    /** The URL fragment shared by all the routes */
    fragment: string | null;
    /** The static and resolved data of this route */
    data: Data;
    /** The outlet name of the route */
    outlet: string;
    /** The component of the route */
    component: Type<any> | null;
    /** The configuration used to match this route **/
    readonly routeConfig: Route | null;
    /** @internal */
    _resolve: ResolveData;
    /** @internal */
    _resolvedData?: Data;
    /** @internal */
    _routerState: RouterStateSnapshot;
    /** @internal */
    _paramMap?: ParamMap;
    /** @internal */
    _queryParamMap?: ParamMap;
    /** The resolved route title */
    get title(): string | undefined;
    /** @internal */
    constructor(
    /** The URL segments matched by this route */
    url: UrlSegment[], 
    /**
     *  The matrix parameters scoped to this route.
     *
     *  You can compute all params (or data) in the router state or to get params outside
     *  of an activated component by traversing the `RouterState` tree as in the following
     *  example:
     *  ```ts
     *  collectRouteParams(router: Router) {
     *    let params = {};
     *    let stack: ActivatedRouteSnapshot[] = [router.routerState.snapshot.root];
     *    while (stack.length > 0) {
     *      const route = stack.pop()!;
     *      params = {...params, ...route.params};
     *      stack.push(...route.children);
     *    }
     *    return params;
     *  }
     *  ```
     */
    params: Params, 
    /** The query parameters shared by all the routes */
    queryParams: Params, 
    /** The URL fragment shared by all the routes */
    fragment: string | null, 
    /** The static and resolved data of this route */
    data: Data, 
    /** The outlet name of the route */
    outlet: string, 
    /** The component of the route */
    component: Type<any> | null, routeConfig: Route | null, resolve: ResolveData);
    /** The root of the router state */
    get root(): ActivatedRouteSnapshot;
    /** The parent of this route in the router state tree */
    get parent(): ActivatedRouteSnapshot | null;
    /** The first child of this route in the router state tree */
    get firstChild(): ActivatedRouteSnapshot | null;
    /** The children of this route in the router state tree */
    get children(): ActivatedRouteSnapshot[];
    /** The path from the root of the router state tree to this route */
    get pathFromRoot(): ActivatedRouteSnapshot[];
    get paramMap(): ParamMap;
    get queryParamMap(): ParamMap;
    toString(): string;
}
/**
 * @description
 *
 * Represents the state of the router at a moment in time.
 *
 * This is a tree of activated route snapshots. Every node in this tree knows about
 * the "consumed" URL segments, the extracted parameters, and the resolved data.
 *
 * The following example shows how a component is initialized with information
 * from the snapshot of the root node's state at the time of creation.
 *
 * ```ts
 * @Component({templateUrl:'template.html'})
 * class MyComponent {
 *   constructor(router: Router) {
 *     const state: RouterState = router.routerState;
 *     const snapshot: RouterStateSnapshot = state.snapshot;
 *     const root: ActivatedRouteSnapshot = snapshot.root;
 *     const child = root.firstChild;
 *     const id: Observable<string> = child.params.map(p => p.id);
 *     //...
 *   }
 * }
 * ```
 *
 * @publicApi
 */
export declare class RouterStateSnapshot extends Tree<ActivatedRouteSnapshot> {
    /** The url from which this snapshot was created */
    url: string;
    /** @internal */
    constructor(
    /** The url from which this snapshot was created */
    url: string, root: TreeNode<ActivatedRouteSnapshot>);
    toString(): string;
}
/**
 * The expectation is that the activate route is created with the right set of parameters.
 * So we push new values into the observables only when they are not the initial values.
 * And we detect that by checking if the snapshot field is set.
 */
export declare function advanceActivatedRoute(route: ActivatedRoute): void;
export declare function equalParamsAndUrlSegments(a: ActivatedRouteSnapshot, b: ActivatedRouteSnapshot): boolean;
export declare function hasStaticTitle(config: Route): boolean;
