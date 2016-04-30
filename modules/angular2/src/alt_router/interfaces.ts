import {RouteSegment, Tree} from './segments';

export interface OnActivate {
  routerOnActivate(curr: RouteSegment, prev?: RouteSegment, currTree?: Tree<RouteSegment>,
                   prevTree?: Tree<RouteSegment>): void;
}

export interface CanDeactivate {
  routerCanDeactivate(currTree?: Tree<RouteSegment>,
                      futureTree?: Tree<RouteSegment>): Promise<boolean>;
}