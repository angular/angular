/** @experimental */
export declare function createNgElementConstructor<T, P>(componentFactory: ComponentFactory<T>, config: NgElementConfig): NgElementConstructor<T, P>;

/** @experimental */
export interface NgElementConfig {
    injector: Injector;
}

/** @experimental */
export interface NgElementConstructor<T, P> {
    readonly observedAttributes: string[];
    new (): NgElementWithProps<T, P>;
}

/** @experimental */
export declare const VERSION: Version;
