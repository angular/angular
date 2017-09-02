/** @experimental */
export declare const INITIAL_CONFIG: InjectionToken<PlatformConfig>;

/** @experimental */
export interface PlatformConfig {
    document?: string;
    url?: string;
}

/** @experimental */
export declare const platformDynamicServer: (extraProviders?: StaticProvider[] | undefined) => PlatformRef;

/** @experimental */
export declare const platformServer: (extraProviders?: StaticProvider[] | undefined) => PlatformRef;

/** @experimental */
export declare class PlatformState {
    constructor(_doc: any);
    getDocument(): any;
    renderToString(): string;
}

/** @experimental */
export declare function renderModule<T>(module: Type<T>, options: {
    document?: string;
    url?: string;
    extraProviders?: StaticProvider[];
}): Promise<string>;

/** @experimental */
export declare function renderModuleFactory<T>(moduleFactory: NgModuleFactory<T>, options: {
    document?: string;
    url?: string;
    extraProviders?: StaticProvider[];
}): Promise<string>;

/** @experimental */
export declare const SERVER_BEFORE_RENDER_LISTENER: InjectionToken<(() => void | Observable<any> | Promise<any>)[]>;

/** @experimental */
export declare class ServerModule {
}

/** @stable */
export declare const VERSION: Version;
