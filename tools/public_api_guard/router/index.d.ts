export declare class ActivatedRoute {
    component: Type | string;
    data: Observable<Data>;
    outlet: string;
    params: Observable<Params>;
    snapshot: ActivatedRouteSnapshot;
    url: Observable<UrlPathWithParams[]>;
    toString(): string;
}

export declare class ActivatedRouteSnapshot {
    component: Type | string;
    data: Data;
    outlet: string;
    params: Params;
    url: UrlPathWithParams[];
    toString(): string;
}

export interface CanActivate {
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean;
}

export interface CanDeactivate<T> {
    canDeactivate(component: T, route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean;
}

export declare type Data = {
    [name: string]: any;
};

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
    error: any;
    id: number;
    url: string;
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

export interface Resolve<T> {
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | any;
}

export declare type ResolveData = {
    [name: string]: any;
};

export interface Route {
    path?: string;
    pathMatch?:
    /** @deprecated */ terminal?: boolean;

export declare class Router {
    events: Observable<Event>;
    routerState: RouterState;
    url: string;
    createUrlTree(commands: any[], {relativeTo, queryParams, fragment}?: NavigationExtras): UrlTree;
    navigate(commands: any[], extras?: NavigationExtras): Promise<boolean>;
    navigateByUrl(url: string | UrlTree): Promise<boolean>;
    parseUrl(url: string): UrlTree;
    resetConfig(config: RouterConfig): void;
    serializeUrl(url: UrlTree): string;
}

export declare const ROUTER_DIRECTIVES: (typeof RouterOutlet | typeof RouterLink | typeof RouterLinkActive)[];

export declare type RouterConfig = Route[];

export declare class RouterOutletMap {
    registerOutlet(name: string, outlet: RouterOutlet): void;
}

export declare class RouterState extends Tree<ActivatedRoute> {
    fragment: Observable<string>;
    queryParams: Observable<Params>;
    snapshot: RouterStateSnapshot;
    toString(): string;
}

export declare class RouterStateSnapshot extends Tree<ActivatedRouteSnapshot> {
    fragment: string;
    queryParams: Params;
    url: string;
    toString(): string;
}

export declare class RoutesRecognized {
    id: number;
    state: RouterStateSnapshot;
    url: string;
    urlAfterRedirects: string;
    constructor(id: number, url: string, urlAfterRedirects: string, state: RouterStateSnapshot);
    toString(): string;
}

export declare class UrlPathWithParams {
    parameters: {
        [key: string]: string;
    };
    path: string;
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
    fragment: string;
    queryParams: {
        [key: string]: string;
    };
    root: UrlSegment;
    toString(): string;
}
