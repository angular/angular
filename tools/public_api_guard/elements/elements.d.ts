/** @experimental */
export interface NgElement<T> extends HTMLElement {
    componentRef: ComponentRef<T> | null;
    ngElement: NgElement<T> | null;
    attributeChangedCallback(attrName: string, oldValue: string | null, newValue: string, namespace?: string): void;
    connectedCallback(): void;
    detach(): void;
    detectChanges(): void;
    disconnectedCallback(): void;
    getHost(): HTMLElement;
    markDirty(): void;
}

/** @experimental */
export interface NgElementConstructor<T, P> {
    readonly is: string;
    readonly observedAttributes: string[];
    new (): NgElementWithProps<T, P>;
    upgrade(host: HTMLElement): NgElementWithProps<T, P>;
}

/** @experimental */
export declare type NgElementWithProps<T, P> = NgElement<T> & {
    [property in keyof

/** @experimental */
export declare function registerAsCustomElements<T>(customElementComponents: Type<any>[], platformRef: PlatformRef, moduleFactory: NgModuleFactory<T>): Promise<NgModuleRef<T>>;

/** @experimental */
export declare const VERSION: Version;
