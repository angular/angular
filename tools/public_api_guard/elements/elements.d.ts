/** @experimental */
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

/** @experimental */
export declare const VERSION: Version;
