/** @deprecated */
export declare const SERVER_PLATFORM_PROVIDERS: Array<any>;

/** @deprecated */
export declare function serverBootstrap<T>(appComponentType: ConcreteType<T>, customProviders: Array<any>): Promise<ComponentRef<T>>;

/** @experimental */
export declare const serverDynamicPlatform: (extraProviders?: any[]) => PlatformRef;

/** @experimental */
export declare const serverPlatform: (extraProviders?: any[]) => PlatformRef;
