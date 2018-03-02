/** @experimental */
export declare function createNgElementConstructor<P>(component: Type<any>, config: NgElementConfig): NgElementConstructor<P>;

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
    attributeToPropertyInputs?: Map<string, string>;
    injector: Injector;
    propertyInputs?: string[];
    strategyFactory?: NgElementStrategyFactory;
}

/** @experimental */
export interface NgElementConstructor<P> {
    readonly observedAttributes: string[];
    new (): NgElement & WithProperties<P>;
}

/** @experimental */
export interface NgElementStrategy {
    events: Observable<NgElementStrategyEvent>;
    connect(element: HTMLElement): void;
    disconnect(): void;
    getPropertyValue(propName: string): any;
    setPropertyValue(propName: string, value: string): void;
}

/** @experimental */
export interface NgElementStrategyEvent {
    name: string;
    value: any;
}

/** @experimental */
export interface NgElementStrategyFactory {
    create(): NgElementStrategy;
}

/** @experimental */
export declare const VERSION: Version;
