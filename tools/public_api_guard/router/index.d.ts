/** @stable */
export declare class ActivatedRoute {
    children: ActivatedRoute[];
    component: Type<any> | string;
    data: Observable<Data>;
    firstChild: ActivatedRoute;
    fragment: Observable<string>;
    outlet: string;
    params: Observable<Params>;
    parent: ActivatedRoute;
    pathFromRoot: ActivatedRoute[];
    queryParams: Observable<Params>;
    root: ActivatedRoute;
    routeConfig: Route;
    snapshot: ActivatedRouteSnapshot;
    url: Observable<UrlSegment[]>;
    toString(): string;
}

/** @stable */
export declare class ActivatedRouteSnapshot {
    children: ActivatedRouteSnapshot[];
    component: Type<any> | string;
    data: Data;
    firstChild: ActivatedRouteSnapshot;
    fragment: string;
    outlet: string;
    params: Params;
    parent: ActivatedRouteSnapshot;
    pathFromRoot: ActivatedRouteSnapshot[];
    queryParams: Params;
    root: ActivatedRouteSnapshot;
    routeConfig: Route;
    url: UrlSegment[];
    toString(): string;
}

/** @stable */
export interface CanActivate {
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean;
}

/** @stable */
export interface CanActivateChild {
    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean;
}

