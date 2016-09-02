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
import {UrlSegment, UrlSegmentGroup, UrlTree} from './url_tree';
import {merge, shallowEqual, shallowEqualArrays} from './utils/collection';
import {Tree, TreeNode} from './utils/tree';


/**
 * The state of the router.
 *
 * ### Usage
 *
 * ```
 * @Component({template:''})
 * class MyComponent {
 *   constructor(router: Router) {
 *     const state = router.routerState;
 *     const id: Observable<string> = state.root.firstChild.params.map(p => p.id);
 *     const isDebug: Observable<string> = state.root.queryParams.map(q => q.debug);
 *   }
 * }
 * ```
 *
 * @stable
 */
export class RouterState extends Tree<ActivatedRoute> {
  /**
   * @internal
   */
  constructor(root: TreeNode<ActivatedRoute>, public snapshot: RouterStateSnapshot) {
    super(root);
    setRouterStateSnapshot<RouterState, ActivatedRoute>(this, root);
  }

  toString(): string { return this.snapshot.toString(); }
}

export function createEmptyState(urlTree: UrlTree, rootComponent: Type<any>): RouterState {
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
    urlTree: UrlTree, rootComponent: Type<any>): RouterStateSnapshot {
  const emptyParams = {};
  const emptyData = {};
  const emptyQueryParams = {};
  const fragment = '';
  const activated = new ActivatedRouteSnapshot(
      [], emptyParams, emptyQueryParams, fragment, emptyData, PRIMARY_OUTLET, rootComponent, null,
      urlTree.root, -1, InheritedResolve.empty);
  return new RouterStateSnapshot('', new TreeNode<ActivatedRouteSnapshot>(activated, []));
}

/**
 * Contains the information about a component loaded in an outlet. The information is provided
 * through the params, urlSegments, and data observables.
 *
 * ### Usage
 *
 * ```
 * @Component({template:''})
 * class MyComponent {
 *   constructor(route: ActivatedRoute) {
 *     const id: Observable<string> = route.params.map(p => p.id);
 *     const data = route.data.map(d => d.user); //includes `data` and `resolve`
 *   }
 * }
 * ```
 *
 * @stable
 */
export class ActivatedRoute {
  /** @internal */
  _futureSnapshot: ActivatedRouteSnapshot;
  snapshot: ActivatedRouteSnapshot;

  /** @internal */
  _routerState: RouterState;

  /**
   * @internal
   */
  constructor(
      public url: Observable<UrlSegment[]>, public params: Observable<Params>,
      public queryParams: Observable<Params>, public fragment: Observable<string>,
      public data: Observable<Data>, public outlet: string, public component: Type<any>|string,
      futureSnapshot: ActivatedRouteSnapshot) {
    this._futureSnapshot = futureSnapshot;
  }

  get routeConfig(): Route { return this._futureSnapshot.routeConfig; }

  get root(): ActivatedRoute { return this._routerState.root; }

  get parent(): ActivatedRoute { return this._routerState.parent(this); }

  get firstChild(): ActivatedRoute { return this._routerState.firstChild(this); }

  get children(): ActivatedRoute[] { return this._routerState.children(this); }

  get pathFromRoot(): ActivatedRoute[] { return this._routerState.pathFromRoot(this); }

  toString(): string {
    return this.snapshot ? this.snapshot.toString() : `Future(${this._futureSnapshot})`;
  }
}

/**
 * @internal
 */
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
 * @Component({template:''})
 * class MyComponent {
 *   constructor(route: ActivatedRoute) {
 *     const id: string = route.snapshot.params.id;
 *     const data = route.snapshot.data;
 *   }
 * }
 * ```
 *
 * @stable
 */
export class ActivatedRouteSnapshot {
  /** @internal **/
  _routeConfig: Route;

  /** @internal **/
  _urlSegment: UrlSegmentGroup;

  /** @internal */
  _lastPathIndex: number;

  /** @internal */
  _resolve: InheritedResolve;

  /** @internal */
  _routerState: RouterStateSnapshot;

  /**
   * @internal
   */
  constructor(
      public url: UrlSegment[], public params: Params, public queryParams: Params,
      public fragment: string, public data: Data, public outlet: string,
      public component: Type<any>|string, routeConfig: Route, urlSegment: UrlSegmentGroup,
      lastPathIndex: number, resolve: InheritedResolve) {
    this._routeConfig = routeConfig;
    this._urlSegment = urlSegment;
    this._lastPathIndex = lastPathIndex;
    this._resolve = resolve;
  }

  get routeConfig(): Route { return this._routeConfig; }

  get root(): ActivatedRouteSnapshot { return this._routerState.root; }

  get parent(): ActivatedRouteSnapshot { return this._routerState.parent(this); }

  get firstChild(): ActivatedRouteSnapshot { return this._routerState.firstChild(this); }

  get children(): ActivatedRouteSnapshot[] { return this._routerState.children(this); }

  get pathFromRoot(): ActivatedRouteSnapshot[] { return this._routerState.pathFromRoot(this); }

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
 * @Component({template:''})
 * class MyComponent {
 *   constructor(router: Router) {
 *     const snapshot = router.routerState.snapshot;
 *   }
 * }
 * ```
 *
 * @stable
 */
export class RouterStateSnapshot extends Tree<ActivatedRouteSnapshot> {
  /**
   * @internal
   */
  constructor(public url: string, root: TreeNode<ActivatedRouteSnapshot>) {
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
    if (!shallowEqual(route.snapshot.queryParams, route._futureSnapshot.queryParams)) {
      (<any>route.queryParams).next(route._futureSnapshot.queryParams);
    }
    if (route.snapshot.fragment !== route._futureSnapshot.fragment) {
      (<any>route.fragment).next(route._futureSnapshot.fragment);
    }
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

    // this is for resolved data
    (<any>route.data).next(route._futureSnapshot.data);
  }
}
