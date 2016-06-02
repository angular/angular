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
export interface NavigationExtras {
    relativeTo?: ActivatedRoute;
    queryParameters?: Params;
    fragment?: string;
}
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
    constructor(rootComponentType: Type, resolver: ComponentResolver, urlSerializer: UrlSerializer, outletMap: RouterOutletMap, location: Location, injector: Injector);
    readonly routerState: RouterState;
    readonly urlTree: UrlTree;
    navigateByUrl(url: string): Observable<void>;
    resetConfig(config: RouterConfig): void;
    dispose(): void;
    createUrlTree(commands: any[], {relativeTo, queryParameters, fragment}?: NavigationExtras): UrlTree;
    navigate(commands: any[], extras?: NavigationExtras): Observable<void>;
    serializeUrl(url: UrlTree): string;
    parseUrl(url: string): UrlTree;
    private setUpLocationChangeListener();
    private runNavigate(url, pop?);
}
