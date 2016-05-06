import {RouteSegment, RouteTree} from './segments';

/**
 * Defines route lifecycle method `routerOnActivate`, which is called by the router at the end of a
 * successful route navigation.
 *
 * The `routerOnActivate` hook is called with the current and previous {@link RouteSegment}s of the
 * component and with the corresponding route trees.
 */
export interface OnActivate {
  routerOnActivate(curr: RouteSegment, prev?: RouteSegment, currTree?: RouteTree,
                   prevTree?: RouteTree): void;
}

/**
 * Defines route lifecycle method `routerOnDeactivate`, which is called by the router at the end of
 * a successful route deactivation.
 */
export interface OnDeactivate {
  routerOnDeactivate(curr?: RouteSegment, currTree?: RouteTree, futureTree?: RouteTree): void;
}

/**
 * Defines route lifecycle method `routerOnReuse`, which is called by the router to determine if an
 * outlet should be reused.
 */
export interface CanReuse {
  routerCanReuse(future: RouteSegment, curr?: RouteSegment, futureTree?: RouteTree,
                 currTree?: RouteTree): boolean;
}

export interface CanDeactivate {
  routerCanDeactivate(curr?: RouteSegment, currTree?: RouteTree,
                      futureTree?: RouteTree): Promise<boolean>;
}

export interface CanDeactivateChild {
  routerCanDeactivate(childSegment: RouteSegment, childComponent: Object, curr?: RouteSegment,
                      currTree?: RouteTree, futureTree?: RouteTree): Promise<boolean>;
}