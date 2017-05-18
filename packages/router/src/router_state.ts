/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {map} from 'rxjs/operator/map';

import {Data, ResolveData, Route} from './config';
import {PRIMARY_OUTLET, ParamMap, Params, convertToParamMap} from './shared';
import {UrlSegment, UrlSegmentGroup, UrlTree, equalSegments} from './url_tree';
import {shallowEqual, shallowEqualArrays} from './utils/collection';
import {Tree, TreeNode} from './utils/tree';


/**
 * @whatItDoes Represents the state of the router.
 *
 * @howToUse
 *
 * ```
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
 * @description
 * RouterState is a tree of activated routes. Every node in this tree knows about the "consumed" URL
 * segments, the extracted parameters, and the resolved data.
 *
 * See {@link ActivatedRoute} for more information.
 *
 * @stable
 */
export class RouterState extends Tree<ActivatedRoute> {
  /** @internal */
  constructor(
      root: TreeNode<ActivatedRoute>,
      /** The current snapshot of the router state */
      public snapshot: RouterStateSnapshot) {
    super(root);
    setRouterStateSnapshot<RouterState, ActivatedRoute>(this, root);
  }

  toString(): string { return this.snapshot.toString(); }
}

export function createEmptyState(urlTree: UrlTree, rootComponent: Type<any>| null): RouterState {
  const snapshot = createEmptyStateSnapshot(urlTree, rootComponent);
  const emptyUrl = new BehaviorSubject([new UrlSegment('', {})]);
  const emptyParams = new BehaviorSubject({});
  const emptyData = new BehaviorSubject({});
  const emptyQueryParams = new BehaviorSubject({});
  const fragment = new BehaviorSubject('');
  const activated = new ActivatedRoute(
      emptyUrl, emptyParams, emptyQueryParams, fragment, emptyData, PRIMARY_OUTLET, rootComponent,
      snapshot.root);
  activated.snapshot = snapshot.root;
  return new RouterState(new TreeNode<ActivatedRoute>(activated, []), snapshot);
}

export function createEmptyStateSnapshot(
    urlTree: UrlTree, rootComponent: Type<any>| null): RouterStateSnapshot {
  const emptyParams = {};
  const emptyData = {};
  const emptyQueryParams = {};
  const fragment = '';
  const activated = new ActivatedRouteSnapshot(
      [], emptyParams, emptyQueryParams, fragment, emptyData, PRIMARY_OUTLET, rootComponent, null,
      urlTree.root, -1, {});
  return new RouterStateSnapshot('', new TreeNode<ActivatedRouteSnapshot>(activated, []));
}

/**
 * @whatItDoes Contains the information about a route associated with a component loaded in an
 * outlet.
 * An `ActivatedRoute` can also be used to traverse the router state tree.
 *
 * @howToUse
 *
 * ```
 * @Component({...})
 * class MyComponent {
 *   constructor(route: ActivatedRoute) {
 *     const id: Observable<string> = route.params.map(p => p.id);
 *     const url: Observable<string> = route.url.map(segments => segments.join(''));
 *     // route.data includes both `data` and `resolve`
 *     const user = route.data.map(d => d.user);
 *   }
 * }
 * ```
 *
 * @stable
 */
export class ActivatedRoute {
  /** The current snapshot of this route */
  snapshot: ActivatedRouteSnapshot;
  /** @internal */
  _futureSnapshot: ActivatedRouteSnapshot;
  /** @internal */
  _routerState: RouterState;
  /** @internal */
  _paramMap: Observable<ParamMap>;
  /** @internal */
  _queryParamMap: Observable<ParamMap>;

  /** @internal */
  constructor(
      /** An observable of the URL segments matched by this route */
      public url: Observable<UrlSegment[]>,
      /** An observable of the matrix parameters scoped to this route */
      public params: Observable<Params>,
      /** An observable of the query parameters shared by all the routes */
      public queryParams: Observable<Params>,
      /** An observable of the URL fragment shared by all the routes */
      public fragment: Observable<string>,
      /** An observable of the static and resolved data of this route. */
      public data: Observable<Data>,
      /** The outlet name of the route. It's a constant */
      public outlet: string,
      /** The component of the route. It's a constant */
      // TODO(vsavkin): remove |string
      public component: Type<any>|string|null, futureSnapshot: ActivatedRouteSnapshot) {
    this._futureSnapshot = futureSnapshot;
  }

