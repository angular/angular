import { ComponentResolver, Type, Injector } from '@angular/core';
import { Location } from '@angular/common';
import { UrlSerializer } from './url_serializer';
import { RouterOutletMap } from './router_outlet_map';
import { UrlTree } from './url_tree';
import { Params } from './shared';
import { RouterState, ActivatedRoute } from './router_state';
import { RouterConfig } from './config';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/concatMap';
export interface NavigationExtras {
    relativeTo?: ActivatedRoute;
    queryParameters?: Params;
    fragment?: string;
}
export declare class NavigationStart {
    id: number;
    url: UrlTree;
    constructor(id: number, url: UrlTree);
}
export declare class NavigationEnd {
    id: number;
    url: UrlTree;
    constructor(id: number, url: UrlTree);
}
export declare class NavigationCancel {
    id: number;
    url: UrlTree;
    constructor(id: number, url: UrlTree);
}
export declare class NavigationError {
    id: number;
    url: UrlTree;
    error: any;
    constructor(id: number, url: UrlTree, error: any);
}
export declare type Event = NavigationStart | NavigationEnd | NavigationCancel | NavigationError;
export declare class Router {
    private rootComponentType;
    private resolver;
    private urlSerializer;
    private outletMap;
    private location;
    private injector;
    private currentUrlTree;
    private currentRouterState;
    private config;
    private locationSubscription;
    private routerEvents;
    private navigationId;
    constructor(rootComponentType: Type, resolver: ComponentResolver, urlSerializer: UrlSerializer, outletMap: RouterOutletMap, location: Location, injector: Injector);
    readonly routerState: RouterState;
    readonly urlTree: UrlTree;
    readonly events: Observable<Event>;
    navigateByUrl(url: string): Promise<boolean>;
    resetConfig(config: RouterConfig): void;
    dispose(): void;
    createUrlTree(commands: any[], {relativeTo, queryParameters, fragment}?: NavigationExtras): UrlTree;
    navigate(commands: any[], extras?: NavigationExtras): Promise<boolean>;
    serializeUrl(url: UrlTree): string;
    parseUrl(url: string): UrlTree;
    private scheduleNavigation(url, pop);
    private setUpLocationChangeListener();
    private runNavigate(url, pop, id);
}
