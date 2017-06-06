import { ComponentResolver } from 'angular2/core';
import { RouterOutlet } from './directives/router_outlet';
import { Type } from 'angular2/src/facade/lang';
import { Observable } from 'angular2/src/facade/async';
import { RouterUrlSerializer } from './router_url_serializer';
import { Location } from 'angular2/platform/common';
import { RouteSegment, UrlTree, RouteTree } from './segments';
export declare class RouterOutletMap {
    registerOutlet(name: string, outlet: RouterOutlet): void;
}
export declare class Router {
    private _rootComponent;
    private _rootComponentType;
    private _componentResolver;
    private _urlSerializer;
    private _routerOutletMap;
    private _location;
    private _prevTree;
    private _urlTree;
    private _locationSubscription;
    private _changes;
    constructor(_rootComponent: Object, _rootComponentType: Type, _componentResolver: ComponentResolver, _urlSerializer: RouterUrlSerializer, _routerOutletMap: RouterOutletMap, _location: Location);
    urlTree: UrlTree;
    navigateByUrl(url: string): Promise<void>;
    navigate(changes: any[], segment?: RouteSegment): Promise<void>;
    dispose(): void;
    private _createInitialTree();
    private _setUpLocationChangeListener();
    private _navigate(url);
    createUrlTree(changes: any[], segment?: RouteSegment): UrlTree;
    serializeUrl(url: UrlTree): string;
    changes: Observable<void>;
    routeTree: RouteTree;
}
