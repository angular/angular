import {ComponentFactory, Type} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';

import {Route} from './config';
import {PRIMARY_OUTLET, Params} from './shared';
import {UrlSegment} from './url_tree';
import {shallowEqual} from './utils/collection';
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
}

export function createEmptyState(rootComponent: Type): RouterState {
  const snapshot = createEmptyStateSnapshot(rootComponent);
  const emptyUrl = new BehaviorSubject([new UrlSegment('', {}, PRIMARY_OUTLET)]);
  const emptyParams = new BehaviorSubject({});
  const emptyQueryParams = new BehaviorSubject({});
  const fragment = new BehaviorSubject('');
  const activated =
      new ActivatedRoute(emptyUrl, emptyParams, PRIMARY_OUTLET, rootComponent, snapshot.root);
  activated.snapshot = snapshot.root;
  return new RouterState(
      new TreeNode<ActivatedRoute>(activated, []), emptyQueryParams, fragment, snapshot);
}

function createEmptyStateSnapshot(rootComponent: Type): RouterStateSnapshot {
  const rootUrlSegment = new UrlSegment('', {}, PRIMARY_OUTLET);
  const emptyUrl = [rootUrlSegment];
  const emptyParams = {};
  const emptyQueryParams = {};
  const fragment = '';
  const activated = new ActivatedRouteSnapshot(
      emptyUrl, emptyParams, PRIMARY_OUTLET, rootComponent, null, rootUrlSegment);
  return new RouterStateSnapshot(
      new TreeNode<ActivatedRouteSnapshot>(activated, []), emptyQueryParams, fragment);
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
 */
export class ActivatedRoute {
  /** @internal */
  _futureSnapshot: ActivatedRouteSnapshot;
  snapshot: ActivatedRouteSnapshot;

  /**
   * @internal
   */
  constructor(
      public urlSegments: Observable<UrlSegment[]>, public params: Observable<Params>,
      public outlet: string, public component: Type|string,
      futureSnapshot: ActivatedRouteSnapshot) {
    this._futureSnapshot = futureSnapshot;
  }
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
 */
export class ActivatedRouteSnapshot {
  /**
   * @internal
   */
  _resolvedComponentFactory: ComponentFactory<any>;

  /** @internal **/
  _routeConfig: Route|null;

  /** @internal **/
  _lastUrlSegment: UrlSegment;

  /**
   * @internal
   */
  constructor(
      public urlSegments: UrlSegment[], public params: Params, public outlet: string,
      public component: Type|string, routeConfig: Route|null, lastUrlSegment: UrlSegment) {
    this._routeConfig = routeConfig;
    this._lastUrlSegment = lastUrlSegment;
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
 */
export class RouterStateSnapshot extends Tree<ActivatedRouteSnapshot> {
  /**
   * @internal
   */
  constructor(
      root: TreeNode<ActivatedRouteSnapshot>, public queryParams: Params,
      public fragment: string|null) {
    super(root);
  }
}

/**
 * The expectation is that the activate route is created with the right set of parameters.
 * So we push new values into the observables only when they are not the initial values.
 * And we detect that by checking if the snapshot field is set.
 */
export function advanceActivatedRoute(route: ActivatedRoute): void {
  if (route.snapshot && !shallowEqual(route.snapshot.params, route._futureSnapshot.params)) {
    route.snapshot = route._futureSnapshot;
    (<any>route.urlSegments).next(route.snapshot.urlSegments);
    (<any>route.params).next(route.snapshot.params);
  } else {
    route.snapshot = route._futureSnapshot;
  }
}