  /** The configuration used to match this route */
  get routeConfig(): Route|null { return this._futureSnapshot.routeConfig; }

  /** The root of the router state */
  get root(): ActivatedRoute { return this._routerState.root; }

  /** The parent of this route in the router state tree */
  get parent(): ActivatedRoute|null { return this._routerState.parent(this); }

  /** The first child of this route in the router state tree */
  get firstChild(): ActivatedRoute|null { return this._routerState.firstChild(this); }

  /** The children of this route in the router state tree */
  get children(): ActivatedRoute[] { return this._routerState.children(this); }

  /** The path from the root of the router state tree to this route */
  get pathFromRoot(): ActivatedRoute[] { return this._routerState.pathFromRoot(this); }

  get paramMap(): Observable<ParamMap> {
    if (!this._paramMap) {
      this._paramMap = map.call(this.params, (p: Params): ParamMap => convertToParamMap(p));
    }
    return this._paramMap;
  }

  get queryParamMap(): Observable<ParamMap> {
    if (!this._queryParamMap) {
      this._queryParamMap =
          map.call(this.queryParams, (p: Params): ParamMap => convertToParamMap(p));
    }
    return this._queryParamMap;
  }

  toString(): string {
    return this.snapshot ? this.snapshot.toString() : `Future(${this._futureSnapshot})`;
  }
}

/** @internal */
export type Inherited = {
  params: Params,
  data: Data,
  resolve: Data,
};

/** @internal */
export function inheritedParamsDataResolve(route: ActivatedRouteSnapshot): Inherited {
  const pathToRoot = route.pathFromRoot;

  let inhertingStartingFrom = pathToRoot.length - 1;

  while (inhertingStartingFrom >= 1) {
    const current = pathToRoot[inhertingStartingFrom];
    const parent = pathToRoot[inhertingStartingFrom - 1];
    // current route is an empty path => inherits its parent's params and data
    if (current.routeConfig && current.routeConfig.path === '') {
      inhertingStartingFrom--;

      // parent is componentless => current route should inherit its params and data
    } else if (!parent.component) {
      inhertingStartingFrom--;

    } else {
      break;
    }
  }

  return pathToRoot.slice(inhertingStartingFrom).reduce((res, curr) => {
    const params = {...res.params, ...curr.params};
    const data = {...res.data, ...curr.data};
    const resolve = {...res.resolve, ...curr._resolvedData};
    return {params, data, resolve};
  }, <any>{params: {}, data: {}, resolve: {}});
}

/**
 * @whatItDoes Contains the information about a route associated with a component loaded in an
 * outlet
 * at a particular moment in time. ActivatedRouteSnapshot can also be used to traverse the router
 * state tree.
 *
 * @howToUse
 *
 * ```
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
 * @stable
 */
export class ActivatedRouteSnapshot {
  /** @internal **/
  _routeConfig: Route|null;
  /** @internal **/
  _urlSegment: UrlSegmentGroup;
  /** @internal */
  _lastPathIndex: number;
  /** @internal */
  _resolve: ResolveData;
  /** @internal */
  _resolvedData: Data;
  /** @internal */
  _routerState: RouterStateSnapshot;
  /** @internal */
  _paramMap: ParamMap;
  /** @internal */
  _queryParamMap: ParamMap;

  /** @internal */
  constructor(
      /** The URL segments matched by this route */
      public url: UrlSegment[],
      /** The matrix parameters scoped to this route */
      public params: Params,
      /** The query parameters shared by all the routes */
      public queryParams: Params,
      /** The URL fragment shared by all the routes */
      public fragment: string,
      /** The static and resolved data of this route */
      public data: Data,
      /** The outlet name of the route */
      public outlet: string,
      /** The component of the route */
      public component: Type<any>|string|null, routeConfig: Route|null, urlSegment: UrlSegmentGroup,
      lastPathIndex: number, resolve: ResolveData) {
    this._routeConfig = routeConfig;
    this._urlSegment = urlSegment;
    this._lastPathIndex = lastPathIndex;
    this._resolve = resolve;
  }

