/** @experimental */
export declare function createNgElementConstructor<T, P>(componentFactory: ComponentFactory<T>, injector: Injector): NgElementConstructor<T, P>;

/** @experimental */
export interface NgElementConstructor<T, P> {
    injector: Injector;
    readonly observedAttributes: string[];
    new (): NgElementWithProps<T, P>;
}

/** @experimental */
export declare const VERSION: Version;
