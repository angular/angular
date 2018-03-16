/** @experimental */
export declare function createCustomElement<P>(component: Type<any>, config: NgElementConfig): NgElementConstructor<P>;

/** @experimental */
export declare abstract class NgElement extends HTMLElement {
    protected ngElementEventsSubscription: Subscription | null;
    protected ngElementStrategy: NgElementStrategy;
    abstract attributeChangedCallback(attrName: string, oldValue: string | null, newValue: string, namespace?: string): void;
    abstract connectedCallback(): void;
    abstract disconnectedCallback(): void;
}

/** @experimental */
export interface NgElementConfig {
    injector: Injector;
    strategyFactory?: NgElementStrategyFactory;
}

/** @experimental */
export interface NgElementConstructor<P> {
    readonly observedAttributes: string[];
    new (injector: Injector): NgElement & WithProperties<P>;
}

/** @experimental */
export interface NgElementStrategy {
    events: Observable<NgElementStrategyEvent>;
    connect(element: HTMLElement): void;
    disconnect(): void;
    getInputValue(propName: string): any;
    setInputValue(propName: string, value: string): void;
}

/** @experimental */
export interface NgElementStrategyEvent {
    name: string;
    value: any;
}

/** @experimental */
export interface NgElementStrategyFactory {
    create(injector: Injector): NgElementStrategy;
}

/** @experimental */
export declare const VERSION: Version;

/** @experimental */
export declare type WithProperties<P> = {
    [property in keyof P]: P[property];
};
