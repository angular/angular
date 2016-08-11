/** @deprecated */
export declare function bootstrap<C>(appComponentType: Type<C>, customProviders?: Array<any>): Promise<ComponentRef<C>>;

/** @deprecated */
export declare function bootstrapWorkerApp<T>(appComponentType: Type<T>, customProviders?: Array<any>): Promise<ComponentRef<T>>;

/** @experimental */
export declare function bootstrapWorkerUi(workerScriptUri: string, customProviders?: Array<any>): Promise<PlatformRef>;

/** @deprecated */
export declare const BROWSER_APP_COMPILER_PROVIDERS: Array<any>;

/** @deprecated */
export declare const browserDynamicPlatform: (extraProviders?: any[]) => PlatformRef;

/** @experimental */
export declare const CACHED_TEMPLATE_PROVIDER: Array<any>;

/** @experimental */
export declare const platformBrowserDynamic: (extraProviders?: any[]) => PlatformRef;

/** @experimental */
export declare const platformWorkerAppDynamic: (extraProviders?: any[]) => PlatformRef;

/** @deprecated */
export declare const workerAppDynamicPlatform: (extraProviders?: any[]) => PlatformRef;
