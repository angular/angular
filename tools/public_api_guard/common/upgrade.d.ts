export declare const LOCATION_UPGRADE_CONFIGURATION: InjectionToken<LocationUpgradeConfig>;

export declare const LOCATION_UPGRADE_MODULE = "LOCATION_UPGRADE_MODULE";

export interface LocationUpgradeConfig {
    appBaseHref?: string;
    serverBaseHref?: string;
    urlCodec?: typeof UrlCodec;
    useHash?: boolean;
}

export declare class LocationUpgradeModule {
    static config(config?: LocationUpgradeConfig): ModuleWithProviders<LocationUpgradeModule>;
}

export declare class LocationUpgradeService {
    readonly $$state: unknown;
    constructor(location: Location, platformLocation: PlatformLocation, locationStrategy: LocationStrategy, urlCodec: UrlCodec);
    $$parse(url: string): void;
    $$parseLinkUrl(url: string, relHref?: string): boolean;
    absUrl(): string;
    hash(hash: string | number | null): this;
    hash(): string;
    host(): string;
    path(path: string | number | null): this;
    path(): string;
    port(): number | null;
    protocol(): string;
    search(): {
        [key: string]: unknown;
    };
    search(search: string | number | {
        [key: string]: unknown;
    }): this;
    search(search: string | number | {
        [key: string]: unknown;
    }, paramValue: null | undefined | string | number | boolean | string[]): this;
    state(): unknown;
    state(state: unknown): this;
    url(): string;
    url(url: string): this;
}

export declare function provideLocationStrategy(platformLocationStrategy: PlatformLocation, baseHref: string, options?: LocationUpgradeConfig): HashLocationStrategy | PathLocationStrategy;
