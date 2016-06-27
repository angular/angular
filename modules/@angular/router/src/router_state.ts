/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentFactory, Type} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';

import {Data, ResolveData, Route} from './config';
import {PRIMARY_OUTLET, Params} from './shared';
import {UrlPathWithParams, UrlSegment, UrlTree} from './url_tree';
import {merge, shallowEqual, shallowEqualArrays} from './utils/collection';
import {Tree, TreeNode} from './utils/tree';


/**
 * The state of the router.
 *
 * ### Usage
 *
 * ```
 * class MyComponent {
 *   constructor(router: Router) {
 *     const state = router.routerState;
 *     const id: Observable<string> = state.firstChild(state.root).params.map(p => p.id);
 *     const isDebug: Observable<string> = state.queryParams.map(q => q.debug);
 *   }
 * }
 * ```
 *
 * @experimental
 */
export class RouterState extends Tree<ActivatedRoute> {
  /**
   * @internal
   */
  constructor(
      root: TreeNode<ActivatedRoute>, public queryParams: Observable<Params>,
      public fragment: Observable<string>, public snapshot: RouterStateSnapshot) {
    super(root);
  }

  toString(): string { return this.snapshot.toString(); }
}

export function createEmptyState(urlTree: UrlTree, rootComponent: Type): RouterState {
  const snapshot = createEmptyStateSnapshot(urlTree, rootComponent);
  const emptyUrl = new BehaviorSubject([new UrlPathWithParams('', {})]);
  const emptyParams = new BehaviorSubject({});
  const emptyData = new BehaviorSubject({});
  const emptyQueryParams = new BehaviorSubject({});
  const fragment = new BehaviorSubject('');
  const activated = new ActivatedRoute(
      emptyUrl, emptyParams, emptyData, PRIMARY_OUTLET, rootComponent, snapshot.root);
  activated.snapshot = snapshot.root;
  return new RouterState(
      new TreeNode<ActivatedRoute>(activated, []), emptyQueryParams, fragment, snapshot);
}

function createEmptyStateSnapshot(urlTree: UrlTree, rootComponent: Type): RouterStateSnapshot {
  const emptyParams = {};
  const emptyData = {};
  const emptyQueryParams = {};
  const fragment = '';
  const activated = new ActivatedRouteSnapshot(
      [], emptyParams, emptyData, PRIMARY_OUTLET, rootComponent, null, urlTree.root, -1,
      InheritedResolve.empty);
  return new RouterStateSnapshot(
      '', new TreeNode<ActivatedRouteSnapshot>(activated, []), emptyQueryParams, fragment);
}

/**
 * Contains the information about a component loaded in an outlet. The information is provided
 * through
 * the params and urlSegments observables.
 *
 * ### Usage
 *
 * ```
 * class MyComponent {
 *   constructor(route: ActivatedRoute) {
 *     const id: Observable<string> = route.params.map(p => p.id);
 *   }
 * }
 * ```
 *
 * @experimental
 */
export class ActivatedRoute {
  /** @internal */
  _futureSnapshot: ActivatedRouteSnapshot;
  snapshot: ActivatedRouteSnapshot;

  /**
   * @internal
   */
  constructor(
      public url: Observable<UrlPathWithParams[]>, public params: Observable<Params>,
      public data: Observable<Data>, public outlet: string, public component: Type|string,
      futureSnapshot: ActivatedRouteSnapshot) {
    this._futureSnapshot = futureSnapshot;
  }

  toString(): string {
    return this.snapshot ? this.snapshot.toString() : `Future(${this._futureSnapshot})`;
  }
}

export class InheritedResolve {
  /**
   * @internal
   */
  resolvedData = {};

  constructor(public parent: InheritedResolve, public current: ResolveData) {}

  /**
   * @internal
   */
  get flattenedResolvedData(): Data {
    return this.parent ? merge(this.parent.flattenedResolvedData, this.resolvedData) :
                         this.resolvedData;
  }

  static get empty(): InheritedResolve { return new InheritedResolve(null, {}); }
}

/**
 * Contains the information about a component loaded in an outlet at a particular moment in time.
 *
 * ### Usage
 *
 * ```
 * class MyComponent {
 *   constructor(route: ActivatedRoute) {
 *     const id: string = route.snapshot.params.id;
 *   }
 * }
 * ```
 *
 * @experimental
 */
export class ActivatedRouteSnapshot {
  /**
   * @internal
   */
  _resolvedComponentFactory: ComponentFactory<any>;

  /** @internal **/
  _routeConfig: Route;

  /** @internal **/
  _urlSegment: UrlSegment;

  /** @internal */
  _lastPathIndex: number;

  /** @internal */
  _resolve: InheritedResolve;

  /**
   * @internal
   */
  constructor(
      public url: UrlPathWithParams[], public params: Params, public data: Data,
      public outlet: string, public component: Type|string, routeConfig: Route,
      urlSegment: UrlSegment, lastPathIndex: number, resolve: InheritedResolve) {
    this._routeConfig = routeConfig;
    this._urlSegment = urlSegment;
    this._lastPathIndex = lastPathIndex;
    this._resolve = resolve;
  }

  toString(): string {
    const url = this.url.map(s => s.toString()).join('/');
    const matched = this._routeConfig ? this._routeConfig.path : '';
    return `Route(url:'${url}', path:'${matched}')`;
  }
}

/**
 * The state of the router at a particular moment in time.
 *
 * ### Usage
 *
 * ```
 * class MyComponent {
 *   constructor(router: Router) {
 *     const snapshot = router.routerState.snapshot;
 *   }
 * }
 * ```
 *
 * @experimental
 */
export class RouterStateSnapshot extends Tree<ActivatedRouteSnapshot> {
  /**
   * @internal
   */
  constructor(
      public url: string, root: TreeNode<ActivatedRouteSnapshot>, public queryParams: Params,
      public fragment: string) {
    super(root);
  }

  toString(): string { return serializeNode(this._root); }
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
    if (!shallowEqual(route.snapshot.params, route._futureSnapshot.params)) {
      (<any>route.params).next(route._futureSnapshot.params);
      (<any>route.data).next(route._futureSnapshot.data);
    }
    if (!shallowEqualArrays(route.snapshot.url, route._futureSnapshot.url)) {
      (<any>route.url).next(route._futureSnapshot.url);
    }
    route.snapshot = route._futureSnapshot;
  } else {
    route.snapshot = route._futureSnapshot;
    (<any>route.data).next(route._futureSnapshot.data);
  }
}
