import {RouteSegment, Tree, RouteTree} from './segments';

export interface OnActivate {
  routerOnActivate(curr: RouteSegment, prev?: RouteSegment, currTree?: RouteTree,
                   prevTree?: RouteTree): void;
}

export interface CanDeactivate {
  routerCanDeactivate(currTree?: RouteTree, futureTree?: RouteTree): Promise<boolean>;
}