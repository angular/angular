export declare function addProviders(providers: Array<any>): void;

export declare var afterEach: Function;

export declare function async(fn: Function): (done: any) => any;

export declare var beforeEach: any;

export declare function beforeEachProviders(fn: () => Array<any>): void;

export declare class ComponentFixture<T> {
    changeDetectorRef: ChangeDetectorRef;
    componentInstance: any;
    componentRef: ComponentRef<T>;
    debugElement: DebugElement;
    elementRef: ElementRef;
    nativeElement: any;
    ngZone: NgZone;
    constructor(componentRef: ComponentRef<T>, ngZone: NgZone, autoDetect: boolean);
    autoDetectChanges(autoDetect?: boolean): void;
    checkNoChanges(): void;
    destroy(): void;
    detectChanges(checkNoChanges?: boolean): void;
    isStable(): boolean;
    whenStable(): Promise<any>;
}

export declare var ComponentFixtureAutoDetect: OpaqueToken;

export declare var ComponentFixtureNoNgZone: OpaqueToken;

export declare var ddescribe: any;

export declare var describe: Function;

export declare function discardPeriodicTasks(): void;

export declare var expect: Function;

export declare function fakeAsync(fn: Function): (...args: any[]) => any;

export declare var fdescribe: any;

export declare var fit: any;

export declare function flushMicrotasks(): void;

export declare function getTestInjector(): TestInjector;

export declare var iit: any;

export declare function inject(tokens: any[], fn: Function): () => any;

export declare class InjectSetupWrapper {
    constructor(_providers: () => any);
    inject(tokens: any[], fn: Function): () => any;
}

export declare var it: any;

export declare function resetBaseTestProviders(): void;

export declare function setBaseTestProviders(platformProviders: Array<Type | Provider | any[]>, applicationProviders: Array<Type | Provider | any[]>): void;

export declare class TestComponentBuilder {
    protected _injector: Injector;
    constructor(_injector: Injector);
    createAsync(rootComponentType: Type): Promise<ComponentFixture<any>>;
    createFakeAsync(rootComponentType: Type): ComponentFixture<any>;
    protected createFromFactory<C>(ngZone: NgZone, componentFactory: ComponentFactory<C>): ComponentFixture<C>;
    createSync<C>(componentFactory: ComponentFactory<C>): ComponentFixture<C>;
    overrideAnimations(componentType: Type, animations: AnimationEntryMetadata[]): TestComponentBuilder;
    overrideDirective(componentType: Type, from: Type, to: Type): TestComponentBuilder;
    overrideProviders(type: Type, providers: any[]): TestComponentBuilder;
    overrideTemplate(componentType: Type, template: string): TestComponentBuilder;
    overrideView(componentType: Type, view: ViewMetadata): TestComponentBuilder;
    overrideViewProviders(type: Type, providers: any[]): TestComponentBuilder;
}

export declare class TestComponentRenderer {
    insertRootElement(rootElementId: string): void;
}

export declare class TestInjector {
    applicationProviders: Array<Type | Provider | any[] | any>;
    platformProviders: Array<Type | Provider | any[] | any>;
    addProviders(providers: Array<Type | Provider | any[] | any>): void;
    createInjector(): ReflectiveInjector;
    execute(tokens: any[], fn: Function): any;
    get(token: any): any;
    reset(): void;
}

export declare function tick(millis?: number): void;

export declare function withProviders(providers: () => any): InjectSetupWrapper;

export declare var xdescribe: Function;

export declare var xit: any;
