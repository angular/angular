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

import {Data, ResolveData, Route} from './config';
import {PRIMARY_OUTLET, Params} from './shared';
import {UrlSegment, UrlSegmentGroup, UrlTree} from './url_tree';
import {merge, shallowEqual, shallowEqualArrays} from './utils/collection';
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
 * segments,
 * the extracted parameters, and the resolved data.
 *
 * See {@link ActivatedRoute} for more information.
 *
 * @stable
 */
export class RouterState extends Tree<ActivatedRoute> {
  /**
   * @internal
   */
  constructor(
      root: TreeNode<ActivatedRoute>,
      /**
       * The current snapshot of the router state.
       */
      public snapshot: RouterStateSnapshot) {
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
 * @whatItDoes Contains the information about a route associated with a component loaded in an
 * outlet.
 * ActivatedRoute can also be used to traverse the router state tree.
 *
 * @howToUse
 *
 * ```
 * @Component({templateUrl:'./my-component.html'})
 * class MyComponent {
 *   constructor(route: ActivatedRoute) {
 *     const id: Observable<string> = route.params.map(p => p.id);
 *     const url: Observable<string> = route.url.map(s => s.join(''));
 *     const user = route.data.map(d => d.user); //includes `data` and `resolve`
 *   }
 * }
 * ```
 *
 * @stable
 */
export class ActivatedRoute {
  /** @internal */
  _futureSnapshot: ActivatedRouteSnapshot;

  /**
   * The current snapshot of this route.
   */
  snapshot: ActivatedRouteSnapshot;

  /** @internal */
  _routerState: RouterState;

  /**
   * @internal
   */
  constructor(
      /**
       *  The URL segments matched by this route. The observable will emit a new value when
       *  the array of segments changes.
       */
      public url: Observable<UrlSegment[]>,

      /**
       * The matrix parameters scoped to this route. The observable will emit a new value when
       * the set of the parameters changes.
       */
      public params: Observable<Params>,

      /**
       * The query parameters shared by all the routes. The observable will emit a new value when
       * the set of the parameters changes.
       */
      public queryParams: Observable<Params>,

      /**
       * The URL fragment shared by all the routes. The observable will emit a new value when
       * the URL fragment changes.
       */
      public fragment: Observable<string>,

      /**
       * The static and resolved data of this route. The observable will emit a new value when
       * any of the resolvers returns a new object.
       */
      public data: Observable<Data>,

      /**
       * The outlet name of the route. It's a constant.
       */
      public outlet: string,

      /**
       * The component of the route. It's a constant.
       */
      public component: Type<any>|string,  // TODO: vsavkin: remove |string
      futureSnapshot: ActivatedRouteSnapshot) {
    this._futureSnapshot = futureSnapshot;
  }

  /**
   * The configuration used to match this route.
   */
  get routeConfig(): Route { return this._futureSnapshot.routeConfig; }

  /**
   * The root of the router state.
   */
  get root(): ActivatedRoute { return this._routerState.root; }

  /**
   * The parent of this route in the router state tree.
   */
  get parent(): ActivatedRoute { return this._routerState.parent(this); }

  /**
   * The first child of this route in the router state tree.
   */
  get firstChild(): ActivatedRoute { return this._routerState.firstChild(this); }

  /**
   * The children of this route in the router state tree.
   */
  get children(): ActivatedRoute[] { return this._routerState.children(this); }

  /**
   * The path from the root of the router state tree to this route.
   */
  get pathFromRoot(): ActivatedRoute[] { return this._routerState.pathFromRoot(this); }

  /**
   * @docsNotRequired
   */
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
      /**
       *  The URL segments matched by this route.
       */
      public url: UrlSegment[],

      /**
       * The matrix parameters scoped to this route.
       */
      public params: Params,

      /**
       * The query parameters shared by all the routes.
       */
      public queryParams: Params,

      /**
       * The URL fragment shared by all the routes.
       */
      public fragment: string,

      /**
       * The static and resolved data of this route.
       */
      public data: Data,

      /**
       * The outlet name of the route.
       */
      public outlet: string,

      /**
       * The component of the route.
       */
      public component: Type<any>|string, routeConfig: Route, urlSegment: UrlSegmentGroup,
      lastPathIndex: number, resolve: InheritedResolve) {
    this._routeConfig = routeConfig;
    this._urlSegment = urlSegment;
    this._lastPathIndex = lastPathIndex;
    this._resolve = resolve;
  }

  /**
   * The configuration used to match this route.
   */
  get routeConfig(): Route { return this._routeConfig; }

  /**
   * The root of the router state.
   */
  get root(): ActivatedRouteSnapshot { return this._routerState.root; }

  /**
   * The parent of this route in the router state tree.
   */
  get parent(): ActivatedRouteSnapshot { return this._routerState.parent(this); }

  /**
   * The first child of this route in the router state tree.
   */
  get firstChild(): ActivatedRouteSnapshot { return this._routerState.firstChild(this); }

  /**
   * The children of this route in the router state tree.
   */
  get children(): ActivatedRouteSnapshot[] { return this._routerState.children(this); }

  /**
   * The path from the root of the router state tree to this route.
   */
  get pathFromRoot(): ActivatedRouteSnapshot[] { return this._routerState.pathFromRoot(this); }

  /**
   * @docsNotRequired
   */
  toString(): string {
    const url = this.url.map(s => s.toString()).join('/');
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
  /**
   * @internal
   */
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
