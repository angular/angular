export declare class ActivatedRoute {
    get children(): ActivatedRoute[];
    component: Type<any> | string | null;
    data: Observable<Data>;
    get firstChild(): ActivatedRoute | null;
    fragment: Observable<string | null>;
    outlet: string;
    get paramMap(): Observable<ParamMap>;
    params: Observable<Params>;
    get parent(): ActivatedRoute | null;
    get pathFromRoot(): ActivatedRoute[];
    get queryParamMap(): Observable<ParamMap>;
    queryParams: Observable<Params>;
    get root(): ActivatedRoute;
    get routeConfig(): Route | null;
    snapshot: ActivatedRouteSnapshot;
    url: Observable<UrlSegment[]>;
    toString(): string;
}

export declare class ActivatedRouteSnapshot {
    get children(): ActivatedRouteSnapshot[];
    component: Type<any> | string | null;
    data: Data;
    get firstChild(): ActivatedRouteSnapshot | null;
    fragment: string | null;
    outlet: string;
    get paramMap(): ParamMap;
    params: Params;
    get parent(): ActivatedRouteSnapshot | null;
    get pathFromRoot(): ActivatedRouteSnapshot[];
    get queryParamMap(): ParamMap;
    queryParams: Params;
    get root(): ActivatedRouteSnapshot;
    readonly routeConfig: Route | null;
    url: UrlSegment[];
    toString(): string;
}

export declare class ActivationEnd {
    snapshot: ActivatedRouteSnapshot;
    constructor(
    snapshot: ActivatedRouteSnapshot);
    toString(): string;
}

export declare class ActivationStart {
    snapshot: ActivatedRouteSnapshot;
    constructor(
    snapshot: ActivatedRouteSnapshot);
    toString(): string;
}

export declare abstract class BaseRouteReuseStrategy implements RouteReuseStrategy {
    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null;
    shouldAttach(route: ActivatedRouteSnapshot): boolean;
    shouldDetach(route: ActivatedRouteSnapshot): boolean;
    shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean;
    store(route: ActivatedRouteSnapshot, detachedTree: DetachedRouteHandle): void;
}

export declare interface CanActivate {
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree;
}

export declare interface CanActivateChild {
    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree;
}

