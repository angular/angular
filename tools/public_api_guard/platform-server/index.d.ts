/** @experimental */
export declare const SERVER_PLATFORM_PROVIDERS: Array<any>;

/** @deprecated */
export declare function serverBootstrap(appComponentType: Type, providers: Array<any>): Promise<ComponentRef<any>>;

/** @experimental */
export declare const serverDynamicPlatform: () => PlatformRef;

/** @experimental */
export declare const serverPlatform: () => PlatformRef;
