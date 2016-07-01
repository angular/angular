/** @stable */
export declare class ActivatedRoute {
    component: Type | string;
    data: Observable<Data>;
    outlet: string;
    params: Observable<Params>;
    snapshot: ActivatedRouteSnapshot;
    url: Observable<UrlPathWithParams[]>;
    toString(): string;
}

/** @stable */
export declare class ActivatedRouteSnapshot {
    component: Type | string;
    data: Data;
    outlet: string;
    params: Params;
    url: UrlPathWithParams[];
    toString(): string;
}

/** @stable */
export interface CanActivate {
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean;
}

/** @stable */
export interface CanDeactivate<T> {
    canDeactivate(component: T, route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean;
}

/** @stable */
export declare type Data = {
    [name: string]: any;
};

/** @experimental */
export declare class DefaultUrlSerializer implements UrlSerializer {
    parse(url: string): UrlTree;
    serialize(tree: UrlTree): string;
}

/** @stable */
export declare type Event = NavigationStart | NavigationEnd | NavigationCancel | NavigationError;

/** @experimental */
export interface ExtraOptions {
    enableTracing?: boolean;
}

/** @stable */
export declare class NavigationCancel {
    id: number;
    url: string;
    constructor(id: number, url: string);
    toString(): string;
}

/** @stable */
export declare class NavigationEnd {
    id: number;
    url: string;
    urlAfterRedirects: string;
    constructor(id: number, url: string, urlAfterRedirects: string);
    toString(): string;
}

/** @stable */
export declare class NavigationError {
    error: any;
    id: number;
    url: string;
    constructor(id: number, url: string, error: any);
    toString(): string;
}

/** @stable */
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

/** @stable */
export declare type ResolveData = {
    [name: string]: any;
};

/** @stable */
export interface Route {
    path?: string;
    pathMatch?:
    /** @deprecated */ terminal?: boolean;

/** @stable */
export declare class Router {
    events: Observable<Event>;
    routerState: RouterState;
    url: string;
    constructor(rootComponentType: Type, resolver: ComponentResolver, urlSerializer: UrlSerializer, outletMap: RouterOutletMap, location: Location, injector: Injector, config: RouterConfig);
    createUrlTree(commands: any[], {relativeTo, queryParams, fragment}?: NavigationExtras): UrlTree;
    navigate(commands: any[], extras?: NavigationExtras): Promise<boolean>;
    navigateByUrl(url: string | UrlTree): Promise<boolean>;
    parseUrl(url: string): UrlTree;
    resetConfig(config: RouterConfig): void;
    serializeUrl(url: UrlTree): string;
}

/** @stable */
export declare const ROUTER_DIRECTIVES: (typeof RouterOutlet | typeof RouterLink | typeof RouterLinkWithHref | typeof RouterLinkActive)[];

/** @stable */
export declare type RouterConfig = Route[];

/** @stable */
export declare class RouterLink {
    fragment: string;
    queryParams: {
        [k: string]: any;
    };
    routerLink: any[] | string;
    urlTree: UrlTree;
    constructor(router: Router, route: ActivatedRoute, locationStrategy: LocationStrategy);
    onClick(button: number, ctrlKey: boolean, metaKey: boolean): boolean;
}

/** @stable */
export declare class RouterLinkActive implements OnChanges, OnDestroy, AfterContentInit {
    links: QueryList<RouterLink>;
    linksWithHrefs: QueryList<RouterLinkWithHref>;
    routerLinkActive: string[] | string;
    constructor(router: Router, element: ElementRef, renderer: Renderer);
    ngAfterContentInit(): void;
    ngOnChanges(changes: {}): any;
    ngOnDestroy(): any;
}

/** @stable */
export declare class RouterLinkWithHref implements OnChanges {
    fragment: string;
    href: string;
    queryParams: {
        [k: string]: any;
    };
    routerLink: any[] | string;
    target: string;
    urlTree: UrlTree;
    ngOnChanges(changes: {}): any;
    onClick(button: number, ctrlKey: boolean, metaKey: boolean): boolean;
}

/** @stable */
export declare class RouterOutlet {
    activatedRoute: ActivatedRoute;
    component: Object;
    isActivated: boolean;
    outletMap: RouterOutletMap;
    constructor(parentOutletMap: RouterOutletMap, location: ViewContainerRef, componentFactoryResolver: ComponentFactoryResolver, name: string);
    activate(activatedRoute: ActivatedRoute, providers: ResolvedReflectiveProvider[], outletMap: RouterOutletMap): void;
    deactivate(): void;
}

/** @stable */
export declare class RouterOutletMap {
    registerOutlet(name: string, outlet: RouterOutlet): void;
}

/** @stable */
export declare class RouterState extends Tree<ActivatedRoute> {
    fragment: Observable<string>;
    queryParams: Observable<Params>;
    snapshot: RouterStateSnapshot;
    toString(): string;
}

/** @stable */
export declare class RouterStateSnapshot extends Tree<ActivatedRouteSnapshot> {
    fragment: string;
    queryParams: Params;
    url: string;
    toString(): string;
}

/** @stable */
export declare class RoutesRecognized {
    id: number;
    state: RouterStateSnapshot;
    url: string;
    urlAfterRedirects: string;
    constructor(id: number, url: string, urlAfterRedirects: string, state: RouterStateSnapshot);
    toString(): string;
}

/** @stable */
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

/** @stable */
export declare class UrlTree {
    fragment: string;
    queryParams: {
        [key: string]: string;
    };
    root: UrlSegment;
    toString(): string;
}
