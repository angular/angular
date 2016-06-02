import { Tree, TreeNode } from './utils/tree';
import { UrlSegment } from './url_tree';
import { Route } from './config';
import { Params } from './shared';
import { Observable } from 'rxjs/Observable';
import { Type, ComponentFactory } from '@angular/core';
export declare class RouterState extends Tree<ActivatedRoute> {
    queryParams: Observable<Params>;
    fragment: Observable<string>;
    snapshot: RouterStateSnapshot;
    constructor(root: TreeNode<ActivatedRoute>, queryParams: Observable<Params>, fragment: Observable<string>, snapshot: RouterStateSnapshot);
}
export declare function createEmptyState(rootComponent: Type): RouterState;
export declare class ActivatedRoute {
    urlSegments: Observable<UrlSegment[]>;
    params: Observable<Params>;
    outlet: string;
    component: Type | string;
    _futureSnapshot: ActivatedRouteSnapshot;
    snapshot: ActivatedRouteSnapshot;
    constructor(urlSegments: Observable<UrlSegment[]>, params: Observable<Params>, outlet: string, component: Type | string, futureSnapshot: ActivatedRouteSnapshot);
}
export declare class ActivatedRouteSnapshot {
    urlSegments: UrlSegment[];
    params: Params;
    outlet: string;
    component: Type | string;
    _resolvedComponentFactory: ComponentFactory<any>;
    _routeConfig: Route | null;
    _lastUrlSegment: UrlSegment;
    constructor(urlSegments: UrlSegment[], params: Params, outlet: string, component: Type | string, routeConfig: Route | null, lastUrlSegment: UrlSegment);
}
export declare class RouterStateSnapshot extends Tree<ActivatedRouteSnapshot> {
    queryParams: Params;
    fragment: string | null;
    constructor(root: TreeNode<ActivatedRouteSnapshot>, queryParams: Params, fragment: string | null);
}
export declare function advanceActivatedRoute(route: ActivatedRoute): void;
