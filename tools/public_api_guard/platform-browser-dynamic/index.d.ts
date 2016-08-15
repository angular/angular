/** @deprecated */
export declare function bootstrap<C>(appComponentType: Type<C>, customProviders?: Array<any>): Promise<ComponentRef<C>>;

/** @experimental */
export declare function bootstrapWorkerUi(workerScriptUri: string, customProviders?: Array<any>): Promise<PlatformRef>;

/** @experimental */
export declare const CACHED_TEMPLATE_PROVIDER: Array<any>;

/** @experimental */
export declare const platformBrowserDynamic: (extraProviders?: any[]) => PlatformRef;

/** @experimental */
export declare const platformWorkerAppDynamic: (extraProviders?: any[]) => PlatformRef;
