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
    canDeactivate(component: T, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean;
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

/** @experimental */
export declare type DetachedRouteHandle = {};

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
export declare type LoadChildrenCallback = () => Type<any> | NgModuleFactory<any> | Promise<Type<any>> | Observable<Type<any>>;

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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<T> | Promise<T> | T;
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
    children?: Routes;
    component?: Type<any>;
    data?: Data;
    loadChildren?: LoadChildren;
    matcher?: UrlMatcher;
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
    routeReuseStrategy: RouteReuseStrategy;
    routerState: RouterState;
    url: string;
    urlHandlingStrategy: UrlHandlingStrategy;
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
export declare const ROUTER_CONFIGURATION: InjectionToken<ExtraOptions>;

/** @experimental */
export declare const ROUTER_INITIALIZER: InjectionToken<(compRef: ComponentRef<any>) => void>;

/** @experimental */
export declare abstract class RouteReuseStrategy {
    abstract retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle;
    abstract shouldAttach(route: ActivatedRouteSnapshot): boolean;
    abstract shouldDetach(route: ActivatedRouteSnapshot): boolean;
    abstract shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean;
    abstract store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void;
}

/** @stable */
export declare class RouterLink {
    fragment: string;
    preserveFragment: boolean;
    preserveQueryParams: boolean;
    queryParams: {
        [k: string]: any;
    };
    replaceUrl: boolean;
    routerLink: any[] | string;
    skipLocationChange: boolean;
    urlTree: UrlTree;
    constructor(router: Router, route: ActivatedRoute, tabIndex: string, renderer: Renderer, el: ElementRef);
    onClick(): boolean;
}

/** @stable */
export declare class RouterLinkActive implements OnChanges, OnDestroy, AfterContentInit {
    isActive: boolean;
    links: QueryList<RouterLink>;
    linksWithHrefs: QueryList<RouterLinkWithHref>;
    routerLinkActive: string[] | string;
    routerLinkActiveOptions: {
        exact: boolean;
    };
    constructor(router: Router, element: ElementRef, renderer: Renderer, cdr: ChangeDetectorRef);
    ngAfterContentInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
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
    replaceUrl: boolean;
    routerLink: any[] | string;
    skipLocationChange: boolean;
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
    locationFactoryResolver: ComponentFactoryResolver;
    locationInjector: Injector;
    outletMap: RouterOutletMap;
    constructor(parentOutletMap: RouterOutletMap, location: ViewContainerRef, resolver: ComponentFactoryResolver, name: string);
    activate(activatedRoute: ActivatedRoute, resolver: ComponentFactoryResolver, injector: Injector, providers: ResolvedReflectiveProvider[], outletMap: RouterOutletMap): void;
    attach(ref: ComponentRef<any>, activatedRoute: ActivatedRoute): void;
    deactivate(): void;
    detach(): ComponentRef<any>;
    ngOnDestroy(): void;
}

/** @stable */
export declare class RouterOutletMap {
    registerOutlet(name: string, outlet: RouterOutlet): void;
    removeOutlet(name: string): void;
}

/** @stable */
export declare class RouterPreloader {
    constructor(router: Router, moduleLoader: NgModuleFactoryLoader, compiler: Compiler, injector: Injector, preloadingStrategy: PreloadingStrategy);
    ngOnDestroy(): void;
    preload(): Observable<any>;
    setUpPreloading(): void;
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

/** @experimental */
export declare abstract class UrlHandlingStrategy {
    abstract extract(url: UrlTree): UrlTree;
    abstract merge(newUrlPart: UrlTree, rawUrl: UrlTree): UrlTree;
    abstract shouldProcessUrl(url: UrlTree): boolean;
}

/** @stable */
export declare class UrlSegment {
    parameters: {
        [name: string]: string;
    };
    path: string;
    constructor(
        path: string,
        parameters: {
        [name: string]: string;
    });
    toString(): string;
}

/** @stable */
export declare class UrlSegmentGroup {
    children: {
        [key: string]: UrlSegmentGroup;
    };
    numberOfChildren: number;
    parent: UrlSegmentGroup;
    segments: UrlSegment[];
    constructor(
        segments: UrlSegment[],
        children: {
        [key: string]: UrlSegmentGroup;
    });
    hasChildren(): boolean;
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

/** @stable */
export declare const VERSION: Version;
