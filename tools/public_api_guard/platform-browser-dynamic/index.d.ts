export declare function bootstrap(appComponentType: Type, customProviders?: Array<any>): Promise<ComponentRef<any>>;

/** @experimental */
export declare function bootstrapWorkerApp(appComponentType: Type, customProviders?: Array<any>): Promise<ComponentRef<any>>;

/** @experimental */
export declare function bootstrapWorkerUi(workerScriptUri: string, customProviders?: Array<any>): Promise<ApplicationRef>;

export declare const BROWSER_APP_COMPILER_PROVIDERS: Array<any>;

export declare const CACHED_TEMPLATE_PROVIDER: Array<any>;