  /** The configuration used to match this route */
  get routeConfig(): Route|null { return this._routeConfig; }

  /** The root of the router state */
  get root(): ActivatedRouteSnapshot { return this._routerState.root; }

  /** The parent of this route in the router state tree */
  get parent(): ActivatedRouteSnapshot|null { return this._routerState.parent(this); }

  /** The first child of this route in the router state tree */
  get firstChild(): ActivatedRouteSnapshot|null { return this._routerState.firstChild(this); }

  /** The children of this route in the router state tree */
  get children(): ActivatedRouteSnapshot[] { return this._routerState.children(this); }

  /** The path from the root of the router state tree to this route */
  get pathFromRoot(): ActivatedRouteSnapshot[] { return this._routerState.pathFromRoot(this); }

  get paramMap(): ParamMap {
    if (!this._paramMap) {
      this._paramMap = convertToParamMap(this.params);
    }
    return this._paramMap;
  }

  get queryParamMap(): ParamMap {
    if (!this._queryParamMap) {
      this._queryParamMap = convertToParamMap(this.queryParams);
    }
    return this._queryParamMap;
  }

  toString(): string {
    const url = this.url.map(segment => segment.toString()).join('/');
    const matched = this._routeConfig ? this._routeConfig.path : '';
    return `Route(url:'${url}', path:'${matched}')`;
  }
}

/**
 * @whatItDoes Represents the state of the router at a moment in time.
 *
 * @howToUse
 *
 * ```
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
 * @description
 * RouterStateSnapshot is a tree of activated route snapshots. Every node in this tree knows about
 * the "consumed" URL segments, the extracted parameters, and the resolved data.
 *
 * @stable
 */
export class RouterStateSnapshot extends Tree<ActivatedRouteSnapshot> {
  /** @internal */
  constructor(
      /** The url from which this snapshot was created */
      public url: string, root: TreeNode<ActivatedRouteSnapshot>) {
    super(root);
    setRouterStateSnapshot<RouterStateSnapshot, ActivatedRouteSnapshot>(this, root);
  }

  toString(): string { return serializeNode(this._root); }
}

function setRouterStateSnapshot<U, T extends{_routerState: U}>(state: U, node: TreeNode<T>): void {
  node.value._routerState = state;
  node.children.forEach(c => setRouterStateSnapshot(state, c));
}

function serializeNode(node: TreeNode<ActivatedRouteSnapshot>): string {
  const c = node.children.length > 0 ? ` { ${node.children.map(serializeNode).join(", ")} } ` : '';
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
    route.snapshot = route._futureSnapshot;
    if (!shallowEqual(currentSnapshot.queryParams, route._futureSnapshot.queryParams)) {
      (<any>route.queryParams).next(route._futureSnapshot.queryParams);
    }
    if (currentSnapshot.fragment !== route._futureSnapshot.fragment) {
      (<any>route.fragment).next(route._futureSnapshot.fragment);
    }
    if (!shallowEqual(currentSnapshot.params, route._futureSnapshot.params)) {
      (<any>route.params).next(route._futureSnapshot.params);
    }
    if (!shallowEqualArrays(currentSnapshot.url, route._futureSnapshot.url)) {
      (<any>route.url).next(route._futureSnapshot.url);
    }
    if (!shallowEqual(currentSnapshot.data, route._futureSnapshot.data)) {
      (<any>route.data).next(route._futureSnapshot.data);
    }
  } else {
    route.snapshot = route._futureSnapshot;

    // this is for resolved data
    (<any>route.data).next(route._futureSnapshot.data);
  }
}


export function equalParamsAndUrlSegments(
    a: ActivatedRouteSnapshot, b: ActivatedRouteSnapshot): boolean {
  const equalUrlParams = shallowEqual(a.params, b.params) && equalSegments(a.url, b.url);
  const parentsMismatch = !a.parent !== !b.parent;

  return equalUrlParams && !parentsMismatch &&
      (!a.parent || equalParamsAndUrlSegments(a.parent, b.parent !));
}