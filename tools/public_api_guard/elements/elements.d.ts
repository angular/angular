/** @experimental */
export declare class ComponentFactoryNgElementStrategy implements NgElementStrategy {
    events: Observable<NgElementStrategyEvent>;
    constructor(componentFactory: ComponentFactory<any>, injector: Injector);
    protected callNgOnChanges(): void;
    connect(element: HTMLElement): void;
    protected detectChanges(): void;
    disconnect(): void;
    getPropertyValue(property: string): any;
    protected initializeComponent(element: HTMLElement): void;
    protected initializeInputs(): void;
    protected initializeOutputs(): void;
    protected recordInputChange(property: string, currentValue: any): void;
    protected scheduleDetectChanges(): void;
    setPropertyValue(property: string, value: any): void;
}

/** @experimental */
export declare class ComponentFactoryNgElementStrategyFactory implements NgElementStrategyFactory {
    constructor(componentFactory: ComponentFactory<any>, injector: Injector);
    create(): ComponentFactoryNgElementStrategy;
}

/** @experimental */
export declare function createNgElementConstructor<P>(config: NgElementConfig): NgElementConstructor<P>;

/** @experimental */
export declare function getConfigFromComponentFactory(componentFactory: ComponentFactory<any>, injector: Injector): {
    strategyFactory: ComponentFactoryNgElementStrategyFactory;
    propertyInputs: string[];
    attributeToPropertyInputs: Map<string, string>;
};

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
    attributeToPropertyInputs: Map<string, string>;
    propertyInputs: string[];
    strategyFactory: NgElementStrategyFactory;
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
