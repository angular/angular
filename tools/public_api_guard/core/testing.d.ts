/** @stable */
export declare function addProviders(providers: Array<any>): void;

/** @stable */
export declare function async(fn: Function): (done: any) => any;

/** @stable */
export declare class ComponentFixture<T> {
    changeDetectorRef: ChangeDetectorRef;
    componentInstance: T;
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

/** @experimental */
export declare var ComponentFixtureAutoDetect: OpaqueToken;

/** @experimental */
export declare var ComponentFixtureNoNgZone: OpaqueToken;

/** @stable */
export declare function configureCompiler(config: {
    providers?: any[];
    useJit?: boolean;
}): void;

/** @stable */
export declare function configureModule(moduleDef: {
    providers?: any[];
    declarations?: any[];
    imports?: any[];
    precompile?: any[];
}): void;

/** @experimental */
export declare function discardPeriodicTasks(): void;

/** @experimental */
export declare function doAsyncPrecompilation(): Promise<any>;

/** @experimental */
export declare function fakeAsync(fn: Function): (...args: any[]) => any;

/** @experimental */
export declare function flushMicrotasks(): void;

/** @experimental */
export declare function getTestBed(): TestBed;

/** @deprecated */
export declare function getTestInjector(): TestBed;

/** @experimental */
export declare function initTestEnvironment(ngModule: Type, platform: PlatformRef): Injector;

/** @stable */
export declare function inject(tokens: any[], fn: Function): () => any;

/** @experimental */
export declare class InjectSetupWrapper {
    constructor(_moduleDef: () => {
        providers?: any[];
        declarations?: any[];
        imports?: any[];
        precompile?: any[];
    });
    inject(tokens: any[], fn: Function): () => any;
}

/** @deprecated */
export declare function resetBaseTestProviders(): void;

/** @experimental */
export declare function resetTestEnvironment(): void;

/** @deprecated */
export declare function setBaseTestProviders(platformProviders: Array<Type | Provider | any[]>, applicationProviders: Array<Type | Provider | any[]>): void;

/** @experimental */
export declare class TestBed implements Injector {
    ngModule: Type;
    platform: PlatformRef;
    configureCompiler(config: {
        providers?: any[];
        useJit?: boolean;
    }): void;
    configureModule(moduleDef: {
        providers?: any[];
        declarations?: any[];
        imports?: any[];
        precompile?: any[];
    }): void;
    createModuleFactory(): Promise<NgModuleFactory<any>>;
    execute(tokens: any[], fn: Function): any;
    get(token: any, notFoundValue?: any): any;
    initTestModule(): void;
    reset(): void;
}

/** @stable */
export declare class TestComponentBuilder {
    protected _injector: Injector;
    constructor(_injector: Injector);
    createAsync<T>(rootComponentType: ConcreteType<T>, ngModule?: ConcreteType<any>): Promise<ComponentFixture<T>>;
    createFakeAsync<T>(rootComponentType: ConcreteType<T>, ngModule?: ConcreteType<any>): ComponentFixture<T>;
    protected createFromFactory<C>(ngZone: NgZone, componentFactory: ComponentFactory<C>): ComponentFixture<C>;
    createSync<T>(rootComponentType: ConcreteType<T>, ngModule?: ConcreteType<any>): ComponentFixture<T>;
    overrideAnimations(componentType: Type, animations: AnimationEntryMetadata[]): TestComponentBuilder;
    overrideDirective(componentType: Type, from: Type, to: Type): TestComponentBuilder;
    overrideProviders(type: Type, providers: any[]): TestComponentBuilder;
    overrideTemplate(componentType: Type, template: string): TestComponentBuilder;
    overrideView(componentType: Type, view: ViewMetadata): TestComponentBuilder;
    overrideViewProviders(type: Type, providers: any[]): TestComponentBuilder;
}

/** @experimental */
export declare class TestComponentRenderer {
    insertRootElement(rootElementId: string): void;
}

/** @experimental */
export declare function tick(millis?: number): void;

/** @experimental */
export declare function withModule(moduleDef: () => {
    providers?: any[];
    declarations?: any[];
    imports?: any[];
    precompile?: any[];
}): InjectSetupWrapper;

/** @experimental */
export declare function withProviders(providers: () => any): InjectSetupWrapper;
