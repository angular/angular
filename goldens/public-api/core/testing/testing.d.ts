/** @codeGenApi */
export declare const __core_private_testing_placeholder__ = "";

/** @deprecated */
export declare function async(fn: Function): (done: any) => any;

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

export declare const ComponentFixtureAutoDetect: InjectionToken<boolean[]>;

export declare const ComponentFixtureNoNgZone: InjectionToken<boolean[]>;

export declare function discardPeriodicTasks(): void;

export declare function fakeAsync(fn: Function): (...args: any[]) => any;

export declare function flush(maxTurns?: number): number;

export declare function flushMicrotasks(): void;

export declare const getTestBed: () => TestBed;

export declare function inject(tokens: any[], fn: Function): () => any;

export declare class InjectSetupWrapper {
    constructor(_moduleDef: () => TestModuleMetadata);
    inject(tokens: any[], fn: Function): () => any;
}

export declare type MetadataOverride<T> = {
    add?: Partial<T>;
    remove?: Partial<T>;
    set?: Partial<T>;
};

export declare function resetFakeAsyncZone(): void;

export declare interface TestBed {
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
    /** @deprecated */ get<T>(token: Type<T> | InjectionToken<T>, notFoundValue?: T, flags?: InjectFlags): any;
    /** @deprecated */ get(token: any, notFoundValue?: any): any;
    initTestEnvironment(ngModule: Type<any> | Type<any>[], platform: PlatformRef, aotSummaries?: () => any[]): void;
    inject<T>(token: Type<T> | InjectionToken<T> | AbstractType<T>, notFoundValue?: T, flags?: InjectFlags): T;
    inject<T>(token: Type<T> | InjectionToken<T> | AbstractType<T>, notFoundValue: null, flags?: InjectFlags): T | null;
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
    overrideProvider(token: any, provider: {
        useFactory?: Function;
        useValue?: any;
        deps?: any[];
    }): void;
    overrideTemplateUsingTestingModule(component: Type<any>, template: string): void;
    resetTestEnvironment(): void;
    resetTestingModule(): void;
}

export declare const TestBed: TestBedStatic;

export declare interface TestBedStatic {
    new (...args: any[]): TestBed;
    compileComponents(): Promise<any>;
    configureCompiler(config: {
        providers?: any[];
        useJit?: boolean;
    }): TestBedStatic;
    configureTestingModule(moduleDef: TestModuleMetadata): TestBedStatic;
    createComponent<T>(component: Type<T>): ComponentFixture<T>;
    /** @deprecated */ get<T>(token: Type<T> | InjectionToken<T>, notFoundValue?: T, flags?: InjectFlags): any;
    /** @deprecated */ get(token: any, notFoundValue?: any): any;
    initTestEnvironment(ngModule: Type<any> | Type<any>[], platform: PlatformRef, aotSummaries?: () => any[]): TestBed;
    inject<T>(token: Type<T> | InjectionToken<T> | AbstractType<T>, notFoundValue?: T, flags?: InjectFlags): T;
    inject<T>(token: Type<T> | InjectionToken<T> | AbstractType<T>, notFoundValue: null, flags?: InjectFlags): T | null;
    overrideComponent(component: Type<any>, override: MetadataOverride<Component>): TestBedStatic;
    overrideDirective(directive: Type<any>, override: MetadataOverride<Directive>): TestBedStatic;
    overrideModule(ngModule: Type<any>, override: MetadataOverride<NgModule>): TestBedStatic;
    overridePipe(pipe: Type<any>, override: MetadataOverride<Pipe>): TestBedStatic;
    overrideProvider(token: any, provider: {
        useFactory: Function;
        deps: any[];
    }): TestBedStatic;
    overrideProvider(token: any, provider: {
        useValue: any;
    }): TestBedStatic;
    overrideProvider(token: any, provider: {
        useFactory?: Function;
        useValue?: any;
        deps?: any[];
    }): TestBedStatic;
    overrideTemplate(component: Type<any>, template: string): TestBedStatic;
    overrideTemplateUsingTestingModule(component: Type<any>, template: string): TestBedStatic;
    resetTestEnvironment(): void;
    resetTestingModule(): TestBedStatic;
}

export declare class TestComponentRenderer {
    insertRootElement(rootElementId: string): void;
}

export declare type TestModuleMetadata = {
    providers?: any[];
    declarations?: any[];
    imports?: any[];
    schemas?: Array<SchemaMetadata | any[]>;
    aotSummaries?: () => any[];
};

export declare function tick(millis?: number, tickOptions?: {
    processNewMacroTasksSynchronously: boolean;
}): void;

export declare function waitForAsync(fn: Function): (done: any) => any;

export declare function withModule(moduleDef: TestModuleMetadata): InjectSetupWrapper;
export declare function withModule(moduleDef: TestModuleMetadata, fn: Function): () => any;
