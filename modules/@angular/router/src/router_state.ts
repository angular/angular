import { Tree, TreeNode } from './utils/tree';
import { UrlSegment } from './url_tree';
import { Params, PRIMARY_OUTLET } from './shared';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Type } from '@angular/core';

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
  const emptyUrl = new BehaviorSubject([new UrlSegment("", {}, PRIMARY_OUTLET)]);
  const emptyParams = new BehaviorSubject({});
  const emptyQueryParams = new BehaviorSubject({});
  const fragment = new BehaviorSubject("");
  const activated = new ActivatedRoute(emptyUrl, emptyParams, PRIMARY_OUTLET, rootComponent);
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
              public component: Type | string) {}
}