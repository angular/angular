/** @experimental */
export declare class ActivatedRoute {
    component: Type | string;
    data: Observable<Data>;
    outlet: string;
    params: Observable<Params>;
    snapshot: ActivatedRouteSnapshot;
    url: Observable<UrlPathWithParams[]>;
    toString(): string;
}

/** @experimental */
export declare class ActivatedRouteSnapshot {
    component: Type | string;
    data: Data;
    outlet: string;
    params: Params;
    url: UrlPathWithParams[];
    toString(): string;
}

/** @experimental */
export interface CanActivate {
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean;
}

/** @experimental */
export interface CanDeactivate<T> {
    canDeactivate(component: T, route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean;
}

/** @experimental */
export declare type Data = {
    [name: string]: any;
};

/** @experimental */
export declare class DefaultUrlSerializer implements UrlSerializer {
    parse(url: string): UrlTree;
    serialize(tree: UrlTree): string;
}

/** @experimental */
export declare type Event = NavigationStart | NavigationEnd | NavigationCancel | NavigationError;

/** @experimental */
export interface ExtraOptions {
    enableTracing?: boolean;
}

/** @experimental */
export declare class NavigationCancel {
    id: number;
    url: string;
    constructor(id: number, url: string);
    toString(): string;
}

/** @experimental */
export declare class NavigationEnd {
    id: number;
    url: string;
    urlAfterRedirects: string;
    constructor(id: number, url: string, urlAfterRedirects: string);
    toString(): string;
}

/** @experimental */
export declare class NavigationError {
    error: any;
    id: number;
    url: string;
    constructor(id: number, url: string, error: any);
    toString(): string;
}

/** @experimental */
export declare class NavigationStart {
    id: number;
    url: string;
    constructor(id: number, url: string);
    toString(): string;
}

/** @experimental */
export declare type Params = {
    [key: string]: any;
};

/** @experimental */
export declare const PRIMARY_OUTLET: string;

/** @experimental */
export declare function provideRouter(config: RouterConfig, opts?: ExtraOptions): any[];

/** @experimental */
export interface Resolve<T> {
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | any;
}

/** @experimental */
export declare type ResolveData = {
    [name: string]: any;
};

/** @experimental */
export interface Route {
    path?: string;
    pathMatch?:
    /** @deprecated */ terminal?: boolean;

/** @experimental */
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

/** @experimental */
export declare const ROUTER_DIRECTIVES: (typeof RouterOutlet | typeof RouterLink | typeof RouterLinkActive)[];

/** @experimental */
export declare type RouterConfig = Route[];

/** @experimental */
export declare class RouterOutletMap {
    registerOutlet(name: string, outlet: RouterOutlet): void;
}

/** @experimental */
export declare class RouterState extends Tree<ActivatedRoute> {
    fragment: Observable<string>;
    queryParams: Observable<Params>;
    snapshot: RouterStateSnapshot;
    toString(): string;
}

/** @experimental */
export declare class RouterStateSnapshot extends Tree<ActivatedRouteSnapshot> {
    fragment: string;
    queryParams: Params;
    url: string;
    toString(): string;
}

/** @experimental */
export declare class RoutesRecognized {
    id: number;
    state: RouterStateSnapshot;
    url: string;
    urlAfterRedirects: string;
    constructor(id: number, url: string, urlAfterRedirects: string, state: RouterStateSnapshot);
    toString(): string;
}

/** @experimental */
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

/** @experimental */
export declare abstract class UrlSerializer {
    abstract parse(url: string): UrlTree;
    abstract serialize(tree: UrlTree): string;
}

/** @experimental */
export declare class UrlTree {
    fragment: string;
    queryParams: {
        [key: string]: string;
    };
    root: UrlSegment;
    toString(): string;
}
