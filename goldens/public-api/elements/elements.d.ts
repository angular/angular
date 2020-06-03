export declare class ComponentNgElementStrategy implements NgElementStrategy {
    events: Observable<NgElementStrategyEvent>;
    constructor(componentFactory: ComponentFactory<any>, injector: Injector);
    protected callNgOnChanges(): void;
    connect(element: HTMLElement): void;
    protected detectChanges(): void;
    disconnect(): void;
    getInputValue(property: string): any;
    protected initializeComponent(element: HTMLElement): void;
    protected initializeInputs(): void;
    protected initializeOutputs(): void;
    protected recordInputChange(property: string, currentValue: any): void;
    protected scheduleDetectChanges(): void;
    setInputValue(property: string, value: any): void;
}

export declare class ComponentNgElementStrategyFactory implements NgElementStrategyFactory {
    componentFactory: ComponentFactory<any>;
    constructor(component: Type<any>, injector: Injector);
    create(injector: Injector): ComponentNgElementStrategy;
}

export declare function createCustomElement<P>(component: Type<any>, config: NgElementConfig): NgElementConstructor<P>;

export declare abstract class NgElement extends HTMLElement {
    protected ngElementEventsSubscription: Subscription | null;
    protected ngElementStrategy: NgElementStrategy;
    abstract attributeChangedCallback(attrName: string, oldValue: string | null, newValue: string, namespace?: string): void;
    abstract connectedCallback(): void;
    abstract disconnectedCallback(): void;
}

export declare interface NgElementConfig {
    injector: Injector;
    strategyFactory?: NgElementStrategyFactory;
}

export declare interface NgElementConstructor<P> {
    readonly observedAttributes: string[];
    new (injector?: Injector): NgElement & WithProperties<P>;
}

export declare interface NgElementStrategy {
    events: Observable<NgElementStrategyEvent>;
    connect(element: HTMLElement): void;
    disconnect(): void;
    getInputValue(propName: string): any;
    setInputValue(propName: string, value: string): void;
}

export declare interface NgElementStrategyEvent {
    name: string;
    value: any;
}

export declare interface NgElementStrategyFactory {
    create(injector: Injector): NgElementStrategy;
}

export declare const VERSION: Version;

export declare type WithProperties<P> = {
    [property in keyof P]: P[property];
};
