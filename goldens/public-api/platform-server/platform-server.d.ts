export declare const BEFORE_APP_SERIALIZED: InjectionToken<(() => void | Promise<void>)[]>;

export declare const INITIAL_CONFIG: InjectionToken<PlatformConfig>;

export declare interface PlatformConfig {
    baseUrl?: string;
    document?: string;
    url?: string;
    useAbsoluteUrl?: boolean;
}

export declare const platformDynamicServer: (extraProviders?: StaticProvider[] | undefined) => PlatformRef;

export declare const platformServer: (extraProviders?: StaticProvider[] | undefined) => PlatformRef;

export declare class PlatformState {
    constructor(_doc: any);
    getDocument(): any;
    renderToString(): string;
}

export declare function renderModule<T>(module: Type<T>, options: {
    document?: string;
    url?: string;
    extraProviders?: StaticProvider[];
}): Promise<string>;

export declare function renderModuleFactory<T>(moduleFactory: NgModuleFactory<T>, options: {
    document?: string;
    url?: string;
    extraProviders?: StaticProvider[];
}): Promise<string>;

export declare class ServerModule {
}

export declare class ServerTransferStateModule {
}

export declare const VERSION: Version;