/** @stable */
export interface CanDeactivate<T> {
    canDeactivate(component: T, route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean;
}

/** @stable */
export interface CanLoad {
    canLoad(route: Route): Observable<boolean> | Promise<boolean> | boolean;
}

/** @stable */
export declare type Data = {
    [name: string]: any;
};

/** @stable */
export declare class DefaultUrlSerializer implements UrlSerializer {
    parse(url: string): UrlTree;
    serialize(tree: UrlTree): string;
}

/** @stable */
export declare type Event = NavigationStart | NavigationEnd | NavigationCancel | NavigationError | RoutesRecognized;

/** @stable */
export interface ExtraOptions {
    enableTracing?: boolean;
    errorHandler?: ErrorHandler;
    initialNavigation?: boolean;
    preloadingStrategy?: any;
    useHash?: boolean;
}

/** @stable */
export declare type LoadChildren = string | LoadChildrenCallback;

/** @stable */
export declare type LoadChildrenCallback = () => Type<any> | Promise<Type<any>> | Observable<Type<any>>;

/** @stable */
export declare class NavigationCancel {
    id: number;
    reason: string;
    url: string;
    constructor(
        id: number,
        url: string,
        reason: string);
    toString(): string;
}

/** @stable */
export declare class NavigationEnd {
    id: number;
    url: string;
    urlAfterRedirects: string;
    constructor(
        id: number,
        url: string,
        urlAfterRedirects: string);
    toString(): string;
}

/** @stable */
export declare class NavigationError {
    error: any;
    id: number;
    url: string;
    constructor(
        id: number,
        url: string,
        error: any);
    toString(): string;
}

/** @stable */
export interface NavigationExtras {
    fragment?: string;
    preserveFragment?: boolean;
    preserveQueryParams?: boolean;
    queryParams?: Params;
    relativeTo?: ActivatedRoute;
    replaceUrl?: boolean;
    skipLocationChange?: boolean;
}

/** @stable */
export declare class NavigationStart {
    id: number;
    url: string;
    constructor(
        id: number,
        url: string);
    toString(): string;
}

/** @experimental */
export declare class NoPreloading implements PreloadingStrategy {
    preload(route: Route, fn: () => Observable<any>): Observable<any>;
}

/** @stable */
export declare type Params = {
    [key: string]: any;
};

/** @experimental */
export declare class PreloadAllModules implements PreloadingStrategy {
    preload(route: Route, fn: () => Observable<any>): Observable<any>;
}

/** @experimental */
export declare abstract class PreloadingStrategy {
    abstract preload(route: Route, fn: () => Observable<any>): Observable<any>;
}

/** @stable */
export declare const PRIMARY_OUTLET: string;

/** @stable */
export declare function provideRoutes(routes: Routes): any;

/** @stable */
export interface Resolve<T> {
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any;
}

/** @stable */
export declare type ResolveData = {
    [name: string]: any;
};

/** @stable */
export interface Route {
    canActivate?: any[];
    canActivateChild?: any[];
    canDeactivate?: any[];
    canLoad?: any[];
    children?: Route[];
    component?: Type<any>;
    data?: Data;
    loadChildren?: LoadChildren;
    outlet?: string;
    path?: string;
    pathMatch?: string;
    redirectTo?: string;
    resolve?: ResolveData;
}

/** @stable */
export declare class Router {
    config: Routes;
    errorHandler: ErrorHandler;
    events: Observable<Event>;
    navigated: boolean;
    routerState: RouterState;
    url: string;
    constructor(rootComponentType: Type<any>, urlSerializer: UrlSerializer, outletMap: RouterOutletMap, location: Location, injector: Injector, loader: NgModuleFactoryLoader, compiler: Compiler, config: Routes);
    createUrlTree(commands: any[], {relativeTo, queryParams, fragment, preserveQueryParams, preserveFragment}?: NavigationExtras): UrlTree;
    dispose(): void;
    initialNavigation(): void;
    isActive(url: string | UrlTree, exact: boolean): boolean;
    navigate(commands: any[], extras?: NavigationExtras): Promise<boolean>;
    navigateByUrl(url: string | UrlTree, extras?: NavigationExtras): Promise<boolean>;
    ngOnDestroy(): void;
    parseUrl(url: string): UrlTree;
    resetConfig(config: Routes): void;
    serializeUrl(url: UrlTree): string;
    setUpLocationChangeListener(): void;
}

/** @stable */
export declare class RouterLink {
    fragment: string;
    preserveFragment: boolean;
    preserveQueryParams: boolean;
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
    routerLinkActiveOptions: {
        exact: boolean;
    };
    constructor(router: Router, element: ElementRef, renderer: Renderer);
    ngAfterContentInit(): void;
    ngOnChanges(changes: {}): any;
    ngOnDestroy(): any;
}

/** @stable */
export declare class RouterLinkWithHref implements OnChanges, OnDestroy {
    fragment: string;
    href: string;
    preserveFragment: boolean;
    preserveQueryParams: boolean;
    queryParams: {
        [k: string]: any;
    };
    routerLink: any[] | string;
    routerLinkOptions: {
        preserveQueryParams: boolean;
        preserveFragment: boolean;
    };
    target: string;
    urlTree: UrlTree;
    constructor(router: Router, route: ActivatedRoute, locationStrategy: LocationStrategy);
    ngOnChanges(changes: {}): any;
    ngOnDestroy(): any;
    onClick(button: number, ctrlKey: boolean, metaKey: boolean): boolean;
}

/** @stable */
export declare class RouterModule {
    constructor(guard: any);
    static forChild(routes: Routes): ModuleWithProviders;
    static forRoot(routes: Routes, config?: ExtraOptions): ModuleWithProviders;
}

/** @stable */
export declare class RouterOutlet implements OnDestroy {
    activateEvents: EventEmitter<any>;
    activatedRoute: ActivatedRoute;
    component: Object;
    deactivateEvents: EventEmitter<any>;
    isActivated: boolean;
    outletMap: RouterOutletMap;
    constructor(parentOutletMap: RouterOutletMap, location: ViewContainerRef, resolver: ComponentFactoryResolver, name: string);
    activate(activatedRoute: ActivatedRoute, loadedResolver: ComponentFactoryResolver, loadedInjector: Injector, providers: ResolvedReflectiveProvider[], outletMap: RouterOutletMap): void;
    deactivate(): void;
    ngOnDestroy(): void;
}

/** @stable */
export declare class RouterOutletMap {
    registerOutlet(name: string, outlet: RouterOutlet): void;
    removeOutlet(name: string): void;
}

/** @stable */
export declare class RouterState extends Tree<ActivatedRoute> {
    snapshot: RouterStateSnapshot;
    toString(): string;
}

/** @stable */
export declare class RouterStateSnapshot extends Tree<ActivatedRouteSnapshot> {
    url: string;
    toString(): string;
}

/** @stable */
export declare type Routes = Route[];

/** @stable */
export declare class RoutesRecognized {
    id: number;
    state: RouterStateSnapshot;
    url: string;
    urlAfterRedirects: string;
    constructor(
        id: number,
        url: string,
        urlAfterRedirects: string,
        state: RouterStateSnapshot);
    toString(): string;
}

/** @stable */
export declare class UrlSegment {
    parameters: {
        [key: string]: string;
    };
    path: string;
    constructor(
        path: string,
        parameters: {
        [key: string]: string;
    });
    toString(): string;
}

/** @stable */
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
    root: UrlSegmentGroup;
    toString(): string;
}
