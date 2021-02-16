export declare const MOCK_PLATFORM_LOCATION_CONFIG: InjectionToken<MockPlatformLocationConfig>;

export declare class MockLocationStrategy extends LocationStrategy {
    internalBaseHref: string;
    internalPath: string;
    internalTitle: string;
    urlChanges: string[];
    constructor();
    back(): void;
    forward(): void;
    getBaseHref(): string;
    getState(): unknown;
    onPopState(fn: (value: any) => void): void;
    path(includeHash?: boolean): string;
    prepareExternalUrl(internal: string): string;
    pushState(ctx: any, title: string, path: string, query: string): void;
    replaceState(ctx: any, title: string, path: string, query: string): void;
    simulatePopState(url: string): void;
}

export declare class MockPlatformLocation implements PlatformLocation {
    get hash(): string;
    get hostname(): string;
    get href(): string;
    get pathname(): string;
    get port(): string;
    get protocol(): string;
    get search(): string;
    get state(): unknown;
    get url(): string;
    constructor(config?: MockPlatformLocationConfig);
    back(): void;
    forward(): void;
    getBaseHrefFromDOM(): string;
    getState(): unknown;
    onHashChange(fn: LocationChangeListener): VoidFunction;
    onPopState(fn: LocationChangeListener): VoidFunction;
    pushState(state: any, title: string, newUrl: string): void;
    replaceState(state: any, title: string, newUrl: string): void;
}

export declare interface MockPlatformLocationConfig {
    appBaseHref?: string;
    startUrl?: string;
}

export declare class SpyLocation implements Location {
    urlChanges: string[];
    back(): void;
    forward(): void;
    getState(): unknown;
    go(path: string, query?: string, state?: any): void;
    isCurrentPathEqualTo(path: string, query?: string): boolean;
    normalize(url: string): string;
    onUrlChange(fn: (url: string, state: unknown) => void): void;
    path(): string;
    prepareExternalUrl(url: string): string;
    replaceState(path: string, query?: string, state?: any): void;
    setBaseHref(url: string): void;
    setInitialPath(url: string): void;
    simulateHashChange(pathname: string): void;
    simulateUrlPop(pathname: string): void;
    subscribe(onNext: (value: any) => void, onThrow?: ((error: any) => void) | null, onReturn?: (() => void) | null): SubscriptionLike;
}
