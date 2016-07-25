/** @experimental */
export declare const platformDynamicServer: (extraProviders?: any[]) => PlatformRef;

/** @experimental */
export declare const platformServer: (extraProviders?: any[]) => PlatformRef;

/** @deprecated */
export declare const SERVER_PLATFORM_PROVIDERS: Array<any>;

/** @deprecated */
export declare function serverBootstrap<T>(appComponentType: ConcreteType<T>, customProviders: Array<any>): Promise<ComponentRef<T>>;

/** @deprecated */
export declare const serverDynamicPlatform: (extraProviders?: any[]) => PlatformRef;

/** @deprecated */
export declare const serverPlatform: (extraProviders?: any[]) => PlatformRef;
