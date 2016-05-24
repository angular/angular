import { Tree, TreeNode } from './tree';
import { UrlSegment } from './url_tree';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ComponentFactory, Type } from '@angular/core';

/**
 * A collection of parameters.
 */
export type Params = { [key: string]: string };

/**
 * Name of the primary outlet.
 * @type {string}
 */
export const PRIMARY_OUTLET: string = "PRIMARY_OUTLET";

/**
 * The state of the router at a particular moment in time.
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
  constructor(root: TreeNode<ActivatedRoute>, public queryParams: Observable<Params>, public fragment: Observable<string>) {
    super(root);
  }
}

export function createEmptyState(rootComponent: Type): RouterState {
  const emptyUrl = new BehaviorSubject([new UrlSegment("", {})]);
  const emptyParams = new BehaviorSubject({});
  const emptyQueryParams = new BehaviorSubject({});
  const fragment = new BehaviorSubject("");
  const activated = new ActivatedRoute(emptyUrl, emptyParams, PRIMARY_OUTLET, rootComponent, <any>null);
  return new RouterState(new TreeNode<ActivatedRoute>(activated, []), emptyQueryParams, fragment);
}

/**
 * Contains the information about a component loaded in an outlet.
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
              public component: Type,
              public factory: ComponentFactory<any>) {}
}