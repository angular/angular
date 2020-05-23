export declare class $locationShim {
    constructor($injector: any, location: Location, platformLocation: PlatformLocation, urlCodec: UrlCodec, locationStrategy: LocationStrategy);
    $$parse(url: string): void;
    $$parseLinkUrl(url: string, relHref?: string | null): boolean;
    absUrl(): string;
    hash(): string;
    hash(hash: string | number | null): this;
    host(): string;
    onChange(fn: (url: string, state: unknown, oldUrl: string, oldState: unknown) => void, err?: (e: Error) => void): void;
    path(): string;
    path(path: string | number | null): this;
    port(): number | null;
    protocol(): string;
    replace(): this;
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

export declare class $locationShimProvider {
    constructor(ngUpgrade: UpgradeModule, location: Location, platformLocation: PlatformLocation, urlCodec: UrlCodec, locationStrategy: LocationStrategy);
    $get(): $locationShim;
    hashPrefix(prefix?: string): void;
    html5Mode(mode?: any): void;
}

export declare class AngularJSUrlCodec implements UrlCodec {
    areEqual(valA: string, valB: string): boolean;
    decodeHash(hash: string): string;
    decodePath(path: string, html5Mode?: boolean): string;
    decodeSearch(search: string): {
        [k: string]: unknown;
    };
    encodeHash(hash: string): string;
    encodePath(path: string): string;
    encodeSearch(search: string | {
        [k: string]: unknown;
    }): string;
    normalize(href: string): string;
    normalize(path: string, search: {
        [k: string]: unknown;
    }, hash: string, baseUrl?: string): string;
    parse(url: string, base?: string): {
        href: string;
        protocol: string;
        host: string;
        search: string;
        hash: string;
        hostname: string;
        port: string;
        pathname: string;
    };
}

export declare const LOCATION_UPGRADE_CONFIGURATION: InjectionToken<LocationUpgradeConfig>;

export declare interface LocationUpgradeConfig {
    appBaseHref?: string;
    hashPrefix?: string;
    serverBaseHref?: string;
    urlCodec?: typeof UrlCodec;
    useHash?: boolean;
}

export declare class LocationUpgradeModule {
    static config(config?: LocationUpgradeConfig): ModuleWithProviders<LocationUpgradeModule>;
}

export declare abstract class UrlCodec {
    abstract areEqual(valA: string, valB: string): boolean;
    abstract decodeHash(hash: string): string;
    abstract decodePath(path: string): string;
    abstract decodeSearch(search: string): {
        [k: string]: unknown;
    };
    abstract encodeHash(hash: string): string;
    abstract encodePath(path: string): string;
    abstract encodeSearch(search: string | {
        [k: string]: unknown;
    }): string;
    abstract normalize(href: string): string;
    abstract normalize(path: string, search: {
        [k: string]: unknown;
    }, hash: string, baseUrl?: string): string;
    abstract parse(url: string, base?: string): {
        href: string;
        protocol: string;
        host: string;
        search: string;
        hash: string;
        hostname: string;
        port: string;
        pathname: string;
    };
}