export declare interface CanDeactivate<T> {
    canDeactivate(component: T, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree;
}

export declare interface CanLoad {
    canLoad(route: Route, segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree;
}

export declare class ChildActivationEnd {
    snapshot: ActivatedRouteSnapshot;
    constructor(
    snapshot: ActivatedRouteSnapshot);
    toString(): string;
}

export declare class ChildActivationStart {
    snapshot: ActivatedRouteSnapshot;
    constructor(
    snapshot: ActivatedRouteSnapshot);
    toString(): string;
}

export declare class ChildrenOutletContexts {
    getContext(childName: string): OutletContext | null;
    getOrCreateContext(childName: string): OutletContext;
    onChildOutletCreated(childName: string, outlet: RouterOutletContract): void;
    onChildOutletDestroyed(childName: string): void;
    onOutletDeactivated(): Map<string, OutletContext>;
    onOutletReAttached(contexts: Map<string, OutletContext>): void;
}

export declare function convertToParamMap(params: Params): ParamMap;

export declare type Data = {
    [name: string]: any;
};

export declare class DefaultUrlSerializer implements UrlSerializer {
    parse(url: string): UrlTree;
    serialize(tree: UrlTree): string;
}

/** @deprecated */
export declare type DeprecatedLoadChildren = string;

export declare type DetachedRouteHandle = {};

export declare type Event = RouterEvent | RouteConfigLoadStart | RouteConfigLoadEnd | ChildActivationStart | ChildActivationEnd | ActivationStart | ActivationEnd | Scroll;

export declare interface ExtraOptions {
    anchorScrolling?: 'disabled' | 'enabled';
    enableTracing?: boolean;
    errorHandler?: ErrorHandler;
    initialNavigation?: InitialNavigation;
    malformedUriErrorHandler?: (error: URIError, urlSerializer: UrlSerializer, url: string) => UrlTree;
    onSameUrlNavigation?: 'reload' | 'ignore';
    paramsInheritanceStrategy?: 'emptyOnly' | 'always';
    preloadingStrategy?: any;
    relativeLinkResolution?: 'legacy' | 'corrected';
    scrollOffset?: [number, number] | (() => [number, number]);
    scrollPositionRestoration?: 'disabled' | 'enabled' | 'top';
    urlUpdateStrategy?: 'deferred' | 'eager';
    useHash?: boolean;
}

export declare class GuardsCheckEnd extends RouterEvent {
    shouldActivate: boolean;
    state: RouterStateSnapshot;
    urlAfterRedirects: string;
    constructor(
    id: number,
    url: string,
    urlAfterRedirects: string,
    state: RouterStateSnapshot,
    shouldActivate: boolean);
    toString(): string;
}

export declare class GuardsCheckStart extends RouterEvent {
    state: RouterStateSnapshot;
    urlAfterRedirects: string;
    constructor(
    id: number,
    url: string,
    urlAfterRedirects: string,
    state: RouterStateSnapshot);
    toString(): string;
}

export declare type InitialNavigation = 'disabled' | 'enabled' | 'enabledBlocking' | 'enabledNonBlocking';

export declare interface IsActiveMatchOptions {
    fragment: 'exact' | 'ignored';
    matrixParams: 'exact' | 'subset' | 'ignored';
    paths: 'exact' | 'subset';
    queryParams: 'exact' | 'subset' | 'ignored';
}

export declare type LoadChildren = LoadChildrenCallback | DeprecatedLoadChildren;

export declare type LoadChildrenCallback = () => Type<any> | NgModuleFactory<any> | Observable<Type<any>> | Promise<NgModuleFactory<any> | Type<any> | any>;

export declare type Navigation = {
    id: number;
    initialUrl: string | UrlTree;
    extractedUrl: UrlTree;
    finalUrl?: UrlTree;
    trigger: 'imperative' | 'popstate' | 'hashchange';
    extras: NavigationExtras;
    previousNavigation: Navigation | null;
};

export declare interface NavigationBehaviorOptions {
    replaceUrl?: boolean;
    skipLocationChange?: boolean;
    state?: {
        [k: string]: any;
    };
}

export declare class NavigationCancel extends RouterEvent {
    reason: string;
    constructor(
    id: number,
    url: string,
    reason: string);
    toString(): string;
}

export declare class NavigationEnd extends RouterEvent {
    urlAfterRedirects: string;
    constructor(
    id: number,
    url: string,
    urlAfterRedirects: string);
    toString(): string;
}

export declare class NavigationError extends RouterEvent {
    error: any;
    constructor(
    id: number,
    url: string,
    error: any);
    toString(): string;
}

export declare interface NavigationExtras extends UrlCreationOptions, NavigationBehaviorOptions {
}

export declare class NavigationStart extends RouterEvent {
    navigationTrigger?: 'imperative' | 'popstate' | 'hashchange';
    restoredState?: {
        [k: string]: any;
        navigationId: number;
    } | null;
    constructor(
    id: number,
    url: string,
    navigationTrigger?: 'imperative' | 'popstate' | 'hashchange',
    restoredState?: {
        [k: string]: any;
        navigationId: number;
    } | null);
    toString(): string;
}

export declare class NoPreloading implements PreloadingStrategy {
    preload(route: Route, fn: () => Observable<any>): Observable<any>;
}

export declare class OutletContext {
    attachRef: ComponentRef<any> | null;
    children: ChildrenOutletContexts;
    outlet: RouterOutletContract | null;
    resolver: ComponentFactoryResolver | null;
    route: ActivatedRoute | null;
}

export declare interface ParamMap {
    readonly keys: string[];
    get(name: string): string | null;
    getAll(name: string): string[];
    has(name: string): boolean;
}

export declare type Params = {
    [key: string]: any;
};

export declare class PreloadAllModules implements PreloadingStrategy {
    preload(route: Route, fn: () => Observable<any>): Observable<any>;
}

export declare abstract class PreloadingStrategy {
    abstract preload(route: Route, fn: () => Observable<any>): Observable<any>;
}

export declare const PRIMARY_OUTLET = "primary";

export declare function provideRoutes(routes: Routes): any;

export declare type QueryParamsHandling = 'merge' | 'preserve' | '';

export declare interface Resolve<T> {
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<T> | Promise<T> | T;
}

export declare type ResolveData = {
    [name: string]: any;
};

export declare class ResolveEnd extends RouterEvent {
    state: RouterStateSnapshot;
    urlAfterRedirects: string;
    constructor(
    id: number,
    url: string,
    urlAfterRedirects: string,
    state: RouterStateSnapshot);
    toString(): string;
}

export declare class ResolveStart extends RouterEvent {
    state: RouterStateSnapshot;
    urlAfterRedirects: string;
    constructor(
    id: number,
    url: string,
    urlAfterRedirects: string,
    state: RouterStateSnapshot);
    toString(): string;
}

export declare interface Route {
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
    runGuardsAndResolvers?: RunGuardsAndResolvers;
}

export declare class RouteConfigLoadEnd {
    route: Route;
    constructor(
    route: Route);
    toString(): string;
}

export declare class RouteConfigLoadStart {
    route: Route;
    constructor(
    route: Route);
    toString(): string;
}

export declare class Router {
    config: Routes;
    errorHandler: ErrorHandler;
    readonly events: Observable<Event>;
    malformedUriErrorHandler: (error: URIError, urlSerializer: UrlSerializer, url: string) => UrlTree;
    navigated: boolean;
    onSameUrlNavigation: 'reload' | 'ignore';
    paramsInheritanceStrategy: 'emptyOnly' | 'always';
    relativeLinkResolution: 'legacy' | 'corrected';
    routeReuseStrategy: RouteReuseStrategy;
    readonly routerState: RouterState;
    get url(): string;
    urlHandlingStrategy: UrlHandlingStrategy;
    urlUpdateStrategy: 'deferred' | 'eager';
    constructor(rootComponentType: Type<any> | null, urlSerializer: UrlSerializer, rootContexts: ChildrenOutletContexts, location: Location, injector: Injector, loader: NgModuleFactoryLoader, compiler: Compiler, config: Routes);
    createUrlTree(commands: any[], navigationExtras?: UrlCreationOptions): UrlTree;
    dispose(): void;
    getCurrentNavigation(): Navigation | null;
    initialNavigation(): void;
    /** @deprecated */ isActive(url: string | UrlTree, exact: boolean): boolean;
    isActive(url: string | UrlTree, matchOptions: IsActiveMatchOptions): boolean;
    navigate(commands: any[], extras?: NavigationExtras): Promise<boolean>;
    navigateByUrl(url: string | UrlTree, extras?: NavigationBehaviorOptions): Promise<boolean>;
    ngOnDestroy(): void;
    parseUrl(url: string): UrlTree;
    resetConfig(config: Routes): void;
    serializeUrl(url: UrlTree): string;
    setUpLocationChangeListener(): void;
}

export declare const ROUTER_CONFIGURATION: InjectionToken<ExtraOptions>;

export declare const ROUTER_INITIALIZER: InjectionToken<(compRef: ComponentRef<any>) => void>;

export declare abstract class RouteReuseStrategy {
    abstract retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null;
    abstract shouldAttach(route: ActivatedRouteSnapshot): boolean;
    abstract shouldDetach(route: ActivatedRouteSnapshot): boolean;
    abstract shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean;
    abstract store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void;
}

export declare class RouterEvent {
    id: number;
    url: string;
    constructor(
    id: number,
    url: string);
}

export declare class RouterLink implements OnChanges {
    fragment?: string;
    preserveFragment: boolean;
    queryParams?: Params | null;
    queryParamsHandling?: QueryParamsHandling | null;
    relativeTo?: ActivatedRoute | null;
    replaceUrl: boolean;
    set routerLink(commands: any[] | string | null | undefined);
    skipLocationChange: boolean;
    state?: {
        [k: string]: any;
    };
    get urlTree(): UrlTree;
    constructor(router: Router, route: ActivatedRoute, tabIndex: string, renderer: Renderer2, el: ElementRef);
    ngOnChanges(changes: SimpleChanges): void;
    onClick(): boolean;
}

export declare class RouterLinkActive implements OnChanges, OnDestroy, AfterContentInit {
    readonly isActive: boolean;
    links: QueryList<RouterLink>;
    linksWithHrefs: QueryList<RouterLinkWithHref>;
    set routerLinkActive(data: string[] | string);
    routerLinkActiveOptions: {
        exact: boolean;
    } | IsActiveMatchOptions;
    constructor(router: Router, element: ElementRef, renderer: Renderer2, cdr: ChangeDetectorRef, link?: RouterLink | undefined, linkWithHref?: RouterLinkWithHref | undefined);
    ngAfterContentInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
}

export declare class RouterLinkWithHref implements OnChanges, OnDestroy {
    fragment?: string;
    href: string;
    preserveFragment: boolean;
    queryParams?: Params | null;
    queryParamsHandling?: QueryParamsHandling | null;
    relativeTo?: ActivatedRoute | null;
    replaceUrl: boolean;
    set routerLink(commands: any[] | string | null | undefined);
    skipLocationChange: boolean;
    state?: {
        [k: string]: any;
    };
    target: string;
    get urlTree(): UrlTree;
    constructor(router: Router, route: ActivatedRoute, locationStrategy: LocationStrategy);
    ngOnChanges(changes: SimpleChanges): any;
    ngOnDestroy(): any;
    onClick(button: number, ctrlKey: boolean, shiftKey: boolean, altKey: boolean, metaKey: boolean): boolean;
}

export declare class RouterModule {
    constructor(guard: any, router: Router);
    static forChild(routes: Routes): ModuleWithProviders<RouterModule>;
    static forRoot(routes: Routes, config?: ExtraOptions): ModuleWithProviders<RouterModule>;
}

export declare class RouterOutlet implements OnDestroy, OnInit, RouterOutletContract {
    activateEvents: EventEmitter<any>;
    get activatedRoute(): ActivatedRoute;
    get activatedRouteData(): Data;
    get component(): Object;
    deactivateEvents: EventEmitter<any>;
    get isActivated(): boolean;
    constructor(parentContexts: ChildrenOutletContexts, location: ViewContainerRef, resolver: ComponentFactoryResolver, name: string, changeDetector: ChangeDetectorRef);
    activateWith(activatedRoute: ActivatedRoute, resolver: ComponentFactoryResolver | null): void;
    attach(ref: ComponentRef<any>, activatedRoute: ActivatedRoute): void;
    deactivate(): void;
    detach(): ComponentRef<any>;
    ngOnDestroy(): void;
    ngOnInit(): void;
}

export declare interface RouterOutletContract {
    activatedRoute: ActivatedRoute | null;
    activatedRouteData: Data;
    component: Object | null;
    isActivated: boolean;
    activateWith(activatedRoute: ActivatedRoute, resolver: ComponentFactoryResolver | null): void;
    attach(ref: ComponentRef<unknown>, activatedRoute: ActivatedRoute): void;
    deactivate(): void;
    detach(): ComponentRef<unknown>;
}

export declare class RouterPreloader implements OnDestroy {
    constructor(router: Router, moduleLoader: NgModuleFactoryLoader, compiler: Compiler, injector: Injector, preloadingStrategy: PreloadingStrategy);
    ngOnDestroy(): void;
    preload(): Observable<any>;
    setUpPreloading(): void;
}

export declare class RouterState extends ɵangular_packages_router_router_m<ActivatedRoute> {
    snapshot: RouterStateSnapshot;
    toString(): string;
}

export declare class RouterStateSnapshot extends ɵangular_packages_router_router_m<ActivatedRouteSnapshot> {
    url: string;
    toString(): string;
}

export declare type Routes = Route[];

export declare const ROUTES: InjectionToken<Route[][]>;

export declare class RoutesRecognized extends RouterEvent {
    state: RouterStateSnapshot;
    urlAfterRedirects: string;
    constructor(
    id: number,
    url: string,
    urlAfterRedirects: string,
    state: RouterStateSnapshot);
    toString(): string;
}

export declare type RunGuardsAndResolvers = 'pathParamsChange' | 'pathParamsOrQueryParamsChange' | 'paramsChange' | 'paramsOrQueryParamsChange' | 'always' | ((from: ActivatedRouteSnapshot, to: ActivatedRouteSnapshot) => boolean);

export declare class Scroll {
    readonly anchor: string | null;
    readonly position: [number, number] | null;
    readonly routerEvent: NavigationEnd;
    constructor(
    routerEvent: NavigationEnd,
    position: [number, number] | null,
    anchor: string | null);
    toString(): string;
}

export declare interface UrlCreationOptions {
    fragment?: string;
    preserveFragment?: boolean;
    queryParams?: Params | null;
    queryParamsHandling?: QueryParamsHandling | null;
    relativeTo?: ActivatedRoute | null;
}

export declare abstract class UrlHandlingStrategy {
    abstract extract(url: UrlTree): UrlTree;
    abstract merge(newUrlPart: UrlTree, rawUrl: UrlTree): UrlTree;
    abstract shouldProcessUrl(url: UrlTree): boolean;
}

export declare type UrlMatcher = (segments: UrlSegment[], group: UrlSegmentGroup, route: Route) => UrlMatchResult | null;

export declare type UrlMatchResult = {
    consumed: UrlSegment[];
    posParams?: {
        [name: string]: UrlSegment;
    };
};

export declare class UrlSegment {
    get parameterMap(): ParamMap;
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

export declare class UrlSegmentGroup {
    children: {
        [key: string]: UrlSegmentGroup;
    };
    get numberOfChildren(): number;
    parent: UrlSegmentGroup | null;
    segments: UrlSegment[];
    constructor(
    segments: UrlSegment[],
    children: {
        [key: string]: UrlSegmentGroup;
    });
    hasChildren(): boolean;
    toString(): string;
}

export declare abstract class UrlSerializer {
    abstract parse(url: string): UrlTree;
    abstract serialize(tree: UrlTree): string;
}

export declare class UrlTree {
    fragment: string | null;
    get queryParamMap(): ParamMap;
    queryParams: Params;
    root: UrlSegmentGroup;
    toString(): string;
}

export declare const VERSION: Version;
