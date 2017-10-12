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
export declare type NgElementWithProps<T, P> = NgElement<T> & {
    [property in keyof

/** @experimental */
export declare const VERSION: Version;
