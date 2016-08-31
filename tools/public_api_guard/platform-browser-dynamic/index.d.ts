/** @experimental */
export declare function bootstrapWorkerUi(workerScriptUri: string, customProviders?: Provider[]): Promise<PlatformRef>;

/** @experimental */
export declare const platformBrowserDynamic: (extraProviders?: Provider[]) => PlatformRef;

/** @experimental */
export declare const platformWorkerAppDynamic: (extraProviders?: Provider[]) => PlatformRef;

/** @experimental */
export declare const RESOURCE_CACHE_PROVIDER: Provider[];
