/** @stable */
export declare function addProviders(providers: Array<any>): void;

/** @deprecated */
export declare var afterEach: Function;

/** @stable */
export declare function async(fn: Function): (done: any) => any;

/** @deprecated */
export declare var beforeEach: any;

/** @deprecated */
export declare function beforeEachProviders(fn: () => Array<any>): void;

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
    directives?: any[];
    pipes?: any[];
    precompile?: any[];
    modules?: any[];
}): void;

/** @deprecated */
export declare var ddescribe: any;

/** @deprecated */
export declare var describe: Function;

/** @experimental */
export declare function discardPeriodicTasks(): void;

/** @deprecated */
export declare var expect: Function;

/** @experimental */
export declare function fakeAsync(fn: Function): (...args: any[]) => any;

/** @deprecated */
export declare var fdescribe: any;

/** @deprecated */
export declare var fit: any;

/** @experimental */
export declare function flushMicrotasks(): void;

/** @experimental */
export declare function getTestInjector(): TestInjector;

/** @deprecated */
export declare var iit: any;

/** @experimental */
export declare function initTestEnvironment(appModule: Type, platform: PlatformRef): void;

/** @stable */
export declare function inject(tokens: any[], fn: Function): () => any;

/** @experimental */
export declare class InjectSetupWrapper {
    constructor(_moduleDef: () => {
        providers?: any[];
        directives?: any[];
        pipes?: any[];
        precompile?: any[];
        modules?: any[];
    });
    inject(tokens: any[], fn: Function): () => any;
}

/** @deprecated */
export declare var it: any;

/** @experimental */
export declare function resetTestEnvironment(): void;

/** @stable */
export declare class TestComponentBuilder {
    protected _injector: Injector;
    constructor(_injector: Injector);
    createAsync<T>(rootComponentType: ConcreteType<T>): Promise<ComponentFixture<T>>;
    createFakeAsync<T>(rootComponentType: ConcreteType<T>): ComponentFixture<T>;
    protected createFromFactory<C>(ngZone: NgZone, componentFactory: ComponentFactory<C>): ComponentFixture<C>;
    createSync<T>(rootComponentType: ConcreteType<T>): ComponentFixture<T>;
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
export declare class TestInjector implements Injector {
    appModule: Type;
    platform: PlatformRef;
    configureCompiler(config: {
        providers?: any[];
        useJit?: boolean;
    }): void;
    configureModule(moduleDef: {
        providers?: any[];
        directives?: any[];
        pipes?: any[];
        precompile?: any[];
        modules?: any[];
    }): void;
    createInjectorAsync(): Promise<Injector>;
    createInjectorSync(): Injector;
    execute(tokens: any[], fn: Function): any;
    get(token: any, notFoundValue?: any): any;
    reset(): void;
}

/** @experimental */
export declare function tick(millis?: number): void;

/** @experimental */
export declare function withModule(moduleDef: () => {
    providers?: any[];
    directives?: any[];
    pipes?: any[];
    precompile?: any[];
    modules?: any[];
}): InjectSetupWrapper;

/** @experimental */
export declare function withProviders(providers: () => any): InjectSetupWrapper;

/** @deprecated */
export declare var xdescribe: Function;

/** @deprecated */
export declare var xit: any;
