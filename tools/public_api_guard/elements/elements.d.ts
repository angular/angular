/** @experimental */
export declare function registerAsCustomElements<T>(
    customElementComponents: Type<any>[],
    platformRef: PlatformRef,
    moduleFactory: NgModuleFactory<T>): Promise<NgModuleRef<T>>;

/** @experimental */
export declare const VERSION: Version;
