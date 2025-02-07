/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Type} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

import {Data, ResolveData, Route} from './models';
import {convertToParamMap, ParamMap, Params, PRIMARY_OUTLET, RouteTitleKey} from './shared';
import {equalSegments, UrlSegment} from './url_tree';
import {shallowEqual, shallowEqualArrays} from './utils/collection';
import {Tree, TreeNode} from './utils/tree';

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
export class RouterState extends Tree<ActivatedRoute> {
  /** @internal */
  constructor(
    root: TreeNode<ActivatedRoute>,
    /** The current snapshot of the router state */
    public snapshot: RouterStateSnapshot,
  ) {
    super(root);
    setRouterState(<RouterState>this, root);
  }

  override toString(): string {
    return this.snapshot.toString();
  }
}

export function createEmptyState(rootComponent: Type<any> | null): RouterState {
  const snapshot = createEmptyStateSnapshot(rootComponent);
  const emptyUrl = new BehaviorSubject([new UrlSegment('', {})]);
  const emptyParams = new BehaviorSubject({});
  const emptyData = new BehaviorSubject({});
  const emptyQueryParams = new BehaviorSubject({});
  const fragment = new BehaviorSubject<string | null>('');
  const activated = new ActivatedRoute(
    emptyUrl,
    emptyParams,
    emptyQueryParams,
    fragment,
    emptyData,
    PRIMARY_OUTLET,
    rootComponent,
    snapshot.root,
  );
  activated.snapshot = snapshot.root;
  return new RouterState(new TreeNode<ActivatedRoute>(activated, []), snapshot);
}

