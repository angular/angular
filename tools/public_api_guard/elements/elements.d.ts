/** @experimental */
<<<<<<< HEAD
export declare function registerAsCustomElements<T>(
    customElementComponents: Type<any>[],
    platformRef: PlatformRef,
    moduleFactory: NgModuleFactory<T>): Promise<NgModuleRef<T>>;
=======
<<<<<<< Updated upstream
export declare function createNgElementConstructor<T, P>(componentFactory: ComponentFactory<T>, injector: Injector): NgElementConstructor<T, P>;

/** @experimental */
export interface NgElementConstructor<T, P> {
    injector: Injector;
    readonly observedAttributes: string[];
    new (): NgElementWithProps<T, P>;
=======
export declare function createNgElementConstructor<T, P>(componentFactory: ComponentFactory<T>, config: NgElementConfig): NgElementConstructor<T, P>;

/** @experimental */
export interface NgElementConfig {
    injector: Injector;
>>>>>>> Stashed changes
}
>>>>>>> dab48556dc... feat(elements): change param to config

/** @experimental */
export declare const VERSION: Version;
