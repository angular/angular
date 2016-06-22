export declare class ActivatedRoute {
    url: Observable<UrlPathWithParams[]>;
    params: Observable<Params>;
    outlet: string;
    component: Type | string;
    snapshot: ActivatedRouteSnapshot;
    toString(): string;
}

export declare class ActivatedRouteSnapshot {
    url: UrlPathWithParams[];
    params: Params;
    outlet: string;
    component: Type | string;
    toString(): string;
}

export interface CanActivate {
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean;
}

export interface CanDeactivate<T> {
    canDeactivate(component: T, route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean;
}

export declare class DefaultUrlSerializer implements UrlSerializer {
    parse(url: string): UrlTree;
    serialize(tree: UrlTree): string;
}

export declare type Event = NavigationStart | NavigationEnd | NavigationCancel | NavigationError;

export interface ExtraOptions {
    enableTracing?: boolean;
}

export declare class NavigationCancel {
    id: number;
    url: string;
    constructor(id: number, url: string);
    toString(): string;
}

export declare class NavigationEnd {
    id: number;
    url: string;
    urlAfterRedirects: string;
    constructor(id: number, url: string, urlAfterRedirects: string);
    toString(): string;
}

export declare class NavigationError {
    id: number;
    url: string;
    error: any;
    constructor(id: number, url: string, error: any);
    toString(): string;
}

export declare class NavigationStart {
    id: number;
    url: string;
    constructor(id: number, url: string);
    toString(): string;
}

export declare type Params = {
    [key: string]: any;
};

export declare const PRIMARY_OUTLET: string;

export declare function provideRouter(config: RouterConfig, opts?: ExtraOptions): any[];

export interface Route {
    path?: string;
    terminal?: boolean;
    component?: Type | string;
    outlet?: string;
    canActivate?: any[];
    canDeactivate?: any[];
    redirectTo?: string;
    children?: Route[];
}

export declare class Router {
    routerState: RouterState;
    url: string;
    events: Observable<Event>;
    resetConfig(config: RouterConfig): void;
    createUrlTree(commands: any[], {relativeTo, queryParams, fragment}?: NavigationExtras): UrlTree;
    navigateByUrl(url: string | UrlTree): Promise<boolean>;
    navigate(commands: any[], extras?: NavigationExtras): Promise<boolean>;
    serializeUrl(url: UrlTree): string;
    parseUrl(url: string): UrlTree;
}

export declare const ROUTER_DIRECTIVES: (typeof RouterOutlet | typeof RouterLink | typeof RouterLinkActive)[];

export declare type RouterConfig = Route[];

export declare class RouterOutletMap {
    registerOutlet(name: string, outlet: RouterOutlet): void;
}

export declare class RouterState extends Tree<ActivatedRoute> {
    queryParams: Observable<Params>;
    fragment: Observable<string>;
    snapshot: RouterStateSnapshot;
    toString(): string;
}

export declare class RouterStateSnapshot extends Tree<ActivatedRouteSnapshot> {
    url: string;
    queryParams: Params;
    fragment: string;
    toString(): string;
}

export declare class RoutesRecognized {
    id: number;
    url: string;
    urlAfterRedirects: string;
    state: RouterStateSnapshot;
    constructor(id: number, url: string, urlAfterRedirects: string, state: RouterStateSnapshot);
    toString(): string;
}

export declare class UrlPathWithParams {
    path: string;
    parameters: {
        [key: string]: string;
    };
    constructor(path: string, parameters: {
        [key: string]: string;
    });
    toString(): string;
}

export declare abstract class UrlSerializer {
    abstract parse(url: string): UrlTree;
    abstract serialize(tree: UrlTree): string;
}

export declare class UrlTree {
    root: UrlSegment;
    queryParams: {
        [key: string]: string;
    };
    fragment: string;
    toString(): string;
}
