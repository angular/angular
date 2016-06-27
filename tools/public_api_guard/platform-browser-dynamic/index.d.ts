/** @experimental */
export declare function bootstrap(appComponentType: Type, customProviders?: Array<any>): Promise<ComponentRef<any>>;

/** @experimental */
export declare function bootstrapWorkerApp(appComponentType: Type, customProviders?: Array<any>): Promise<ComponentRef<any>>;

/** @experimental */
export declare function bootstrapWorkerUi(workerScriptUri: string, customProviders?: Array<any>): Promise<ApplicationRef>;

/** @experimental */
export declare const BROWSER_APP_COMPILER_PROVIDERS: Array<any>;

/** @experimental */
export declare const CACHED_TEMPLATE_PROVIDER: Array<any>;
