/** @deprecated */
export declare function bootstrap<C>(appComponentType: Type<C>, customProviders?: Provider[]): Promise<ComponentRef<C>>;

/** @experimental */
export declare function bootstrapWorkerUi(workerScriptUri: string, customProviders?: Provider[]): Promise<PlatformRef>;

/** @experimental */
export declare const CACHED_TEMPLATE_PROVIDER: Provider[];

/** @experimental */
export declare const platformBrowserDynamic: (extraProviders?: any[]) => PlatformRef;

/** @experimental */
export declare const platformWorkerAppDynamic: (extraProviders?: any[]) => PlatformRef;
