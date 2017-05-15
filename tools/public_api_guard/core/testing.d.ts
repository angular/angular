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
    ngZone: NgZone | null;
    constructor(componentRef: ComponentRef<T>, ngZone: NgZone | null, _autoDetect: boolean);
    autoDetectChanges(autoDetect?: boolean): void;
    checkNoChanges(): void;
    destroy(): void;
    detectChanges(checkNoChanges?: boolean): void;
    isStable(): boolean;
    whenRenderingDone(): Promise<any>;
    whenStable(): Promise<any>;
}

/** @experimental */
export declare const ComponentFixtureAutoDetect: InjectionToken<boolean[]>;

/** @experimental */
export declare const ComponentFixtureNoNgZone: InjectionToken<boolean[]>;

/** @experimental */
export declare function discardPeriodicTasks(): void;

/** @experimental */
export declare function fakeAsync(fn: Function): (...args: any[]) => any;

/** @experimental */
export declare function flushMicrotasks(): void;

/** @experimental */
export declare function getTestBed(): TestBed;

/** @stable */
export declare function inject(tokens: any[], fn: Function): () => any;

/** @experimental */
export declare class InjectSetupWrapper {
    constructor(_moduleDef: () => TestModuleMetadata);
    inject(tokens: any[], fn: Function): () => any;
}

/** @experimental */
export declare type MetadataOverride<T> = {
    add?: T;
    remove?: T;
    set?: T;
};

/** @experimental */
export declare function resetFakeAsyncZone(): void;

/** @stable */
export declare class TestBed implements Injector {
    ngModule: Type<any> | Type<any>[];
    platform: PlatformRef;
    compileComponents(): Promise<any>;
    configureCompiler(config: {
        providers?: any[];
        useJit?: boolean;
    }): void;
    configureTestingModule(moduleDef: TestModuleMetadata): void;
    createComponent<T>(component: Type<T>): ComponentFixture<T>;
    execute(tokens: any[], fn: Function, context?: any): any;
    get(token: any, notFoundValue?: any): any;
    /** @experimental */ initTestEnvironment(ngModule: Type<any> | Type<any>[], platform: PlatformRef, aotSummaries?: () => any[]): void;
    overrideComponent(component: Type<any>, override: MetadataOverride<Component>): void;
    overrideDirective(directive: Type<any>, override: MetadataOverride<Directive>): void;
    overrideModule(ngModule: Type<any>, override: MetadataOverride<NgModule>): void;
    overridePipe(pipe: Type<any>, override: MetadataOverride<Pipe>): void;
    overrideProvider(token: any, provider: {
        useFactory: Function;
        deps: any[];
    }): void;
    overrideProvider(token: any, provider: {
        useValue: any;
    }): void;
    /** @experimental */ resetTestEnvironment(): void;
    resetTestingModule(): void;
    static compileComponents(): Promise<any>;
    static configureCompiler(config: {
        providers?: any[];
        useJit?: boolean;
    }): typeof TestBed;
    static configureTestingModule(moduleDef: TestModuleMetadata): typeof TestBed;
    static createComponent<T>(component: Type<T>): ComponentFixture<T>;
    static get(token: any, notFoundValue?: any): any;
    /** @experimental */ static initTestEnvironment(ngModule: Type<any> | Type<any>[], platform: PlatformRef, aotSummaries?: () => any[]): TestBed;
    static overrideComponent(component: Type<any>, override: MetadataOverride<Component>): typeof TestBed;
    static overrideDirective(directive: Type<any>, override: MetadataOverride<Directive>): typeof TestBed;
    static overrideModule(ngModule: Type<any>, override: MetadataOverride<NgModule>): typeof TestBed;
    static overridePipe(pipe: Type<any>, override: MetadataOverride<Pipe>): typeof TestBed;
    static overrideProvider(token: any, provider: {
        useFactory: Function;
        deps: any[];
    }): void;
    static overrideProvider(token: any, provider: {
        useValue: any;
    }): void;
    static overrideTemplate(component: Type<any>, template: string): typeof TestBed;
    /** @experimental */ static resetTestEnvironment(): void;
    static resetTestingModule(): typeof TestBed;
}

/** @experimental */
export declare class TestComponentRenderer {
    insertRootElement(rootElementId: string): void;
}

/** @experimental */
export declare type TestModuleMetadata = {
    providers?: any[];
    declarations?: any[];
    imports?: any[];
    schemas?: Array<SchemaMetadata | any[]>;
};

/** @experimental */
export declare function tick(millis?: number): void;

/** @experimental */
export declare function withModule(moduleDef: TestModuleMetadata): InjectSetupWrapper;
