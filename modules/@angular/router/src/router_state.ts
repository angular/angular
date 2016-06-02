import { Tree, TreeNode } from './utils/tree';
import { UrlSegment } from './url_tree';
import { Route } from './config';
import { Params, PRIMARY_OUTLET } from './shared';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Type, ComponentFactory } from '@angular/core';

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
  constructor(root: TreeNode<ActivatedRoute>, public queryParams: Observable<Params>, public fragment: Observable<string>, public snapshot: RouterStateSnapshot) {
    super(root);
  }
}

export function createEmptyState(rootComponent: Type): RouterState {
  const snapshot = createEmptyStateSnapshot(rootComponent);
  const emptyUrl = new BehaviorSubject([new UrlSegment("", {}, PRIMARY_OUTLET)]);
  const emptyParams = new BehaviorSubject({});
  const emptyQueryParams = new BehaviorSubject({});
  const fragment = new BehaviorSubject("");
  const activated = new ActivatedRoute(emptyUrl, emptyParams, PRIMARY_OUTLET, rootComponent, snapshot.root);
  return new RouterState(new TreeNode<ActivatedRoute>(activated, []), emptyQueryParams, fragment, snapshot);
}

function createEmptyStateSnapshot(rootComponent: Type): RouterStateSnapshot {
  const rootUrlSegment = new UrlSegment("", {}, PRIMARY_OUTLET);
  const emptyUrl = [rootUrlSegment];
  const emptyParams = {};
  const emptyQueryParams = {};
  const fragment = "";
  const activated = new ActivatedRouteSnapshot(emptyUrl, emptyParams, PRIMARY_OUTLET, rootComponent, null, rootUrlSegment);
  return new RouterStateSnapshot(new TreeNode<ActivatedRouteSnapshot>(activated, []), emptyQueryParams, fragment);
}

/**
 * Contains the information about a component loaded in an outlet. The information is provided through
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
  constructor(public urlSegments: Observable<UrlSegment[]>,
              public params: Observable<Params>,
              public outlet: string,
              public component: Type | string,
              public snapshot: ActivatedRouteSnapshot
  ) {}
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
  _routeConfig: Route;

  /** @internal **/
  _lastUrlSegment: UrlSegment;

  constructor(public urlSegments: UrlSegment[],
              public params: Params,
              public outlet: string,
              public component: Type | string, 
              routeConfig: Route,
              lastUrlSegment: UrlSegment) {
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
  constructor(root: TreeNode<ActivatedRouteSnapshot>, public queryParams: Params, public fragment: string) {
    super(root);
  }
}