export function createEmptyStateSnapshot(rootComponent: Type<any> | null): RouterStateSnapshot {
  const emptyParams = {};
  const emptyData = {};
  const emptyQueryParams = {};
  const fragment = '';
  const activated = new ActivatedRouteSnapshot(
    [],
    emptyParams,
    emptyQueryParams,
    fragment,
    emptyData,
    PRIMARY_OUTLET,
    rootComponent,
    null,
    {},
  );
  return new RouterStateSnapshot('', new TreeNode<ActivatedRouteSnapshot>(activated, []));
}

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
 * {@example router/activated-route/module.ts region="activated-route"
 *     header="activated-route.component.ts"}
 *
 * @see [Getting route information](guide/routing/common-router-tasks#getting-route-information)
 *
 * @publicApi
 */
export class ActivatedRoute {
  /** The current snapshot of this route */
  snapshot!: ActivatedRouteSnapshot;
  /** @internal */
  _futureSnapshot: ActivatedRouteSnapshot;
  /** @internal */
  _routerState!: RouterState;
  /** @internal */
  _paramMap?: Observable<ParamMap>;
  /** @internal */
  _queryParamMap?: Observable<ParamMap>;

  /** An Observable of the resolved route title */
  readonly title: Observable<string | undefined>;

  /** An observable of the URL segments matched by this route. */
  public url: Observable<UrlSegment[]>;
  /** An observable of the matrix parameters scoped to this route. */
  public params: Observable<Params>;
  /** An observable of the query parameters shared by all the routes. */
  public queryParams: Observable<Params>;
  /** An observable of the URL fragment shared by all the routes. */
  public fragment: Observable<string | null>;
  /** An observable of the static and resolved data of this route. */
  public data: Observable<Data>;

  /** @internal */
  constructor(
    /** @internal */
    public urlSubject: BehaviorSubject<UrlSegment[]>,
    /** @internal */
    public paramsSubject: BehaviorSubject<Params>,
    /** @internal */
    public queryParamsSubject: BehaviorSubject<Params>,
    /** @internal */
    public fragmentSubject: BehaviorSubject<string | null>,
    /** @internal */
    public dataSubject: BehaviorSubject<Data>,
    /** The outlet name of the route, a constant. */
    public outlet: string,
    /** The component of the route, a constant. */
    public component: Type<any> | null,
    futureSnapshot: ActivatedRouteSnapshot,
  ) {
    this._futureSnapshot = futureSnapshot;
    this.title = this.dataSubject?.pipe(map((d: Data) => d[RouteTitleKey])) ?? of(undefined);
    // TODO(atscott): Verify that these can be changed to `.asObservable()` with TGP.
    this.url = urlSubject;
    this.params = paramsSubject;
    this.queryParams = queryParamsSubject;
    this.fragment = fragmentSubject;
    this.data = dataSubject;
  }

  /** The configuration used to match this route. */
  get routeConfig(): Route | null {
    return this._futureSnapshot.routeConfig;
  }

  /** The root of the router state. */
  get root(): ActivatedRoute {
    return this._routerState.root;
  }

  /** The parent of this route in the router state tree. */
  get parent(): ActivatedRoute | null {
    return this._routerState.parent(this);
  }

  /** The first child of this route in the router state tree. */
  get firstChild(): ActivatedRoute | null {
    return this._routerState.firstChild(this);
  }

  /** The children of this route in the router state tree. */
  get children(): ActivatedRoute[] {
    return this._routerState.children(this);
  }

  /** The path from the root of the router state tree to this route. */
  get pathFromRoot(): ActivatedRoute[] {
    return this._routerState.pathFromRoot(this);
  }

  /**
   * An Observable that contains a map of the required and optional parameters
   * specific to the route.
   * The map supports retrieving single and multiple values from the same parameter.
   */
  get paramMap(): Observable<ParamMap> {
    this._paramMap ??= this.params.pipe(map((p: Params): ParamMap => convertToParamMap(p)));
    return this._paramMap;
  }

  /**
   * An Observable that contains a map of the query parameters available to all routes.
   * The map supports retrieving single and multiple values from the query parameter.
   */
  get queryParamMap(): Observable<ParamMap> {
    this._queryParamMap ??= this.queryParams.pipe(
      map((p: Params): ParamMap => convertToParamMap(p)),
    );
    return this._queryParamMap;
  }

  toString(): string {
    return this.snapshot ? this.snapshot.toString() : `Future(${this._futureSnapshot})`;
  }
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
export function getInherited(
  route: ActivatedRouteSnapshot,
  parent: ActivatedRouteSnapshot | null,
  paramsInheritanceStrategy: ParamsInheritanceStrategy = 'emptyOnly',
): Inherited {
  let inherited: Inherited;
  const {routeConfig} = route;
  if (
    parent !== null &&
    (paramsInheritanceStrategy === 'always' ||
      // inherit parent data if route is empty path
      routeConfig?.path === '' ||
      // inherit parent data if parent was componentless
      (!parent.component && !parent.routeConfig?.loadComponent))
  ) {
    inherited = {
      params: {...parent.params, ...route.params},
      data: {...parent.data, ...route.data},
      resolve: {
        // Snapshots are created with data inherited from parent and guards (i.e. canActivate) can
        // change data because it's not frozen...
        // This first line could be deleted chose to break/disallow mutating the `data` object in
        // guards.
        // Note that data from parents still override this mutated data so anyone relying on this
        // might be surprised that it doesn't work if parent data is inherited but otherwise does.
        ...route.data,
        // Ensure inherited resolved data overrides inherited static data
        ...parent.data,
        // static data from the current route overrides any inherited data
        ...routeConfig?.data,
        // resolved data from current route overrides everything
        ...route._resolvedData,
      },
    };
  } else {
    inherited = {
      params: {...route.params},
      data: {...route.data},
      resolve: {...route.data, ...(route._resolvedData ?? {})},
    };
  }

  if (routeConfig && hasStaticTitle(routeConfig)) {
    inherited.resolve[RouteTitleKey] = routeConfig.title;
  }
  return inherited;
}

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
export class ActivatedRouteSnapshot {
  /** The configuration used to match this route **/
  public readonly routeConfig: Route | null;
  /** @internal */
  _resolve: ResolveData;
  /** @internal */
  _resolvedData?: Data;
  /** @internal */
  _routerState!: RouterStateSnapshot;
  /** @internal */
  _paramMap?: ParamMap;
  /** @internal */
  _queryParamMap?: ParamMap;

  /** The resolved route title */
  get title(): string | undefined {
    // Note: This _must_ be a getter because the data is mutated in the resolvers. Title will not be
    // available at the time of class instantiation.
    return this.data?.[RouteTitleKey];
  }

  /** @internal */
  constructor(
    /** The URL segments matched by this route */
    public url: UrlSegment[],
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
    public params: Params,
    /** The query parameters shared by all the routes */
    public queryParams: Params,
    /** The URL fragment shared by all the routes */
    public fragment: string | null,
    /** The static and resolved data of this route */
    public data: Data,
    /** The outlet name of the route */
    public outlet: string,
    /** The component of the route */
    public component: Type<any> | null,
    routeConfig: Route | null,
    resolve: ResolveData,
  ) {
    this.routeConfig = routeConfig;
    this._resolve = resolve;
  }

  /** The root of the router state */
  get root(): ActivatedRouteSnapshot {
    return this._routerState.root;
  }

  /** The parent of this route in the router state tree */
  get parent(): ActivatedRouteSnapshot | null {
    return this._routerState.parent(this);
  }

  /** The first child of this route in the router state tree */
  get firstChild(): ActivatedRouteSnapshot | null {
    return this._routerState.firstChild(this);
  }

  /** The children of this route in the router state tree */
  get children(): ActivatedRouteSnapshot[] {
    return this._routerState.children(this);
  }

  /** The path from the root of the router state tree to this route */
  get pathFromRoot(): ActivatedRouteSnapshot[] {
    return this._routerState.pathFromRoot(this);
  }

  get paramMap(): ParamMap {
    this._paramMap ??= convertToParamMap(this.params);
    return this._paramMap;
  }

  get queryParamMap(): ParamMap {
    this._queryParamMap ??= convertToParamMap(this.queryParams);
    return this._queryParamMap;
  }

  toString(): string {
    const url = this.url.map((segment) => segment.toString()).join('/');
    const matched = this.routeConfig ? this.routeConfig.path : '';
    return `Route(url:'${url}', path:'${matched}')`;
  }
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
export class RouterStateSnapshot extends Tree<ActivatedRouteSnapshot> {
  /** @internal */
  constructor(
    /** The url from which this snapshot was created */
    public url: string,
    root: TreeNode<ActivatedRouteSnapshot>,
  ) {
    super(root);
    setRouterState(<RouterStateSnapshot>this, root);
  }

  override toString(): string {
    return serializeNode(this._root);
  }
}

function setRouterState<U, T extends {_routerState: U}>(state: U, node: TreeNode<T>): void {
  node.value._routerState = state;
  node.children.forEach((c) => setRouterState(state, c));
}

function serializeNode(node: TreeNode<ActivatedRouteSnapshot>): string {
  const c = node.children.length > 0 ? ` { ${node.children.map(serializeNode).join(', ')} } ` : '';
  return `${node.value}${c}`;
}

/**
 * The expectation is that the activate route is created with the right set of parameters.
 * So we push new values into the observables only when they are not the initial values.
 * And we detect that by checking if the snapshot field is set.
 */
export function advanceActivatedRoute(route: ActivatedRoute): void {
  if (route.snapshot) {
    const currentSnapshot = route.snapshot;
    const nextSnapshot = route._futureSnapshot;
    route.snapshot = nextSnapshot;
    if (!shallowEqual(currentSnapshot.queryParams, nextSnapshot.queryParams)) {
      route.queryParamsSubject.next(nextSnapshot.queryParams);
    }
    if (currentSnapshot.fragment !== nextSnapshot.fragment) {
      route.fragmentSubject.next(nextSnapshot.fragment);
    }
    if (!shallowEqual(currentSnapshot.params, nextSnapshot.params)) {
      route.paramsSubject.next(nextSnapshot.params);
    }
    if (!shallowEqualArrays(currentSnapshot.url, nextSnapshot.url)) {
      route.urlSubject.next(nextSnapshot.url);
    }
    if (!shallowEqual(currentSnapshot.data, nextSnapshot.data)) {
      route.dataSubject.next(nextSnapshot.data);
    }
  } else {
    route.snapshot = route._futureSnapshot;

    // this is for resolved data
    route.dataSubject.next(route._futureSnapshot.data);
  }
}

export function equalParamsAndUrlSegments(
  a: ActivatedRouteSnapshot,
  b: ActivatedRouteSnapshot,
): boolean {
  const equalUrlParams = shallowEqual(a.params, b.params) && equalSegments(a.url, b.url);
  const parentsMismatch = !a.parent !== !b.parent;

  return (
    equalUrlParams &&
    !parentsMismatch &&
    (!a.parent || equalParamsAndUrlSegments(a.parent, b.parent!))
  );
}

export function hasStaticTitle(config: Route) {
  return typeof config.title === 'string' || config.title === null;
}
