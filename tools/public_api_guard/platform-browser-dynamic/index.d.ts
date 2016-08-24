/** @experimental */
export declare function bootstrapWorkerUi(workerScriptUri: string, customProviders?: Provider[]): Promise<PlatformRef>;

/** @stable */
export declare const platformBrowserDynamic: (extraProviders?: (TypeProvider | ValueProvider | ClassProvider | ExistingProvider | FactoryProvider | any[])[]) => PlatformRef;

/** @experimental */
export declare const platformWorkerAppDynamic: (extraProviders?: (TypeProvider | ValueProvider | ClassProvider | ExistingProvider | FactoryProvider | any[])[]) => PlatformRef;

/** @experimental */
export declare const RESOURCE_CACHE_PROVIDER: Provider[];
